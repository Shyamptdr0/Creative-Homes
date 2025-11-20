import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const StageRemark = sequelize.define("StageRemark", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	projectStageId: { type: DataTypes.INTEGER, allowNull: false },

	userRole: {
		type: DataTypes.ENUM("admin", "contractor", "client"),
		allowNull: false,
	},

	remark: { type: DataTypes.TEXT, allowNull: false },
}, {
	tableName: "StageRemarks",
	timestamps: true,
});

export default StageRemark;
