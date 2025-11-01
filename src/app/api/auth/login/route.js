// import User from "@/models/User";
// import Client from "@/models/Client";
// import Contractor from "@/models/Contractor";
// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";
// import bcrypt from "bcrypt";
//
// export async function POST(request) {
// 	try {
// 		const { userId, password } = await request.json();
//
// 		if (!userId || !password) {
// 			return NextResponse.json({ success: false, message: "Missing fields" });
// 		}
//
// 		let account = null;
// 		let role = null;
//
// 		// ✅ 1. Check Admin Table (User)
// 		account = await User.findOne({ where: { email: userId } });
// 		if (account) {
// 			const valid = await bcrypt.compare(password, account.password);
// 			if (!valid) return NextResponse.json({ success: false, message: "Invalid password" });
//
// 			role = "admin";
// 		}
//
// 		// ✅ 2. Check Client Table
// 		if (!account) {
// 			account = await Client.findOne({ where: { clientId: userId } });
// 			if (account) {
// 				const valid = await bcrypt.compare(password, account.password);
// 				if (!valid) return NextResponse.json({ success: false, message: "Invalid password" });
//
// 				role = "client";
// 			}
// 		}
//
// 		// ✅ 3. Check Contractor Table
// 		if (!account) {
// 			account = await Contractor.findOne({ where: { contractorId: userId } });
// 			if (account) {
// 				const valid = await bcrypt.compare(password, account.password);
// 				if (!valid) return NextResponse.json({ success: false, message: "Invalid password" });
//
// 				role = "contractor";
// 			}
// 		}
//
// 		// ❌ No user found
// 		if (!account) {
// 			return NextResponse.json({ success: false, message: "User not found" });
// 		}
//
// 		const token = jwt.sign(
// 			{ id: account.id, userId, role },
// 			process.env.JWT_SECRET || "secret123",
// 			{ expiresIn: "7d" }
// 		);
//
// 		return NextResponse.json({
// 			success: true,
// 			token,
// 			user: {
// 				id: account.id,
// 				name: account.name,
// 				userId,
// 				role,
// 			},
// 		});
//
// 	} catch (err) {
// 		console.log(err);
// 		return NextResponse.json({ success: false, message: "Server error" });
// 	}
// }
