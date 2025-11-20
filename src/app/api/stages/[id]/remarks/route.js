import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import StageRemark from "@/models/StageRemark";
import { verifyToken } from "@/lib/auth";

/* ----------------------------------------
   GET STAGE REMARKS
---------------------------------------- */
export async function GET(req, context) {
	try {
		const { id } = await context.params;

		const stage = await ProjectStage.findByPk(id);
		if (!stage)
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);

		const remarks = await StageRemark.findAll({
			where: { projectStageId: id },
			order: [["createdAt", "ASC"]],
		});

		const formatted = remarks.map(r => ({
			id: r.id,
			by: r.userRole,
			message: r.remark,
			createdAt: r.createdAt,
		}));

		return NextResponse.json({ success: true, remarks: formatted });

	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* ----------------------------------------
   ADD NEW REMARK
---------------------------------------- */
export async function PUT(req, context) {
	try {
		const { id } = await context.params;
		const body = await req.json();
		const message = body.message?.trim();

		if (!message)
			return NextResponse.json(
				{ success: false, message: "Message required" },
				{ status: 400 }
			);

		// AUTH CHECK
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

		const stage = await ProjectStage.findByPk(id);
		if (!stage)
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);

		const newR = await StageRemark.create({
			projectStageId: id,
			userRole: user.role,
			remark: message,
		});

		return NextResponse.json({
			success: true,
			remark: {
				id: newR.id,
				by: user.role,
				message,
				createdAt: newR.createdAt,
			}
		});

	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
