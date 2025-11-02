// src/lib/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let dialectModule;

try {
	const mysql = await import("mysql2");
	dialectModule = mysql.default;
	console.log("✅ mysql2 loaded");
} catch (err) {
	console.error("❌ mysql2 load error:", err);
}

const isURL = !!process.env.DATABASE_URL;

// ✅ Aiven supports SSL — must enable
const sequelize = isURL
	? new Sequelize(process.env.DATABASE_URL, {
		dialect: "mysql",
		dialectModule,
		logging: false,
		timezone: "+05:30",
		dialectOptions: {
			ssl: {
				require: true,
			},
		},
	})
	: new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASS,
		{
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			dialect: "mysql",
			dialectModule,
			logging: false,
			timezone: "+05:30",
			dialectOptions: {
				ssl: {
					require: true,
				},
			},
		}
	);

sequelize
	.authenticate()
	.then(() => console.log("✅ Connected to Aiven MySQL"))
	.catch((err) => console.error("❌ Database connection failed:", err));

export default sequelize;
