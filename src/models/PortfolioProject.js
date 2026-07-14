import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const PortfolioProject = sequelize.define("PortfolioProject", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	name: { type: DataTypes.STRING, allowNull: false },
	image: { type: DataTypes.STRING, allowNull: false },
	city: { type: DataTypes.STRING },
	floors: { type: DataTypes.STRING },
	dimensions: { type: DataTypes.STRING },
	facing: { type: DataTypes.STRING },
	budget: { type: DataTypes.STRING },
	description: { type: DataTypes.TEXT },
	
	// New fields for Hero Slider
	architectName: { type: DataTypes.STRING },
	work: { type: DataTypes.STRING },
	isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
	featuredRank: { type: DataTypes.INTEGER, defaultValue: 0 }
});

export default PortfolioProject;
