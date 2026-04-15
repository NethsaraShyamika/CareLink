import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../../auth-service/models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected ✔");

    // 🔥 optional cleanup (ONLY if you want fresh start)
    await User.deleteMany({ email: { $in: ["admin@gmail.com", "d@gmail.com"] } });

    const adminPassword = await bcrypt.hash("Admin123", 10);

    const users = [
      {
        firstName: "Admin",
        lastName: "User",
        phone: "0700000000",
        email: "admin@gmail.com",
        password: adminPassword,
        role: "admin",
        isActive: true,
        isEmailVerified: true,
      }
    ];

    await User.insertMany(users);

    console.log("Users seeded successfully 🚀");

    process.exit();
  } catch (err) {
    console.error("Seeder error:", err);
    process.exit(1);
  }
};

seedUsers();