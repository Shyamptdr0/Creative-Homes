import { NextResponse } from "next/server";
import Project from "@/models/Project";
import jwt from "jsonwebtoken";
import "@/lib/db";

function getUser(req) {
	try {
		const auth = req.headers.get("authorization");
		if (!auth) return null;
		const token = auth.split(" ")[1];
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch {
		return null;
	}
}

export async function PUT(req, context) {
	try {
		// ✅ FIX FOR NEXT.JS: params is a Promise
		const { id } = await context.params;

		const user = getUser(req);
		if (!user) {
			return NextResponse.json(
				{ success: false, error: "Invalid token" },
				{ status: 401 }
			);
		}

		const project = await Project.findByPk(id);
		if (!project)
			return NextResponse.json(
				{ success: false, error: "Project not found" },
				{ status: 404 }
			);

		// 🔥 AUTO DETECT ROLE FROM TOKEN
		if (user.role === "client") {
			project.clientApproved = true;
		} else if (user.role === "contractor") {
			project.contractorApproved = true;
		}

		// 🔥 When both approved → Lock project
		if (project.clientApproved && project.contractorApproved) {
			project.status = "approved";
			project.adminLocked = true;
		}

		await project.save();

		return NextResponse.json({ success: true, project });
	} catch (err) {
		console.error("APPROVE ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
