import Contractor from "@/models/Contractor";
import ContractorType from "@/models/ContractorType";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import ContractorTypeAssignment from "@/models/ContractorTypeAssignment";

// ===============================
// GET CONTRACTOR PROFILE
// ===============================
export async function GET(req) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		if (!token)
			return Response.json({ success: false, msg: "No token provided" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const contractor = await Contractor.findOne({
			where: { id: decoded.id },
			attributes: { exclude: ["password", "visiblePassword"] },
			include: [
				{
					model: ContractorType,
					as: "types",   // ✅ FIXED
					through: { attributes: [] }
				}
			]
		});

		return Response.json({
			success: true,
			role: "contractor",
			user: contractor
		});

	} catch (err) {
		console.log("GET CONTRACTOR ERROR:", err);
		return Response.json({ success: false, msg: "Invalid token" }, { status: 401 });
	}
}

// ===============================
// UPDATE CONTRACTOR PROFILE
// ===============================
export async function PUT(req) {
	try {
		const token = req.headers.get("authorization")?.split(" ")[1];
		if (!token)
			return Response.json({ success: false, msg: "No token provided" }, { status: 401 });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const form = await req.formData();

		// ===============================
		// UPDATE MULTIPLE TYPES
		// ===============================
		const types = form.getAll("types[]"); // array from checkbox

		if (types.length > 0) {
			await ContractorTypeAssignment.destroy({ where: { contractorId: decoded.id } });

			await ContractorTypeAssignment.bulkCreate(
				types.map((t) => ({
					contractorId: decoded.id,
					typeId: parseInt(t),
				}))
			);
		}

		// ===============================
		// UPDATE FIELDS (name, phone, address)
		// ===============================
		const allowed = ["name", "phone", "address"];
		const updateData = {};

		for (const key of allowed) {
			if (form.get(key)) updateData[key] = form.get(key);
		}

		// Phone Validation
		if (updateData.phone && !/^\d{10}$/.test(updateData.phone)) {
			return Response.json({ success: false, msg: "Phone must be 10 digits" }, { status: 400 });
		}

		// ===============================
		// PHOTO UPLOAD
		// ===============================
		const file = form.get("photo");

		if (file && file.size > 0) {
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			updateData.photo = await uploadToCloudinary(buffer, "contractors");
		}

		// UPDATE DB
		await Contractor.update(updateData, { where: { id: decoded.id } });

		// RETURN UPDATED USER
		const updated = await Contractor.findOne({
			where: { id: decoded.id },
			attributes: { exclude: ["password", "visiblePassword"] },
			include: [{ model: ContractorType, as: "types", through: { attributes: [] } }]
		});

		return Response.json({
			success: true,
			msg: "Profile updated",
			user: updated
		});

	} catch (err) {
		console.log("UPDATE CONTRACTOR ERROR:", err);
		return Response.json({ success: false, msg: "Update failed" }, { status: 500 });
	}
}
