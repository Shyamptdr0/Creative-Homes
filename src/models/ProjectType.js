import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const ProjectType = sequelize.define("ProjectType", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	name: { type: DataTypes.STRING, allowNull: false },
}, {
	tableName: "ProjectTypes",     // ✅ FIX
	timestamps: false,             // ✅ (optional)
});

export default ProjectType;
