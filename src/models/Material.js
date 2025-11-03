import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";
import Contractor from "./Contractor.js";

const Material = sequelize.define("Material", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	name: { type: DataTypes.STRING, allowNull: false },
	quantity: { type: DataTypes.FLOAT, allowNull: false },
	unit: { type: DataTypes.STRING, defaultValue: "pcs" },
	cost: { type: DataTypes.FLOAT, allowNull: false },
	status: {
		type: DataTypes.ENUM("pending", "delivered", "used"),
		defaultValue: "pending",
	},
	projectId: { type: DataTypes.INTEGER },
	contractorId: { type: DataTypes.INTEGER }
});

// ✅ Associations with alias
Material.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Material, { foreignKey: "projectId", as: "materials" });

Material.belongsTo(Contractor, { foreignKey: "contractorId", as: "contractor" });
Contractor.hasMany(Material, { foreignKey: "contractorId", as: "materials" });

export default Material;
