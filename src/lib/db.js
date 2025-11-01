// src/lib/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let dialectModule;
try {
	dialectModule = await import("mysql2"); // 👈 Dynamic import works in Next.js 14+ server env
	console.log("✅ mysql2 module loaded dynamically");
} catch (error) {
	console.error("❌ Failed to load mysql2:", error);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialect: "mysql",
	dialectModule: dialectModule?.default,
	timezone: "+05:30",
	logging: false,
});


sequelize
	.authenticate()
	.then(() => console.log("✅ MySQL connected successfully"))
	.catch((err) => console.error("❌ MySQL connection failed:", err));

export default sequelize;
