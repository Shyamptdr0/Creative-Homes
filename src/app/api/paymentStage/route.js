import { NextResponse } from "next/server";

import "@/lib/db";

import PaymentStage from "@/models/PaymentStage";
import Payment from "@/models/Payment";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";

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

		// Calculate total %
		const clientTotal = stages
			.filter((s) => s.stageType === "client")
			.reduce((s, c) => s + c.percentage, 0);

		const contractorTotal = stages
			.filter((s) => s.stageType === "contractor")
			.reduce((s, c) => s + c.percentage, 0);

		if (clientTotal !== 100)
			return NextResponse.json(
				{ success: false, error: "Client percentages must total 100%" },
				{ status: 400 }
			);

		if (contractorTotal !== 100)
			return NextResponse.json(
				{ success: false, error: "Contractor percentages must total 100%" },
				{ status: 400 }
			);

		const savedStages = [];

		for (const s of stages) {
			const amount = (totalAmount * s.percentage) / 100;

			const stage = await PaymentStage.create({
				projectId,
				stageOrder: s.stageOrder,
				stageName: s.stageName,
				stageType: s.stageType,
				percentage: s.percentage,
				amount,
				dueDate: s.dueDate,
				remarks: s.remarks || "",
			});

			// Auto create payment entry
			await Payment.create({
				projectId,
				stageId: stage.id,
				clientId: project.clientId,
				contractorId: project.contractorId,
				payerType: s.stageType === "client" ? "client" : "admin",
				receiverType: s.stageType === "client" ? "admin" : "contractor",
				totalAmount: amount,
				dueDate: s.dueDate,
				status: "pending",
			});

			savedStages.push(stage);
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
