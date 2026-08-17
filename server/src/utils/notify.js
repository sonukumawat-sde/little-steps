import Notification from "../models/Notification.js";

export const notify = async (userId, title, message, type = "general", link = "") => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (e) {
    console.error("Notification error:", e.message);
  }
};
