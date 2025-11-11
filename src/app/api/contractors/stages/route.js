import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Stage from "@/models/Stage";
import Project from "@/models/Project";
import Client from "@/models/Client";
import StageRemark from "@/models/StageRemark";   // ✅ ADD THIS
import "@/lib/db";

export async function GET(req) {
	try {
		const auth = req.headers.get("authorization");
		if (!auth) return NextResponse.json({ success: false, msg: "No token" }, { status: 401 });

		const token = auth.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "contractor")
			return NextResponse.json({ success: false, msg: "Access denied" }, { status: 403 });

		const contractorId = decoded.id;

		const stages = await Stage.findAll({
			include: [
				{
					model: Project,
					as: "project",
					where: { contractorId },
					include: [{ model: Client, as: "client", attributes: ["name", "clientId"] }],
					attributes: ["id", "title"],
				},
				{
					model: StageRemark,              // ✅ Show remarks history
					as: "remarks",
					attributes: ["id", "message", "by", "createdAt"],
				},
			],
			order: [["id", "ASC"]],
		});

		return NextResponse.json({ success: true, stages });

	} catch (err) {
		return NextResponse.json({ success: false, msg: err.message }, { status: 500 });
	}
}
