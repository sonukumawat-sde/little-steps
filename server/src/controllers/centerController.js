import Center from "../models/Center.js";

// Public search with filters (PRD: 24x7, age group, timing, pricing, city)
export const searchCenters = async (req, res) => {
  try {
    const { city, is24x7, ageGroup, timing, maxPrice, planType, q } = req.query;

    // Only verified centers are shown publicly
    const filter = { verificationStatus: "verified" };

    if (city) filter.city = new RegExp(city, "i");
    if (q) filter.name = new RegExp(q, "i");
    if (is24x7 === "true") filter.is24x7 = true;
    if (ageGroup) filter.ageGroups = ageGroup;

    if (timing === "night") filter.supportsNightShift = true;
    if (timing === "emergency") filter.supportsEmergency = true;

    if (maxPrice && planType) {
      const key = `pricing.${planType}`;
      filter[key] = { $lte: Number(maxPrice) };
    }

    const centers = await Center.find(filter).populate("provider", "name email");
    res.json(centers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id).populate("provider", "name email phone");
    if (!center) return res.status(404).json({ message: "Center not found" });
    res.json(center);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Provider: create center
export const createCenter = async (req, res) => {
  try {
    const center = await Center.create({ ...req.body, provider: req.user._id });
    res.status(201).json(center);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Provider: update own center
export const updateCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) return res.status(404).json({ message: "Center not found" });
    if (String(center.provider) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not your center" });
    }
    Object.assign(center, req.body);
    await center.save();
    res.json(center);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Provider: list own centers
export const myCenters = async (req, res) => {
  try {
    const centers = await Center.find({ provider: req.user._id });
    res.json(centers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
