import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import { deleteFromCloudinary } from "@/lib/deleteFromCloudinary";
import "@/lib/db";

export async function DELETE(req, ctx) {
	try {
		// ✅ FIX: unwrap params using await
		const { projectId } = await ctx.params;

		if (!projectId) {
			return NextResponse.json({ success: false, error: "Missing projectId" }, { status: 400 });
		}

		// Get all drawings for this project
		const drawings = await Drawing.findAll({ where: { projectId } });

		// Delete each image/video from Cloudinary + DB
		for (const d of drawings) {
			if (d.fileUrl) await deleteFromCloudinary(d.fileUrl);
			await d.destroy();
		}

		return NextResponse.json({ success: true, message: "All drawings deleted" });

	} catch (err) {
		console.log("DELETE ALL ERROR", err);
		return NextResponse.json(
			{ success: false, error: "Server error" },
			{ status: 500 }
		);
	}
}
