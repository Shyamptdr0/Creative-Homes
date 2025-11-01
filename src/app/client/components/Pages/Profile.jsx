"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Mail, Badge } from "lucide-react";

export default function ClientProfile() {
	const [client, setClient] = useState(null);

	useEffect(() => {
		const fetchProfile = async () => {
			const token = sessionStorage.getItem("token");
			if (!token) return;

			const res = await fetch("/api/profile", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();
			if (data.success && data.role === "client") {
				setClient(data.user);
			}
		};

		fetchProfile();
	}, []);

	if (!client)
		return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;

	return (
		<div className="p-6 flex justify-center h-auto bg-gray-100">
			<Card className="max-w-lg w-full shadow-lg border border-gray-200 rounded-2xl">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
						<User className="h-6 w-6" /> Client Profile
					</CardTitle>
					<p className="text-sm text-gray-500">Dashboard / Profile</p>
				</CardHeader>

				<CardContent className="space-y-4 text-gray-700">
					<p className="flex items-center gap-2">
						<Badge className="h-5 w-5" /> <strong>ID:</strong> {client.clientId}
					</p>
					<p className="flex items-center gap-2">
						<User className="h-5 w-5" /> <strong>Name:</strong> {client.name}
					</p>
					<p className="flex items-center gap-2">
						<Mail className="h-5 w-5" /> <strong>Email:</strong> {client.email || "N/A"}
					</p>
					<p className="flex items-center gap-2">
						<Phone className="h-5 w-5" /> <strong>Phone:</strong> {client.phone || "N/A"}
					</p>
					<p className="flex items-center gap-2">
						<MapPin className="h-5 w-5" /> <strong>Address:</strong> {client.address || "N/A"}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
