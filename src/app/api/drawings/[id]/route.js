import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import { deleteFromCloudinary } from "@/lib/deleteFromCloudinary";
import "@/lib/db";

export async function DELETE(req, ctx) {
	try {
		const { id } = await ctx.params;

		const drawing = await Drawing.findByPk(id);
		if (!drawing) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		if (drawing.fileUrl) {
			await deleteFromCloudinary(drawing.fileUrl);
		}

		await Drawing.destroy({ where: { id } });

		return NextResponse.json({ message: "Deleted successfully" });
	} catch (err) {
		console.error("DELETE Error:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}

export async function PUT(req, ctx) {
	try {
		const { id } = await ctx.params;

		const form = await req.formData();
		const title = form.get("title");
		const projectId = form.get("projectId");
		const newFileUrl = form.get("fileUrl");

		const drawing = await Drawing.findByPk(id);
		if (!drawing) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		if (newFileUrl && newFileUrl !== drawing.fileUrl) {
			if (drawing.fileUrl) {
				await deleteFromCloudinary(drawing.fileUrl);
			}
		}

		await drawing.update({
			title,
			projectId,
			fileUrl: newFileUrl || drawing.fileUrl,
		});

		return NextResponse.json({ success: true, drawing });
	} catch (err) {
		console.error("PUT update error:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
