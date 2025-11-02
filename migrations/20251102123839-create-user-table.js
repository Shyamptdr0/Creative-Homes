export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("Users", {
		id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
		email: { type: Sequelize.STRING, unique: true },
		password: { type: Sequelize.STRING, allowNull: false },
		role: { type: Sequelize.ENUM("admin","client","contractor"), defaultValue: "admin" },
		name: Sequelize.STRING,
		createdAt: { allowNull: false, type: Sequelize.DATE },
		updatedAt: { allowNull: false, type: Sequelize.DATE }
	});
}

export async function down(queryInterface) {
	await queryInterface.dropTable("Users");
}
