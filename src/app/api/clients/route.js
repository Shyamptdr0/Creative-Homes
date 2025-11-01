import Client from "@/models/Client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

function generateClientCredentials() {
	const clientId = "CL" + Math.floor(1000 + Math.random() * 9000);
	const password = Math.random().toString(36).slice(-8);
	return { clientId, password };
}

// ✅ Get all clients
export async function GET() {
	const clients = await Client.findAll({
		attributes: { exclude: ["password"] }
	});
	return NextResponse.json({ success: true, clients });
}

// ✅ Create client
export async function POST(req) {
	try {
		const data = await req.json();
		const { name, phone, address, email } = data;

		const { clientId, password } = generateClientCredentials();
		const hashed = await bcrypt.hash(password, 10);

		const client = await Client.create({
			clientId,
			name,
			email,
			phone,
			address,
			password: hashed,
			visiblePassword: password
		});

		return NextResponse.json({ success: true, client });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message });
	}
}
