"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select";
import {
	Dialog, DialogContent, DialogHeader, DialogTitle,
	DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import {
	Table, TableBody, TableCell, TableHead,
	TableHeader, TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function StagePage() {
	const [projects, setProjects] = useState([]);
	const [stages, setStages] = useState([]);

	const [openCreate, setOpenCreate] = useState(false);
	const [editStage, setEditStage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [createLoading, setCreateLoading] = useState(false);
	const [editLoading, setEditLoading] = useState(false);

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
		setLoading(true);
		const res = await fetch(`/api/stages/all`);
		const data = await res.json();
		if (data.success) {
			// 🔥 Sort stages by start date (ascending)
			const sorted = data.stages.sort(
				(a, b) => new Date(a.startDate) - new Date(b.startDate)
			);
			setStages(sorted);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchProjects();
		fetchStages();
	}, []);

	// ✅ Create Stage
	const handleSubmit = async (e) => {
		e.preventDefault();
		setCreateLoading(true);

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
		setCreateLoading(false);
	};

	// ✅ Delete Stage
	const handleDelete = async (id) => {
		if (!confirm("Are you sure?")) return;
		await fetch(`/api/stages/${id}`, { method: "DELETE" });
		setStages(stages.filter((s) => s.id !== id));
	};

	// ✅ Edit Stage
	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setEditLoading(true);

		await fetch(`/api/stages/${editStage.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(editStage),
		});

		setEditLoading(false);
		setEditStage(null);
		fetchStages();
	};

	const progressColor = (value) => {
		if (value <= 30) return "bg-red-500";
		if (value <= 70) return "bg-yellow-500";
		return "bg-green-600";
	};

	const projectsWithStages = projects.filter((p) =>
		stages.some((s) => s.projectId === p.id)
	);

	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const date = new Date(dateStr);

		const day = date.getDate();
		const month = date.toLocaleString("en-US", { month: "short" }); // Nov
		const year = date.getFullYear();

		return `${day} - ${month} - ${year}`;
	};

	return (
		<div className="container mx-auto grid grid-cols-1 gap-8 py-8">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Admin — Manage Stages</h1>

				<Dialog open={openCreate} onOpenChange={setOpenCreate}>
					<DialogTrigger asChild>
						<Button>Add Stage</Button>
					</DialogTrigger>

					<DialogContent className="space-y-4">
						<DialogHeader>
							<DialogTitle>Create Stage</DialogTitle>
						</DialogHeader>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
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

							<div>
								<Label>Stage Name</Label>
								<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
							</div>

							<div>
								<Label>Description</Label>
								<Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label>Start Date</Label>
									<Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
								</div>
								<div>
									<Label>End Date</Label>
									<Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
								</div>
							</div>

							<DialogFooter>
								<Button disabled={createLoading} type="submit">
									{createLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Stage
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* ✅ Table */}
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
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} className="py-6 text-center">
									<Loader2 className="animate-spin inline-block mr-2" /> Loading stages...
								</TableCell>
							</TableRow>
						) : projectsWithStages.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="py-6 text-center text-gray-500">
									No stage data found
								</TableCell>
							</TableRow>
						) : (
							projectsWithStages.map((project) => {
								const projectStages = stages.filter((s) => s.projectId === project.id);
								return (
									<React.Fragment key={project.id}>
										<TableRow className="bg-gray-100 font-semibold">
											<TableCell colSpan={5}>{project.title}</TableCell>
										</TableRow>

										{projectStages.map((s) => (
											<TableRow key={s.id}>
												<TableCell></TableCell>
												<TableCell>{s.name}</TableCell>

												{/* ✅ Progress Bar */}
												<TableCell className="w-56">
													<div className="relative w-full">
														<div className="h-2 rounded bg-gray-200 relative">
															<div
																className={`h-2 rounded ${progressColor(s.progress)}`}
																style={{ width: `${s.progress}%` }}
															></div>
														</div>
														<span className="text-xs font-semibold absolute left-1 top-2">
															{s.progress}%
														</span>
													</div>
												</TableCell>

												<TableCell>
													{formatDate(s.startDate)}  → {formatDate(s.endDate)}
												</TableCell>


												<TableCell className="flex gap-2">
													<Button size="sm" onClick={() => setEditStage(s)}>Edit</Button>
													<Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>
														Delete
													</Button>
												</TableCell>
											</TableRow>
										))}
									</React.Fragment>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* ✅ Edit Modal */}
			{editStage && (
				<Dialog open={true} onOpenChange={() => setEditStage(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Stage</DialogTitle>
						</DialogHeader>

						<form onSubmit={handleEditSubmit} className="space-y-3">
							<Input value={editStage.name} onChange={(e) => setEditStage({ ...editStage, name: e.target.value })} />
							<Textarea value={editStage.description} onChange={(e) => setEditStage({ ...editStage, description: e.target.value })} />
							<Input type="date" value={editStage.startDate?.slice(0, 10)} onChange={(e) => setEditStage({ ...editStage, startDate: e.target.value })} />
							<Input type="date" value={editStage.endDate?.slice(0, 10)} onChange={(e) => setEditStage({ ...editStage, endDate: e.target.value })} />

							<DialogFooter>
								<Button type="submit" disabled={editLoading}>
									{editLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Update
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
