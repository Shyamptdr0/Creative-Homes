// api/project-stages/list/route.js
import { NextResponse } from "next/server";
import ProjectStage from "@/models/ProjectStage";
import StageTemplate from "@/models/StageTemplate";
import StageRemark from "@/models/StageRemark";
import "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Op } from "sequelize";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const projectId = searchParams.get("projectId");

		if (!projectId) {
			return NextResponse.json(
				{ success: false, error: "projectId is required" },
				{ status: 400 }
			);
		}

		/* =============================================================
		   Identify viewer from token
		============================================================= */
		let viewerRole = "unknown";
		const auth = req.headers.get("authorization");

		if (auth) {
			try {
				const token = auth.split(" ")[1];
				const user = verifyToken(token);
				viewerRole = user.role;
			} catch (err) {
				console.log("Invalid token");
			}
		}

		/* =============================================================
		   Fetch stages + remarks
		============================================================= */
		const stages = await ProjectStage.findAll({
			where: { projectId },
			include: [
				{
					model: StageTemplate,
					as: "StageTemplate",
					attributes: ["id", "name"],
				},
				{
					model: StageRemark,
					as: "remarks",
					attributes: ["id", "userRole", "isRead"],
				},
			],
			order: [
				["floorName", "ASC"],
				["id", "ASC"],
			],
		});

		/* =============================================================
		   Correct unread logic:
		   unread = remark NOT written by viewer AND isRead = false
		============================================================= */
		return NextResponse.json({
			success: true,
			stages: stages.map((s) => {
				const json = s.toJSON();

				const unread = (json.remarks || []).filter(
					(r) =>
						viewerRole !== "unknown" &&
						r.userRole !== viewerRole &&
						!r.isRead
				).length;

				return {
					...json,
					unreadRemarks: unread,
				};
			}),
		});

	} catch (err) {
		console.error("PROJECT-STAGES LIST ERROR =>", err);
		return NextResponse.json({
			success: false,
			error: err.message,
		});
	}
}
