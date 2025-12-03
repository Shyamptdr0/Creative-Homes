import { NextResponse } from "next/server";
import PaymentStage from "@/models/PaymentStage";

export async function POST(req) {
	try {
		const { projectId, stageOrder, stageName, percentage, amount, remarks } =
			await req.json();

		const stage = await PaymentStage.create({
			projectId,
			stageOrder,
			stageName,
			percentage,
			amount,
			remarks: remarks || "",
		});

		return NextResponse.json({ success: true, stage });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
