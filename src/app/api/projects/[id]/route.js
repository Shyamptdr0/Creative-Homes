import { NextResponse } from "next/server";
import Project from "@/models/Project";
import "@/lib/db";
import jwt from "jsonwebtoken";

function roleFilter(decoded) {
	const { role, id } = decoded;

	if (role === "client") return { clientId: id };
	if (role === "contractor") return { contractorId: id };
	return {}; // admin sees everything
}

export async function GET(req, { params }) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const filter = roleFilter(decoded);
		filter.id = params.id;

		const project = await Project.findOne({ where: filter });

		if (!project) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

		return NextResponse.json({ success: true, project });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

export async function PUT(req, { params }) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "admin")
			return NextResponse.json({ success: false, error: "Only admin can update projects" }, { status: 403 });

		const body = await req.json();
		const updated = await Project.update(body, { where: { id: params.id } });

		if (!updated[0])
			return NextResponse.json({ success: false, error: "No update or not found" }, { status: 404 });

		const project = await Project.findByPk(params.id);
		return NextResponse.json({ success: true, project });

	} catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "admin")
			return NextResponse.json({ success: false, error: "Only admin can delete projects" }, { status: 403 });

		const deleted = await Project.destroy({ where: { id: params.id } });

		if (!deleted) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

		return NextResponse.json({ success: true, message: "Project deleted" });

	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
