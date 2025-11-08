// ✅ /app/api/contractors/queries/route.js
import { NextResponse } from "next/server";
import Query from "@/models/Query";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import "@/lib/db";
import jwt from "jsonwebtoken";

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

		if (decoded.role !== "contractor") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const contractorId = decoded.id;

		const queries = await Query.findAll({
			where: { contractorId },
			include: [
				{ model: Project, attributes: ["id", "title"] },
				{ model: Client, attributes: ["clientId", "name"] },
				{ model: Contractor, attributes: ["id", "name"] },
			],
			order: [["createdAt", "DESC"]],
		});

		// ✅ Count queries that have no reply or empty reply
		const newQueries = queries.filter(
			(q) => !q.reply || q.reply.trim() === ""
		).length;

		return NextResponse.json({
			success: true,
			queries,
			newQueries,
		});
	} catch (error) {
		console.error("CONTRACTOR QUERY API ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
