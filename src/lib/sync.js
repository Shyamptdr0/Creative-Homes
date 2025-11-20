import sequelize from "./db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// ✅ Import models so Sequelize creates tables
import User from "../models/User.js";
import "../models/Client.js";
import "../models/Contractor.js";
import "../models/ProjectType.js";
import "../models/Project.js";
import "../models/Material.js";
import "../models/Drawing.js";
import "../models/Query.js";
import "../models/StageRemark.js";
import "../models/StageTemplate.js";
import "../models/ProjectStage.js";
import "../models/Payment.js"

dotenv.config();

(async () => {
	try {
		console.log("⏳ Connecting to DB...");
		await sequelize.authenticate();
		console.log("✅ DB Connected");

		console.log("⏳ Syncing models...");
		// ⚠️ DO NOT use force:true in production
		 await sequelize.sync({ alter: false });
		console.log("✅ Tables synced successfully");

		// ✅ Create admin user
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

		// process.exit(0);
	} catch (error) {
		console.error("❌ Init error:", error);
		process.exit(1);
	}
})();
