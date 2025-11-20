"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import ProjectForm from "@/components/ProjectForm";
import ProjectTypesPage from "@/components/ProjectType"; // ✅ use component

export default function ProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(null);
	const [editOpen, setEditOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);

	// ✅ Fetch Projects
	async function fetchProjects() {
		try {
			setLoading(true);
			const res = await fetch("/api/projects");
			const data = await res.json();

			const ordered = (data.projects || [])
				.sort((a, b) => a.id - b.id)
				.map((p, i) => ({ ...p, serial: i + 1 }));

			setProjects(ordered);
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchProjects();
	}, []);

	// ✅ Create Project
	async function handleCreate(data) {
		await fetch("/api/projects", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		setCreateOpen(false);
		fetchProjects();
	}

	// ✅ Update Project
	async function handleUpdate(data) {
		if (!editing) return;

		await fetch(`/api/projects/${editing.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify(data),
		});

		setEditOpen(false);
		setEditing(null);
		fetchProjects();
	}

	// ✅ Delete Project
	async function handleDelete(id) {
		if (!confirm("Delete this project?")) return;

		await fetch(`/api/projects/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		});

		fetchProjects();
	}

	return (
		<div className="container mx-auto grid grid-cols-1 gap-8 py-8">

			{/* ✅ Display project types on top */}
			<ProjectTypesPage />

			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-semibold">Project Management</h1>

				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button>Create Project</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>New Project</DialogTitle>
						</DialogHeader>

						<ProjectForm
							key={createOpen ? "open" : "closed"}
							onSubmit={handleCreate}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{/* ✅ Project Table */}
			<div className="rounded-md border overflow-x-auto">
				<Table>
					<TableCaption>Projects List</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="text-center">#</TableHead>
							<TableHead>Project Id</TableHead>
							<TableHead>Project Title</TableHead>
							<TableHead>Client</TableHead>
							<TableHead>Contractor</TableHead>
							<TableHead>Project Type</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Start</TableHead>
							<TableHead>End</TableHead>
							<TableHead>Rate</TableHead>
							<TableHead className="text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={10} className="text-center py-8">
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="animate-spin w-6 h-6" />
										<span>Loading projects...</span>
									</div>
								</TableCell>
							</TableRow>
						) : projects.length === 0 ? (
							<TableRow>
								<TableCell colSpan={10} className="text-center py-6 text-gray-500">
									No projects found
								</TableCell>
							</TableRow>
						) : (
							projects.map((p) => (
								<TableRow key={p.id}>
									<TableCell className="text-center font-bold">{p.serial}</TableCell>
									<TableCell>{p.projectUid}</TableCell>
									<TableCell>{p.title}</TableCell>
									<TableCell>
										{p.client?.clientId} — {p.client?.name}
									</TableCell>
									<TableCell>
										{p.contractor?.contractorId} — {p.contractor?.name}
									</TableCell>

									{/* ✅ Project Type Shown */}
									<TableCell>{p.projectType?.name || "-"}</TableCell>

									<TableCell className="capitalize">{p.status}</TableCell>
									<TableCell>
										{p.startDate ? new Date(p.startDate).toLocaleDateString() : "-"}
									</TableCell>
									<TableCell>
										{p.endDate ? new Date(p.endDate).toLocaleDateString() : "-"}
									</TableCell>
									<TableCell>₹{p.totalCost}</TableCell>

									<TableCell className="flex gap-2 justify-center">
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												setEditing(p);
												setEditOpen(true);
											}}
										>
											Edit
										</Button>

										<Button
											size="sm"
											variant="destructive"
											disabled={p.adminLocked === true}
											onClick={() => handleDelete(p.id)}
										>
											Delete
										</Button>

									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Edit Dialog */}
			<Dialog
				open={editOpen}
				onOpenChange={(open) => {
					setEditOpen(open);
					if (!open) setEditing(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Project</DialogTitle>
					</DialogHeader>

					{editing && (
						<ProjectForm initialData={editing} onSubmit={handleUpdate} />
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
