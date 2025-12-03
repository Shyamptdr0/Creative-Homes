import { NextResponse } from "next/server";
import "@/lib/db";

import PaymentInstallment from "@/models/PaymentInstallment";

export async function PUT(req) {
	try {
		const { id, paid, remark } = await req.json();

		const inst = await PaymentInstallment.findByPk(id);
		if (!inst)
			return NextResponse.json({ success: false, error: "Not found" });

		inst.paid = paid;
		if (remark) inst.remark = remark;

		await inst.save();

		return NextResponse.json({ success: true, installment: inst });
	} catch (e) {
		return NextResponse.json(
			{ success: false, error: e.message },
			{ status: 500 }
		);
	}
}
