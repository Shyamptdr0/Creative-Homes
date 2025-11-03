import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Project from "@/models/Project";
import { NextResponse } from "next/server";

async function findUser(id, role) {
	if (!role) return null;
	role = role.toLowerCase();

	if (role === "client") {
		const user = await Client.findByPk(id);
		return user ? { user, role, key: "clientId" } : null;
	}

	if (role === "contractor") {
		const user = await Contractor.findByPk(id);
		return user ? { user, role, key: "contractorId" } : null;
	}

	return null;
}

// ✅ GET Single User
export async function GET(req, context) {
	const { id } = await context.params;
	const role = req.nextUrl.searchParams.get("role")?.toLowerCase();

	const data = await findUser(id, role);
	if (!data) return NextResponse.json({ success: false }, { status: 404 });

	return NextResponse.json({
		success: true,
		user: { ...data.user.dataValues, userId: data.user[data.key], role }
	});
}

// ✅ UPDATE User
export async function PUT(req, context) {
	const { id } = await context.params;
	const role = req.nextUrl.searchParams.get("role")?.toLowerCase();
	const body = await req.json();

	const data = await findUser(id, role);
	if (!data) return NextResponse.json({ success: false }, { status: 404 });

	await data.user.update(body);
	return NextResponse.json({ success: true });
}

// ✅ DELETE User
export async function DELETE(req, context) {
	const { id } = await context.params;
	const role = req.nextUrl.searchParams.get("role")?.toLowerCase();

	const data = await findUser(id, role);
	if (!data) return NextResponse.json({ success: false }, { status: 404 });

	// ✅ Check if user linked to project
	const where = role === "client" ? { clientId: id } : { contractorId: id };
	const projectExists = await Project.findOne({ where });

	if (projectExists) {
		return NextResponse.json(
			{ success: false, msg: "Cannot delete — user has assigned projects" },
			{ status: 400 }
		);
	}

	await data.user.destroy();
	return NextResponse.json({ success: true });
}
