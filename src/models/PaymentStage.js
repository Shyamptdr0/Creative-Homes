import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Project from "./Project.js";

const PaymentStage = sequelize.define(
	"PaymentStage",
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

		projectId: { type: DataTypes.INTEGER, allowNull: false },

		stageOrder: { type: DataTypes.INTEGER, allowNull: false },
		stageName: { type: DataTypes.STRING, allowNull: false },

		percentage: { type: DataTypes.FLOAT, allowNull: false },
		amount: { type: DataTypes.FLOAT, allowNull: false },

		remarks: { type: DataTypes.TEXT },
	},
	{ tableName: "paymentStages" }
);

PaymentStage.belongsTo(Project, { foreignKey: "projectId", as: "project" });

Project.hasMany(PaymentStage, {
	foreignKey: "projectId",
	as: "stages",
	order: [["stageOrder", "ASC"]],
});

export default PaymentStage;
