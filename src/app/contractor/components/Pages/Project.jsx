"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function ContractorProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	async function fetchProjects() {
		try {
			setLoading(true);
			const token = sessionStorage.getItem("token");
			if (!token) {
				console.log("No session token");
				setLoading(false);
				return;
			}

			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` },
				cache: "no-store",
			});

			const data = await res.json();
			console.log("Contractor Projects =>", data);

			if (!data.success) return;

			const ordered = (data.projects || [])
				.sort((a, b) => a.id - b.id)
				.map((p, i) => ({ ...p, serial: i + 1 }));

			setProjects(ordered);
		} catch (error) {
			console.error("Error fetching projects:", error);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchProjects();
	}, []);

	return (
		<div className="container mx-auto grid grid-cols-1 gap-8 py-8">
			<h2 className="text-2xl font-bold mb-4">Assigned Projects</h2>

			<div className="border rounded-lg shadow-md overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-100">
							<TableHead>#</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Client</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Start Date</TableHead>
							<TableHead>End Date</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan="6" className="text-center py-6">
									<div className="flex items-center justify-center gap-2 text-gray-600">
										<Loader2 className="animate-spin h-5 w-5" />
										<span>Loading projects...</span>
									</div>
								</TableCell>
							</TableRow>
						) : projects.length > 0 ? (
							projects.map((p) => (
								<TableRow key={p.id}>
									<TableCell>{p.serial}</TableCell>
									<TableCell className="font-medium">{p.title}</TableCell>
									<TableCell>{p.client?.clientId} — {p.client?.name}</TableCell>
									<TableCell className="capitalize">{p.status}</TableCell>
									<TableCell>{p.startDate ? new Date(p.startDate).toLocaleDateString() : "-"}</TableCell>
									<TableCell>{p.endDate ? new Date(p.endDate).toLocaleDateString() : "-"}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan="6" className="text-center py-6 text-gray-500 italic">
									No assigned projects found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
