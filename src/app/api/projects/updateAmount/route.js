import { NextResponse } from "next/server";
import "@/lib/db"; // ensure DB connection

import Project from "@/models/Project";

export async function PUT(req) {
	try {
		const body = await req.json();
		const { projectId, totalAmount } = body;

		if (!projectId || !totalAmount) {
			return NextResponse.json(
				{
					success: false,
					message: "Project ID and totalAmount both are required",
				},
				{ status: 400 }
			);
		}

		// Update project
		await Project.update(
			{ totalAmount },
			{ where: { id: projectId } }
		);

		return NextResponse.json({
			success: true,
			message: "Project amount updated successfully",
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: error.message,
			},
			{ status: 500 }
		);
	}
}
