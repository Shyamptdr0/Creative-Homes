import Client from "@/models/Client";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

function generateClientId() {
	return "CL-" + Date.now().toString().slice(-6);
}

function generatePassword() {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let p = "";
	for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
	return p;
}

export async function POST(req) {
	try {
		const form = await req.formData();

		const name = form.get("name");
		const email = form.get("email");
		const phone = form.get("phone");
		const address = form.get("address");
		const aadhaar = form.get("aadhaar");
		const pan = form.get("pan");

		const file = form.get("photo");
		let photoUrl = null;

		if (file && file.size > 0) {
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			photoUrl = await uploadToCloudinary(buffer, "clients");
		}

		const password = generatePassword();
		const hash = await bcrypt.hash(password, 10);

		const user = await Client.create({
			name,
			email,
			phone,
			address,
			aadhaar,
			pan,
			photo: photoUrl,
			clientId: generateClientId(),
			visiblePassword: password,
			password: hash,
		});

		return Response.json({ success: true, user });
	} catch (err) {
		console.log("❌ Client signup error:", err);
		return Response.json({ success: false }, { status: 500 });
	}
}
