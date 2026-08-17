import mongoose from "mongoose";
import { caregiverSchema } from "./Caregiver.js";

const pricingSchema = new mongoose.Schema(
  {
    hourly: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
  },
  { _id: false }
);

const centerSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    city: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Availability
    is24x7: { type: Boolean, default: false },
    operatingHours: { type: String, default: "09:00 - 18:00" }, // when not 24x7
    supportsNightShift: { type: Boolean, default: false },
    supportsEmergency: { type: Boolean, default: false },

    // Age groups: infant / toddler / preschool
    ageGroups: [
      { type: String, enum: ["infant", "toddler", "preschool"] },
    ],

    // Capacity & availability tracking (to avoid overbooking - NFR)
    capacity: { type: Number, default: 10 },
    currentBookings: { type: Number, default: 0 },

    pricing: pricingSchema,

    photos: [{ type: String }],
    safetyMeasures: [{ type: String }], // CCTV, fire safety, verified staff
    certifications: [{ type: String }],
    caregivers: [caregiverSchema],

    // Availability slots (PRD: provider manages specific slots)
    availabilitySlots: [{
      day: { type: String }, // Monday, Tuesday etc
      startTime: { type: String },
      endTime: { type: String },
      type: { type: String, enum: ["day","night","emergency"], default: "day" },
      available: { type: Boolean, default: true },
    }],

    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Admin verification workflow
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    documents: [{ name: String, url: String }],
  },
  { timestamps: true }
);

// Virtual: available slots left
centerSchema.virtual("availableSlots").get(function () {
  return Math.max(this.capacity - this.currentBookings, 0);
});

centerSchema.set("toJSON", { virtuals: true });
centerSchema.set("toObject", { virtuals: true });

export default mongoose.model("Center", centerSchema);
