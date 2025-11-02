export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("projects", {
		id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

		title: { type: Sequelize.STRING, allowNull: false },
		description: Sequelize.TEXT,

		status: {
			type: Sequelize.ENUM("planned", "in_progress", "completed"),
			defaultValue: "planned"
		},

		startDate: Sequelize.DATE,
		endDate: Sequelize.DATE,
		totalCost: Sequelize.FLOAT,

		clientId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: { model: "clients", key: "id" },
			onDelete: "CASCADE"
		},

		contractorId: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: { model: "contractors", key: "id" },
			onDelete: "CASCADE"
		},

		createdAt: { allowNull: false, type: Sequelize.DATE },
		updatedAt: { allowNull: false, type: Sequelize.DATE }
	});
}

export async function down(queryInterface) {
	await queryInterface.dropTable("projects");
}
