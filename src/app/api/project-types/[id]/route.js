import { NextResponse } from "next/server";
import ProjectType from "@/models/ProjectType";
import "@/lib/db";

// ✅ Get single type
export async function GET(req, context) {
	try {
		const { id } = await context.params;

		const type = await ProjectType.findByPk(id);
		if (!type)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		return NextResponse.json({ success: true, type });
	} catch (err) {
		console.error("❌ GET ONE ProjectType ERROR:", err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

// ✅ Update
export async function PUT(req, context) {
	try {
		const { id } = await context.params;
		const body = await req.json();

		const type = await ProjectType.findByPk(id);
		if (!type)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		await type.update({
			name: body.name ?? type.name,
			description: body.description ?? type.description,
		});

		return NextResponse.json({ success: true, type });
	} catch (err) {
		console.error("❌ UPDATE ProjectType ERROR:", err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

// ✅ Delete
export async function DELETE(req, context) {
	try {
		const { id } = await context.params;

		const type = await ProjectType.findByPk(id);
		if (!type)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		await type.destroy();
		return NextResponse.json({ success: true, message: "Deleted" });

	} catch (err) {
		console.error("❌ DELETE ProjectType ERROR:", err);
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
