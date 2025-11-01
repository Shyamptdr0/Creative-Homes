import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import Project from "@/models/Project";
import User from "@/models/User";

Stage.belongsTo(Project, { foreignKey: "projectId" });
Stage.belongsTo(User, { foreignKey: "updatedBy" });

// GET all or by projectId
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const projectId = searchParams.get("projectId");

		const where = projectId ? { projectId } : {};

		const stages = await Stage.findAll({
			where,
			include: [
				{ model: Project },
				{ model: User, attributes: ["id", "userId", "email", "role"] },
			],
			order: [["id", "ASC"]],
		});

		return NextResponse.json(stages);
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 });
	}
}

// POST - Create new stage
export async function POST(req) {
	try {
		const data = await req.json();
		const stage = await Stage.create(data);
		return NextResponse.json(stage);
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Failed to create stage" }, { status: 500 });
	}
}
