import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import "@/lib/db";

export async function GET() {
	const drawings = await Drawing.findAll({
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
		order: [["id", "DESC"]],
	});

	return NextResponse.json(drawings);
}

export async function POST(req) {
	try {
		const form = await req.formData();
		const projectId = form.get("projectId");

		const urlList = JSON.parse(form.get("fileUrls"));
		const nameList = JSON.parse(form.get("fileNames"));

		let created = [];

		for (let i = 0; i < urlList.length; i++) {
			const fileUrl = urlList[i];
			const fileName = nameList[i]; // auto title

			const drawing = await Drawing.create({
				projectId,
				title: fileName,
				fileUrl,
				uploadedAt: new Date(),
			});

			created.push(drawing);
		}

		return NextResponse.json({ success: true, created });
	} catch (err) {
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
