import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const ContractorType = sequelize.define(
	"ContractorType",
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING, unique: true, allowNull: false },
	},
	{ tableName: "contractor_types" }
);

export default ContractorType;
