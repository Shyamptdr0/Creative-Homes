// src/lib/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let dialectModule;

// Load mysql2 dynamically
try {
	const mysql = await import("mysql2");
	dialectModule = mysql.default;
	console.log("✅ mysql2 loaded");
} catch (err) {
	console.error("❌ mysql2 load error:", err);
}

const usingURL = !!process.env.DATABASE_URL;

const sequelize = usingURL
	? new Sequelize(process.env.DATABASE_URL, {
		dialect: "mysql",
		dialectModule,
		logging: false,
		timezone: "+05:30",
		dialectOptions: {
			ssl: {
				minVersion: "TLSv1.2",
				rejectUnauthorized: false,
			},
		},
	})
	: new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST,
			port: process.env.DB_PORT || 3306,
			dialect: "mysql",
			dialectModule,
			logging: false,
			timezone: "+05:30",
			dialectOptions: process.env.DB_SSL === "true"
				? {
					ssl: {
						minVersion: "TLSv1.2",
						rejectUnauthorized: false,
					},
				}
				: {},
		}
	);

// Test DB connection
sequelize
	.authenticate()
	.then(() => console.log("✅ DB Connected"))
	.catch((err) => console.error("❌ Database connection failed:", err));

/* ---------------------------------------------------------
   🚀 AUTO SYNC MODELS WITH DATABASE
   Adds missing columns (aadhaar, pan, photo), no data loss
----------------------------------------------------------- */
sequelize
	.sync({ alter: true })
	.then(() => console.log("🔄 Database synced with models"))
	.catch((err) => console.error("❌ Sync error:", err));

export default sequelize;
