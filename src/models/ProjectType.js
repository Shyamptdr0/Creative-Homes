import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const ProjectType = sequelize.define("ProjectType", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	name: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.TEXT },
}, {
	tableName: "ProjectTypes",
	timestamps: true,

});
export default ProjectType;
