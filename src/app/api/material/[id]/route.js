import { NextResponse } from "next/server";
import Material from "@/models/Material";
import Project from "@/models/Project";
import jwt from "jsonwebtoken";
import "@/lib/sync";

function getUser(req) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader) return null;
		const token = authHeader.split(" ")[1];
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch {
		return null;
	}
}

// ✅ GET SINGLE MATERIAL
export async function GET(req, context) {
	const params = await context.params; // ✅ FIX
	const decoded = getUser(req);
	if (!decoded) return NextResponse.json({ msg: "Invalid token" }, { status: 401 });

	const material = await Material.findByPk(params.id);
	return NextResponse.json({ success: true, data: material });
}

// ✅ UPDATE MATERIAL
// ✅ UPDATE MATERIAL
export async function PUT(req, context) {
	const params = await context.params;
	const decoded = getUser(req);
	if (!decoded) return NextResponse.json({ msg: "Invalid token" }, { status: 401 });

	const body = await req.json();

	const material = await Material.findByPk(params.id, {
		include: [{ model: Project, as: "project" }],
	});

	if (!material || material.project.contractorId !== decoded.id)
		return NextResponse.json({ msg: "Not allowed" }, { status: 403 });

	await Material.update(body, { where: { id: params.id } });
	return NextResponse.json({ success: true });
}

// ✅ DELETE MATERIAL
export async function DELETE(req, context) {
	const params = await context.params;
	const decoded = getUser(req);
	if (!decoded) return NextResponse.json({ msg: "Invalid token" }, { status: 401 });

	const material = await Material.findByPk(params.id, {
		include: [{ model: Project, as: "project" }],
	});

	if (!material || material.project.contractorId !== decoded.id)
		return NextResponse.json({ msg: "Not allowed" }, { status: 403 });

	await Material.destroy({ where: { id: params.id } });
	return NextResponse.json({ success: true });
}

