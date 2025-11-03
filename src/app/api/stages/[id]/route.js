import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import "@/lib/sync";

// ✅ DELETE /api/admin/stages/:id
export async function DELETE(req, { params }) {
	try {
		const { id } = await params; // ✅ unwrap params
		const stage = await Stage.findByPk(id);

		if (!stage) {
			return NextResponse.json({ success: false, msg: "Stage not found" });
		}

		await stage.destroy();

		return NextResponse.json({ success: true, msg: "Stage deleted successfully" });
	} catch (err) {
		console.error("DELETE Stage Error:", err);
		return NextResponse.json({ success: false, msg: "Error deleting stage" });
	}
}

// ✅ PUT /api/admin/stages/:id
export async function PUT(req, { params }) {
	try {
		const { id } = await params; // ✅ unwrap params
		const body = await req.json();

		const [updated] = await Stage.update(body, { where: { id } });

		if (!updated) {
			return NextResponse.json({ success: false, msg: "Stage not found or no change" });
		}

		return NextResponse.json({ success: true, msg: "Stage updated successfully" });
	} catch (err) {
		console.error("UPDATE Stage Error:", err);
		return NextResponse.json({ success: false, msg: "Error updating stage" });
	}
}
