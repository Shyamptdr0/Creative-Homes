import Query from "@/models/Query";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const count = await Query.count({ where: { reply: null } });
		return NextResponse.json({ newQueries: count });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
