import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const Contractor = sequelize.define("Contractor", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	contractorId: { type: DataTypes.STRING, unique: true, allowNull: false }, // auto generate
	name: { type: DataTypes.STRING, allowNull: false },
	email: { type: DataTypes.STRING, unique: true, allowNull: true },
	phone: DataTypes.STRING,
	address: DataTypes.STRING,

	password: { type: DataTypes.STRING, allowNull: false }, // hashed password
	visiblePassword: { type: DataTypes.STRING, allowNull: false }, // store generated visible password

}, { tableName: "contractors" });

export default Contractor;
