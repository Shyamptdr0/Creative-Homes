import { NextResponse } from "next/server";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Material from "@/models/Material"; // ✅ ADD
import "@/lib/db";
import jwt from "jsonwebtoken";

// ✅ Get User From Token
function getUser(req) {
	const authHeader = req.headers.get("authorization");
	if (!authHeader) return null;

	const token = authHeader.split(" ")[1];
	if (!token) return null;

	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch {
		return null;
	}
}

// ✅ GET Project by ID
export async function GET(req, context) {
	try {
		const decoded = getUser(req);
		if (!decoded)
			return NextResponse.json({ success: false, error: "Token invalid" }, { status: 401 });

		const { id } = await context.params;

		const filter = { id };
		if (decoded.role === "client") filter.clientId = decoded.id;
		if (decoded.role === "contractor") filter.contractorId = decoded.id;

		const project = await Project.findOne({
			where: filter,
			include: [
				{ model: Client, as: "client" },
				{ model: Contractor, as: "contractor" },
			]
		});

		if (!project)
			return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

		return NextResponse.json({ success: true, project });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

// ✅ UPDATE Project
export async function PUT(req, context) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader)
			return NextResponse.json({ success: false, msg: "No token" }, { status: 401 });

		const token = authHeader.split(" ")[1];
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch {
			return NextResponse.json({ success: false, msg: "Invalid token" }, { status: 401 });
		}

		const { id } = await context.params;
		const data = await req.json();

		const project = await Project.findByPk(id, {
			include: [
				{ model: Client, as: "client", attributes: ["id"] },
				{ model: Contractor, as: "contractor", attributes: ["id"] },
			],
		});

		if (!project)
			return NextResponse.json({ success: false, msg: "Not found" }, { status: 404 });

		if (decoded.role === "contractor" && project.contractorId !== decoded.id)
			return NextResponse.json({ success: false, msg: "No permission" }, { status: 403 });

		if (decoded.role === "client" && project.clientId !== decoded.id)
			return NextResponse.json({ success: false, msg: "No permission" }, { status: 403 });

		await project.update(data);

		return NextResponse.json({ success: true, msg: "Updated", project });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

// ✅ DELETE Project
export async function DELETE(req, context) {
	try {
		const decoded = getUser(req);
		if (!decoded)
			return NextResponse.json({ success: false, error: "Token invalid" }, { status: 401 });

		const { id } = await context.params;

		const project = await Project.findByPk(id);
		if (!project)
			return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

		// ✅ Only owner or admin can delete
		if (decoded.role === "client" && project.clientId !== decoded.id)
			return NextResponse.json({ success: false, error: "No permission" }, { status: 403 });

		if (decoded.role === "contractor" && project.contractorId !== decoded.id)
			return NextResponse.json({ success: false, error: "No permission" }, { status: 403 });

		// ✅ First delete related materials
		await Material.destroy({ where: { projectId: id } });

		// ✅ Now delete project
		await Project.destroy({ where: { id } });

		return NextResponse.json({ success: true, message: "Deleted" });
	} catch (err) {
		console.error("DELETE ERR:", err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
