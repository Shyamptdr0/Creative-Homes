import Admin from "@/models/User.js";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		if (!token) return NextResponse.json({ success: false, msg: "No token provided" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (decoded.role !== "admin") {
			return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 403 });
		}

		const admin = await Admin.findOne({
			where: { id: decoded.id },
			attributes: { exclude: ["password"] },
		});

		if (!admin) return NextResponse.json({ success: false, msg: "Admin not found" }, { status: 404 });

		return NextResponse.json({ success: true, admin });

	} catch {
		return NextResponse.json({ success: false, msg: "Invalid or expired token" }, { status: 401 });
	}
}
