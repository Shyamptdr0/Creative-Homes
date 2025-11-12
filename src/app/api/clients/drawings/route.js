// ✅ /api/clients/drawings/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Drawing from "@/models/Drawing";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor"; // ✅ To show contractor name (optional)
import "@/lib/db";

export async function GET(req) {
	try {
		// ✅ Check Token
		const authHeader = req.headers.get("authorization");
		if (!authHeader)
			return NextResponse.json(
				{ success: false, message: "No token" },
				{ status: 401 }
			);

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// ✅ Ensure logged-in user is a client
		if (decoded.role !== "client") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const clientId = decoded.id;

		// ✅ Fetch drawings where the project belongs to this client
		const drawings = await Drawing.findAll({
			include: [
				{
					model: Project,
					as: "project",
					attributes: ["id", "title", "clientId"],
					include: [
						{
							model: Contractor,
							as: "contractor",
							attributes: ["name"], // ✅ contractor name visible to client
						},
						{
							model: Client,
							as: "client",
							attributes: ["name"],
						},
					],
				},
			],
			where: { "$project.clientId$": clientId }, // ✅ filter by client
			order: [["id", "ASC"]],
		});

		return NextResponse.json({ success: true, drawings });

	} catch (err) {
		console.log("CLIENT DRAWINGS ERROR =>", err);
		return NextResponse.json(
			{ success: false, message: err.message },
			{ status: 500 }
		);
	}
}
