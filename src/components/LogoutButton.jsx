"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
	const router = useRouter();

	const handleLogout = () => {
		sessionStorage.clear();
		router.push("/Login");
	};

	return (
		<button
			onClick={handleLogout}
			className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
		>
			Logout
		</button>
	);
}
