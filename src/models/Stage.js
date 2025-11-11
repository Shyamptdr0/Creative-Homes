import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";

const Stage = sequelize.define("Stage", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	name: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.TEXT },

	remark: { type: DataTypes.TEXT, defaultValue: "" },
	adminRemark: { type: DataTypes.TEXT, defaultValue: "" },

	isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
	isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },

	projectId: { type: DataTypes.INTEGER, allowNull: false },
});

Stage.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Stage, { foreignKey: "projectId", as: "stages" });

export default Stage;
