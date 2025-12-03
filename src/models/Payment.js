import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

import Client from "./Client.js";
import Contractor from "./Contractor.js";
import Project from "./Project.js";
import PaymentStage from "./PaymentStage.js";
import PaymentInstallment from "./PaymentInstallment.js";

const Payment = sequelize.define(
	"Payment",
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

		projectId: { type: DataTypes.INTEGER, allowNull: false },
		stageId: { type: DataTypes.INTEGER, allowNull: false },

		clientId: { type: DataTypes.INTEGER, allowNull: true },
		contractorId: { type: DataTypes.INTEGER, allowNull: true },

		payerType: { type: DataTypes.ENUM("client", "admin"), allowNull: false },
		receiverType: {
			type: DataTypes.ENUM("admin", "contractor"),
			allowNull: false,
		},

		totalAmount: { type: DataTypes.FLOAT, allowNull: false },
		paidAmount: { type: DataTypes.FLOAT, defaultValue: 0 },

		installmentCount: { type: DataTypes.INTEGER, defaultValue: 1 },

		dueDate: { type: DataTypes.DATEONLY },
		remarks: { type: DataTypes.TEXT },

		status: {
			type: DataTypes.ENUM("pending", "partial", "completed", "overdue"),
			defaultValue: "pending",
		},
	},
	{ tableName: "payments" }
);

// ------------------------------------
// ALL ASSOCIATIONS HERE (SAFE)
// ------------------------------------

Payment.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Payment.belongsTo(PaymentStage, { foreignKey: "stageId", as: "stage" });
Payment.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Payment.belongsTo(Contractor, { foreignKey: "contractorId", as: "contractor" });

Payment.hasMany(PaymentInstallment, {
	foreignKey: "paymentId",
	as: "installments",
});

// Reverse relation (safe here, Payment is already initialized)
PaymentInstallment.belongsTo(Payment, {
	foreignKey: "paymentId",
	as: "payment",
});

export default Payment;
