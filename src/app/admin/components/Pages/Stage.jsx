"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function StagePage() {
	const [projects, setProjects] = useState([]);
	const [stages, setStages] = useState([]);

	const [openCreate, setOpenCreate] = useState(false);
	const [editStage, setEditStage] = useState(null);
	const [loading, setLoading] = useState(false);

	const [form, setForm] = useState({
		projectId: "",
		name: "",
		description: "",
		startDate: "",
		endDate: "",
	});

	const fetchProjects = async () => {
		const res = await fetch("/api/projects");
		const data = await res.json();
		if (data.success) setProjects(data.projects);
	};

	const fetchStages = async () => {
		const res = await fetch(`/api/stages/all`);
		const data = await res.json();
		if (data.success) setStages(data.stages);
	};

	useEffect(() => {
		fetchProjects();
		fetchStages();
	}, []);

	// ✅ Create Stage
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const res = await fetch("/api/stages/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});

		const data = await res.json();
		if (data.success) {
			setForm({ projectId: "", name: "", description: "", startDate: "", endDate: "" });
			setOpenCreate(false);
			fetchStages();
		}
		setLoading(false);
	};

	// ✅ Delete Stage
	const handleDelete = async (id) => {
		if (!confirm("Are you sure?")) return;
		await fetch(`/api/stages/${id}`, { method: "DELETE" });
		setStages(stages.filter((s) => s.id !== id));
	};

	// ✅ Edit stage
	const handleEditSubmit = async (e) => {
		e.preventDefault();
		await fetch(`/api/stages/${editStage.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(editStage),
		});

		setEditStage(null);
		fetchStages();
	};

	// ✅ Only projects that have stages
	const projectsWithStages = projects.filter((p) =>
		stages.some((s) => s.projectId === p.id)
	);

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold"> Admin — Manage Stages</h1>

				<Dialog open={openCreate} onOpenChange={setOpenCreate}>
					<DialogTrigger asChild>
						<Button>Add Stage</Button>
					</DialogTrigger>

					<DialogContent className="space-y-4">
						<DialogHeader>
							<DialogTitle>Create Stage</DialogTitle>
						</DialogHeader>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label>Select Project</Label>
								<Select
									value={form.projectId}
									onValueChange={(v) => setForm({ ...form, projectId: v })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choose Project" />
									</SelectTrigger>
									<SelectContent>
										{projects.map((p) => (
											<SelectItem key={p.id} value={p.id.toString()}>
												{p.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Stage Name</Label>
								<Input
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
								/>
							</div>

							<div className="space-y-2">
								<Label>Description</Label>
								<Textarea
									value={form.description}
									onChange={(e) => setForm({ ...form, description: e.target.value })}
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label>Start Date</Label>
									<Input
										type="date"
										value={form.startDate}
										onChange={(e) => setForm({ ...form, startDate: e.target.value })}
									/>
								</div>

								<div>
									<Label>End Date</Label>
									<Input
										type="date"
										value={form.endDate}
										onChange={(e) => setForm({ ...form, endDate: e.target.value })}
									/>
								</div>
							</div>

							<DialogFooter>
								<Button disabled={loading} type="submit">
									{loading ? "Creating..." : "Create Stage"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* ✅ TABLE */}
			<div className="border rounded-lg bg-white shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Project</TableHead>
							<TableHead>Stage</TableHead>
							<TableHead>Progress</TableHead>
							<TableHead>Dates</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{projectsWithStages.map((project) => {
							const projectStages = stages.filter((s) => s.projectId === project.id);

							return (
								<React.Fragment key={project.id}>
									<TableRow className="bg-muted font-semibold">
										<TableCell colSpan={5}>{project.title}</TableCell>
									</TableRow>

									{projectStages.map((s) => (
										<TableRow key={s.id}>
											<TableCell></TableCell>
											<TableCell>{s.name}</TableCell>
											<TableCell>{s.progress || 0}%</TableCell>
											<TableCell>
												{s.startDate?.slice(0, 10)} → {s.endDate?.slice(0, 10)}
											</TableCell>
											<TableCell className="flex gap-2">
												<Button size="sm" onClick={() => setEditStage(s)}>Edit</Button>
												<Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>Delete</Button>
											</TableCell>
										</TableRow>
									))}
								</React.Fragment>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{/* ✅ Edit Modal */}
			{editStage && (
				<Dialog open={true} onOpenChange={() => setEditStage(null)}>
					<DialogContent>
						<DialogHeader><DialogTitle>Edit Stage</DialogTitle></DialogHeader>

						<form onSubmit={handleEditSubmit} className="space-y-3">
							<Input
								value={editStage.name}
								onChange={(e) => setEditStage({ ...editStage, name: e.target.value })}
							/>

							<Textarea
								value={editStage.description}
								onChange={(e) => setEditStage({ ...editStage, description: e.target.value })}
							/>

							<Input
								type="date"
								value={editStage.startDate?.slice(0, 10)}
								onChange={(e) => setEditStage({ ...editStage, startDate: e.target.value })}
							/>

							<Input
								type="date"
								value={editStage.endDate?.slice(0, 10)}
								onChange={(e) => setEditStage({ ...editStage, endDate: e.target.value })}
							/>

							<DialogFooter>
								<Button type="submit">Update</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
