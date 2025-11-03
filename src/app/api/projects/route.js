import { NextResponse } from "next/server";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import "@/lib/db";

export async function GET() {
	try {
		const projects = await Project.findAll({
			include: [
				{ model: Client, as: "client", attributes: ["id", "name", "email", "clientId"] },
				{ model: Contractor, as: "contractor", attributes: ["id", "name", "email", "contractorId"] }
			],
			order: [["createdAt", "DESC"]]
		});

		return NextResponse.json({ success: true, projects });
	} catch (error) {
		console.error("PROJECT GET ERROR =>", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const body = await req.json();

		if (!body.title || !body.clientId || !body.contractorId) {
			return NextResponse.json(
				{ success: false, error: "Title, clientId, contractorId are required" },
				{ status: 400 }
			);
		}

		const project = await Project.create({
			title: body.title,
			description: body.description,
			status: body.status || "planned",
			startDate: body.startDate,
			endDate: body.endDate,
			totalCost: body.totalCost,
			clientId: Number(body.clientId),
			contractorId: Number(body.contractorId),
		});

		return NextResponse.json({ success: true, project });
	} catch (error) {
		console.error("PROJECT CREATE ERROR =>", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
