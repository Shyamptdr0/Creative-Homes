import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import "@/lib/db";

import Payment from "@/models/Payment";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Project from "@/models/Project";
import PaymentStage from "@/models/PaymentStage";
import PaymentInstallment from "@/models/PaymentInstallment";

export async function GET(req) {
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
		console.log("CLIENT ID:", clientId);

		const payments = await Payment.findAll({
			where: { 
				clientId,
				receiverType: "admin"
			},
			include: [
				{ 
					model: Client, as: "client",
					attributes: ["id", "name", "ClientId"]
				},
				{ 
					model: Contractor, as: "contractor",
					attributes: ["id", "name"]
				},
				{ 
					model: Project, as: "project",
					attributes: ["id", "title", "projectUid"]
				},
				{ 
					model: PaymentStage, as: "stage",
					attributes: ["id", "stageName", "stageOrder"]
				},
				{ 
					model: PaymentInstallment, 
					as: "installments",
					attributes: ["id", "installmentNo", "amount", "dueDate", "paid", "remark"],
					order: [["installmentNo", "ASC"]]
				},
			],
			order: [
				[{ model: Project, as: "project" }, "title", "ASC"],
				[{ model: PaymentStage, as: "stage" }, "stageOrder", "ASC"],
				["createdAt", "DESC"]
			],
		});

		// Calculate paid amount from installments
		const paymentsWithCalculatedAmounts = payments.map(payment => {
			const paymentData = payment.toJSON();
			const paidInstallments = paymentData.installments?.filter(inst => inst.paid) || [];
			const calculatedPaidAmount = paidInstallments.reduce((sum, inst) => sum + inst.amount, 0);
			
			// Override paidAmount with calculated value from installments
			paymentData.paidAmount = calculatedPaidAmount;
			
			// Update status based on installments
			if (calculatedPaidAmount >= paymentData.totalAmount) {
				paymentData.status = "completed";
			} else if (calculatedPaidAmount > 0) {
				paymentData.status = "partial";
			} else {
				paymentData.status = "pending";
			}
			
			return paymentData;
		});

		console.log("FOUND CLIENT PAYMENTS:", payments.length);
		console.log("CLIENT PAYMENT DATA SAMPLE:", paymentsWithCalculatedAmounts[0]);

		return NextResponse.json({ success: true, payments: paymentsWithCalculatedAmounts });
	} catch (error) {
		console.error("CLIENT PAYMENTS GET ERROR =>", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
