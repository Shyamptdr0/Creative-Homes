import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";
import Contractor from "./Contractor.js";

const Material = sequelize.define("Material", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	// contractor requirement fields
	name: { type: DataTypes.STRING, allowNull: false },
	quantity: { type: DataTypes.FLOAT, allowNull: false },
	unit: { type: DataTypes.STRING, defaultValue: "pcs" },

	// admin side fields
	cost: { type: DataTypes.FLOAT, allowNull: true },
	billImage: { type: DataTypes.STRING, allowNull: true },

	status: {
		type: DataTypes.ENUM(
			"requested",
			"approved",
			"rejected",
			"delivered",
			"used"
		),
		defaultValue: "requested",
	},

	projectId: DataTypes.INTEGER,
	contractorId: DataTypes.INTEGER,
});

Material.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Material, { foreignKey: "projectId", as: "materials" });

Material.belongsTo(Contractor, { foreignKey: "contractorId", as: "contractor" });
Contractor.hasMany(Material, { foreignKey: "contractorId", as: "materials" });

export default Material;
