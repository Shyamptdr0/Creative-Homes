import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import ContractorType from "@/models/ContractorType";
import ContractorTypeAssignment from "@/models/ContractorTypeAssignment";
import Project from "@/models/Project";
import { NextResponse } from "next/server";

/* -----------------------------
   Find User by ID + Role
------------------------------ */
async function findUser(id, role) {
	if (!role) return null;
	role = role.toLowerCase();

	if (role === "client") {
		const user = await Client.findByPk(id);
		return user ? { user, role, key: "clientId" } : null;
	}

	if (role === "contractor") {
		const user = await Contractor.findByPk(id, {
			include: [
				{
					model: ContractorType,
					as: "types",
					through: { attributes: [] },
				},
			],
		});
		return user ? { user, role, key: "contractorId" } : null;
	}

	return null;
}

/* ============================
   GET SINGLE USER
============================ */
export async function GET(req, context) {
	const { id } = await context.params;
	const role = req.nextUrl.searchParams.get("role")?.toLowerCase();

	const data = await findUser(id, role);
	if (!data) return NextResponse.json({ success: false }, { status: 404 });

	// Prepare response
	let user = { ...data.user.dataValues, role };
	user.userId = data.user[data.key];

	// Include contractor types array
	if (role === "contractor") {
		user.types = data.user.types?.map((t) => ({
			id: t.id,
			name: t.name,
		}));
	}

	return NextResponse.json({ success: true, user });
}

/* ============================
   UPDATE SINGLE USER
============================ */
export async function PUT(req, context) {
	const { id } = await context.params;
	const role = req.nextUrl.searchParams.get("role")?.toLowerCase();
	const body = await req.json();

	const data = await findUser(id, role);
	if (!data) return NextResponse.json({ success: false }, { status: 404 });

	const { types = [], ...updateFields } = body;

	// Update user base fields
	await data.user.update(updateFields);

	/* UPDATE MULTIPLE CONTRACTOR TYPES */
	if (role === "contractor") {
		// Remove old type assignments
		await ContractorTypeAssignment.destroy({
			where: { contractorId: id },
		});

		// Add new type assignments
		if (Array.isArray(types) && types.length > 0) {
			await ContractorTypeAssignment.bulkCreate(
				types.map((t) => ({
					contractorId: id,
					typeId: t,
				}))
			);
		}
	}

	return NextResponse.json({ success: true });
}

/* ============================
   DELETE SINGLE USER
============================ */
export async function DELETE(req, context) {
	const { id } = await context.params;
	const role = req.nextUrl.searchParams.get("role")?.toLowerCase();

	const data = await findUser(id, role);
	if (!data) return NextResponse.json({ success: false }, { status: 404 });

	// Cannot delete if linked to a project
	const where =
		role === "client" ? { clientId: id } : { contractorId: id };

	const projectExists = await Project.findOne({ where });
	if (projectExists) {
		return NextResponse.json(
			{
				success: false,
				msg: "Cannot delete — user has assigned projects",
			},
			{ status: 400 }
		);
	}

	// Delete contractor type assignments
	if (role === "contractor") {
		await ContractorTypeAssignment.destroy({
			where: { contractorId: id },
		});
	}

	// Delete user
	await data.user.destroy();

	return NextResponse.json({ success: true });
}
