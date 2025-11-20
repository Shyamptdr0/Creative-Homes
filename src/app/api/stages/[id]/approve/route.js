import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import StageRemark from "@/models/StageRemark";
import { verifyToken } from "@/lib/auth";

export async function PUT(req, context) {
	try {
		// ⭐ PARAMS FIX → MUST AWAIT
		const { id: stageId } = await context.params;

		// ⭐ BODY OPTIONAL
		let body = {};
		try {
			body = await req.json().catch(() => ({}));
		} catch {
			body = {};
		}

		const message = body?.message?.trim() || "Stage Approved";

		// ⭐ TOKEN CHECK
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

		// ⭐ ONLY ADMIN
		if (user.role !== "admin") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 403 }
			);
		}

		// ⭐ FIND STAGE
		const stage = await ProjectStage.findByPk(stageId);
		if (!stage)
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);

		// ⭐ UPDATE STATUS
		await stage.update({ status: "approved" });

		// ⭐ ADD REMARK
		await StageRemark.create({
			projectStageId: stageId,
			userRole: "admin",
			remark: message,
		});

		return NextResponse.json({
			success: true,
			message: "Stage approved successfully",
		});
	} catch (err) {
		console.error("APPROVE API ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
