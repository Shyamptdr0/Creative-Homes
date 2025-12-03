import { NextResponse } from "next/server";
import PaymentStage from "@/models/PaymentStage";
import Payment from "@/models/Payment";
import Project from "@/models/Project";

export async function POST(req) {
	try {
		const { projectId } = await req.json();

		if (!projectId)
			return NextResponse.json({ success: false, error: "Project ID required" });

		// Load project
		const project = await Project.findByPk(projectId);
		if (!project)
			return NextResponse.json({ success: false, error: "Project not found" });

		// Load stages
		const stages = await PaymentStage.findAll({
			where: { projectId },
			order: [["stageOrder", "ASC"]],
		});

		if (!stages.length)
			return NextResponse.json({ success: false, error: "No stages found" });

		// Delete previous payments (optional: to regenerate)
		await Payment.destroy({ where: { projectId } });

		// Create payments for each stage
		for (const stage of stages) {
			await Payment.create({
				projectId,
				stageId: stage.id,

				clientId: project.clientId,
				contractorId: project.contractorId,

				payerType: "client",
				receiverType: "admin",

				totalAmount: stage.amount,
				paidAmount: 0,
				dueDate: null,
			});

			await Payment.create({
				projectId,
				stageId: stage.id,

				clientId: project.clientId,
				contractorId: project.contractorId,

				payerType: "admin",
				receiverType: "contractor",

				totalAmount: stage.amount,
				paidAmount: 0,
				dueDate: null,
			});
		}

		return NextResponse.json({ success: true, message: "Payments generated" });

	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
