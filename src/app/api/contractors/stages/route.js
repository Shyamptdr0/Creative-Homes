// api/contractors/stages/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import ProjectStage from "@/models/ProjectStage";
import StageTemplate from "@/models/StageTemplate";
import Project from "@/models/Project";
import StageRemark from "@/models/StageRemark";
import "@/lib/db";

export async function GET(req) {
	try {
		const auth = req.headers.get("authorization");
		if (!auth)
			return NextResponse.json({ success: false, msg: "No token" }, { status: 401 });

		const token = auth.split(" ")[1];
		let decoded;

		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch {
			return NextResponse.json({ success: false, msg: "Invalid token" }, { status: 401 });
		}

		if (decoded.role !== "contractor")
			return NextResponse.json({ success: false, msg: "Access denied" }, { status: 403 });

		const contractorId = decoded.id;

		const stages = await ProjectStage.findAll({
			where: { contractorId },

			include: [
				{ model: StageTemplate, as: "StageTemplate", attributes: ["id", "name"] },
				{ model: Project, as: "project", attributes: ["id", "title", "projectUid"] },
				{
					model: StageRemark,
					as: "remarks",
					attributes: ["id", "remark", "userRole", "createdAt", "isRead"],
				},
			],
			order: [["id", "ASC"]],
		});

		return NextResponse.json({
			success: true,
			stages: stages.map((s) => ({
				...s.toJSON(),

				unreadCount: (s.remarks || []).filter(
					(r) => r.userRole !== "contractor" && !r.isRead
				).length,

				remarks: (s.remarks || []).map((r) => ({
					id: r.id,
					by: r.userRole,
					message: r.remark,
					createdAt: r.createdAt,
					isRead: r.isRead,
				})),
			})),
		});
	} catch (err) {
		console.log("CONTRACTOR STAGES API ERROR:", err);
		return NextResponse.json({ success: false, msg: err.message }, { status: 500 });
	}
}
