import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Stage from "@/models/Stage";
import Project from "@/models/Project";
import Client from "@/models/Client";
import "@/lib/sync"; // Ensure DB models are loaded

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json({ success: false, msg: "No token provided" }, { status: 401 });
		}

		const token = authHeader.split(" ")[1];
		if (!token) {
			return NextResponse.json({ success: false, msg: "Invalid token format" }, { status: 401 });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return NextResponse.json(
				{ success: false, msg: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		// ✅ Allow only contractor role
		if (decoded.role !== "contractor") {
			return NextResponse.json(
				{ success: false, msg: "Access denied" },
				{ status: 403 }
			);
		}

		const contractorId = decoded.id;

		// ✅ Fetch only stages under contractor's projects
		const stages = await Stage.findAll({
			include: [
				{
					model: Project,
					as: "project",
					where: { contractorId }, // ✅ filter stage by contractor's projects
					include: [{ model: Client, as: "client", attributes: ["name", "clientId"] }],
					attributes: ["id", "title"]
				}
			],
			order: [["createdAt", "DESC"]],
		});

		return NextResponse.json({ success: true, stages });
	} catch (error) {
		console.error("CONTRACTOR STAGE ERROR =>", error);
		return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
	}
}
