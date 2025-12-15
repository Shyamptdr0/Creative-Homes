import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import "@/lib/db";

import Payment from "@/models/Payment";
import PaymentInstallment from "@/models/PaymentInstallment";

export async function POST(req) {
	try {
		// ---------------- TOKEN CHECK ----------------
		const authHeader = req.headers.get("authorization");

		if (!authHeader)
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);

		const token = authHeader.split(" ")[1];
		if (!token)
			return NextResponse.json(
				{ success: false, message: "Invalid token format" },
				{ status: 401 }
			);

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch {
			return NextResponse.json(
				{ success: false, message: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		// ---------------- CLIENT ACCESS ONLY ----------------
		if (decoded.role !== "client") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const clientId = decoded.id;
		const { installmentId, amount } = await req.json();

		if (!installmentId || !amount || amount <= 0) {
			return NextResponse.json(
				{ success: false, message: "Invalid payment data" },
				{ status: 400 }
			);
		}

		// Find the installment
		const installment = await PaymentInstallment.findOne({
			where: { id: installmentId },
			include: [
				{
					model: Payment,
					as: "payment",
					where: { clientId }
				}
			]
		});

		if (!installment) {
			return NextResponse.json(
				{ success: false, message: "Installment not found" },
				{ status: 404 }
			);
		}

		if (installment.paid) {
			return NextResponse.json(
				{ success: false, message: "Installment already paid" },
				{ status: 400 }
			);
		}

		if (amount > installment.amount) {
			return NextResponse.json(
				{ success: false, message: "Amount exceeds installment amount" },
				{ status: 400 }
			);
		}

		// Update installment as paid
		await installment.update({
			paid: true,
			remark: installment.remark ? `${installment.remark} (Paid: ₹${amount})` : `Paid: ₹${amount}`
		});

		// Recalculate payment status
		const payment = installment.payment;
		const allInstallments = await PaymentInstallment.findAll({
			where: { paymentId: payment.id }
		});

		const paidInstallments = allInstallments.filter(inst => inst.paid);
		const totalPaid = paidInstallments.reduce((sum, inst) => sum + inst.amount, 0);

		let status = "pending";
		if (totalPaid >= payment.totalAmount) {
			status = "completed";
		} else if (totalPaid > 0) {
			status = "partial";
		}

		await payment.update({
			paidAmount: totalPaid,
			status
		});

		console.log("CLIENT PAYMENT SUCCESS:", {
			clientId,
			installmentId,
			amount,
			paymentId: payment.id
		});

		return NextResponse.json({
			success: true,
			message: "Payment successful",
			data: {
				installment: installment.toJSON(),
				payment: {
					...payment.toJSON(),
					paidAmount: totalPaid,
					status
				}
			}
		});

	} catch (error) {
		console.error("CLIENT MAKE PAYMENT ERROR =>", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
