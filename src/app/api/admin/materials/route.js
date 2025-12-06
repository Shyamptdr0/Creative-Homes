import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Material from "@/models/Material";
import Project from "@/models/Project";
import Contractor from "@/models/Contractor";
import "@/lib/db";

function getAdmin(req) {
	const auth = req.headers.get("authorization");
	if (!auth) return null;

	try {
		const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
		if (decoded.role !== "admin") return null;
		return decoded;
	} catch {
		return null;
	}
}

export async function GET(req) {
	const admin = getAdmin(req);
	if (!admin)
		return NextResponse.json({ msg: "Unauthorized" }, { status: 403 });

	const materials = await Material.findAll({
		include: [
			{ model: Project, as: "project", attributes: ["id", "title"] },
			{ model: Contractor, as: "contractor", attributes: ["id", "name"] }
		],
		order: [["createdAt", "DESC"]],
	});

	return NextResponse.json({ success: true, data: materials });
}
