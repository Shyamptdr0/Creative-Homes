import Contractor from "@/models/Contractor";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

// AUTO ID
function generateContractorId() {
	return "CT-" + Date.now().toString().slice(-6);
}

// AUTO PASSWORD
function generatePassword() {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let pass = "";
	for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
	return pass;
}

export async function POST(req) {
	try {
		const formData = await req.formData();

		const name = formData.get("name");
		const email = formData.get("email");
		const phone = formData.get("phone");
		const address = formData.get("address");
		const aadhaar = formData.get("aadhaar");
		const pan = formData.get("pan");
		const croppedImage = formData.get("photo"); // cropped image

		/* =========================
		   BACKEND STRICT VALIDATION
		========================= */

		if (!/^\d{10}$/.test(phone)) {
			return Response.json({ success: false, msg: "Phone must be 10 digits" });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return Response.json({ success: false, msg: "Invalid Email Format" });
		}

		if (!/^\d{4}-\d{4}-\d{4}$/.test(aadhaar)) {
			return Response.json({ success: false, msg: "Aadhaar must be XXXX-XXXX-XXXX" });
		}

		if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
			return Response.json({ success: false, msg: "Invalid PAN Format (ABCDE1234F)" });
		}

		/* =========================
		   PHOTO UPLOAD TO CLOUDINARY
		========================= */
		let photoUrl = null;

		if (croppedImage && croppedImage.size > 0) {
			const bytes = await croppedImage.arrayBuffer();
			const buffer = Buffer.from(bytes);
			photoUrl = await uploadToCloudinary(buffer, "contractors");
		}

		const autoPassword = generatePassword();
		const hashed = await bcrypt.hash(autoPassword, 10);

		const user = await Contractor.create({
			name,
			email,
			phone,
			address,
			aadhaar,
			pan,
			photo: photoUrl,
			contractorId: generateContractorId(),
			password: hashed,
			visiblePassword: autoPassword,
		});

		return Response.json({ success: true, user });

	} catch (error) {
		console.error("❌ Contractor signup error:", error);
		return Response.json({ success: false, msg: "Signup failed" }, { status: 500 });
	}
}
