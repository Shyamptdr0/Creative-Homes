import Query from "@/models/Query";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const type = searchParams.get("type"); // "client" or "contractor"

		let where = {};

		// ✅ Correct field names
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

export async function POST(req) {
	try {
		const body = await req.json();
		const query = await Query.create(body);
		return NextResponse.json(query);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
