// /api/drawings/[id]/route.js
import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import { deleteFromCloudinary } from "@/lib/deleteFromCloudinary";
import "@/lib/db";

export async function DELETE(req, ctx) {
	try {
		const { id } = ctx.params;

		const drawing = await Drawing.findByPk(id);
		if (!drawing)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		// ✅ delete from cloudinary
		if (drawing.fileUrl) await deleteFromCloudinary(drawing.fileUrl);

		await drawing.destroy();
		return NextResponse.json({ success: true, message: "Deleted successfully" });

	} catch (err) {
		console.log("DELETE drawing", err);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

export async function PUT(req, ctx) {
	try {
		const { id } = ctx.params;
		const form = await req.formData();

		const title = form.get("title");
		const projectId = form.get("projectId");
		const newFileUrl = form.get("fileUrl");

		const drawing = await Drawing.findByPk(id);
		if (!drawing)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		// ✅ If file replaced, remove old
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
		console.log("PUT drawing error", err);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}
