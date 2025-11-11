import { NextResponse } from "next/server";
import Stage from "@/models/Stage";
import StageRemark from "@/models/StageRemark";
import "@/lib/db";

// ✅ Get Single Stage
export async function GET(req, ctx) {
	try {
		const { id } = await ctx.params;

		const stage = await Stage.findByPk(id, {
			include: [{ model: StageRemark, as: "remarks" }],
		});

		if (!stage)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		return NextResponse.json({ success: true, stage });

	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

// ✅ Update Stage + Add Remark
export async function PUT(req, ctx) {
	try {
		const { id } = await ctx.params;
		const body = await req.json();

		const stage = await Stage.findByPk(id);
		if (!stage)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		await stage.update({
			name: body.name ?? stage.name,
			description: body.description ?? stage.description,
			projectId: body.projectId ?? stage.projectId,
			isCompleted: body.isCompleted ?? stage.isCompleted,
			isApproved: body.isApproved ?? stage.isApproved,
		});

		if (body.remark) {
			await StageRemark.create({
				stageId: id,
				by: body.by,
				message: body.remark,
			});
		}

		return NextResponse.json({ success: true, stage });

	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}

// ✅ Delete Stage (fixed)
export async function DELETE(req, ctx) {
	try {
		const { id } = await ctx.params;

		const stage = await Stage.findByPk(id);
		if (!stage)
			return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

		// ✅ delete remarks first
		await StageRemark.destroy({ where: { stageId: id } });

		// ✅ delete stage
		await stage.destroy();

		return NextResponse.json({ success: true, message: "Deleted" });

	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
