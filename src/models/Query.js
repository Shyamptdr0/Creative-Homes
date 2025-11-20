// src/models/Query.js
import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Client from "./Client.js";
import Contractor from "./Contractor.js";
import Project from "./Project.js";

const Query = sequelize.define("Query", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	message: { type: DataTypes.TEXT, allowNull: false },

	reply: { type: DataTypes.TEXT },

	status: {
		type: DataTypes.ENUM("open", "resolved"),
		defaultValue: "open",
	},

	// 🆕 NEW FIELD — stores one image URL
	imageUrl: {
		type: DataTypes.STRING,
		allowNull: true,
	},
});

Query.belongsTo(Client, { foreignKey: "clientId", onDelete: "CASCADE" });
Query.belongsTo(Contractor, { foreignKey: "contractorId", onDelete: "CASCADE" });
Query.belongsTo(Project, { foreignKey: "projectId", onDelete: "CASCADE" });

export default Query;
