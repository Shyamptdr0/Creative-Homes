import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import StageRemark from "@/models/StageRemark";
import { verifyToken } from "@/lib/auth";

export async function PUT(req, context) {
	try {
		// ⭐ FIX => Unwrap params
		const { id: stageId } = await context.params;

		// Parse Body
		let body;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json(
				{ success: false, message: "Invalid JSON body" },
				{ status: 400 }
			);
		}

		const message = body?.message?.trim() || "Stage Rejected";

		// Validate Token
		const authHeader = req.headers.get("authorization");
		if (!authHeader)
			return NextResponse.json(
				{ success: false, message: "Missing token" },
				{ status: 401 }
			);

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

		// ONLY ADMIN
		if (user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 403 }
			);
		}

		// Find Stage
		const stage = await ProjectStage.findByPk(stageId);
		if (!stage)
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);

		// Update Stage
		await stage.update({ status: "rejected" });

		// Save Remark
		await StageRemark.create({
			projectStageId: stageId,
			userRole: "admin",
			remark: message,
		});

		return NextResponse.json({
			success: true,
			message: "Stage rejected successfully",
		});

	} catch (error) {
		console.error("REJECT API ERROR:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
