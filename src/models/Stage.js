 import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";
import User from "./User.js";

const Stage = sequelize.define("Stage", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	stageName: DataTypes.STRING,
	progress: DataTypes.INTEGER,
	status: DataTypes.ENUM("pending", "in_progress", "done"),
	notes: DataTypes.TEXT,
	images: DataTypes.JSON,
});

Stage.belongsTo(Project, { foreignKey: "projectId" });
Stage.belongsTo(User, { foreignKey: "updatedBy" });

export default Stage;
