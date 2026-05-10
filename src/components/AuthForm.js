"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(true);
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		phone: "",
		role: "client",
	});
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		let endpoint = isLogin
				? "/api/auth/login"
				: `/api/auth/register/`;

		const res = await fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});
		const data = await res.json();

		if (!res.ok) return setError(data.error || "Something went wrong");

		// Save token
		sessionStorage.setItem("token", data.token);
		sessionStorage.setItem("user", JSON.stringify(data.user));

		// Redirect
		switch (data.user.role) {
			case "contractor":
				router.push("/contractor");
				break;
			default:
				router.push("/client");
		}
	};

	return (
		<div className="max-w-md mx-auto mt-20 bg-gray-900 p-6 rounded-2xl shadow-lg text-white">
			<h2 className="text-2xl font-bold mb-6 text-center">
				{isLogin ? "Login" : "Register"}
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				{!isLogin && (
					<>
						<input
							type="text"
							placeholder="Full Name"
							className="w-full p-2 rounded bg-gray-800"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
						<select
							className="w-full p-2 rounded bg-gray-800"
							value={form.role}
							onChange={(e) => setForm({ ...form, role: e.target.value })}
						>
							<option value="client">Client</option>
							<option value="contractor">Contractor</option>
						</select>
						<input
							type="text"
							placeholder="Phone"
							className="w-full p-2 rounded bg-gray-800"
							value={form.phone}
							onChange={(e) => setForm({ ...form, phone: e.target.value })}
						/>
					</>
				)}

				<input
					type="email"
					placeholder="Email"
					className="w-full p-2 rounded bg-gray-800"
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
				/>
				<input
					type="password"
					placeholder="Password"
					className="w-full p-2 rounded bg-gray-800"
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>

				{error && <p className="text-red-400 text-center">{error}</p>}

				<button className="w-full bg-primary text-white font-bold py-2 rounded hover:bg-primary/90 transition shadow-lg">
					{isLogin
							? "Login"
							: "Register"}
				</button>
			</form>

			<div className="mt-4 text-center text-sm space-y-1">

					<p>
						{isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
						<button
							className="text-primary hover:text-primary/80 underline font-medium"
							onClick={() => setIsLogin(!isLogin)}
						>
							{isLogin ? "Register" : "Login"}
						</button>
					</p>
				<p>
					<button
						className="text-blue-400 underline"
						onClick={() => {
							setIsLogin(true);
						}}
					>
					</button>
				</p>
			</div>
		</div>
	);
}
