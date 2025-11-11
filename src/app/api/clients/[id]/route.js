import Client from "@/models/Client";
import { NextResponse } from "next/server";
import "@/lib/db";

// ✅ Get single client
export async function GET(req, ctx) {
	try {
		const { id } = await ctx.params; // ✅ FIXED — await params

		const client = await Client.findByPk(id);
		if (!client)
			return NextResponse.json(
				{ success: false, message: "Client not found" },
				{ status: 404 }
			);

		return NextResponse.json({ success: true, client });
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

// ✅ Update client
export async function PUT(req, ctx) {
	try {
		const { id } = await ctx.params; // ✅ FIXED — await params

		const client = await Client.findByPk(id);
		if (!client)
			return NextResponse.json(
				{ success: false, message: "Client not found" },
				{ status: 404 }
			);

		const data = await req.json();
		await client.update(data);

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

// ✅ Delete client
export async function DELETE(req, ctx) {
	try {
		const { id } = await ctx.params; // ✅ FIXED — await params

		const client = await Client.findByPk(id);
		if (!client)
			return NextResponse.json(
				{ success: false, message: "Client not found" },
				{ status: 404 }
			);

		await client.destroy();
		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
