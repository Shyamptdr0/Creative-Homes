import Contractor from "@/models/Contractor";
import { NextResponse } from "next/server";

// ✅ Get contractor by ID
export async function GET(req, context) {
	const { id } = await context.params; // ✅ await params

	const contractor = await Contractor.findOne({
		where: { contractorId: id },  // ✅ search by contractorId instead of PK
		attributes: { exclude: ["password"] }
	});

	if (!contractor) {
		return NextResponse.json({ success: false, message: "Contractor not found" });
	}

	return NextResponse.json({ success: true, contractor });
}

// ✅ Update contractor
export async function PUT(req, context) {
	const { id } = await context.params;
	try {
		const contractor = await Contractor.findOne({ where: { contractorId: id } });
		if (!contractor) return NextResponse.json({ success: false });

		const data = await req.json();
		await contractor.update(data);

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message });
	}
}

// ✅ Delete contractor
export async function DELETE(req, context) {
	const { id } = await context.params;

	const contractor = await Contractor.findOne({ where: { contractorId: id } });
	if (!contractor) return NextResponse.json({ success: false });

	await contractor.destroy();
	return NextResponse.json({ success: true });
}
