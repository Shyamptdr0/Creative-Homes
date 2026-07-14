import { NextResponse } from "next/server";
import PortfolioProject from "@/models/PortfolioProject";
import sequelize from "@/lib/db";

// GET featured projects
export async function GET() {
	try {
		const projects = await PortfolioProject.findAll({
			where: { isFeatured: true },
			order: [["featuredRank", "ASC"]],
		});
		return NextResponse.json(projects);
	} catch (error) {
		console.error("Error fetching featured projects:", error);
		return NextResponse.json({ error: "Failed to fetch featured projects" }, { status: 500 });
	}
}

// POST update featured ranks
export async function POST(req) {
	try {
		const body = await req.json();
		const { featuredData } = body; 
		// featuredData should be an array of { id, isFeatured, featuredRank }

		if (!Array.isArray(featuredData)) {
			return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
		}

		await sequelize.transaction(async (t) => {
			for (const item of featuredData) {
				await PortfolioProject.update(
					{ 
						isFeatured: item.isFeatured, 
						featuredRank: item.featuredRank 
					},
					{ 
						where: { id: item.id },
						transaction: t
					}
				);
			}
		});

		return NextResponse.json({ success: true, message: "Featured projects updated successfully" });
	} catch (error) {
		console.error("Error updating featured projects:", error);
		return NextResponse.json({ error: "Failed to update featured projects" }, { status: 500 });
	}
}
