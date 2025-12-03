import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const ContractorTypeLink = sequelize.define(
	"ContractorTypeLink",
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
		contractorId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: "contractors", key: "id" },
		},
		typeId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: { model: "contractor_types", key: "id" },
		},
	},
	{ tableName: "contractor_type_links" }
);

/* ======================================================
   FIX: Lazy-load associations AFTER all models are loaded
====================================================== */

export function registerContractorTypeRelations() {
	const Contractor = require("./Contractor.js").default;
	const ContractorType = require("./ContractorType.js").default;

	Contractor.belongsToMany(ContractorType, {
		through: ContractorTypeLink,
		foreignKey: "contractorId",
		as: "types",
	});

	ContractorType.belongsToMany(Contractor, {
		through: ContractorTypeLink,
		foreignKey: "typeId",
		as: "contractors",
	});
}

export default ContractorTypeLink;
