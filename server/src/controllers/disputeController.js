import Dispute from "../models/Dispute.js";
import Booking from "../models/Booking.js";
import { notify } from "../utils/notify.js";

// Parent: raise a dispute
export const raiseDispute = async (req, res) => {
  try {
    const { bookingId, reason, description } = req.body;
    const booking = await Booking.findById(bookingId).populate("center");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.parent) !== String(req.user._id))
      return res.status(403).json({ message: "Not your booking" });

    const dispute = await Dispute.create({
      booking: bookingId,
      raisedBy: req.user._id,
      against: booking.provider,
      reason,
      description,
    });

    // Notify admin (we'll use a generic admin user notify via all admins)
    await notify(
      booking.provider,
      "Dispute Raised Against You",
      `A dispute has been raised for booking of ${booking.childName}. Reason: ${reason}`,
      "dispute",
      "/provider"
    );

    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Parent: my disputes
export const myDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user._id })
      .populate("booking")
      .sort("-createdAt");
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: all disputes
export const allDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("booking")
      .populate("raisedBy", "name email")
      .populate("against", "name email")
      .sort("-createdAt");
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: resolve dispute
export const resolveDispute = async (req, res) => {
  try {
    const { resolution, status } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    dispute.status = status || "resolved";
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    await notify(
      dispute.raisedBy,
      "Dispute Resolved",
      `Your dispute has been ${dispute.status}. Resolution: ${resolution}`,
      "dispute",
      "/parent"
    );

    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
