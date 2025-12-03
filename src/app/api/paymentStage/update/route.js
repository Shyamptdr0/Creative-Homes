import { NextResponse } from "next/server";
import PaymentStage from "@/models/PaymentStage";

export async function PUT(req) {
	try {
		const { id, stageOrder, stageName, percentage, amount, remarks } = await req.json();

		await PaymentStage.update(
			{ stageOrder, stageName, percentage, amount, remarks },
			{ where: { id } }
		);

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
