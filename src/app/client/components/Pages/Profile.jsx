"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Mail, Badge } from "lucide-react";

export default function ClientProfile() {
	const [client, setClient] = useState(null);

	useEffect(() => {
		const fetchClient = async () => {
			const token = sessionStorage.getItem("token");
			if (!token) return;

			const res = await fetch("/api/clients/profile", {
				headers: { Authorization: `Bearer ${token}` },
			});

			const data = await res.json();
			if (data.success && data.role === "client") {
				setClient(data.user);
			}
		};

		fetchClient();
	}, []);

	if (!client) return <p className="text-center mt-20">Loading Profile...</p>;

	return (
		<div className="p-6 flex justify-center bg-gray-100">
			<Card className="max-w-lg w-full shadow-lg">
				<CardHeader className="text-center">
					<CardTitle className="flex items-center justify-center gap-2 text-xl font-bold">
						<User /> Client Profile
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="flex gap-2"><Badge size={14}/> ID: {client.clientId}</p>
					<p className="flex gap-2"><User size={14}/> Name: {client.name}</p>
					<p className="flex gap-2"><Mail size={14}/> Email: {client.email}</p>
					<p className="flex gap-2"><Phone size={14}/> Phone: {client.phone}</p>
					<p className="flex gap-2"><MapPin size={14}/> Address: {client.address}</p>
				</CardContent>
			</Card>
		</div>
	);
}
