import ContractorType from "@/models/ContractorType";
import { NextResponse } from "next/server";

/* ===============================
   UPDATE TYPE (PUT)
================================ */
export async function PUT(req, context) {
	try {
		const { id } = await context.params; // ✅ FIXED
		const { name } = await req.json();

		if (!name || name.trim() === "") {
			return NextResponse.json(
				{ success: false, msg: "Type name required" },
				{ status: 400 }
			);
		}

		const updated = await ContractorType.update(
			{ name },
			{ where: { id } }
		);

		if (!updated[0]) {
			return NextResponse.json(
				{ success: false, msg: "Type not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, msg: "Type updated" });
	} catch (error) {
		console.error("UPDATE TYPE ERROR:", error);
		return NextResponse.json(
			{ success: false, msg: "Server error" },
			{ status: 500 }
		);
	}
}

/* ===============================
   DELETE TYPE (DELETE)
================================ */
export async function DELETE(req, context) {
	try {
		const { id } = await context.params; // ✅ FIXED

		const deleted = await ContractorType.destroy({
			where: { id },
		});

		if (!deleted) {
			return NextResponse.json(
				{ success: false, msg: "Type not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, msg: "Type deleted" });
	} catch (error) {
		console.error("DELETE TYPE ERROR:", error);
		return NextResponse.json(
			{ success: false, msg: "Server error" },
			{ status: 500 }
		);
	}
}
