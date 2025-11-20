import { NextResponse } from "next/server";
import StageRemark from "@/models/StageRemark";
import "@/lib/db";

export async function GET(req, context) {
	try {
		const { id } = await context.params;

		const remarks = await StageRemark.findAll({
			where: { projectStageId: id }
		});

		const external = remarks.some(
			(r) => r.userRole === "contractor" || r.userRole === "client"
		);

		return NextResponse.json({
			success: true,
			externalRemarks: external
		});

	} catch (err) {
		console.error("HAS REMARK API ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
