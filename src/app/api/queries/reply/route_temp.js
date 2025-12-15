// ✅ /app/api/queries/route.js

import { NextResponse } from "next/server";
import Query from "@/models/Query";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Project from "@/models/Project";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import "@/lib/db";
import {Op} from "sequelize";
import jwt from "jsonwebtoken";

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");
		
		if (!authHeader) {
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);
		}

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

		let where = {};

		// Admin sees all queries
		if (decoded.role === "admin") {
			// No where clause - admin sees all queries
		}
		// Client sees only their queries
		else if (decoded.role === "client") {
			where.clientId = decoded.id;
		}
		// Contractor sees only their queries
		else if (decoded.role === "contractor") {
			where.contractorId = decoded.id;
		}
		else {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const queries = await Query.findAll({
			where,
			include: [
				{ model: Client, attributes: ["id", "name", "phone"] },
				{ model: Contractor, attributes: ["id", "name", "phone"] },
				{ model: Project, attributes: ["id", "title"] }
			],
			order: [["createdAt", "DESC"]],
		});

		// Count new queries (no reply) for admin
		let newQueries = 0;
		if (decoded.role === "admin") {
			newQueries = queries.filter(
				(q) => !q.reply || q.reply.trim() === ""
			).length;
		}

		return NextResponse.json({
			success: true,
			queries,
			newQueries: decoded.role === "admin" ? newQueries : undefined,
		});

	} catch (err) {
		console.error("QUERIES API ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* ============================================================
   🆕 POST — Creates a Query with optional Image Upload
============================================================ */
export async function POST(req) {
	try {
		const formData = await req.formData();

		const message = formData.get("message");
		const projectId = formData.get("projectId");
		const contractorId = formData.get("contractorId");
		const clientId = formData.get("clientId"); // still supported

		const image = formData.get("image");

		let imageUrl = null;

		// 🆕 If file uploaded → convert to buffer -> upload to Cloudinary
		if (image && image.name) {
			const arrayBuffer = await image.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			imageUrl = await uploadToCloudinary(buffer, "queries");
		}

		// 🆕 Create query with imageUrl included
		const query = await Query.create({
			message,
			projectId,
			contractorId,
			clientId,
			imageUrl,
		});

		return NextResponse.json(
			{ success: true, query },
			{ status: 201 }
		);

	} catch (err) {
		console.error("QUERY CREATE ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
