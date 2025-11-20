import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import { deleteFromCloudinary } from "@/lib/deleteFromCloudinary";
import "@/lib/db";

// ========================= DELETE =========================
export async function DELETE(req, { params }) {
	try {
		// ⬅ REAL FIX
		const { id } = await params;

		if (!id)
			return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });

		const drawing = await Drawing.findByPk(id);

		if (!drawing)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		// Delete Cloudinary file
		if (drawing.fileUrl) await deleteFromCloudinary(drawing.fileUrl);

		await drawing.destroy();

		return NextResponse.json({ success: true, message: "Deleted successfully" });

	} catch (err) {
		console.log("DELETE drawing error:", err);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

// ========================= UPDATE =========================
export async function PUT(req, { params }) {
	try {
		// ⬅ REAL FIX
		const { id } = await params;

		const form = await req.formData();
		const title = form.get("title");
		const projectId = form.get("projectId");
		const newFileUrl = form.get("fileUrl");

		const drawing = await Drawing.findByPk(id);

		if (!drawing)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		// Delete old file if replaced
		if (newFileUrl && newFileUrl !== drawing.fileUrl) {
			if (drawing.fileUrl) await deleteFromCloudinary(drawing.fileUrl);
		}

		await drawing.update({
			title: title ?? drawing.title,
			projectId: projectId ?? drawing.projectId,
			fileUrl: newFileUrl || drawing.fileUrl,
		});

		return NextResponse.json({ success: true, drawing });

	} catch (err) {
		console.log("PUT drawing error:", err);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}
