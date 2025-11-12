import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import Project from "@/models/Project";
import "@/lib/db";

export async function GET() {
	const drawings = await Drawing.findAll({
		include: [{ model: Project, as: "project" }],
		order: [["id", "ASC"]],
	});
	return NextResponse.json(drawings);
}

export async function POST(req) {
	try {
		const form = await req.formData();
		const projectId = form.get("projectId");
		const title = form.get("title");
		const fileUrl = form.get("fileUrl");

		const drawing = await Drawing.create({ projectId, title, fileUrl });
		return NextResponse.json(drawing);
	} catch (err) {
		console.log("POST drawing error", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
