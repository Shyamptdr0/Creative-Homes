import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const User = sequelize.define("User", {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

	email: { type: DataTypes.STRING, unique: true, allowNull:true  },
	password: { type: DataTypes.STRING, allowNull: false },

	role: {
		type: DataTypes.ENUM("admin"),
		defaultValue: "admin",
	},

	name: DataTypes.STRING,
});

export default User;
