import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import Project from "@/models/Project";
import "@/lib/sync";

export async function GET() {
	try {
		const stages = await Stage.findAll({
			include: [
				{
					model: Project,
					as: "project", // ✅ MUST MATCH association alias
					attributes: ["id", "title"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		return NextResponse.json({ success: true, stages });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, msg: "Error fetching stages", error: err.message });
	}
}
