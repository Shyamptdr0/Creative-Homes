import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import StageRemark from "@/models/StageRemark";
import { verifyToken } from "@/lib/auth";

export async function PUT(req, context) {
	try {
		// ⭐ FIX: unwrap params Promise
		const { id } = await context.params;
		const body = await req.json();

		// ⭐ Token check
		const auth = req.headers.get("authorization");
		if (!auth) {
			return NextResponse.json(
				{ success: false, message: "Missing token" },
				{ status: 401 }
			);
		}

		const token = auth.split(" ")[1];
		let user;
		try {
			user = verifyToken(token);
		} catch {
			return NextResponse.json(
				{ success: false, message: "Invalid token" },
				{ status: 401 }
			);
		}

		// Only contractor allowed
		if (user.role !== "contractor") {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 403 }
			);
		}

		// ⭐ Fetch Stage
		const stage = await ProjectStage.findByPk(id);
		if (!stage) {
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);
		}

		// ⭐ Status update
		const newStatus = body.status === "completed" ? "completed" : "pending";
		await stage.update({ status: newStatus });

		// ⭐ Remark optional
		if (body.message?.trim()) {
			await StageRemark.create({
				projectStageId: id,
				userRole: "contractor",
				remark: body.message.trim(),
			});
		}

		return NextResponse.json({
			success: true,
			message: "Stage updated successfully",
		});
	} catch (error) {
		console.error("COMPLETE ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
