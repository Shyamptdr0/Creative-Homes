import { NextResponse } from "next/server";
import PortfolioProject from "@/models/PortfolioProject";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { deleteFromCloudinary } from "@/lib/deleteFromCloudinary";

export async function GET(req, { params }) {
	try {
		const { id } = await params;
		const project = await PortfolioProject.findByPk(id);
		
		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}
		
		return NextResponse.json(project);
	} catch (error) {
		console.error("Error fetching portfolio project:", error);
		return NextResponse.json({ error: "Failed to fetch portfolio project" }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		const { id } = await params;
		const project = await PortfolioProject.findByPk(id);

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		// Delete image from cloudinary if necessary
		if (project.image) {
			await deleteFromCloudinary(project.image);
		}

		await project.destroy();
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting portfolio project:", error);
		return NextResponse.json({ error: "Failed to delete portfolio project" }, { status: 500 });
	}
}

export async function PUT(req, { params }) {
	try {
		const { id } = await params;
		const formData = await req.formData();
		const name = formData.get("name");
		const city = formData.get("city");
		const floors = formData.get("floors");
		const dimensions = formData.get("dimensions");
		const facing = formData.get("facing");
		const budget = formData.get("budget");
		const description = formData.get("description");
		const architectName = formData.get("architectName");
		const work = formData.get("work");
		const image = formData.get("image");

		const project = await PortfolioProject.findByPk(id);
		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		let imageUrl = project.image;

		if (image && typeof image === "object") {
			const buffer = Buffer.from(await image.arrayBuffer());
			imageUrl = await uploadToCloudinary(buffer, "portfolio");
			
			if (project.image) {
				await deleteFromCloudinary(project.image);
			}
		}

		await project.update({
			name: name || project.name,
			city: city || project.city,
			floors: floors || project.floors,
			dimensions: dimensions || project.dimensions,
			facing: facing || project.facing,
			budget: budget || project.budget,
			description: description || project.description,
			architectName: architectName !== null ? architectName : project.architectName,
			work: work !== null ? work : project.work,
			image: imageUrl
		});

		return NextResponse.json({ success: true, project });
	} catch (error) {
		console.error("Error updating portfolio project:", error);
		return NextResponse.json({ error: "Failed to update portfolio project" }, { status: 500 });
	}
}
