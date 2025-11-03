"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ContractorProjectsPage() {
	const [projects, setProjects] = useState([]);

	async function fetchProjects() {
		const token = sessionStorage.getItem("token");
		if (!token) {
			console.log("No session token");
			return;
		}

		const res = await fetch("/api/contractors/projects", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: "no-store"
		});

		const data = await res.json();
		console.log("Contractor Projects =>", data);

		if (!data.success) {
			console.warn(data.message);
			return;
		}

		// ✅ Set state
		const ordered = (data.projects || [])
			.sort((a, b) => a.id - b.id)
			.map((p, i) => ({ ...p, serial: i + 1 }));

		setProjects(ordered);
	}

	useEffect(() => {
		fetchProjects();
	}, []);

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">Assigned Projects</h2>

			<div className="border rounded-lg overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>#</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Client</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Start</TableHead>
							<TableHead>End</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{projects.length > 0 ? (
							projects.map((p) => (
								<TableRow key={p.id}>
									<TableCell>{p.serial}</TableCell>
									<TableCell>{p.title}</TableCell>
									<TableCell>{p.client?.clientId} — {p.client?.name}</TableCell>
									<TableCell className="capitalize">{p.status}</TableCell>
									<TableCell>{p.startDate ? new Date(p.startDate).toLocaleDateString() : "-"}</TableCell>
									<TableCell>{p.endDate ? new Date(p.endDate).toLocaleDateString() : "-"}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan="6" className="text-center py-4">
									No assigned projects
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
