import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const Client = sequelize.define("Client", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	clientId: { type: DataTypes.STRING, unique: true, allowNull: false },

	name: { type: DataTypes.STRING, allowNull: false },
	email: { type: DataTypes.STRING, unique: true, allowNull: true },
	phone: DataTypes.STRING,
	address: DataTypes.STRING,

	aadhaar: DataTypes.STRING,
	pan: DataTypes.STRING,
	photo: DataTypes.STRING,

	password: { type: DataTypes.STRING, allowNull: false },
	visiblePassword: { type: DataTypes.STRING, allowNull: false },

}, { tableName: "clients" });

export default Client;
