import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

import Project from "./Project.js";
import StageTemplate from "./StageTemplate.js";
import StageRemark from "./StageRemark.js";

const ProjectStage = sequelize.define("ProjectStage", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	projectId: { type: DataTypes.INTEGER, allowNull: false },
	stageTemplateId: { type: DataTypes.INTEGER, allowNull: false },

	contractorId: { type: DataTypes.INTEGER, allowNull: true },

	status: {
		type: DataTypes.ENUM("pending", "in_progress", "completed", "approved", "rejected"),
		defaultValue: "pending",
	},
}, {
	tableName: "ProjectStages",
	timestamps: true,
});

// Project
ProjectStage.belongsTo(Project, {
	foreignKey: "projectId",
	as: "project",
});

// Template
ProjectStage.belongsTo(StageTemplate, {
	foreignKey: "stageTemplateId",
	as: "StageTemplate",
});

// Remarks — 🔥 REAL FIX IS HERE
ProjectStage.hasMany(StageRemark, {
	foreignKey: "projectStageId",
	as: "remarks",       // <--- THIS ALIAS YOU WANT
});

StageRemark.belongsTo(ProjectStage, {
	foreignKey: "projectStageId",
	as: "projectStage",  // this is correct
});

export default ProjectStage;
