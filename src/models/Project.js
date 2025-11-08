import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Client from "./Client.js";
import Contractor from "./Contractor.js";

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
	totalCost: {
		type: DataTypes.FLOAT,
		defaultValue: 0,
	},
	// ✅ Material cost stored in project
	totalMaterialCost: {
		type: DataTypes.FLOAT,
		defaultValue: 0,
	},



	clientId: { type: DataTypes.INTEGER, allowNull: false },
	contractorId: { type: DataTypes.INTEGER, allowNull: false },
});

// ✅ Relationships
Project.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Project, { foreignKey: "clientId" });

Project.belongsTo(Contractor, { foreignKey: "contractorId", as: "contractor" });
Contractor.hasMany(Project, { foreignKey: "contractorId" });

export default Project;
