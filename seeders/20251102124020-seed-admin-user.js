import bcrypt from "bcrypt";

export async function up(queryInterface) {
	const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
	await queryInterface.bulkInsert("Users", [
		{
			email: process.env.ADMIN_EMAIL,
			password: hashedPassword,
			role: "admin",
			name: "Admin",
			createdAt: new Date(),
			updatedAt: new Date()
		}
	]);
}

export async function down(queryInterface) {
	await queryInterface.bulkDelete("Users", { email: process.env.ADMIN_EMAIL });
}
