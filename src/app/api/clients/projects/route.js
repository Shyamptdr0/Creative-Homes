import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import ProjectType from "@/models/ProjectType";

import ProjectStage from "@/models/ProjectStage";
import StageTemplate from "@/models/StageTemplate";

import "@/lib/db";

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader) {
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== "client") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const clientId = decoded.id;

		const projects = await Project.findAll({
			where: { clientId },
			include: [
				{ model: Client, as: "client", attributes: ["id", "name"] },
				{ model: Contractor, as: "contractor", attributes: ["id", "name"] },
				{ model: ProjectType, as: "projectType", attributes: ["id", "name"] }, // 🔥 FIX ADDED
			],
			order: [["createdAt", "DESC"]],
		});

		return NextResponse.json({
			success: true,
			projects,
		});
	} catch (error) {
		console.error("ERROR CLIENT PROJECTS:", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
