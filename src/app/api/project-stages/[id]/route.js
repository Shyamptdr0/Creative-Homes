import ProjectStage from "@/models/ProjectStage";
import { NextResponse } from "next/server";

export async function DELETE(req, context) {
	try {
		const { id } = await context.params;   // ⬅ MUST AWAIT params

		const stage = await ProjectStage.findByPk(id);
		if (!stage) {
			return NextResponse.json(
				{ success: false, error: "Stage not found" },
				{ status: 404 }
			);
		}

		await stage.destroy();

		return NextResponse.json({ success: true, message: "Stage removed" });
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
