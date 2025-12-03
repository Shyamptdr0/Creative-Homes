import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import ProjectStage from "@/models/ProjectStage";
import StageTemplate from "@/models/StageTemplate";
import StageRemark from "@/models/StageRemark";

import Project from "@/models/Project";
import Contractor from "@/models/Contractor";
import Client from "@/models/Client";

import "@/lib/db";

export async function GET(req) {
	try {
		// ============================
		// AUTH CHECK
		// ============================
		const auth = req.headers.get("authorization");
		if (!auth)
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);

		const token = auth.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "client") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const clientId = decoded.id;

		// ============================
		// FETCH PROJECT STAGES
		// ============================
		const rawStages = await ProjectStage.findAll({
			include: [
				{
					model: StageTemplate,
					as: "StageTemplate",
					attributes: ["id", "name"],
				},
				{
					model: StageRemark,
					as: "remarks",
					attributes: ["id", "remark", "userRole", "isRead", "createdAt"],
				},
				{
					model: Project,
					as: "project",
					where: { clientId },
					attributes: ["id", "title"],
					include: [
						{ model: Contractor, as: "contractor", attributes: ["id", "name"] },
						{ model: Client, as: "client", attributes: ["id", "name"] },
					],
				},
			],
			order: [["id", "ASC"]],
		});

		// ============================
		// FORMAT CLEAN DATA FOR CLIENT UI
		// ============================
		const stages = rawStages.map((st) => ({
			id: st.id,
			floorName: st.floorName,
			status: st.status,
			projectId: st.projectId,

			StageTemplate: st.StageTemplate,

			// 🔥 Unread logic for Client (don't count client's own remarks)
			unreadRemarks: st.remarks.filter(
				(r) => r.userRole !== "client" && r.isRead === false
			).length,

			remarks: st.remarks.map((r) => ({
				id: r.id,
				message: r.remark,
				by: r.userRole,
				createdAt: r.createdAt,
			})),

			project: {
				id: st.project.id,
				title: st.project.title,
				contractor: st.project.contractor,
				client: st.project.client,
			},
		}));

		return NextResponse.json({ success: true, stages });
	} catch (error) {
		console.error("CLIENT STAGE ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
