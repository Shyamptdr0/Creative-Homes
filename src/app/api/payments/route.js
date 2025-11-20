import Payment from "@/models/Payment";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Contractor from "@/models/Contractor";

import { NextResponse } from "next/server";

export async function GET() {
	try {
		const payments = await Payment.findAll({
			include: [Project, Client, Contractor],
			order: [["createdAt", "DESC"]],
		});

		return NextResponse.json({ success: true, payments });
	} catch (e) {
		return NextResponse.json({ success: false, error: e.message });
	}
}
