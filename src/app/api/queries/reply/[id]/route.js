import Query from "@/models/Query";
import { NextResponse } from "next/server";

export async function PUT(req, context) {
	try {
		const { id } = await context.params;
		const { reply } = await req.json();

		const query = await Query.findByPk(id);
		if (!query) {
			return NextResponse.json({ error: "Query not found" }, { status: 404 });
		}

		await query.update({ reply, status: "resolved" });

		return NextResponse.json(query);
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
