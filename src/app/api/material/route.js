import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Material from "@/models/Material";
import Project from "@/models/Project";
import "@/lib/db";

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader) return NextResponse.json({ msg: "No token" }, { status: 401 });

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "contractor")
			return NextResponse.json({ msg: "Unauthorized" }, { status: 403 });

		const materials = await Material.findAll({
			where: { contractorId: decoded.id },
			include: [{ model: Project, as: "project", attributes: ["id", "title"] }],
			order: [["createdAt", "DESC"]],
		});

		return NextResponse.json({ success: true, data: materials });
	} catch (err) {
		console.log("JWT error:", err);
		return NextResponse.json({ msg: "Server error", error: err.message }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader) return NextResponse.json({ msg: "No token" }, { status: 401 });

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const body = await req.json();
		const created = await Material.create({
			...body,
			contractorId: decoded.id,
		});

		return NextResponse.json({ success: true, data: created });
	} catch (err) {
		console.log(err);
		return NextResponse.json({ msg: "Server error", error: err.message }, { status: 500 });
	}
}
