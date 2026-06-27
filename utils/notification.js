const axios = require("axios");
const userRepo = require("../repo/user/user.repo");
const { notificationData, androidNotificationChannels } = require("../constants");

function getOneSignalConfig() {
  const appId = (process.env.ONESIGNAL_APP_ID_USER || process.env.APP_ID || "").trim();
  const apiKey = (process.env.ONESIGNAL_API_KEY_USER || process.env.API_KEY || "").trim();
  let baseUrl = (process.env.ONESIGNAL_API_BASE_URL || "https://api.onesignal.com").trim().replace(/\/$/, "");

  // Legacy env files used the v1 host; this project sends v2 payloads (Key auth, include_aliases).
  if (baseUrl.includes("onesignal.com/api/v1")) {
    baseUrl = "https://onesignal.com/api/v1";
  }

  return { appId, apiKey, baseUrl };
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertOneSignalConfig(config) {
  if (!uuidPattern.test(config.appId)) {
    throw new Error(
      `Invalid ONESIGNAL_APP_ID_USER "${config.appId}". Expected a UUID like 81457ae9-65fb-4dbb-99bc-bf7ff6571004 with no spaces.`,
    );
  }

  if (!config.apiKey) {
    throw new Error("Missing ONESIGNAL_API_KEY_USER.");
  }
}

function isSubscriptionId(value) {
  return uuidPattern.test(String(value));
}

exports.normalizeUserIds = (userId) => {
  if (userId == null || userId === "") {
    return [];
  }

  if (Array.isArray(userId)) {
    return userId.map(String).map((id) => id.trim()).filter(Boolean);
  }

  if (typeof userId === "string") {
    if (userId.includes(",")) {
      return userId
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    }
    return [userId.trim()].filter(Boolean);
  }

  return [String(userId)];
};

exports.resolveSubscriptionIds = async (userIds) => {
  const config = getOneSignalConfig();
  assertOneSignalConfig(config);

  const subscriptionIds = [];

  for (const userId of userIds) {
    if (isSubscriptionId(userId)) {
      subscriptionIds.push(userId);
      continue;
    }

    try {
      const response = await axios.get(
        `${config.baseUrl}/apps/${config.appId}/users/by/external_id/${encodeURIComponent(userId)}`,
        {
          headers: {
            Authorization: `Key ${config.apiKey}`,
          },
        },
      );

      const subscriptions = response.data?.subscriptions ?? [];
      for (const subscription of subscriptions) {
        if (subscription?.id && subscription.enabled !== false) {
          subscriptionIds.push(subscription.id);
        }
      }
    } catch (error) {
      console.warn(
        `No OneSignal subscriptions for user ${userId}:`,
        error.response?.data ?? error.message,
      );
    }
  }

  return [...new Set(subscriptionIds)];
};

async function sendOneSignalNotification(payload) {
  const config = getOneSignalConfig();
  assertOneSignalConfig(config);

  const body = {
    app_id: config.appId,
    target_channel: "push",
    ...payload,
  };

  console.log("Sending OneSignal notification with payload:", body);
  return axios.post(`${config.baseUrl}/notifications`, body, {
    headers: {
      Authorization: `Key ${config.apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

exports.sendPushToUserIds = async (userIds, payload) => {
  const normalizedIds = exports.normalizeUserIds(userIds);
  if (!normalizedIds.length) {
    console.warn("No user ids provided for push notification");
    return { ok: false, reason: "no_user_ids", userIds: [] };
  }

  const subscriptionIds = await exports.resolveSubscriptionIds(normalizedIds);
  if (!subscriptionIds.length) {
    console.warn("No OneSignal subscriptions resolved for user ids:", normalizedIds);
    return { ok: false, reason: "no_subscriptions", userIds: normalizedIds };
  }

  console.log(`Resolved ${subscriptionIds.length} OneSignal subscription(s) for user ids:`, normalizedIds);

  const result = await exports.sendNotificationUser({
    ...payload,
    include_subscription_ids: subscriptionIds,
  });

  if (result?.id) {
    return { ok: true, result, userIds: normalizedIds, subscriptionIds };
  }

  return { ok: false, reason: "api_error", result, userIds: normalizedIds, subscriptionIds };
};

/**
 * Sends a push notification using the OneSignal REST API.
 *
 * @param {Object} payload - The payload containing notification details.
 * @returns {Promise<Object|null>} - OneSignal API response data, or null on failure.
 */
exports.sendNotificationUser = async (payload) => {
  try {
    const response = await sendOneSignalNotification(payload);
    const { id, errors } = response.data ?? {};
    if (errors?.length) {
      console.warn("OneSignal notification not delivered:", {
        id,
        errors,
        include_subscription_ids: payload.include_subscription_ids,
        existing_android_channel_id: payload.existing_android_channel_id,
      });
      return response.data;
    }
    if (!id) {
      console.warn("OneSignal notification created without id:", response.data);
      return response.data;
    }
    console.log("Notification sent successfully:", response.data);
    return response.data;
  } catch (error) {
    const errorBody = error.response?.data ?? error.message;
    console.error("OneSignal API error sending notification:", errorBody);
    return null;
  }
};

exports.sendNotificationAdmin = exports.sendNotificationUser;

exports.notifyUser = (desc, title, id, data = {}) => {
  void exports
    .sendPushToUserIds([id], {
      contents: { en: desc },
      headings: {
        en: title,
      },
      data,
    })
    .then((sendResult) => {
      if (sendResult?.ok) {
        console.log(`Notification send to user: ${id}`);
      }
    });
};

function buildAdminPayload(desc, title, data, subscriptionIds, options = {}) {
  const payload = {
    contents: { en: desc },
    headings: {
      en: title,
    },
    data,
    include_subscription_ids: subscriptionIds,
  };

  if (options.existingAndroidChannelId) {
    payload.existing_android_channel_id = options.existingAndroidChannelId;
  }
  if (options.priority != null) {
    payload.priority = options.priority;
  }

  return payload;
}

exports.notifyAdmin = (desc, title, data = {}, options = {}) => {
  void (async () => {
    try {
      const admin = await userRepo.profile({ role: "admin" });
      if (!admin) {
        console.error("Error sending notification: admin user not found");
        return;
      }

      const subscriptionIds = await exports.resolveSubscriptionIds([admin.id]);
      if (!subscriptionIds.length) {
        console.warn(`No OneSignal subscriptions resolved for admin id=${admin.id}`);
        return;
      }

      console.log(`Sending admin notification to user id ${admin.id}`);
      console.log(`Resolved ${subscriptionIds.length} OneSignal subscription(s) for user ids:`, [String(admin.id)]);

      let result = await exports.sendNotificationUser(
        buildAdminPayload(desc, title, data, subscriptionIds, options),
      );

      if (!result?.id && options.existingAndroidChannelId) {
        console.warn(
          `Admin notification failed with existing_android_channel_id=${options.existingAndroidChannelId}, retrying without channel fields`,
        );
        result = await exports.sendNotificationUser(
          buildAdminPayload(desc, title, data, subscriptionIds, {
            priority: options.priority,
          }),
        );
      }

      if (result?.id) {
        console.log(`Notification send to admin: ${admin.id}`, result);
      } else {
        console.warn(`Admin notification API send failed for admin id=${admin.id}`, result);
      }
    } catch (error) {
      console.error("Error sending notification:", error.message);
    }
  })();
};

exports.notifyAdminPaymentRequest = (desc, title, data = {}) => {
  exports.notifyAdmin(desc, title, data, {
    existingAndroidChannelId: androidNotificationChannels.paymentRequest,
    priority: 10,
  });
};

exports.notificationContent = {
  buyProduct: {
    user: {
      title: () => "Pin Purchase",
      desc: () => "Congrats! Pin has been purchased successfully",
      data: () => {
        return {
          activity: notificationData.product,
          id: null,
        };
      },
    },
    admin: {
      title: () => "Pin Purchase",
      desc: (userName, userPh) => `${userName} - ${userPh} have just purchased a pin`,
      data: (id) => {
        return { activity: notificationData.user, id };
      },
    },
  },
  transactionReq: {
    user: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
      desc: (notation) => `New ${notation} request has been created successfully`,
      data: () => {
        return { activity: notificationData.transaction, id: null };
      },
    },
    admin: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
      desc: (userName, userPh, notation, amount) => `You have new ${notation} request of ₹${amount} by ${userName} - ${userPh}`,
      data: (id) => {
        return { activity: notificationData.user, id };
      },
    },
  },
  paymentSubmitted: {
    admin: {
      title: () => "Payment Request",
      desc: (userName, userPh) => `${userName} - ${userPh} submitted payment proof for review`,
      data: (id) => {
        return { activity: notificationData.payment, id };
      },
    },
  },
  transactionApproved: {
    user: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request Approved`,
      desc: (notation, amount) => `Your ${notation} request of ₹${amount} has been approved`,
      data: () => {
        return { activity: notificationData.transaction, id: null };
      },
    },
    admin: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
      desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
      data: (id) => {
        return { activity: notificationData.user, id };
      },
    },
  },
  transactionReject: {
    user: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request Rejected`,
      desc: (notation, amount) => `Your ${notation} request of ₹${amount} has been rejected`,
      data: () => {
        return { activity: notificationData.transaction, id: null };
      },
    },
    admin: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
      desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
      data: (id) => {
        return { activity: notificationData.user, id };
      },
    },
  },
  commission: {
    user: {
      title: () => `Level Commission Credited`,
      desc: (amount) => `Your Level commission ₹${amount} have credited into your wallet`,
      data: (id) => {
        return { activity: notificationData.commission, id };
      },
    },
    admin: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
      desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
      data: (id) => {
        return { activity: notificationData.user, id };
      },
    },
  },
  commissionMissedLessUser: {
    user: {
      title: () => `Commission Missed`,
      desc: (amount, level) => `Oh! No! You just missed ₹${amount} commission from level - ${level}`,
      data: () => {
        return { activity: notificationData.noActivity, id: null };
      },
    },
  },
  commissionMissedNoPkg: {
    user: {
      title: () => `Commission Missed`,
      desc: (amount, level) => `Oh! No! You just missed ₹${amount} commission from level - ${level} because you have not purchased any pin yet`,
      data: () => {
        return { activity: notificationData.product, id: null };
      },
    },
  },
  transfer: {
    user: {
      title: () => `Amount Received`,
      desc: (amount, userName, userPh) => `You have recieved ₹${amount} from ${userName} - ${userPh}`,
      data: () => {
        return { activity: notificationData.transaction };
      },
    },
  },
  amtCr: {
    user: {
      title: (title) => title,
      desc: (amount, isReward) => `You have recieved ${isReward ? `reward ₹${amount}` : `₹${amount}`} from admin`,
      data: () => {
        return { activity: notificationData.transaction };
      },
    },
    admin: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
      desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
      data: (id) => {
        return { activity: notificationData.user, id };
      },
    },
  },
  amtDr: {
    user: {
      title: (title) => title,
      desc: (amount, isReward) => `${isReward ? "Reward" : "Amount"} ₹${amount} deducted by admin`,
      data: () => {
        return { activity: notificationData.transaction };
      },
    },
    admin: {
      title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
      desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
      data: (id) => {
        return { activity: notificationData.user, id };
      },
    },
  },
  sponsor: {
    user: {
      title: () => "New Referral User",
      desc: () => "Congrats! A new user have signed-up with your sponsor code",
      data: () => {
        return { activity: notificationData.sponsorBonus, id: null };
      },
    },
  },
};
