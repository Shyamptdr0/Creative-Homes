"use client";

import { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ClientProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [projectTypes, setProjectTypes] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchProjects = async () => {
		try {
			setLoading(true);
			const token = sessionStorage.getItem("token");

			if (!token) {
				console.log("No session token");
				setLoading(false);
				return;
			}

			// ✅ Fetch client’s own projects
			const res = await fetch("/api/clients/projects", {
				headers: { Authorization: `Bearer ${token}` },
				cache: "no-store",
			});

			const data = await res.json();
			console.log("Client Projects =>", data);

			// ✅ Fetch all project types
			const typeRes = await fetch("/api/project-types");
			const typeData = await typeRes.json();
			const types = typeData.types || [];

			if (!data.success) {
				setProjects([]);
				return;
			}

			// ✅ Attach typeName from projectTypes
			const ordered = (data.projects || [])
				.sort((a, b) => a.id - b.id)
				.map((p, idx) => {
					const typeName =
						types.find((t) => t.id === p.projectTypeId)?.name || "N/A";
					return {
						...p,
						serial: idx + 1,
						typeName,
					};
				});

			setProjectTypes(types);
			setProjects(ordered);
		} catch (error) {
			console.error("FETCH ERROR (Client Projects):", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	// ✅ STATUS Badge UI


	return (
		<div className="container mx-auto py-8 space-y-6">
			<h1 className="text-3xl font-bold">My Projects</h1>

			<Card className="shadow-md border p-4 overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead>#</TableHead>
							<TableHead>Project Name</TableHead>
							<TableHead>Project Type</TableHead>
							<TableHead>Contractor</TableHead>
							<TableHead>Status</TableHead> {/* ✅ NEW */}
							<TableHead>Start Date</TableHead>
							<TableHead>End Date</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan="7" className="text-center py-6">
									<div className="flex justify-center items-center gap-2 text-gray-600">
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

									<TableCell>{p.typeName}</TableCell>

									<TableCell>
										{p.contractor
											? `${p.contractor.contractorId} — ${p.contractor.name}`
											: "N/A"}
									</TableCell>

									{/* ✅ STATUS */}
									<TableCell className="capitalize">{p.status}</TableCell>

									<TableCell>
										{p.startDate
											? new Date(p.startDate).toLocaleDateString()
											: "-"}
									</TableCell>
									<TableCell>
										{p.endDate
											? new Date(p.endDate).toLocaleDateString()
											: "-"}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan="7" className="text-center py-6 text-gray-500">
									No projects found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}
