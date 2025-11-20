import { NextResponse } from "next/server";
import StageTemplate from "@/models/StageTemplate";
import ProjectStage from "@/models/ProjectStage";
import StageRemark from "@/models/StageRemark";
import "@/lib/db";

/* ============================================================
   UPDATE TEMPLATE
============================================================ */
export async function PUT(req, context) {
	try {
		const { id } = await context.params;
		const body = await req.json();

		const { name, projectTypeId } = body;

		await StageTemplate.update(
			{ name, projectTypeId },
			{ where: { id } }
		);

		return NextResponse.json({ success: true });

	} catch (err) {
		console.error("UPDATE TEMPLATE ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* ============================================================
   DELETE TEMPLATE (FULL CASCADE)
============================================================ */
export async function DELETE(req, context) {
	try {
		const { id } = await context.params;

		const template = await StageTemplate.findByPk(id);
		if (!template) {
			return NextResponse.json(
				{ success: false, error: "Template not found" },
				{ status: 404 }
			);
		}

		// Step 1: Get all project stages using this template
		const projectStages = await ProjectStage.findAll({
			where: { stageTemplateId: id },
			attributes: ["id"],
		});

		const stageIds = projectStages.map(ps => ps.id);

		// Step 2: Delete remarks linked to these projectStages
		if (stageIds.length > 0) {
			await StageRemark.destroy({
				where: { projectStageId: stageIds }
			});
		}

		// Step 3: Delete projectStages
		await ProjectStage.destroy({
			where: { stageTemplateId: id }
		});

		// Step 4: Delete Template
		await template.destroy();

		return NextResponse.json({ success: true });

	} catch (err) {
		console.error("DELETE TEMPLATE ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
