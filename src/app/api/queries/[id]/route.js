import Query from "@/models/Query";
import { NextResponse } from "next/server";

export async function GET(req, context) {
	try {
		const { id } = await context.params;

		const query = await Query.findByPk(id);
		if (!query) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		return NextResponse.json(query);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

export async function PUT(req, context) {
	try {
		const { id } = await context.params;
		const body = await req.json();

		const query = await Query.findByPk(id);
		if (!query) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		await query.update(body);
		return NextResponse.json(query);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

export async function DELETE(req, context) {
	try {
		const { id } = await context.params;

		const query = await Query.findByPk(id);
		if (!query) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		await query.destroy();

		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
