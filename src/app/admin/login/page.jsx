"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLogin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setLoading(true);

		const res = await fetch("/api/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		const data = await res.json();

		setLoading(false);

		if (res.ok && data.token) {
			sessionStorage.setItem("token", data.token);

			toast.success("Login Successful...");

			setTimeout(() => router.push("/admin/dashboard"), 1200);
		} else {
			toast.error(data.error || "Invalid credentials ❌");
		}
	};

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="p-6  border-t-6 border-black shadow-2xl rounded-md bg-white w-96">
				<h1 className="text-2xl font-bold mb-4">Admin Login</h1>

				<input
					className="border p-2 w-full mb-2"
					placeholder="Email"
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type="password"
					className="border p-2 w-full mb-2"
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button
					className="bg-black text-white p-2 w-full rounded disabled:opacity-50 cursor-pointer"
					onClick={handleLogin}
					disabled={loading}
				>
					{loading ? "Logging in..." : "Login"}
				</button>
			</div>
		</div>
	);
}
