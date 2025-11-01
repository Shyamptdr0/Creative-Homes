import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import { NextResponse } from "next/server";

async function findUser(id) {
	let user = await Client.findByPk(id);
	if (user) return { user, type: "client", key: "clientId" };

	user = await Contractor.findByPk(id);
	if (user) return { user, type: "contractor", key: "contractorId" };

	return null;
}

// ✅ GET single user
export async function GET(req, context) {
	const params = await context.params;
	const data = await findUser(params.id);

	if (!data) return NextResponse.json({ success: false });

	return NextResponse.json({
		success: true,
		user: {
			...data.user.dataValues,
			role: data.type,
			userId: data.user[data.key],
		},
	});
}

// ✅ UPDATE user
export async function PUT(req, context) {
	const params = await context.params;
	const body = await req.json();
	const data = await findUser(params.id);

	if (!data) return NextResponse.json({ success: false });

	await data.user.update(body);
	return NextResponse.json({ success: true });
}

// ✅ DELETE user
export async function DELETE(req, context) {
	const params = await context.params;
	const data = await findUser(params.id);

	if (!data) return NextResponse.json({ success: false });

	await data.user.destroy();
	return NextResponse.json({ success: true });
}
