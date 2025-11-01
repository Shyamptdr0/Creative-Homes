import { NextResponse } from "next/server";
import Project from "@/models/Project";
import "@/lib/db";

export async function GET(req, context) {
	const { id } = await context.params;

	try {
		const project = await Project.findByPk(id);

		if (!project) {
			return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, project });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function PUT(req, context) {
	const { id } = await context.params;

	try {
		const body = await req.json();

		const [updatedRows] = await Project.update(
			{
				title: body.title,
				description: body.description,
				status: body.status,
				startDate: body.startDate,
				endDate: body.endDate,
				totalCost: body.totalCost,
				clientId: body.clientId,
				contractorId: body.contractorId,
			},
			{ where: { id } }
		);

		if (updatedRows === 0) {
			return NextResponse.json({ success: false, error: "Project not found or no change" }, { status: 404 });
		}

		const updated = await Project.findByPk(id);
		return NextResponse.json({ success: true, project: updated });

	} catch (error) {
		console.error("Update project error:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(req, context) {
	const { id } = await context.params;

	try {
		const deleted = await Project.destroy({ where: { id } });

		if (!deleted) {
			return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Project deleted" });
	} catch (error) {
		console.error("Delete error:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
