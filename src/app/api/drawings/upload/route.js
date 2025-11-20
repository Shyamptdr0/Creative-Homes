import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function POST(req) {
	try {
		const data = await req.formData();
		const files = data.getAll("files");

		const urls = [];
		const names = [];

		for (const file of files) {
			const buffer = Buffer.from(await file.arrayBuffer());
			const url = await uploadToCloudinary(buffer, "drawings");
			urls.push(url);

			const raw = file.name;
			const nameOnly = raw.substring(0, raw.lastIndexOf(".")) || raw;
			names.push(nameOnly);
		}

		return NextResponse.json({ urls, names });
	} catch (err) {
		console.log(err);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
