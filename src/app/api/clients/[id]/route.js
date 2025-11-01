import Client from "@/models/Client";
import { NextResponse } from "next/server";

// ✅ Get single client
export async function GET(req, { params }) {
	const client = await Client.findByPk(params.id);
	if (!client) return NextResponse.json({ success: false });
	return NextResponse.json({ success: true, client });
}

// ✅ Update client
export async function PUT(req, { params }) {
	try {
		const client = await Client.findByPk(params.id);
		if (!client) return NextResponse.json({ success: false });

		const data = await req.json();
		await client.update(data);

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message });
	}
}

// ✅ Delete client
export async function DELETE(req, { params }) {
	const client = await Client.findByPk(params.id);
	if (!client) return NextResponse.json({ success: false });

	await client.destroy();
	return NextResponse.json({ success: true });
}
