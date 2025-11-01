"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ContractorLogin() {
	const router = useRouter();
	const [contractorId, setContractorId] = useState("");
	const [password, setPassword] = useState("");

	const login = async () => {
		const res = await fetch("/api/auth/contractor-login/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ contractorId, password }),
		});
		const data = await res.json();

		if (!data.success) return toast.error(data.message);

		toast.success("Login success");
		sessionStorage.setItem("token", data.token);
		sessionStorage.setItem("user", JSON.stringify(data.user));

		router.push("/contractor/dashboard");
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
			<div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-md space-y-4">
				<h2 className="text-xl font-bold text-center">Contractor Login</h2>

				<Input placeholder="User ID" value={contractorId} onChange={(e) => setContractorId(e.target.value)} />
				<Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

				<Button className="w-full" onClick={login}>Login</Button>
			</div>
		</div>
	);
}
