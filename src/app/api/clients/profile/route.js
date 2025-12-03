import Client from "@/models/Client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

// GET CLIENT PROFILE
export async function GET(req) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];

		if (!token)
			return NextResponse.json({ success: false, msg: "No token provided" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "client")
			return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 403 });

		const client = await Client.findOne({
			where: { id: decoded.id },
			attributes: { exclude: ["password"] },
		});

		if (!client)
			return NextResponse.json({ success: false, msg: "Client not found" }, { status: 404 });

		return NextResponse.json({
			success: true,
			role: "client",
			user: client,
		});
	} catch (err) {
		return NextResponse.json({ success: false, msg: "Invalid token" }, { status: 401 });
	}
}

// UPDATE CLIENT PROFILE
export async function PUT(req) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		if (!token)
			return NextResponse.json({ success: false, msg: "Token missing" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "client")
			return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 403 });

		const formData = await req.formData();

		const name = formData.get("name");
		const phone = formData.get("phone");
		const address = formData.get("address");
		const photo = formData.get("photo");

		if (phone && !/^\d{10}$/.test(phone))
			return NextResponse.json({ success: false, msg: "Phone must be 10 digits" }, { status: 400 });

		const client = await Client.findOne({ where: { id: decoded.id } });

		if (!client)
			return NextResponse.json({ success: false, msg: "Client not found" }, { status: 404 });

		let photoUrl = null;

		if (photo && typeof photo !== "string" && photo.size > 0) {
			const bytes = await photo.arrayBuffer();
			const buffer = Buffer.from(bytes);
			photoUrl = await uploadToCloudinary(buffer, "clients");
		}

		if (name) client.name = name;
		if (phone) client.phone = phone;
		if (address) client.address = address;
		if (photoUrl) client.photo = photoUrl;

		await client.save();

		return NextResponse.json({ success: true, msg: "Profile updated", user: client });

	} catch (err) {
		return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
	}
}
