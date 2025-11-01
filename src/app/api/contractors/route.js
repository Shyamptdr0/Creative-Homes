import Contractor from "@/models/Contractor";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

function generateContractorCredentials() {
	const contractorId = "CT" + Math.floor(1000 + Math.random() * 9000);
	const password = Math.random().toString(36).slice(-8);
	return { contractorId, password };
}

// ✅ Get all contractors
export async function GET() {
	const contractors = await Contractor.findAll({
		attributes: { exclude: ["password"] }
	});
	return NextResponse.json({ success: true, contractors });
}

// ✅ Create contractor
export async function POST(req) {
	try {
		const data = await req.json();
		const { name, phone, address, email } = data;

		const { contractorId, password } = generateContractorCredentials();
		const hash = await bcrypt.hash(password, 10);

		const contractor = await Contractor.create({
			contractorId,
			name,
			email,
			phone,
			address,
			password: hash,
			visiblePassword: password
		});

		return NextResponse.json({ success: true, contractor });
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message });
	}
}
