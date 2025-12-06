import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Material from "@/models/Material";
import Project from "@/models/Project";
import "@/lib/db";

function getUser(req) {
	const auth = req.headers.get("authorization");
	if (!auth) return null;
	try {
		return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
	} catch {
		return null;
	}
}

// Contractor creates simple requirement (NO cost, NO bill)
export async function POST(req) {
	const user = getUser(req);
	if (!user)
		return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

	const body = await req.json();

	if (!body.projectId || !body.name || !body.quantity || !body.unit) {
		return NextResponse.json(
			{ msg: "Missing required fields" },
			{ status: 400 }
		);
	}

	const projectExists = await Project.findByPk(body.projectId);
	if (!projectExists)
		return NextResponse.json({ msg: "Invalid project" }, { status: 400 });

	const material = await Material.create({
		name: body.name,
		quantity: body.quantity,
		unit: body.unit,
		projectId: body.projectId,
		contractorId: user.id,
		status: "requested", // auto
		cost: null,
		billImage: null,
	});

	return NextResponse.json({ success: true, data: material });
}
