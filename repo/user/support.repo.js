const { SupportMessage } = require("../../models");
const { notifyAdmin, notificationContent } = require("../../utils/notification");

exports.getMessages = async (userId) => {
  await SupportMessage.update(
    { is_read_by_user: true },
    {
      where: {
        user_id: userId,
        sender_role: "admin",
        is_read_by_user: false,
      },
    },
  );

  return SupportMessage.findAll({
    where: { user_id: userId },
    order: [["created_at", "ASC"]],
  });
};

exports.sendMessage = async (user, message) => {
  const trimmed = (message || "").trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }

  const created = await SupportMessage.create({
    user_id: user.id,
    sender_role: "user",
    message: trimmed,
    is_read_by_admin: false,
    is_read_by_user: true,
  });

  notifyAdmin(
    `${user.first_name || "User"} (${user.mobile}): ${trimmed}`,
    "New support message",
    { activity: "support", id: user.id },
  );

  return created;
};
