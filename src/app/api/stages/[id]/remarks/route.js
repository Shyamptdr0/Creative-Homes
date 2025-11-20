// api/stages/[id]/remarks/route.js
import { NextResponse } from "next/server";
import { Op } from "sequelize";

import ProjectStage from "@/models/ProjectStage";
import StageRemark from "@/models/StageRemark";
import StageTemplate from "@/models/StageTemplate";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";

import "@/lib/db";
import { verifyToken } from "@/lib/auth";

/* ======================================================
   GET REMARKS (admin, contractor, client)
====================================================== */
export async function GET(req, context) {
	try {
		const { id } = await context.params;

		// ---------------------------
		// 🔐 Identify current viewer
		// ---------------------------
		let viewer = null;
		const auth = req.headers.get("authorization");

		if (auth) {
			try {
				viewer = verifyToken(auth.split(" ")[1]); // {id, role}
			} catch (e) {
				console.log("Invalid token for GET remarks viewer");
			}
		}

		// Stage + full project info
		const stage = await ProjectStage.findOne({
			where: { id },
			include: [
				{ model: StageTemplate, as: "StageTemplate" },
				{
					model: Project,
					as: "project",
					include: [
						{ model: Client, as: "client" },
						{ model: Contractor, as: "contractor" }
					],
				},
			],
		});

		if (!stage) {
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);
		}

		// Fetch all remarks
		const remarks = await StageRemark.findAll({
			where: { projectStageId: id },
			order: [["createdAt", "ASC"]],
		});

		// ------------------------------------------------------------
		// ⭐ FIX: Mark unread remarks as READ for *this viewer*
		// ------------------------------------------------------------
		if (viewer?.role) {
			await StageRemark.update(
				{ isRead: true },
				{
					where: {
						projectStageId: id,
						userRole: { [Op.ne]: viewer.role }, // not written by viewer
						isRead: false,
					},
				}
			);
		}

		return NextResponse.json({
			success: true,

			stage: {
				id: stage.id,
				templateName: stage.StageTemplate?.name,
				project: {
					id: stage.project?.id,
					client: stage.project?.client,
					contractor: stage.project?.contractor,
				},
			},

			remarks: remarks.map((r) => ({
				id: r.id,
				by: r.userRole,
				senderName:
					r.userRole === "admin"
						? "Admin"
						: r.userRole === "contractor"
							? stage.project?.contractor?.name
							: stage.project?.client?.name,
				message: r.remark,
				isRead: r.isRead,
				createdAt: r.createdAt,
			})),
		});

	} catch (err) {
		console.error("REMARK FETCH ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* ======================================================
   PUT — ADD NEW REMARK
====================================================== */
export async function PUT(req, context) {
	try {
		const { id } = await context.params;
		const { message } = await req.json();

		if (!message?.trim()) {
			return NextResponse.json(
				{ success: false, message: "Message required" },
				{ status: 400 }
			);
		}

		// Auth
		const auth = req.headers.get("authorization");
		if (!auth) {
			return NextResponse.json(
				{ success: false, message: "Missing token" },
				{ status: 401 }
			);
		}

		const token = auth.split(" ")[1];

		let user;
		try {
			user = verifyToken(token);
		} catch {
			return NextResponse.json(
				{ success: false, message: "Invalid token" },
				{ status: 401 }
			);
		}

		const stage = await ProjectStage.findByPk(id, {
			include: [
				{
					model: Project,
					as: "project",
					include: [
						{ model: Client, as: "client" },
						{ model: Contractor, as: "contractor" },
					],
				},
			],
		});

		if (!stage) {
			return NextResponse.json(
				{ success: false, message: "Stage not found" },
				{ status: 404 }
			);
		}

		let senderName = "Admin";
		if (user.role === "contractor") senderName = stage.project?.contractor?.name;
		if (user.role === "client") senderName = stage.project?.client?.name;

		const newRemark = await StageRemark.create({
			projectStageId: id,
			userRole: user.role,
			remark: message.trim(),
			isRead: false,
		});

		return NextResponse.json({
			success: true,
			remark: {
				id: newRemark.id,
				by: user.role,
				senderName,
				message,
				isRead: false,
				createdAt: newRemark.createdAt,
			},
		});

	} catch (err) {
		console.error("REMARK ADD ERROR:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
