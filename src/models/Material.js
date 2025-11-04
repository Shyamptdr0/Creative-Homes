import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";
import Contractor from "./Contractor.js";

const Material = sequelize.define("Material", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	name: DataTypes.STRING,
	quantity: DataTypes.FLOAT,
	unit: { type: DataTypes.STRING, defaultValue: "pcs" },
	cost: DataTypes.FLOAT,
	status: {
		type: DataTypes.ENUM("pending", "delivered", "used"),
		defaultValue: "pending",
	},
	billImage: DataTypes.STRING,
	projectId: DataTypes.INTEGER,
	contractorId: DataTypes.INTEGER,
});

Material.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Material, { foreignKey: "projectId", as: "materials" });

Material.belongsTo(Contractor, { foreignKey: "contractorId", as: "contractor" });
Contractor.hasMany(Material, { foreignKey: "contractorId", as: "materials" });

export default Material;
