import { NextResponse } from "next/server";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req) {
	try {
		const authHeader = req.headers.get("authorization");

		if (!authHeader) {
			return NextResponse.json(
				{ success: false, message: "No token provided" },
				{ status: 401 }
			);
		}

		// ✅ Token Format: Bearer xxxxxxxxx
		const token = authHeader.split(" ")[1];

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Invalid token format" },
				{ status: 401 }
			);
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return NextResponse.json(
				{ success: false, message: "Invalid or expired token" },
				{ status: 401 }
			);
		}

		// ✅ Allow only contractor role
		if (decoded.role !== "contractor") {
			return NextResponse.json(
				{ success: false, message: "Access denied" },
				{ status: 403 }
			);
		}

		const contractorId = decoded.id;

		const projects = await Project.findAll({
			where: { contractorId },
			include: [
				{ model: Client, as: "client", attributes: ["clientId", "name"] },
				{ model: Contractor, as: "contractor", attributes: ["contractorId", "name"] },
			],
			order: [["createdAt", "DESC"]],
		});

		return NextResponse.json({ success: true, projects });

	} catch (error) {
		console.error("CONTRACTOR PROJECT ERROR =>", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
