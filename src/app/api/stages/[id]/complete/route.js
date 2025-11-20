import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import StageRemark from "@/models/StageRemark";
import { verifyToken } from "@/lib/auth";

export async function PUT(req, context) {
	try {
		// ⭐ FIX: unwrap params Promise
		const { id } = await context.params;
		const stageId = id;

		// ⭐ Read body safely
		let body = {};
		try {
			body = await req.json();
		} catch {
			body = {};
		}

		// ⭐ Token check
		const authHeader = req.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json(
				{ success: false, message: "Missing token" },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];

		let user;
		try {
			user = verifyToken(token);
		} catch {
			return NextResponse.json(
				{ success: false, message: "Invalid token" },
				{ status: 401 }
			);
		}

		// ⭐ Only contractor can mark complete
		if (user.role !== "contractor") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 403 }
			);
		}

		// ⭐ Stage check
		const stage = await ProjectStage.findByPk(stageId);
		if (!stage) {
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);
		}

		// ⭐ Status update
		await stage.update({ status: "completed" });

		// ⭐ Optional remark
		if (body.message?.trim()) {
			await StageRemark.create({
				projectStageId: stageId,
				userRole: "contractor",
				remark: body.message.trim(),
			});
		}

		return NextResponse.json({
			success: true,
			message: "Stage marked completed",
		});
	} catch (error) {
		console.error("COMPLETE ERROR =>", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
