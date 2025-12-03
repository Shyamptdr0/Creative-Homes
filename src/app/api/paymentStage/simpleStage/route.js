import { NextResponse } from "next/server";

import "@/lib/db";

import PaymentStage from "@/models/PaymentStage";
import Payment from "@/models/Payment";
import Project from "@/models/Project";

export async function POST(req) {
	try {
		const body = await req.json();
		const { projectId, totalAmount, stages } = body;

		if (!projectId || !totalAmount || !stages?.length) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const project = await Project.findByPk(projectId);
		if (!project) {
			return NextResponse.json(
				{ success: false, error: "Project not found" },
				{ status: 404 }
			);
		}

		// Validate total percentage
		const totalPercent = stages.reduce((sum, s) => sum + Number(s.percentage), 0);
		if (totalPercent !== 100) {
			return NextResponse.json(
				{ success: false, error: "Total percentage must equal 100%" },
				{ status: 400 }
			);
		}

		const savedStages = [];

		for (const s of stages) {
			const amount = (Number(totalAmount) * Number(s.percentage)) / 100;

			// Store Stage
			const stage = await PaymentStage.create({
				projectId,
				stageOrder: s.stageOrder,
				stageName: s.stageName,
				percentage: s.percentage,
				amount,
			});

			savedStages.push(stage);

			// --------------------------------------------
			// AUTO CREATE PAYMENTS
			// --------------------------------------------

			// 1️⃣ Client → Admin
			await Payment.create({
				projectId,
				stageId: stage.id,
				clientId: project.clientId,
				payerType: "client",
				receiverType: "admin",
				totalAmount: amount,
				status: "pending",
			});

			// 2️⃣ Admin → Contractor
			await Payment.create({
				projectId,
				stageId: stage.id,
				contractorId: project.contractorId,
				payerType: "admin",
				receiverType: "contractor",
				totalAmount: amount,
				status: "pending",
			});
		}

		return NextResponse.json({
			success: true,
			message: "Stages created successfully",
			stages: savedStages,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
