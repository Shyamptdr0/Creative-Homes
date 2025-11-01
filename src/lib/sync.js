import sequelize from "./db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";
import Client from "../models/Client.js";
import Contractor from "../models/Contractor.js";
import Project from "../models/Project.js";
import Stage from "../models/Stage.js";

dotenv.config();

(async () => {
	try {
		await sequelize.sync({ alter: true });
		console.log("✅ Database synced successfully");

		const adminEmail = process.env.ADMIN_EMAIL;
		const adminPassword = process.env.ADMIN_PASSWORD;

		const adminExists = await User.findOne({ where: { email: adminEmail } });

		if (!adminExists) {
			const hashedPassword = await bcrypt.hash(adminPassword, 10);
			await User.create({
				email: adminEmail,
				password: hashedPassword,
				role: "admin",
				name: "Admin",
			});
			console.log("👑 Default admin user created");
		} else {
			console.log("✅ Admin already exists");
		}

		process.exit(0);
	} catch (error) {
		console.error("❌ Sync error:", error);
		process.exit(1);
	}
})();
