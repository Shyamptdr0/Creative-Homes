import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Material from "@/models/Material";
import Project from "@/models/Project";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import "@/lib/db";

function getUser(req) {
	const auth = req.headers.get("authorization");
	if (!auth) return null;
	try {
		return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
	} catch {
		return null;
	}
}

// ✅ GET MATERIALS
export async function GET(req) {
	const user = getUser(req);
	if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

	const materials = await Material.findAll({
		where: { contractorId: user.id },
		include: [{ model: Project, as: "project", attributes: ["id", "title"] }],
		order: [["createdAt", "DESC"]],
	});

	return NextResponse.json({ success: true, data: materials });
}

// ✅ CREATE MATERIAL
export async function POST(req) {
	const user = getUser(req);
	if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

	const fd = await req.formData();
	const file = fd.get("billImage");

	let billImageUrl = null;

	if (file && file.name) {
		const buffer = Buffer.from(await file.arrayBuffer());
		billImageUrl = await uploadToCloudinary(buffer);
	}

	const material = await Material.create({
		name: fd.get("name"),
		quantity: fd.get("quantity"),
		unit: fd.get("unit"),
		cost: fd.get("cost"),
		status: fd.get("status"),
		projectId: fd.get("projectId"),
		contractorId: user.id,
		billImage: billImageUrl,
	});

	return NextResponse.json({ success: true, data: material });
}
