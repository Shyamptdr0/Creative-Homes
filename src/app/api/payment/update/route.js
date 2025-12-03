import { NextResponse } from "next/server";

import "@/lib/db";

import Payment from "@/models/Payment";

export async function PUT(req) {
	try {
		const { id, key, value } = await req.json();

		if (!id || !key) {
			return NextResponse.json(
				{ success: false, error: "Missing fields" },
				{ status: 400 }
			);
		}

		const payment = await Payment.findByPk(id);
		if (!payment) {
			return NextResponse.json(
				{ success: false, error: "Payment not found" },
				{ status: 404 }
			);
		}

		// Update allowed fields dynamically
		payment[key] = value;
		await payment.save();

		return NextResponse.json({ success: true, payment });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
