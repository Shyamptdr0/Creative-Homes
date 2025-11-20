// ✅ /api/contractors/drawings/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Drawing from "@/models/Drawing";
import Project from "@/models/Project";
import Client from "@/models/Client";
import ProjectType from "@/models/ProjectType"; // ✅ added
import "@/lib/db";

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader)
			return NextResponse.json({ success: false, message: "No token" }, { status: 401 });

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "contractor") {
			return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
		}

		const contractorId = decoded.id;

		const drawings = await Drawing.findAll({
			include: [
				{
					model: Project,
					as: "project",
					attributes: ["id", "title", "projectUid", "contractorId"],
					include: [
						{
							model: Client,
							as: "client",
							attributes: ["name"],
						},
						{
							model: ProjectType,
							as: "projectType",
							attributes: ["name"], // ✅ now included
						},
					],
				},
			],
			where: { "$project.contractorId$": contractorId },
			order: [["id", "ASC"]],
		});

		return NextResponse.json({ success: true, drawings });

	} catch (err) {
		console.log("CONTRACTOR DRAWING ERROR =>", err);
		return NextResponse.json({ success: false, message: err.message }, { status: 500 });
	}
}
