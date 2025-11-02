export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("clients", {
		id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

		clientId: { type: Sequelize.STRING, unique: true, allowNull: false },
		name: { type: Sequelize.STRING, allowNull: false },
		email: { type: Sequelize.STRING, unique: true },
		phone: Sequelize.STRING,
		address: Sequelize.STRING,

		password: { type: Sequelize.STRING, allowNull: false },
		visiblePassword: { type: Sequelize.STRING, allowNull: false },

		createdAt: { allowNull: false, type: Sequelize.DATE },
		updatedAt: { allowNull: false, type: Sequelize.DATE }
	});
}

export async function down(queryInterface) {
	await queryInterface.dropTable("clients");
}
