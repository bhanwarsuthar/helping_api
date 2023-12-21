const OneSignal = require("onesignal-node");
const userRepo = require("../repo/user/user.repo");
const { notificationData } = require("../constants");

// Create a OneSignal client using the provided API credentials and options.
const clientUser = new OneSignal.Client(process.env.ONESIGNAL_APP_ID_USER, process.env.ONESIGNAL_API_KEY_USER, { apiRoot: process.env.ONESIGNAL_API_BASE_URL });
const clientAdmin = new OneSignal.Client(process.env.ONESIGNAL_APP_ID_ADMIN, process.env.ONESIGNAL_API_KEY_ADMIN, { apiRoot: process.env.ONESIGNAL_API_BASE_URL });

/**
 * Sends a push notification using the OneSignal API.
 *
 * @param {Object} payload - The payload containing notification details.
 * @returns {Promise<Object>} - A promise that resolves with the OneSignal API response.
 */

exports.sendNotificationUser = async (payload) => {
  try {
    // Create and send the notification using the OneSignal client.
    const response = await clientUser.createNotification(payload);

    // Return the OneSignal API response.
    return response;
  } catch (error) {
    // Handle any errors that occur during the notification sending process.
    console.error("Error sending notification:", error.message);
    throw error;
  }
};

exports.sendNotificationAdmin = async (payload) => {
  try {
    // Create and send the notification using the OneSignal client.
    const response = await clientUser.createNotification(payload);

    // Return the OneSignal API response.
    return response;
  } catch (error) {
    // Handle any errors that occur during the notification sending process.
    console.error("Error sending notification:", error.message);
    throw error;
  }
};

exports.notifyUser = async (desc, title, id, data = {}) => {
  await this.sendNotificationUser({
    contents: { en: desc },
    headings: {
      en: title,
    },
    include_aliases: {
      external_id: [`${id}`],
    },
    data,
    target_channel: "push",
  });

  console.log(`Notification send to user: ${id}`);
};

exports.notifyAdmin = async (desc, title, data = {}) => {
  const admin = await userRepo.profile({ role: "admin" });

  await this.sendNotificationUser({
    contents: { en: desc },
    headings: {
      en: title,
    },
    include_aliases: {
      external_id: [`${admin.id}`],
    },
    data,
    target_channel: "push",
  });

  console.log(`Notification send to admin: ${admin.id}`);
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
      title: () => "Product Purchase",
      desc: (userName, userPh) => `${userName} - ${userPh} have just purchased a product`,
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
      title: () => `Commission Credited`,
      desc: (amount) => `Your product purchase commission ₹${amount} have credited into your wallet`,
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
    // admin: {
    //   title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
    //   desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
    //   data: () => {
    //     return { activity: notificationData.noActivity, id: null };
    //   },
    // },
  },
  commissionMissedNoPkg: {
    user: {
      title: () => `Commission Missed`,
      desc: (amount, level) => `Oh! No! You just missed ₹${amount} commission from level - ${level} because you have not purchased any product yet`,
      data: () => {
        return { activity: notificationData.product, id: null };
      },
    },
    // admin: {
    //   title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
    //   desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
    //   data: () => {
    //     return { activity: notificationData.noActivity, id: null };
    //   },
    // },
  },
  transfer: {
    user: {
      title: () => `Amount Received`,
      desc: (amount, userName, userPh) => `You have recieved ₹${amount} from ${userName} - ${userPh}`,
      data: () => {
        return { activity: notificationData.transaction };
      },
    },
    // admin: {
    //   title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
    //   desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
    //   data: (id) => {
    //     return { activity: notificationData.user, id };
    //   },
    // },
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
      title: () => "New Referal User",
      desc: () => "Congrats! A new user have signed-up with your sponsor code",
      data: () => {
        return { activity: notificationData.level, id: null };
      },
    },
    // admin: {
    //   title: (notation) => `${notation.replace(notation[0], notation[0].toUpperCase())} Request`,
    //   desc: (userName, userPh, notation, amount) => `You have new ${notation} request of  ₹${amount} by ${userName} - ${userPh}`,
    //   data: (id) => {
    //     return { activity: notificationData.user, id };
    //   },
    // },
  },
};
