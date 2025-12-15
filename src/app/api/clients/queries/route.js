// ✅ /app/api/client/queries/route.js

import { NextResponse } from "next/server";
import Query from "@/models/Query";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import "@/lib/db";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");

		if (!authHeader)
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);

		const token = authHeader.split(" ")[1];

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return NextResponse.json(
				{ success: false, message: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		// Only client allowed
		if (decoded.role !== "client") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const clientId = decoded.id;

		// Fetch all queries from client's projects (including contractor queries)
		const clientProjects = await Project.findAll({
			where: { clientId },
			attributes: ["id"]
		});
		const projectIds = clientProjects.map(p => p.id);

		const queries = await Query.findAll({
			where: { projectId: { [Op.in]: projectIds } },
			include: [
				{ model: Project, attributes: ["id", "title"] },
				{ model: Client, attributes: ["id", "name"] },
				{ model: Contractor, attributes: ["id", "name"] },
			],
			order: [["createdAt", "DESC"]],
		});

		// Count new queries (no reply)
		const newQueries = queries.filter(
			(q) => !q.reply || q.reply.trim() === ""
		).length;

		return NextResponse.json({
			success: true,
			queries,
			newQueries,
		});

	} catch (error) {
		console.error("CLIENT QUERY API ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
