import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const ContractorTypeAssignment = sequelize.define(
	"ContractorTypeAssignment",
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		contractorId: { type: DataTypes.INTEGER, allowNull: false },
		typeId: { type: DataTypes.INTEGER, allowNull: false },
	},
	{ tableName: "contractor_type_assignment" }
);

export default ContractorTypeAssignment;
