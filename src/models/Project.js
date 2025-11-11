import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

import Client from "./Client.js";
import Contractor from "./Contractor.js";
import ProjectType from "./ProjectType.js";

const Project = sequelize.define("Project", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	title: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.TEXT },
	status: {
		type: DataTypes.ENUM("planned", "in_progress", "completed"),
		defaultValue: "planned",
	},
	startDate: { type: DataTypes.DATE },
	endDate: { type: DataTypes.DATE },
	totalCost: { type: DataTypes.FLOAT, defaultValue: 0 },
	totalMaterialCost: { type: DataTypes.FLOAT, defaultValue: 0 },

	clientId: { type: DataTypes.INTEGER, allowNull: false },
	contractorId: { type: DataTypes.INTEGER, allowNull: false },
	projectTypeId: { type: DataTypes.INTEGER, allowNull: false },
});

// ✅ Client relationship
Project.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Project, { foreignKey: "clientId" });

// ✅ Contractor relationship
Project.belongsTo(Contractor, { foreignKey: "contractorId", as: "contractor" });
Contractor.hasMany(Project, { foreignKey: "contractorId" });

// ✅ Project Type relationship
Project.belongsTo(ProjectType, { foreignKey: "projectTypeId", as: "projectType" });
ProjectType.hasMany(Project, { foreignKey: "projectTypeId" });

export default Project;
