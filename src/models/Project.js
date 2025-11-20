import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

import Client from "./Client.js";
import Contractor from "./Contractor.js";
import ProjectType from "./ProjectType.js";

// 🆕 Function to generate unique project code
function generateProjectId() {
	return "PR" + Math.floor(100000 + Math.random() * 900000);
}

const Project = sequelize.define("Project", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	// 🆕 Auto generated unique Project ID
	projectUid: {
		type: DataTypes.STRING,
		unique: true,
		defaultValue: generateProjectId
	},

	title: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.TEXT },

	status: {
		type: DataTypes.ENUM(
			"pending_approval",
			"approved",
			"planned",
			"in_progress",
			"completed"
		),
		defaultValue: "pending_approval",
	},

	startDate: { type: DataTypes.DATE },
	endDate: { type: DataTypes.DATE },
	totalCost: { type: DataTypes.FLOAT, defaultValue: 0 },
	totalMaterialCost: { type: DataTypes.FLOAT, defaultValue: 0 },

	clientApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
	contractorApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
	adminLocked: { type: DataTypes.BOOLEAN, defaultValue: false },

	clientId: { type: DataTypes.INTEGER, allowNull: false },
	contractorId: { type: DataTypes.INTEGER, allowNull: false },
	projectTypeId: { type: DataTypes.INTEGER, allowNull: false },
});

// Associations
Project.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Project, { foreignKey: "clientId" });

Project.belongsTo(Contractor, { foreignKey: "contractorId", as: "contractor" });
Contractor.hasMany(Project, { foreignKey: "contractorId" });

Project.belongsTo(ProjectType, { foreignKey: "projectTypeId", as: "projectType" });
ProjectType.hasMany(Project, { foreignKey: "projectTypeId" });

export default Project;
