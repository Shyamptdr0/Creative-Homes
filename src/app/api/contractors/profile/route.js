import Contractor from "@/models/Contractor";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		if (!token)
			return NextResponse.json({ success: false, msg: "No token provided" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "contractor") {
			return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 403 });
		}

		const contractor = await Contractor.findOne({
			where: { id: decoded.id },
			attributes: { exclude: ["password"] },
		});

		if (!contractor)
			return NextResponse.json({ success: false, msg: "Contractor not found" }, { status: 404 });

		return NextResponse.json({
			success: true,
			role: "contractor",
			user: contractor,
		});
	} catch {
		return NextResponse.json({ success: false, msg: "Invalid token" }, { status: 401 });
	}
}
