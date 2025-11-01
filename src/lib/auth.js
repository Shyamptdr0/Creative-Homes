import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
		},
		SECRET,
		{ expiresIn: "7d" }
	);
}

export function verifyToken(token) {
	try {
		return jwt.verify(token, SECRET);
	} catch {
		throw new Error("Invalid token");
	}
}
