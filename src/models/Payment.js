// models/Payment.js
import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";
import Client from "./Client.js";
import Contractor from "./Contractor.js";
import Project from "./Project.js";

const Payment = sequelize.define("Payment", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	projectId: { type: DataTypes.INTEGER, allowNull: false },
	clientId: { type: DataTypes.INTEGER },
	contractorId: { type: DataTypes.INTEGER },

	// Who is paying?
	payerType: { type: DataTypes.ENUM("client", "admin"), allowNull: false },

	// Who is receiving?
	receiverType: { type: DataTypes.ENUM("admin", "contractor"), allowNull: false },

	amount: { type: DataTypes.FLOAT, allowNull: false },

	installmentNo: { type: DataTypes.INTEGER, defaultValue: 1 },
	totalInstallments: { type: DataTypes.INTEGER, defaultValue: 1 },

	dueDate: { type: DataTypes.DATEONLY },
	status: {
		type: DataTypes.ENUM("pending", "completed", "overdue", "partial"),
		defaultValue: "pending"
	},
	notes: { type: DataTypes.TEXT },
});

Payment.belongsTo(Project, { foreignKey: "projectId" });
Payment.belongsTo(Client, { foreignKey: "clientId" });
Payment.belongsTo(Contractor, { foreignKey: "contractorId" });

export default Payment;
