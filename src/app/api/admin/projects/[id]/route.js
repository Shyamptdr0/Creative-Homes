import { NextResponse } from "next/server";
import Project from "@/models/Project";

export async function GET(req, context) {
	const { id } = await context.params;  // ✅ FIX: await params

	try {
		const project = await Project.findByPk(id);
		return NextResponse.json({ project });
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(req, context) {
	const { id } = await context.params;  // ✅ FIX: await params

	try {
		const body = await req.json();

		await Project.update(
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

		const updated = await Project.findByPk(id);
		return NextResponse.json({ success: true, project: updated });
	} catch (error) {
		console.error("Update project error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(req, context) {
	const { id } = await context.params;  // ✅ FIX: await params

	try {
		await Project.destroy({ where: { id } });
		return NextResponse.json({ success: true, message: "Project deleted" });
	} catch (error) {
		console.error("Delete error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
