import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    childName: { type: String, required: true },
    ageGroup: { type: String, enum: ["infant", "toddler", "preschool"], required: true },

    planType: { type: String, enum: ["hourly", "daily", "monthly"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    slotTiming: { type: String, default: "" }, // e.g. "night", "day", "22:00-06:00"

    amount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
