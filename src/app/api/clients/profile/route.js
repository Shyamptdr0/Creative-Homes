import Client from "@/models/Client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		if (!token)
			return NextResponse.json({ success: false, msg: "No token provided" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "client") {
			return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 403 });
		}

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
	} catch {
		return NextResponse.json({ success: false, msg: "Invalid token" }, { status: 401 });
	}
}
