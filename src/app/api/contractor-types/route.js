import ContractorType from "@/models/ContractorType";
import { NextResponse } from "next/server";

// GET ALL
export async function GET() {
	const types = await ContractorType.findAll();
	return NextResponse.json({ success: true, types });
}

// CREATE TYPE
export async function POST(req) {
	try {
		const { name } = await req.json();
		const exists = await ContractorType.findOne({ where: { name } });

		if (exists)
			return NextResponse.json(
				{ success: false, msg: "Type already exists" },
				{ status: 400 }
			);

		const type = await ContractorType.create({ name });
		return NextResponse.json({ success: true, type });
	} catch (err) {
		return NextResponse.json({ success: false, msg: "Error" });
	}
}
