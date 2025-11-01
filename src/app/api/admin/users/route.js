import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

function generateCredentials(role) {
	const prefix = role === "client" ? "CL" : "CT";
	const userId = prefix + Math.floor(1000 + Math.random() * 9000);
	const password = Math.random().toString(36).slice(-8);
	return { userId, password };
}

// ✅ Get Both Clients + Contractors
export async function GET() {
	const clients = await Client.findAll({
		attributes: ["id", "name", "email", "phone", "address", "clientId", "visiblePassword"],
	});

	const contractors = await Contractor.findAll({
		attributes: ["id", "name", "email", "phone", "address", "contractorId", "visiblePassword"],
	});

	const users = [
		...clients.map(c => ({ ...c.dataValues, role: "client", userId: c.clientId })),
		...contractors.map(c => ({ ...c.dataValues, role: "contractor", userId: c.contractorId })),
	];

	return NextResponse.json({ success: true, users });
}

// ✅ Create Client / Contractor
export async function POST(req) {
	try {
		const { name, email, phone, address, role } = await req.json();

		const { userId, password } = generateCredentials(role);
		const hashedPassword = await bcrypt.hash(password, 10);

		let user;

		if (role === "client") {
			user = await Client.create({
				name, email, phone, address,
				clientId: userId,
				password: hashedPassword,
				visiblePassword: password
			});
		} else {
			user = await Contractor.create({
				name, email, phone, address,
				contractorId: userId,
				password: hashedPassword,
				visiblePassword: password
			});
		}

		return NextResponse.json({
			success: true,
			user: { ...user.dataValues, userId, password },
		});
	} catch (err) {
		return NextResponse.json({ success: false, error: err.message }, { status: 500 });
	}
}
