import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const Client = sequelize.define("Client", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	clientId: { type: DataTypes.STRING, unique: true, allowNull: false }, // auto generate
	name: { type: DataTypes.STRING, allowNull: false },
	email: { type: DataTypes.STRING, unique: true, allowNull: true },
	phone: DataTypes.STRING,
	address: DataTypes.STRING,

	password: { type: DataTypes.STRING, allowNull: false }, // hashed password
	visiblePassword: { type: DataTypes.STRING, allowNull: false }, // store generated visible password (optional)

}, { tableName: "clients" });

export default Client;
