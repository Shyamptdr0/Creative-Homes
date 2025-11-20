// ✅ /app/api/queries/route.js

import { NextResponse } from "next/server";
import Query from "@/models/Query";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Project from "@/models/Project";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import "@/lib/db";
import {Op} from "sequelize";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const type = searchParams.get("type"); // "client" or "contractor"

		let where = {};

		if (type === "client") {
			where.clientId = { [Op.ne]: null };
		}

		if (type === "contractor") {
			where.contractorId = { [Op.ne]: null };
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

		return NextResponse.json(queries);
	} catch (err) {
		console.error("API ERROR:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
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
