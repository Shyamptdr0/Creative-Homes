import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Material from "@/models/Material";
import Project from "@/models/Project";
import Contractor from "@/models/Contractor";
import "@/lib/db";

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader)
			return NextResponse.json({ msg: "No token" }, { status: 401 });

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// ✅ Only admin can access
		if (decoded.role !== "admin")
			return NextResponse.json({ msg: "Unauthorized" }, { status: 403 });

		const materials = await Material.findAll({
			include: [
				{ model: Project, as: "project", attributes: ["id", "title"] },
				{ model: Contractor, as: "contractor", attributes: ["id", "name"] }
			],
			order: [["createdAt", "DESC"]],
		});

		return NextResponse.json({ success: true, data: materials });
	} catch (err) {
		return NextResponse.json(
			{ msg: "Server error", error: err.message },
			{ status: 500 }
		);
	}
}
