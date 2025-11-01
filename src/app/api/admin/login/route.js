import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(req) {
	const { email, password } = await req.json();

	const user = await User.findOne({ where: { email } });

	if (!user || user.role !== "admin")
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const match = await bcrypt.compare(password, user.password);
	if (!match)
		return NextResponse.json({ error: "Wrong credentials" }, { status: 401 });

	const token = generateToken(user);

	return NextResponse.json({ message: "Login success", token });
}
