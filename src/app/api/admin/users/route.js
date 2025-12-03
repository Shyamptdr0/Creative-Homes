import Client from "@/models/Client";
import Contractor from "@/models/Contractor";
import ContractorType from "@/models/ContractorType";
import ContractorTypeAssignment from "@/models/ContractorTypeAssignment";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

/* -----------------------------
   Generate USER ID + PASSWORD
------------------------------ */
function generateCredentials(role) {
	const prefix = role === "client" ? "CL" : "CT";
	const userId = prefix + Math.floor(1000 + Math.random() * 9000);
	const password = Math.random().toString(36).slice(-8).toUpperCase();
	return { userId, password };
}

/* =============================
   GET ALL USERS (CLIENT + CONTRACTOR)
============================= */
export async function GET() {
	try {
		const clients = await Client.findAll();

		const contractors = await Contractor.findAll({
			include: [
				{
					model: ContractorType,
					as: "types",
					through: { attributes: [] },
				},
			],
		});

		const users = [
			...clients.map((c) => ({
				...c.dataValues,
				userId: c.clientId,
				role: "client",
			})),

			...contractors.map((c) => ({
				...c.dataValues,
				userId: c.contractorId,
				role: "contractor",
				types: c.types?.map((t) => ({ id: t.id, name: t.name })) || [],
			})),
		];

		return NextResponse.json({ success: true, users });
	} catch (err) {
		console.log("GET USERS ERROR:", err);
		return NextResponse.json({ success: false }, { status: 500 });
	}
}

/* =============================
   CREATE USER (ADMIN → ADD)
============================= */
export async function POST(req) {
	try {
		const body = await req.json();
		const {
			name,
			email,
			phone,
			address,
			role,
			types = [], // array of type IDs
		} = body;

		// VALIDATIONS
		if (!/^\d{10}$/.test(phone)) {
			return NextResponse.json(
				{ success: false, msg: "Phone must be 10 digits" },
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

		/* CREATE CLIENT */
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
		}

		/* CREATE CONTRACTOR (MULTIPLE TYPES) */
		else {
			user = await Contractor.create({
				name,
				email,
				phone,
				address,
				contractorId: userId,
				password: hashedPassword,
				visiblePassword: password,
			});

			// Insert type assignments
			if (Array.isArray(types) && types.length > 0) {
				await ContractorTypeAssignment.bulkCreate(
					types.map((t) => ({
						contractorId: user.id,
						typeId: t,
					}))
				);
			}
		}

		return NextResponse.json({
			success: true,
			user: {
				...user.dataValues,
				userId,
				password,
			},
		});
	} catch (err) {
		console.log("CREATE USER ERROR:", err);
		return NextResponse.json(
			{ success: false, msg: "Error creating user" },
			{ status: 500 }
		);
	}
}

/* =============================
   UPDATE USER
============================= */
export async function PUT(req) {
	try {
		const body = await req.json();
		const { id, role, types = [], ...updatedFields } = body;

		let model = role === "client" ? Client : Contractor;

		const user = await model.findByPk(id);
		if (!user)
			return NextResponse.json({ success: false, msg: "User not found" });

		// Update basic fields
		await user.update(updatedFields);

		/* UPDATE MULTIPLE CONTRACTOR TYPES */
		if (role === "contractor") {
			// Delete old types
			await ContractorTypeAssignment.destroy({
				where: { contractorId: id },
			});

			// Insert new types
			if (Array.isArray(types) && types.length > 0) {
				await ContractorTypeAssignment.bulkCreate(
					types.map((t) => ({
						contractorId: id,
						typeId: t,
					}))
				);
			}
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		console.log("UPDATE USER ERROR:", err);
		return NextResponse.json(
			{ success: false, msg: "Update failed" },
			{ status: 500 }
		);
	}
}

/* =============================
   DELETE USER
============================= */
export async function DELETE(req) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		const role = searchParams.get("role");

		if (!id || !role)
			return NextResponse.json(
				{ success: false, msg: "Missing ID or role" },
				{ status: 400 }
			);

		let model = role === "client" ? Client : Contractor;

		// delete contractor types also
		if (role === "contractor") {
			await ContractorTypeAssignment.destroy({
				where: { contractorId: id },
			});
		}

		await model.destroy({ where: { id } });

		return NextResponse.json({ success: true });
	} catch (err) {
		console.log("DELETE USER ERROR:", err);
		return NextResponse.json(
			{ success: false, msg: "Delete failed" },
			{ status: 500 }
		);
	}
}
