import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import ProjectStage from "@/models/ProjectStage";
import StageTemplate from "@/models/StageTemplate";

import "@/lib/db";

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

		// ---------------- CONTRACTOR ACCESS ONLY ----------------
		if (decoded.role !== "contractor") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const contractorId = decoded.id;

		// ---------------- FETCH CONTRACTOR PROJECTS ----------------
		const projects = await Project.findAll({
			where: { contractorId },
			include: [
				{ model: Client, as: "client", attributes: ["ClientId", "name"] },
				{ model: Contractor, as: "contractor", attributes: ["id", "name"] },
			],
			order: [["createdAt", "ASC"]],
		});

		if (!projects.length) {
			return NextResponse.json({ success: true, projects: [] });
		}

		// ---------------- FETCH ALL PROJECT STAGES ----------------
		const projectIds = projects.map((p) => p.id);

		const stages = await ProjectStage.findAll({
			where: { projectId: projectIds },
			include: [
				{
					model: StageTemplate,
					as: "StageTemplate",
					attributes: ["id", "name"],
				},
			],
		});

		// ---------------- CALCULATE PROJECT PROGRESS ----------------
		const finalProjects = projects.map((project) => {
			const pStages = stages.filter((s) => s.projectId === project.id);

			let avgProgress = 0;

			if (pStages.length > 0) {
				// ✔ completed stage = 100%
				// ✔ approved = 100%
				// ✔ pending = 0%
				const sum = pStages.reduce((acc, st) => {
					if (st.isApproved) return acc + 100;
					if (st.isCompleted) return acc + 100;
					return acc + 0;
				}, 0);

				avgProgress = Math.round(sum / pStages.length);
			}

			return {
				...project.toJSON(),
				avgProgress,
			};
		});

		return NextResponse.json({
			success: true,
			projects: finalProjects,
		});

	} catch (error) {
		console.error("CONTRACTOR PROJECT ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
