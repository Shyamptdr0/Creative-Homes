import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import "@/lib/sync";

export async function PUT(req, { params }) {
	try {
		const { id } = params;
		const data = await req.json();

		const stage = await Stage.findByPk(id);
		if (!stage) return NextResponse.json({ success: false, msg: "Stage not found" });

		await stage.update({
			progress: data.progress,
			images: data.images, // array of urls
			endDate: data.endDate
		});

		return NextResponse.json({ success: true, msg: "Stage updated", stage });
	} catch (e) {
		console.log(e);
		return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
	}
}
