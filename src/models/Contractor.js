import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import ContractorType from "./ContractorType.js";
import ContractorTypeAssignment from "./ContractorTypeAssignment.js";

const Contractor = sequelize.define(
	"Contractor",
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

		contractorId: { type: DataTypes.STRING, unique: true, allowNull: false },

		name: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, unique: true },
		phone: DataTypes.STRING,
		address: DataTypes.STRING,

		aadhaar: DataTypes.STRING,
		pan: DataTypes.STRING,
		photo: DataTypes.STRING,

		password: { type: DataTypes.STRING, allowNull: false },
		visiblePassword: { type: DataTypes.STRING, allowNull: false },
	},
	{ tableName: "contractors" }
);

// ⭐ ONLY ONE MANY-TO-MANY
Contractor.belongsToMany(ContractorType, {
	through: ContractorTypeAssignment,
	foreignKey: "contractorId",
	as: "types",
});

ContractorType.belongsToMany(Contractor, {
	through: ContractorTypeAssignment,
	foreignKey: "typeId",
	as: "contractors",
});

export default Contractor;
