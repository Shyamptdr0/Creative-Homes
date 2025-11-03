import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import Project from "@/models/Project";
import "@/lib/sync";

export async function POST(req) {
	try {
		const data = await req.json();

		const project = await Project.findByPk(data.projectId);
		if (!project) {
			return NextResponse.json({ success: false, msg: "Project not found" }, { status: 404 });
		}

		const stage = await Stage.create(data);

		return NextResponse.json({ success: true, stage });
	} catch (e) {
		console.log(e);
		return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
	}
}
