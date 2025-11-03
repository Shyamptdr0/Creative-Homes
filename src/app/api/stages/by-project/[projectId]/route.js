import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import "@/lib/sync";

export async function GET(req, { params }) {
	try {
		const { projectId } = params;

		const stages = await Stage.findAll({
			where: { projectId },
			order: [["id", "ASC"]],
		});

		return NextResponse.json({ success: true, stages });
	} catch (e) {
		console.log(e);
		return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
	}
}
