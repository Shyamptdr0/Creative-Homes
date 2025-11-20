import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const body = await req.json();
		const payment = await Payment.create(body);

		return NextResponse.json({ success: true, payment });
	} catch (e) {
		return NextResponse.json({ success: false, error: e.message }, { status: 500 });
	}
}
