// api/project-stages/create/route.js
import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import Project from "@/models/Project";
import "@/lib/db";

export async function POST(req) {
	try {
		const body = await req.json();
		const { projectId, stageTemplateIds, floorName } = body;

		if (!projectId) {
			return NextResponse.json({ success: false, error: "projectId required" }, { status: 400 });
		}

		if (!floorName || floorName.trim() === "") {
			return NextResponse.json({ success: false, error: "floorName required" }, { status: 400 });
		}

		if (!Array.isArray(stageTemplateIds) || stageTemplateIds.length === 0) {
			return NextResponse.json({ success: false, error: "stageTemplateIds must be array" }, { status: 400 });
		}

		const project = await Project.findByPk(projectId);
		if (!project) {
			return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
		}

		const contractorId = project.contractorId || null;

		// check existing
		const already = await ProjectStage.findAll({
			where: { projectId, floorName },
			attributes: ["stageTemplateId"]
		});

		const existingIds = new Set(already.map(a => a.stageTemplateId));
		const finalStages = stageTemplateIds.filter(id => !existingIds.has(id));

		if (finalStages.length === 0) {
			return NextResponse.json({ success: true, message: "No new stages to assign" });
		}

		const payload = finalStages.map(id => ({
			projectId,
			stageTemplateId: id,
			floorName,
			contractorId,
			status: "pending",
		}));

		await ProjectStage.bulkCreate(payload);

		return NextResponse.json({
			success: true,
			message: "Stages assigned successfully",
			added: payload.length
		});

	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
