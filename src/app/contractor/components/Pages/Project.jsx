"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, BadgeAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ContractorProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [projectTypes, setProjectTypes] = useState([]);
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

			// ✅ fetch project list
			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` },
				cache: "no-store",
			});
			const data = await res.json();
			console.log("Contractor Projects =>", data);

			// ✅ fetch project types
			const typeRes = await fetch("/api/project-types");
			const typeData = await typeRes.json();
			const types = typeData.types || [];

			if (!data.success) return;

			const ordered = (data.projects || [])
				.sort((a, b) => a.id - b.id)
				.map((p, i) => {
					const typeName = types.find((t) => t.id === p.projectTypeId)?.name || "N/A";
					return { ...p, serial: i + 1, typeName };
				});

			setProjectTypes(types);
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
							<TableHead>Project Type</TableHead> {/* ✅ New column */}
							<TableHead>Client</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Start Date</TableHead>
							<TableHead>End Date</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan="7" className="text-center py-6">
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


									<TableCell>
											{p.typeName}
									</TableCell>

									<TableCell>
										{p.client ? `${p.client.ClientId} — ${p.client.name}` : "N/A"}
									</TableCell>

									<TableCell className="capitalize">{p.status}</TableCell>
									<TableCell>
										{p.startDate ? new Date(p.startDate).toLocaleDateString() : "-"}
									</TableCell>
									<TableCell>
										{p.endDate ? new Date(p.endDate).toLocaleDateString() : "-"}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan="7" className="text-center py-6 text-gray-500 italic">
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
