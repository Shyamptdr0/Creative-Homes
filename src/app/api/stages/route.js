import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import Project from "@/models/Project";
import ProjectType from "@/models/ProjectType";
import StageRemark from "@/models/StageRemark";
import "@/lib/db";

export async function GET() {
	try {
		const stages = await Stage.findAll({
			include: [
				{
					model: Project,
					as: "project",
					attributes: ["id", "title"],
					include: [{ model: ProjectType, as: "projectType", attributes: ["name"] }],
				},
				{
					model: StageRemark,
					as: "remarks",
					attributes: ["id", "by", "message", "createdAt"],
				},
			],
			order: [["id", "ASC"]],
		});

		return NextResponse.json({ success: true, stages });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const body = await req.json();

		if (!body.name || !body.projectId)
			return NextResponse.json({ success: false, error: "name & projectId required" }, { status: 400 });

		const stage = await Stage.create({
			name: body.name,
			description: body.description || "",
			projectId: body.projectId,
			isCompleted: false,
			isApproved: false,
		});

		return NextResponse.json({ success: true, stage });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
