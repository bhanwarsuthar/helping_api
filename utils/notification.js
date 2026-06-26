const axios = require("axios");
const userRepo = require("../repo/user/user.repo");
const { notificationData } = require("../constants");

function getOneSignalConfig() {
  const appId = (process.env.ONESIGNAL_APP_ID_USER || process.env.APP_ID || "").trim();
  const apiKey = (process.env.ONESIGNAL_API_KEY_USER || process.env.API_KEY || "").trim();
  let baseUrl = (process.env.ONESIGNAL_API_BASE_URL || "https://api.onesignal.com").trim().replace(/\/$/, "");

  // Legacy env files used the v1 host; this project sends v2 payloads (Key auth, include_aliases).
  if (baseUrl.includes("onesignal.com/api/v1")) {
    baseUrl = "https://api.onesignal.com";
  }

  return { appId, apiKey, baseUrl };
}

function assertOneSignalConfig(config) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(config.appId)) {
    throw new Error(
      `Invalid ONESIGNAL_APP_ID_USER "${config.appId}". Expected a UUID like 81457ae9-65fb-4dbb-99bc-bf7ff6571004 with no spaces.`,
    );
  }

  if (!config.apiKey) {
    throw new Error("Missing ONESIGNAL_API_KEY_USER.");
  }
}

async function sendOneSignalNotification(payload) {
  const config = getOneSignalConfig();
  assertOneSignalConfig(config);

  const body = {
    app_id: config.appId,
    target_channel: "push",
    ...payload,
  };

  return axios.post(`${config.baseUrl}/notifications`, body, {
    headers: {
      Authorization: `Key ${config.apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Sends a push notification using the OneSignal REST API.
 *
 * @param {Object} payload - The payload containing notification details.
 * @returns {Promise<Object|null>} - OneSignal API response data, or null on failure.
 */
exports.sendNotificationUser = async (payload) => {
  try {
    const response = await sendOneSignalNotification(payload);
    console.log("Notification sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error.response?.data ?? error.message);
    return null;
  }
};

exports.sendNotificationAdmin = exports.sendNotificationUser;

exports.notifyUser = (desc, title, id, data = {}) => {
  void exports
    .sendNotificationUser({
      contents: { en: desc },
      headings: {
        en: title,
      },
      include_aliases: {
        external_id: [`${id}`],
      },
      data,
    })
    .then((result) => {
      if (result) {
        console.log(`Notification send to user: ${id}`);
      }
    });
};

exports.notifyAdmin = (desc, title, data = {}) => {
  void (async () => {
    try {
      const admin = await userRepo.profile({ role: "admin" });
      if (!admin) {
        console.error("Error sending notification: admin user not found");
        return;
      }

      const result = await exports.sendNotificationUser({
        contents: { en: desc },
        headings: {
          en: title,
        },
        include_aliases: {
          external_id: [`${admin.id}`],
        },
        data,
      });

      if (result) {
        console.log(`Notification send to admin: ${admin.id}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error.message);
    }
  })();
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
