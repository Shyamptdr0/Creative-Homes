import { NextResponse } from "next/server";
import PortfolioProject from "@/models/PortfolioProject";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function GET() {
	try {
		// Ensure the table exists
		await PortfolioProject.sync({ alter: true });
		
		const projects = await PortfolioProject.findAll({ order: [["createdAt", "DESC"]] });
		return NextResponse.json(projects);
	} catch (error) {
		console.error("Error fetching portfolio projects:", error);
		return NextResponse.json({ error: "Failed to fetch portfolio projects" }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		const formData = await req.formData();
		const name = formData.get("name");
		const city = formData.get("city");
		const floors = formData.get("floors");
		const dimensions = formData.get("dimensions");
		const facing = formData.get("facing");
		const budget = formData.get("budget");
		const description = formData.get("description");
		const architectName = formData.get("architectName") || "";
		const work = formData.get("work") || "";
		const image = formData.get("image");

		if (!name) {
			return NextResponse.json({ error: "Project name is required" }, { status: 400 });
		}

		let imageUrl = "";

		if (image && typeof image === "object") {
			const buffer = Buffer.from(await image.arrayBuffer());
			imageUrl = await uploadToCloudinary(buffer, "portfolio");
		}

		if (!imageUrl) {
			return NextResponse.json({ error: "Project image is required" }, { status: 400 });
		}

		const newProject = await PortfolioProject.create({
			name,
			city,
			floors,
			dimensions,
			facing,
			budget,
			description,
			architectName,
			work,
			image: imageUrl
		});

		return NextResponse.json({ success: true, project: newProject }, { status: 201 });
	} catch (error) {
		console.error("Error creating portfolio project:", error);
		return NextResponse.json({ error: "Failed to create portfolio project" }, { status: 500 });
	}
}
