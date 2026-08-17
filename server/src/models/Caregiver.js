import mongoose from "mongoose";

// Caregivers are embedded within a Center but kept as a schema for clarity
export const caregiverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    certifications: [{ type: String }], // e.g. "First Aid", "Child Psychology"
    verified: { type: Boolean, default: false },
    photo: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { _id: true }
);

export default mongoose.model("Caregiver", caregiverSchema);
