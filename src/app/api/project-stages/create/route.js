import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import Project from "@/models/Project";
import "@/lib/db";

export async function POST(req) {
	try {
		const body = await req.json();
		const { projectId, stageTemplateIds } = body;

		// --------------------------------------------------------
		// VALIDATION
		// --------------------------------------------------------
		if (!projectId) {
			return NextResponse.json(
				{ success: false, error: "projectId is required" },
				{ status: 400 }
			);
		}

		if (!stageTemplateIds || !Array.isArray(stageTemplateIds) || stageTemplateIds.length === 0) {
			return NextResponse.json(
				{ success: false, error: "stageTemplateIds must be a non-empty array" },
				{ status: 400 }
			);
		}

		// --------------------------------------------------------
		// GET PROJECT → used to extract contractorId
		// --------------------------------------------------------
		const project = await Project.findByPk(projectId);

		if (!project) {
			return NextResponse.json(
				{ success: false, error: "Project not found" },
				{ status: 404 }
			);
		}

		const contractorId = project.contractorId || null;

		// --------------------------------------------------------
		// REMOVE ALREADY ASSIGNED STAGES (avoid duplicates)
		// --------------------------------------------------------
		const already = await ProjectStage.findAll({
			where: { projectId },
			attributes: ["stageTemplateId"]
		});

		const alreadyIds = new Set(already.map(a => a.stageTemplateId));

		const newStages = stageTemplateIds.filter(id => !alreadyIds.has(id));

		if (newStages.length === 0) {
			return NextResponse.json({
				success: true,
				message: "All selected stages already assigned",
			});
		}

		// --------------------------------------------------------
		// BULK INSERT (faster than loop)
		// --------------------------------------------------------
		const payload = newStages.map(id => ({
			projectId,
			stageTemplateId: id,
			contractorId,
			status: "pending",
		}));

		await ProjectStage.bulkCreate(payload);

		// --------------------------------------------------------
		// DONE
		// --------------------------------------------------------
		return NextResponse.json({
			success: true,
			addedCount: payload.length,
			message: "Stages assigned successfully",
		});

	} catch (err) {
		console.error("CREATE PROJECT STAGE ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
