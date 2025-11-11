// models/StageRemark.js
import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Stage from "./Stage.js";

const StageRemark = sequelize.define("StageRemark", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	stageId: { type: DataTypes.INTEGER, allowNull: false },

	// "admin" or "contractor"
	by: { type: DataTypes.STRING, allowNull: false },

	message: { type: DataTypes.TEXT, allowNull: false },
});

StageRemark.belongsTo(Stage, { foreignKey: "stageId", as: "stage", onDelete: "CASCADE" });
Stage.hasMany(StageRemark, { foreignKey: "stageId", as: "remarks", onDelete: "CASCADE" });

export default StageRemark;
