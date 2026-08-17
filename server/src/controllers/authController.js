import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    // Providers need admin approval; parents are auto-approved
    const status = role === "provider" ? "pending" : "approved";

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "parent",
      city,
      status,
    });

    res.status(201).json({
      token: generateToken(user),
      user: sanitize(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your account was rejected by admin" });
    }

    res.json({ token: generateToken(user), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};

const sanitize = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  phone: u.phone,
  city: u.city,
});
