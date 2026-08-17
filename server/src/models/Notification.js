import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["booking_request", "booking_confirmed", "booking_rejected",
             "booking_completed", "subscription", "verification", "dispute", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" }, // frontend route to redirect
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
