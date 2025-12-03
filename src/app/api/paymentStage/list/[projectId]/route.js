import { NextResponse } from "next/server";
import PaymentStage from "@/models/PaymentStage";

export async function GET(req, ctx) {
	try {
		// 🔥 FIX: unwrap params because they are async
		const { projectId } = await ctx.params;

		const stages = await PaymentStage.findAll({
			where: { projectId },
			order: [["stageOrder", "ASC"]],
		});

		return NextResponse.json({ success: true, stages });
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
