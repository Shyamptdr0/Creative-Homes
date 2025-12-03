import { NextResponse } from "next/server";
import "@/lib/db";

import Payment from "@/models/Payment";
import PaymentInstallment from "@/models/PaymentInstallment";

// --- Safe date add function (no timezone shifting) ---
function addDays(dateStr, days) {
	const d = new Date(dateStr + "T00:00:00"); // lock to midnight
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10); // return YYYY-MM-DD
}

export async function POST(req) {
	try {
		const { paymentId, count, gapDays, startDate } = await req.json();

		if (!paymentId || !count || !gapDays || !startDate) {
			return NextResponse.json(
				{ success: false, error: "Missing fields" },
				{ status: 400 }
			);
		}

		// Validate payment
		const payment = await Payment.findByPk(paymentId);
		if (!payment) {
			return NextResponse.json(
				{ success: false, error: "Payment not found" },
				{ status: 404 }
			);
		}

		const baseAmount = payment.totalAmount / count;

		// Remove old installments
		await PaymentInstallment.destroy({ where: { paymentId } });

		let dueDate = startDate; // ✔ Use exact date user selected
		const installments = [];

		for (let i = 1; i <= count; i++) {
			const inst = await PaymentInstallment.create({
				paymentId,
				installmentNo: i,
				amount: baseAmount,
				dueDate, // ✔ Save safe string YYYY-MM-DD
				paid: false,
			});

			installments.push(inst);

			// Set next due date
			dueDate = addDays(dueDate, Number(gapDays));
		}

		return NextResponse.json({ success: true, installments });

	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
