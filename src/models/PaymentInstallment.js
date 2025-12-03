import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const PaymentInstallment = sequelize.define(
	"PaymentInstallment",
	{
		id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

		paymentId: { type: DataTypes.INTEGER, allowNull: false },

		installmentNo: { type: DataTypes.INTEGER, allowNull: false },
		amount: { type: DataTypes.FLOAT, allowNull: false },

		dueDate: { type: DataTypes.DATEONLY, allowNull: false },

		paid: { type: DataTypes.BOOLEAN, defaultValue: false },
		remark: { type: DataTypes.TEXT },
	},
	{ tableName: "paymentInstallments" }
);

export default PaymentInstallment;
