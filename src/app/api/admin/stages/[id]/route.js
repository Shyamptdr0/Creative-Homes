import { NextResponse } from "next/server";
import Stage from "@/models/Stage";

export async function GET(req, { params }) {
	try {
		const stage = await Stage.findByPk(params.id);
		if (!stage) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json(stage);
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch stage" }, { status: 500 });
	}
}

export async function PUT(req, { params }) {
	try {
		const body = await req.json();
		await Stage.update(body, { where: { id: params.id } });
		const updated = await Stage.findByPk(params.id);
		return NextResponse.json(updated);
	} catch (error) {
		return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
	}
}

export async function DELETE(req, { params }) {
	try {
		await Stage.destroy({ where: { id: params.id } });
		return NextResponse.json({ message: "Stage deleted" });
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete stage" }, { status: 500 });
	}
}
