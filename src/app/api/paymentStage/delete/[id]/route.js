import { NextResponse } from "next/server";
import PaymentStage from "@/models/PaymentStage";

export async function DELETE(req, context) {
	try {
		const { id } = await context.params;

		const deleted = await PaymentStage.destroy({
			where: { id }
		});

		if (!deleted) {
			return NextResponse.json(
				{ success: false, error: "Stage not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true });

	} catch (err) {
		console.error("DELETE Stage Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
