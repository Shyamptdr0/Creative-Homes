import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Material from "@/models/Material";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { deleteFromCloudinary } from "@/lib/deleteFromCloudinary";
import { updateProjectMaterialTotal } from "@/lib/updateProjectMaterialTotal";
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

// ✅ UPDATE MATERIAL
export async function PUT(req, ctx) {
	const params = await ctx.params;

	const user = getUser(req);
	if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

	const fd = await req.formData();
	const file = fd.get("billImage");

	const material = await Material.findOne({
		where: { id: params.id, contractorId: user.id }
	});

	if (!material) return NextResponse.json({ msg: "Not found" }, { status: 404 });

	const oldProjectId = material.projectId;

	let update = {
		name: fd.get("name"),
		quantity: fd.get("quantity"),
		unit: fd.get("unit"),
		cost: fd.get("cost"),
		status: fd.get("status"),
		projectId: fd.get("projectId"),
	};

	// ✅ If bill changed
	if (file && file.type.startsWith("image/")) {
		if (material.billImage) await deleteFromCloudinary(material.billImage);

		const buffer = Buffer.from(await file.arrayBuffer());
		update.billImage = await uploadToCloudinary(buffer);
	}

	await Material.update(update, { where: { id: params.id } });

	// ✅ Update totals
	if (oldProjectId !== Number(update.projectId)) {
		await updateProjectMaterialTotal(oldProjectId); // old project
	}
	await updateProjectMaterialTotal(update.projectId); // new project

	return NextResponse.json({ success: true, message: "Material updated" });
}

// ✅ DELETE MATERIAL
export async function DELETE(req, ctx) {
	const params = await ctx.params;

	const user = getUser(req);
	if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

	const material = await Material.findOne({
		where: { id: params.id, contractorId: user.id }
	});

	if (!material) return NextResponse.json({ msg: "Not found" }, { status: 404 });

	if (material.billImage) await deleteFromCloudinary(material.billImage);

	await Material.destroy({
		where: { id: params.id, contractorId: user.id },
	});

	// ✅ Update totals
	await updateProjectMaterialTotal(material.projectId);

	return NextResponse.json({ success: true, message: "Material deleted" });
}
