import Booking from "../models/Booking.js";
import Center from "../models/Center.js";
import { notify } from "../utils/notify.js";

// Parent: create booking request
export const createBooking = async (req, res) => {
  try {
    const { centerId, childName, ageGroup, planType, startDate, endDate, slotTiming } = req.body;

    const center = await Center.findById(centerId);
    if (!center) return res.status(404).json({ message: "Center not found" });
    if (center.verificationStatus !== "verified") {
      return res.status(400).json({ message: "Center not available for booking" });
    }
    if (center.availableSlots <= 0) {
      return res.status(400).json({ message: "No slots available at this center" });
    }

    const amount = center.pricing?.[planType] || 0;

    const booking = await Booking.create({
      parent: req.user._id,
      center: center._id,
      provider: center.provider,
      childName, ageGroup, planType, startDate, endDate, slotTiming, amount,
    });

    // Notify provider
    await notify(
      center.provider,
      "New Booking Request",
      `${req.user.name} has requested a ${planType} slot for ${childName} at ${center.name}.`,
      "booking_request",
      "/provider"
    );

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Parent: booking history
export const myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ parent: req.user._id })
      .populate("center", "name city pricing photos")
      .sort("-createdAt");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Provider: bookings for their centers
export const providerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("center", "name")
      .populate("parent", "name email phone")
      .sort("-createdAt");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Provider: accept / reject / complete booking
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate("center");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.provider) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const center = booking.center;

    if (status === "confirmed" && booking.status !== "confirmed") {
      if (center.availableSlots <= 0) return res.status(400).json({ message: "Center is full" });
      center.currentBookings += 1;
      await center.save();
      await notify(
        booking.parent,
        "Booking Confirmed! ✅",
        `Your booking for ${booking.childName} at ${center.name} has been confirmed.`,
        "booking_confirmed",
        "/parent"
      );
    }

    if (status === "rejected") {
      if (booking.status === "confirmed") {
        center.currentBookings = Math.max(center.currentBookings - 1, 0);
        await center.save();
      }
      await notify(
        booking.parent,
        "Booking Rejected",
        `Your booking for ${booking.childName} at ${center.name} was rejected. Please try another center.`,
        "booking_rejected",
        "/parent"
      );
    }

    if (status === "completed") {
      await notify(
        booking.parent,
        "Service Completed",
        `Your childcare session at ${center.name} is marked complete. Please leave a review!`,
        "booking_completed",
        "/parent"
      );
    }

    if (status === "cancelled" && booking.status === "confirmed") {
      center.currentBookings = Math.max(center.currentBookings - 1, 0);
      await center.save();
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Parent: leave feedback
export const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.parent) !== String(req.user._id))
      return res.status(403).json({ message: "Not your booking" });

    booking.feedback = { rating, comment };
    await booking.save();

    const center = await Center.findById(booking.center);
    if (center) {
      const total = center.rating * center.ratingCount + Number(rating);
      center.ratingCount += 1;
      center.rating = Number((total / center.ratingCount).toFixed(2));
      await center.save();
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
