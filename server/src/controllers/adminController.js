import User from "../models/User.js";
import Center from "../models/Center.js";
import Booking from "../models/Booking.js";
import Subscription from "../models/Subscription.js";
import Dispute from "../models/Dispute.js";
import { notify } from "../utils/notify.js";

// Approve / reject users
export const listPendingUsers = async (req, res) => {
  const users = await User.find({ status: "pending" }).select("-password");
  res.json(users);
};

export const listAllUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } }).select("-password").sort("-createdAt");
  res.json(users);
};

export const setUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = status;
    await user.save();

    await notify(
      user._id,
      status === "approved" ? "Account Approved ✅" : "Account Rejected",
      status === "approved"
        ? "Your provider account has been approved. You can now list your centers!"
        : "Your account was not approved. Please contact support.",
      "verification",
      status === "approved" ? "/provider" : "/"
    );

    res.json({ message: `User ${status}`, user: { _id: user._id, status } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify centers
export const listPendingCenters = async (req, res) => {
  const centers = await Center.find({ verificationStatus: "pending" }).populate("provider", "name email");
  res.json(centers);
};

export const listAllCenters = async (req, res) => {
  const centers = await Center.find().populate("provider", "name email").sort("-createdAt");
  res.json(centers);
};

export const setCenterVerification = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    const center = await Center.findById(req.params.id);
    if (!center) return res.status(404).json({ message: "Center not found" });
    center.verificationStatus = verificationStatus;
    await center.save();

    await notify(
      center.provider,
      verificationStatus === "verified" ? "Center Verified ✅" : "Center Rejected",
      verificationStatus === "verified"
        ? `Your center "${center.name}" has been verified and is now live!`
        : `Your center "${center.name}" was not approved. Please review the requirements.`,
      "verification",
      "/provider"
    );

    res.json({ message: `Center ${verificationStatus}`, center });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Platform analytics & KPIs
export const analytics = async (req, res) => {
  try {
    const [
      totalUsers, totalParents, totalProviders, verifiedProviders,
      totalCenters, verifiedCenters, totalBookings, confirmedBookings,
      activeSubs, pendingBookings, completedBookings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "parent" }),
      User.countDocuments({ role: "provider" }),
      User.countDocuments({ role: "provider", status: "approved" }),
      Center.countDocuments(),
      Center.countDocuments({ verificationStatus: "verified" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Subscription.countDocuments({ status: "active" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "completed" }),
    ]);

    const bookingConversion = totalBookings > 0
      ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0;

    const centers = await Center.find().select("capacity currentBookings");
    const totalCapacity = centers.reduce((s, c) => s + c.capacity, 0);
    const totalOccupied = centers.reduce((s, c) => s + c.currentBookings, 0);
    const avgUtilization = totalCapacity > 0
      ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;

    // Monthly booking trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: "$amount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Open disputes
    const openDisputes = await Dispute.countDocuments({ status: "open" });

    res.json({
      totalUsers, totalParents, totalProviders, verifiedProviders,
      totalCenters, verifiedCenters, totalBookings, confirmedBookings,
      pendingBookings, completedBookings,
      activeSubscriptions: activeSubs,
      bookingConversionRate: Number(bookingConversion),
      avgUtilization: Number(avgUtilization),
      monthlyBookings,
      openDisputes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const allBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("center", "name city")
    .populate("parent", "name email")
    .populate("provider", "name")
    .sort("-createdAt")
    .limit(100);
  res.json(bookings);
};
