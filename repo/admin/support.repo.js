const { SupportMessage, User, sequelize } = require("../../models");
const { notifyUser } = require("../../utils/notification");

exports.listConversations = async () => {
  const rows = await sequelize.query(
    `
    SELECT
      u.id AS user_id,
      u.first_name,
      u.mobile,
      (
        SELECT sm.message
        FROM support_messages sm
        WHERE sm.user_id = u.id
        ORDER BY sm.created_at DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT sm.created_at
        FROM support_messages sm
        WHERE sm.user_id = u.id
        ORDER BY sm.created_at DESC
        LIMIT 1
      ) AS last_message_at,
      (
        SELECT COUNT(*)
        FROM support_messages sm
        WHERE sm.user_id = u.id
          AND sm.sender_role = 'user'
          AND sm.is_read_by_admin = 0
      ) AS unread_count
    FROM users u
    WHERE u.role = 'user'
      AND EXISTS (
        SELECT 1 FROM support_messages sm2 WHERE sm2.user_id = u.id
      )
    ORDER BY last_message_at DESC
    `,
    { type: sequelize.QueryTypes.SELECT },
  );

  return rows;
};

exports.getMessages = async (userId) => {
  const user = await User.findOne({ where: { id: userId, role: "user" } });
  if (!user) {
    throw new Error("User not found");
  }

  await SupportMessage.update(
    { is_read_by_admin: true },
    {
      where: {
        user_id: userId,
        sender_role: "user",
        is_read_by_admin: false,
      },
    },
  );

  const messages = await SupportMessage.findAll({
    where: { user_id: userId },
    order: [["created_at", "ASC"]],
  });

  return { user, messages };
};

exports.sendReply = async (userId, message) => {
  const user = await User.findOne({ where: { id: userId, role: "user" } });
  if (!user) {
    throw new Error("User not found");
  }

  const trimmed = (message || "").trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }

  const created = await SupportMessage.create({
    user_id: userId,
    sender_role: "admin",
    message: trimmed,
    is_read_by_admin: true,
    is_read_by_user: false,
  });

  notifyUser("Admin replied to your support message", "Support reply", user.id, {
    activity: "support",
    id: user.id,
  });

  return created;
};
