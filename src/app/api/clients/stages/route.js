import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Stage from "@/models/Stage";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import StageRemark from "@/models/StageRemark";
import "@/lib/db";

export async function GET(req) {
	try {
		const auth = req.headers.get("authorization");
		if (!auth)
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);

		const token = auth.split(" ")[1];
		let decoded = null;

		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch {
			return NextResponse.json(
				{ success: false, message: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		if (decoded.role !== "client")
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);

		const clientId = decoded.id;

		const stages = await Stage.findAll({
			include: [
				{
					model: Project,
					as: "project",
					where: { clientId },
					include: [
						{
							model: Contractor,
							as: "contractor",
							attributes: ["id", "name", "phone"],
						},
						{
							model: Client,
							as: "client",
							attributes: ["id", "name", "clientId"],
						},
					],
					attributes: ["id", "title"],
				},
				{
					model: StageRemark,
					as: "remarks",
					attributes: ["id", "message", "by", "createdAt"],
				},
			],
			order: [["id", "ASC"]],
		});

		return NextResponse.json({ success: true, stages });

	} catch (error) {
		console.error("CLIENT STAGE ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
