import { NextResponse } from "next/server";
import ProjectType from "@/models/ProjectType";
import "@/lib/db";

// GET ALL
export async function GET() {
	try {
		const types = await ProjectType.findAll({
			order: [["id", "ASC"]],
		});
		return NextResponse.json({ success: true, types });
	} catch (err) {
		console.error("❌ GET ProjectTypes ERROR:", err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

// CREATE
export async function POST(req) {
	try {
		const body = await req.json();

		if (!body.name)
			return NextResponse.json({ success: false, error: "Name required" }, { status: 400 });

		const type = await ProjectType.create({
			name: body.name,
			description: body.description || null,
		});

		return NextResponse.json({ success: true, type });

	} catch (err) {
		console.error("❌ POST ProjectTypes ERROR:", err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
