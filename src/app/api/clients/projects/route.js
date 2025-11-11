import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import Stage from "@/models/Stage";
import "@/lib/db";

export async function GET(req) {
	try {
		// ✅ Check token
		const authHeader = req.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];
		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Invalid token format" },
				{ status: 401 }
			);
		}

		// ✅ Verify token
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return NextResponse.json(
				{ success: false, message: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		// ✅ Only client allowed
		if (decoded.role !== "client") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const clientId = decoded.id;

		// ✅ Fetch this client's projects
		const projects = await Project.findAll({
			where: { clientId },
			include: [
				{ model: Client, as: "client", attributes: ["Id", "name"] },
				{ model: Contractor, as: "contractor", attributes: ["contractorId", "name"] },
			],
			order: [["createdAt", "DESC"]],
		});

		// ✅ Fetch all stages
		const stages = await Stage.findAll();

		// ✅ Compute progress per project
		const formatted = projects.map((project) => {
			const projectStages = stages.filter((s) => s.projectId === project.id);

			let avgProgress = 0;
			if (projectStages.length > 0) {
				const sum = projectStages.reduce(
					(total, stage) => total + (stage.progress || 0),
					0
				);
				avgProgress = Math.round(sum / projectStages.length);
			}

			return {
				...project.toJSON(),
				avgProgress,
			};
		});

		return NextResponse.json({
			success: true,
			projects: formatted,
		});
	} catch (error) {
		console.error("CLIENT PROJECT ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
