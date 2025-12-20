import { NextResponse } from "next/server";

import "@/lib/db";

import Payment from "@/models/Payment";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Project from "@/models/Project";
import PaymentStage from "@/models/PaymentStage";
import PaymentInstallment from "@/models/PaymentInstallment";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const projectId = searchParams.get("projectId");

		if (!projectId) {
			return NextResponse.json(
				{ success: false, error: "projectId is required" },
				{ status: 400 }
			);
		}

		const payments = await Payment.findAll({
			where: { projectId },
			include: [
				{ model: Client, as: "client" },
				{ model: Contractor, as: "contractor" },
				{ model: Project, as: "project" },
				{ model: PaymentStage, as: "stage" },
				{ 
					model: PaymentInstallment, 
					as: "installments",
					order: [["installmentNo", "ASC"]]
				},
			],
			order: [[{ model: PaymentStage, as: "stage" }, "stageOrder", "ASC"]],
		});

		return NextResponse.json({ success: true, payments });
	} catch (error) {
		console.error("PAYMENT GET ERROR =>", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
