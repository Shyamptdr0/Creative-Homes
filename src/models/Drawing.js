import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";
import * as Data from "sequelize/lib/utils";

const Drawing = sequelize.define("Drawing", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	projectId: { type: DataTypes.INTEGER, allowNull: false },
	title: { type: DataTypes.STRING, allowNull: false },
	fileUrl: { type: DataTypes.STRING, allowNull: false }, // Cloudinary URL

	// ✅ New field
	uploadedAt: {
		type: DataTypes.DATE,
		defaultValue: Data.now
	},
});

Project.hasMany(Drawing, { foreignKey: "projectId", as: "drawings" });
Drawing.belongsTo(Project, { foreignKey: "projectId", as: "project" });

export default Drawing;
