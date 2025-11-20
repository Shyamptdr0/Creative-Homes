import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
	try {
		const body = await req.json();
		await Payment.update(body, { where: { id: params.id } });

		return NextResponse.json({ success: true });
	} catch (e) {
		return NextResponse.json({ success: false, error: e.message });
	}
}
