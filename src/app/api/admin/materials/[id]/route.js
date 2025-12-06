import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import Material from "@/models/Material";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { deleteFromCloudinary } from "@/lib/deleteFromCloudinary";
import { updateProjectMaterialTotal } from "@/lib/updateProjectMaterialTotal";

import "@/lib/db"; // important!

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

export async function PUT(req, context) {
	// ⛳ Fix: params is a Promise, must await
	const params = await context.params;
	const id = params.id;

	const admin = getAdmin(req);
	if (!admin)
		return NextResponse.json({ msg: "Unauthorized" }, { status: 403 });

	// Fetch material
	const material = await Material.findByPk(id);
	if (!material)
		return NextResponse.json({ msg: "Not found" }, { status: 404 });

	const fd = await req.formData();
	let update = {};

	// Update status
	const status = fd.get("status");
	if (status) update.status = status;

	// Update cost
	const cost = fd.get("cost");
	if (cost) update.cost = Number(cost);

	// Bill Image update
	const file = fd.get("billImage");
	if (file && file.size > 0 && file.type.startsWith("image/")) {
		// Delete old image if exists
		if (material.billImage) await deleteFromCloudinary(material.billImage);

		const buffer = Buffer.from(await file.arrayBuffer());
		update.billImage = await uploadToCloudinary(buffer);
	}

	// Save changes
	await material.update(update);

	// 🆕 Update project-level total cost
	await updateProjectMaterialTotal(material.projectId);

	return NextResponse.json({
		success: true,
		message: "Material updated successfully",
	});
}
