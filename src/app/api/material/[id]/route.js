import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Material from "@/models/Material";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import "@/lib/db";

// ✅ Get user from JWT
function getUser(req) {
	const auth = req.headers.get("authorization");
	if (!auth) return null;
	try {
		return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
	} catch {
		return null;
	}
}

// ✅ PUT — Update Material
export async function PUT(req, context) {
	const params = await context.params; // ✅ FIXED PARAMS
	const user = getUser(req);
	if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

	const fd = await req.formData();
	const file = fd.get("billImage");

	let update = {
		name: fd.get("name"),
		quantity: fd.get("quantity"),
		unit: fd.get("unit"),
		cost: fd.get("cost"),
		status: fd.get("status"),
		projectId: fd.get("projectId"),
	};

	// ✅ Upload new bill image if selected
	if (file && file.name) {
		const buffer = Buffer.from(await file.arrayBuffer());
		update.billImage = await uploadToCloudinary(buffer);
	}

	await Material.update(update, {
		where: { id: params.id, contractorId: user.id },
	});

	return NextResponse.json({ success: true, message: "Material updated" });
}

// ✅ DELETE — Delete Material
export async function DELETE(req, context) {
	const params = await context.params; // ✅ FIXED PARAMS
	const user = getUser(req);
	if (!user) return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });

	await Material.destroy({
		where: { id: params.id, contractorId: user.id },
	});

	return NextResponse.json({ success: true, message: "Material deleted" });
}
