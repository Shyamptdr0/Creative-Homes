import Contractor from "@/models/Contractor";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const { contractorId, password } = await req.json();
		const user = await Contractor.findOne({ where: { contractorId } });

		if (!user) return NextResponse.json({ success: false, msg: "Contractor not found" });

		const match = await bcrypt.compare(password, user.password);
		if (!match) return NextResponse.json({ success: false, msg: "Invalid password" });

		const token = jwt.sign(
			{ id: user.id, contractorId: user.contractorId, role: "contractor" },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		return NextResponse.json({ success: true, token, user });
	} catch {
		return NextResponse.json({ success: false, msg: "Server error" });
	}
}
