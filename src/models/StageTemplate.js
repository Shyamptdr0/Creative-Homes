import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import ProjectType from "./ProjectType.js";

const StageTemplate = sequelize.define("StageTemplate", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	name: { type: DataTypes.STRING, allowNull: false },

	projectTypeId: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
}, {
	tableName: "StageTemplates",
	timestamps: true,
});

// Association
StageTemplate.belongsTo(ProjectType, { foreignKey: "projectTypeId" });
ProjectType.hasMany(StageTemplate, { foreignKey: "projectTypeId" });

export default StageTemplate;
