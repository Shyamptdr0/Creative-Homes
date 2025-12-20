import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { uploadToLocal } from "@/lib/uploadLocal";

export async function POST(req) {
	try {
		const data = await req.formData();
		const files = data.getAll("files");

		const urls = [];
		const names = [];

		for (const file of files) {
			const buffer = Buffer.from(await file.arrayBuffer());
			const fileName = file.name;
			const fileExtension = fileName.split('.').pop().toLowerCase();
			
			// Check if file is image or video (use Cloudinary)
			const imageVideoExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
			const mimeType = file.type;
			
			if (mimeType.startsWith('image/') || mimeType.startsWith('video/') || imageVideoExtensions.includes(fileExtension)) {
				// Upload to Cloudinary for images and videos
				const url = await uploadToCloudinary(buffer, "drawings");
				urls.push(url);
			} else {
				// Upload locally for PDFs and documents
				const url = await uploadToLocal(buffer, fileName, "documents");
				urls.push(url);
			}

			const raw = fileName;
			const nameOnly = raw.substring(0, raw.lastIndexOf(".")) || raw;
			names.push(nameOnly);
		}

		return NextResponse.json({ urls, names });
	} catch (err) {
		console.log(err);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
