import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";

const Stage = sequelize.define("Stage", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	name: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.TEXT },

	startDate: { type: DataTypes.DATE, allowNull: true },
	endDate: { type: DataTypes.DATE, allowNull: true },

	progress: { type: DataTypes.FLOAT, defaultValue: 0 }, // 0 - 100

	images: {
		type: DataTypes.JSON, // store array of image URLs
		defaultValue: [],
	},

	projectId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "stages" });

// Relationships
Stage.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Stage, { foreignKey: "projectId", as: "stages" });

export default Stage;
