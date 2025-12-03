import { NextResponse } from "next/server";
import "@/lib/db";

import PaymentInstallment from "@/models/PaymentInstallment";

export async function GET(req, ctx) {
	try {
		const { paymentId } = await ctx.params;  // <-- FIX

		const data = await PaymentInstallment.findAll({
			where: { paymentId },
			order: [["installmentNo", "ASC"]],
		});

		return NextResponse.json({ success: true, installments: data });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

