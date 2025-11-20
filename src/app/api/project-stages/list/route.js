import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import StageTemplate from "@/models/StageTemplate";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const projectId = searchParams.get("projectId");

		const stages = await ProjectStage.findAll({
			where: { projectId },
			include: [
				{
					model: StageTemplate,
					as: "StageTemplate",
					attributes: ["id", "name"],
				},
			],
			order: [["id", "ASC"]],
		});

		return NextResponse.json({
			success: true,
			stages,
		});
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
