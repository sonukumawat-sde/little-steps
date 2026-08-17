import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true },
    plan: { type: String, enum: ["monthly"], default: "monthly" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    autoRenew: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
