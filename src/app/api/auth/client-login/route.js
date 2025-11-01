import Client from "@/models/Client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const { clientId, password } = await req.json();
		const user = await Client.findOne({ where: { clientId } });

		if (!user) return NextResponse.json({ success: false, msg: "Client not found" });

		const match = await bcrypt.compare(password, user.password);
		if (!match) return NextResponse.json({ success: false, msg: "Invalid password" });

		const token = jwt.sign(
			{ id: user.id, clientId: user.clientId, role: "client" },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		return NextResponse.json({ success: true, token, user });
	} catch {
		return NextResponse.json({ success: false, msg: "Server error" });
	}
}
