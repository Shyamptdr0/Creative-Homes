import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function POST(req) {
	try {
		const form = await req.formData();
		const file = form.get("file");

		const buffer = Buffer.from(await file.arrayBuffer());
		const url = await uploadToCloudinary(buffer, "drawings");

		return NextResponse.json({ url });
	} catch (e) {
		console.error("Upload error", e);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
