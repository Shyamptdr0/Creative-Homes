import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Generate ID + password
function generateCredentials(role) {
	const prefix = role === "client" ? "CL" : "CT";
	const userId = prefix + Math.floor(1000 + Math.random() * 9000);
	const password = Math.random().toString(36).slice(-8);
	return { userId, password };
}

/* =============================
   GET ALL USERS
============================= */
export async function GET() {
	const clients = await Client.findAll();
	const contractors = await Contractor.findAll();

	const users = [
		...clients.map(c => ({
			...c.dataValues,
			role: "client",
			userId: c.clientId
		})),

		...contractors.map(c => ({
			...c.dataValues,
			role: "contractor",
			userId: c.contractorId
		}))
	];

	return NextResponse.json({ success: true, users });
}

/* =============================
   CREATE USER
============================= */
export async function POST(req) {
	try {
		const { name, email, phone, address, role } = await req.json();

		/* 🔥 VALIDATE PHONE NUMBER HERE */
		if (!/^\d{10}$/.test(phone)) {
			return NextResponse.json(
				{ success: false, msg: "Phone number must be exactly 10 digits" },
				{ status: 400 }
			);
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return NextResponse.json(
				{ success: false, msg: "Invalid email format" },
				{ status: 400 }
			);
		}


		const { userId, password } = generateCredentials(role);
		const hashedPassword = await bcrypt.hash(password, 10);

		let user;

		if (role === "client") {
			user = await Client.create({
				name,
				email,
				phone,
				address,
				clientId: userId,
				password: hashedPassword,
				visiblePassword: password,
			});
		} else {
			user = await Contractor.create({
				name,
				email,
				phone,
				address,
				contractorId: userId,
				password: hashedPassword,
				visiblePassword: password,
			});
		}

		return NextResponse.json({
			success: true,
			user: { ...user.dataValues, userId, password },
		});

	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
