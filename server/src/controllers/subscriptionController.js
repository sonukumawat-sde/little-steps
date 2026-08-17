import Subscription from "../models/Subscription.js";
import Center from "../models/Center.js";

export const createSubscription = async (req, res) => {
  try {
    const { centerId, autoRenew } = req.body;
    const center = await Center.findById(centerId);
    if (!center) return res.status(404).json({ message: "Center not found" });

    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);

    const sub = await Subscription.create({
      parent: req.user._id,
      center: center._id,
      amount: center.pricing?.monthly || 0,
      startDate: start,
      endDate: end,
      autoRenew: !!autoRenew,
    });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const mySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ parent: req.user._id })
      .populate("center", "name city pricing")
      .sort("-createdAt");
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (String(sub.parent) !== String(req.user._id))
      return res.status(403).json({ message: "Not your subscription" });
    sub.status = "cancelled";
    sub.autoRenew = false;
    await sub.save();
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
