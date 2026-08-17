import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Center from "../models/Center.js";
import Booking from "../models/Booking.js";
import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";

dotenv.config();

const run = async () => {
  await connectDB();
  console.log("🌱 Clearing old data...");
  await User.deleteMany({});
  await Center.deleteMany({});
  await Booking.deleteMany({});
  await Subscription.deleteMany({});
  await Notification.deleteMany({});

  // ── USERS ──────────────────────────────────────────────
  const admin = await User.create({
    name: "Platform Admin", email: "admin@littlesteps.com",
    password: "admin123", role: "admin", status: "approved", city: "Bengaluru",
  });

  // Use create() one by one so bcrypt pre-save hook runs
  const p1r = await User.create({ name: "Riya Sharma", email: "parent@littlesteps.com", password: "parent123", role: "parent", status: "approved", city: "Bengaluru", phone: "9876543210" });
  const p2r = await User.create({ name: "Arjun Mehta", email: "arjun@gmail.com", password: "parent123", role: "parent", status: "approved", city: "Pune", phone: "9811234567" });
  const p3r = await User.create({ name: "Priya Nair", email: "priya@gmail.com", password: "parent123", role: "parent", status: "approved", city: "Mumbai", phone: "9822345678" });
  const p4r = await User.create({ name: "Deepak Verma", email: "deepak@gmail.com", password: "parent123", role: "parent", status: "approved", city: "Bengaluru", phone: "9833456789" });
  const parents = [p1r, p2r, p3r, p4r];

  const pr1 = await User.create({ name: "Sunshine Childcare Group", email: "provider@littlesteps.com", password: "provider123", role: "provider", status: "approved", city: "Bengaluru", phone: "9811111111" });
  const pr2 = await User.create({ name: "Tiny Tots Care Pvt Ltd", email: "provider2@littlesteps.com", password: "provider123", role: "provider", status: "approved", city: "Pune", phone: "9822222222" });
  const pr3 = await User.create({ name: "Happy Kids Network", email: "provider3@littlesteps.com", password: "provider123", role: "provider", status: "approved", city: "Mumbai", phone: "9833333333" });
  const pr4 = await User.create({ name: "Little Angels Creche", email: "provider4@littlesteps.com", password: "provider123", role: "provider", status: "pending", city: "Delhi", phone: "9844444444" });
  const providers = [pr1, pr2, pr3, pr4];

  const [p1, p2, p3, p4] = providers;

  // ── CENTERS ────────────────────────────────────────────
  const centers = await Center.insertMany([
    {
      provider: p1._id, name: "Sunshine 24×7 Daycare — Koramangala",
      description: "Award-winning 24×7 daycare with CCTV-monitored rooms, certified caregivers, and emergency care support. Trusted by 200+ families in Bengaluru.",
      city: "Bengaluru", address: "12, 5th Block, Koramangala, Bengaluru — 560034",
      location: { lat: 12.9352, lng: 77.6245 },
      is24x7: true, supportsNightShift: true, supportsEmergency: true, operatingHours: "24×7",
      ageGroups: ["infant", "toddler", "preschool"], capacity: 40, currentBookings: 18,
      pricing: { hourly: 180, daily: 1100, monthly: 22000 },
      safetyMeasures: ["24hr CCTV Surveillance", "Fire Safety System", "Secure Biometric Entry", "First Aid Trained Staff", "Emergency Protocols"],
      certifications: ["ISO 9001:2015 Certified", "Govt. Registered Crèche", "NAEYC Accredited"],
      caregivers: [
        { name: "Anita Rao", experienceYears: 10, certifications: ["First Aid", "Child Psychology", "Infant CPR"], verified: true, bio: "Senior caregiver with 10 years specializing in infant and toddler care. Former NIMHANS child development consultant." },
        { name: "Meera Nair", experienceYears: 7, certifications: ["Night Care Specialist", "First Aid", "Nutrition"], verified: true, bio: "Night-shift specialist. Expert in sleep training and night-time care routines for infants." },
        { name: "Sunita Pillai", experienceYears: 5, certifications: ["Early Childhood Education", "First Aid"], verified: true, bio: "Montessori-trained educator focused on play-based learning for toddlers." },
      ],
      rating: 4.8, ratingCount: 47, verificationStatus: "verified",
    },
    {
      provider: p1._id, name: "Sunshine Little Wonders — HSR Layout",
      description: "Premium daycare in HSR Layout with dedicated learning zones, outdoor play area, and flexible hourly slots for working parents.",
      city: "Bengaluru", address: "27, Sector 2, HSR Layout, Bengaluru — 560102",
      location: { lat: 12.9116, lng: 77.6389 },
      is24x7: false, supportsNightShift: false, supportsEmergency: false, operatingHours: "06:00 - 22:00",
      ageGroups: ["toddler", "preschool"], capacity: 30, currentBookings: 12,
      pricing: { hourly: 150, daily: 900, monthly: 18000 },
      safetyMeasures: ["CCTV Surveillance", "Fire Safety", "Verified Caregivers", "Hygienic Kitchen"],
      certifications: ["Govt. Registered Crèche", "ISO Certified"],
      caregivers: [
        { name: "Divya Menon", experienceYears: 6, certifications: ["Early Childhood Education", "Montessori Level 2"], verified: true, bio: "Passionate about creative play and early STEM activities." },
        { name: "Rekha Shetty", experienceYears: 4, certifications: ["First Aid", "Art Therapy"], verified: true, bio: "Specializes in art and music-based learning for preschoolers." },
      ],
      rating: 4.6, ratingCount: 32, verificationStatus: "verified",
    },
    {
      provider: p2._id, name: "Tiny Tots Night Crèche — FC Road",
      description: "Pune's most trusted 24×7 crèche designed for night-shift parents. Cozy sleeping arrangements, nutritious meals, and round-the-clock supervision.",
      city: "Pune", address: "45, FC Road, Shivajinagar, Pune — 411005",
      location: { lat: 18.5204, lng: 73.8567 },
      is24x7: true, supportsNightShift: true, supportsEmergency: true, operatingHours: "24×7",
      ageGroups: ["infant", "toddler", "preschool"], capacity: 25, currentBookings: 10,
      pricing: { hourly: 130, daily: 800, monthly: 16000 },
      safetyMeasures: ["24hr CCTV", "Night Security Guard", "Verified Staff", "First Aid Kit", "Safe Sleep Environment"],
      certifications: ["Govt. Registered Crèche", "State Child Welfare Board Approved"],
      caregivers: [
        { name: "Sneha Kulkarni", experienceYears: 8, certifications: ["Night Care", "First Aid", "Nutrition Diploma"], verified: true, bio: "8 years of night-shift childcare. Expert in infant sleep schedules and night routines." },
        { name: "Pooja Deshpande", experienceYears: 5, certifications: ["Child Psychology", "First Aid"], verified: true, bio: "Child psychologist focused on emotional well-being during night care." },
      ],
      rating: 4.5, ratingCount: 28, verificationStatus: "verified",
    },
    {
      provider: p2._id, name: "Tiny Tots Day School — Kothrud",
      description: "Structured daycare with preschool curriculum, music and dance classes, and healthy meals. Perfect for toddlers and preschool-age children.",
      city: "Pune", address: "88, Paud Road, Kothrud, Pune — 411038",
      location: { lat: 18.5074, lng: 73.8077 },
      is24x7: false, supportsNightShift: false, supportsEmergency: false, operatingHours: "07:30 - 20:00",
      ageGroups: ["toddler", "preschool"], capacity: 35, currentBookings: 20,
      pricing: { hourly: 110, daily: 650, monthly: 13000 },
      safetyMeasures: ["CCTV", "GPS-tracked Transport", "Hygienic Meals", "Verified Staff"],
      certifications: ["Govt. Registered", "SSC Affiliated Preschool"],
      caregivers: [
        { name: "Vrinda Joshi", experienceYears: 9, certifications: ["B.Ed", "Montessori", "First Aid"], verified: true, bio: "Experienced school teacher turned daycare educator. Specializes in structured learning." },
        { name: "Manasi Gokhale", experienceYears: 3, certifications: ["Music Therapy", "First Aid"], verified: true, bio: "Music and dance educator for young children." },
      ],
      rating: 4.3, ratingCount: 19, verificationStatus: "verified",
    },
    {
      provider: p3._id, name: "Happy Kids 24hr Care — Bandra",
      description: "Mumbai's premium 24×7 childcare centre in the heart of Bandra. Emergency care, night slots, and flexible hourly bookings available.",
      city: "Mumbai", address: "14, Hill Road, Bandra West, Mumbai — 400050",
      location: { lat: 19.0596, lng: 72.8295 },
      is24x7: true, supportsNightShift: true, supportsEmergency: true, operatingHours: "24×7",
      ageGroups: ["infant", "toddler", "preschool"], capacity: 50, currentBookings: 22,
      pricing: { hourly: 200, daily: 1200, monthly: 24000 },
      safetyMeasures: ["24hr CCTV", "Security Guard", "Fire Safety", "Nurse on Duty", "Biometric Entry"],
      certifications: ["ISO 9001 Certified", "BMC Registered", "NAEYC Accredited"],
      caregivers: [
        { name: "Fatima Sheikh", experienceYears: 12, certifications: ["Pediatric First Aid", "Child Psychology", "Infant CPR"], verified: true, bio: "12 years experience in premium childcare. Former nurse with specialization in infant care." },
        { name: "Kavita Sharma", experienceYears: 8, certifications: ["Early Childhood Education", "Special Needs Care"], verified: true, bio: "Expert in inclusive childcare for children with special needs." },
        { name: "Zara Khan", experienceYears: 4, certifications: ["Night Care", "First Aid"], verified: true, bio: "Night-shift specialist with expertise in infant sleep management." },
      ],
      rating: 4.9, ratingCount: 63, verificationStatus: "verified",
    },
    {
      provider: p3._id, name: "Happy Kids Daycare — Andheri",
      description: "Affordable and trusted daycare in Andheri with outdoor play area, swimming pool (supervised), and nutritionist-designed meal plans.",
      city: "Mumbai", address: "56, Lokhandwala Complex, Andheri West, Mumbai — 400053",
      location: { lat: 19.1334, lng: 72.8271 },
      is24x7: false, supportsNightShift: false, supportsEmergency: false, operatingHours: "07:00 - 21:00",
      ageGroups: ["toddler", "preschool"], capacity: 45, currentBookings: 15,
      pricing: { hourly: 160, daily: 950, monthly: 19000 },
      safetyMeasures: ["CCTV", "Swimming Pool Safety", "Verified Staff", "Hygienic Kitchen", "Fire Safety"],
      certifications: ["BMC Registered", "ISO Certified"],
      caregivers: [
        { name: "Roshni Iyer", experienceYears: 7, certifications: ["Swimming Safety", "First Aid", "Nutrition"], verified: true, bio: "Sports and activity specialist. Trained in aquatic safety for children." },
        { name: "Nisha Patel", experienceYears: 5, certifications: ["Early Childhood Education", "First Aid"], verified: true, bio: "Activity coordinator for toddlers and preschoolers." },
      ],
      rating: 4.4, ratingCount: 35, verificationStatus: "verified",
    },
    {
      provider: p1._id, name: "Sunshine Emergency Care — MG Road",
      description: "Specialized emergency and last-minute childcare for urgent situations. Available 24×7 with instant confirmation for working parents.",
      city: "Bengaluru", address: "3, MG Road, Bengaluru — 560001",
      location: { lat: 12.9757, lng: 77.6066 },
      is24x7: true, supportsNightShift: true, supportsEmergency: true, operatingHours: "24×7",
      ageGroups: ["infant", "toddler", "preschool"], capacity: 15, currentBookings: 3,
      pricing: { hourly: 220, daily: 1400, monthly: 28000 },
      safetyMeasures: ["24hr CCTV", "Emergency Medical Kit", "Doctor on Call", "Biometric Entry", "GPS Tracking"],
      certifications: ["ISO Certified", "Govt. Emergency Care Approved"],
      caregivers: [
        { name: "Dr. Lakshmi Rao", experienceYears: 15, certifications: ["MBBS", "Pediatric First Aid", "Emergency Care"], verified: true, bio: "Pediatric doctor providing medical oversight for emergency childcare situations." },
        { name: "Geeta Krishnan", experienceYears: 10, certifications: ["Emergency Childcare", "Infant CPR", "First Aid"], verified: true, bio: "Specialist in emergency and crisis childcare with 10 years experience." },
      ],
      rating: 4.7, ratingCount: 22, verificationStatus: "verified",
    },
    {
      provider: p4._id, name: "Little Angels Premium Crèche — Dwarka",
      description: "New premium crèche in Delhi awaiting verification. State-of-the-art facilities with AI-monitored safety systems.",
      city: "Delhi", address: "Sector 10, Dwarka, New Delhi — 110075",
      location: { lat: 28.5923, lng: 77.0318 },
      is24x7: true, supportsNightShift: true, supportsEmergency: false, operatingHours: "24×7",
      ageGroups: ["infant", "toddler", "preschool"], capacity: 30, currentBookings: 0,
      pricing: { hourly: 170, daily: 1000, monthly: 20000 },
      safetyMeasures: ["AI CCTV", "Biometric Entry", "First Aid"],
      certifications: ["Registration Pending"],
      caregivers: [
        { name: "Sunita Chauhan", experienceYears: 6, certifications: ["Child Psychology", "First Aid"], verified: false, bio: "Experienced in early childhood care." },
      ],
      rating: 0, ratingCount: 0, verificationStatus: "pending",
    },
  ]);

  // ── BOOKINGS ───────────────────────────────────────────
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const lastWeek = new Date(today); lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const bookings = await Booking.insertMany([
    // Confirmed bookings
    {
      parent: parents[0]._id, center: centers[0]._id, provider: p1._id,
      childName: "Aanya Sharma", ageGroup: "toddler", planType: "monthly",
      startDate: lastMonth, amount: 22000, status: "confirmed",
      feedback: { rating: 5, comment: "Excellent care! Anita di is amazing with Aanya." },
    },
    {
      parent: parents[0]._id, center: centers[1]._id, provider: p1._id,
      childName: "Aanya Sharma", ageGroup: "toddler", planType: "daily",
      startDate: yesterday, amount: 900, status: "completed",
      feedback: { rating: 5, comment: "Great experience! Will book again." },
    },
    {
      parent: parents[1]._id, center: centers[2]._id, provider: p2._id,
      childName: "Rohan Mehta", ageGroup: "infant", planType: "monthly",
      startDate: lastMonth, amount: 16000, status: "confirmed", slotTiming: "night",
    },
    {
      parent: parents[2]._id, center: centers[4]._id, provider: p3._id,
      childName: "Sia Nair", ageGroup: "preschool", planType: "daily",
      startDate: today, amount: 1200, status: "confirmed",
    },
    {
      parent: parents[3]._id, center: centers[0]._id, provider: p1._id,
      childName: "Dev Verma", ageGroup: "infant", planType: "hourly",
      startDate: today, amount: 180, status: "confirmed", slotTiming: "night",
    },
    // Pending bookings
    {
      parent: parents[0]._id, center: centers[6]._id, provider: p1._id,
      childName: "Aanya Sharma", ageGroup: "toddler", planType: "hourly",
      startDate: tomorrow, amount: 220, status: "pending", slotTiming: "emergency",
    },
    {
      parent: parents[2]._id, center: centers[2]._id, provider: p2._id,
      childName: "Sia Nair", ageGroup: "preschool", planType: "daily",
      startDate: tomorrow, amount: 800, status: "pending",
    },
    // Completed
    {
      parent: parents[1]._id, center: centers[3]._id, provider: p2._id,
      childName: "Rohan Mehta", ageGroup: "toddler", planType: "daily",
      startDate: lastWeek, amount: 650, status: "completed",
      feedback: { rating: 4, comment: "Good facility, friendly staff." },
    },
    {
      parent: parents[3]._id, center: centers[5]._id, provider: p3._id,
      childName: "Dev Verma", ageGroup: "toddler", planType: "monthly",
      startDate: lastMonth, amount: 19000, status: "completed",
      feedback: { rating: 5, comment: "Best daycare in Andheri! Highly recommend." },
    },
  ]);

  // ── SUBSCRIPTIONS ──────────────────────────────────────
  const endDate1 = new Date(); endDate1.setMonth(endDate1.getMonth() + 1);
  const endDate2 = new Date(); endDate2.setMonth(endDate2.getMonth() + 1);

  await Subscription.insertMany([
    {
      parent: parents[0]._id, center: centers[0]._id,
      amount: 22000, startDate: lastMonth, endDate: endDate1,
      status: "active", autoRenew: true,
    },
    {
      parent: parents[1]._id, center: centers[2]._id,
      amount: 16000, startDate: lastMonth, endDate: endDate2,
      status: "active", autoRenew: false,
    },
    {
      parent: parents[3]._id, center: centers[5]._id,
      amount: 19000, startDate: lastMonth, endDate: new Date(lastMonth.getTime() + 30*24*60*60*1000),
      status: "expired", autoRenew: false,
    },
  ]);

  // Update center ratings from feedback
  await Center.findByIdAndUpdate(centers[0]._id, { rating: 4.8, ratingCount: 47 });
  await Center.findByIdAndUpdate(centers[1]._id, { rating: 4.6, ratingCount: 32 });

  // ── NOTIFICATIONS ──────────────────────────────────────
  await Notification.insertMany([
    {
      user: parents[0]._id, title: "Booking Confirmed! ✅",
      message: "Your monthly booking for Aanya at Sunshine 24×7 Daycare has been confirmed.",
      type: "booking_confirmed", read: false,
    },
    {
      user: parents[0]._id, title: "Service Completed",
      message: "Your session at Sunshine HSR Layout is complete. Please leave a review!",
      type: "booking_completed", read: false,
    },
    {
      user: p1._id, title: "New Booking Request",
      message: "Riya Sharma has requested an emergency hourly slot for Aanya.",
      type: "booking_request", read: false,
    },
    {
      user: p2._id, title: "New Booking Request",
      message: "Priya Nair has requested a daily slot for Sia Nair.",
      type: "booking_request", read: false,
    },
    {
      user: p4._id, title: "Account Pending Approval",
      message: "Your provider account is under review. Admin will approve within 24 hours.",
      type: "verification", read: false,
    },
  ]);

  console.log("\n✅ Seed complete! Real data loaded.\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Demo Logins:");
  console.log("  Admin:     admin@littlesteps.com / admin123");
  console.log("  Parent:    parent@littlesteps.com / parent123");
  console.log("  Provider:  provider@littlesteps.com / provider123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("  Centers: 8 (7 verified, 1 pending)");
  console.log("  Bookings: 9 (confirmed + pending + completed)");
  console.log("  Subscriptions: 3 (2 active, 1 expired)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); });
