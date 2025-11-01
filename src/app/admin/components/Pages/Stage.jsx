"use client";

import React, { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminStagesPage() {
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedStage, setSelectedStage] = useState(null);
	const [newStage, setNewStage] = useState({
		stageName: "",
		progress: 0,
		status: "pending",
		notes: "",
		projectId: "",
	});

	const [projects, setProjects] = useState([]); // To show project list in dropdown

	useEffect(() => {
		fetchStages();
		fetchProjects();
	}, []);

	const fetchStages = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/admin/stages");
			const data = await res.json();
			setStages(data);
		} catch (err) {
			console.error(err);
			toast.error("Error fetching stages");
		} finally {
			setLoading(false);
		}
	};

	const fetchProjects = async () => {
		try {
			const res = await fetch("/api/admin/projects");
			const data = await res.json();
			setProjects(data);
		} catch (err) {
			console.error(err);
		}
	};

	const handleCreate = async () => {
		if (!newStage.stageName || !newStage.projectId) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			const res = await fetch("/api/admin/stages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newStage),
			});

			if (res.ok) {
				toast.success("New stage created successfully");
				setNewStage({
					stageName: "",
					progress: 0,
					status: "pending",
					notes: "",
					projectId: "",
				});
				fetchStages();
			} else {
				toast.error("Failed to create stage");
			}
		} catch (err) {
			console.error(err);
			toast.error("Error creating stage");
		}
	};

	const handleUpdate = async () => {
		try {
			const res = await fetch(`/api/admin/stages/${selectedStage.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(selectedStage),
			});

			if (res.ok) {
				toast.success("Stage updated successfully");
				setSelectedStage(null);
				fetchStages();
			} else {
				toast.error("Failed to update stage");
			}
		} catch (err) {
			console.error(err);
			toast.error("Error updating stage");
		}
	};

	const handleDelete = async (id) => {
		if (!confirm("Are you sure you want to delete this stage?")) return;
		try {
			const res = await fetch(`/api/admin/stages/${id}`, { method: "DELETE" });
			if (res.ok) {
				toast.success("Stage deleted successfully");
				fetchStages();
			} else {
				toast.error("Failed to delete stage");
			}
		} catch (err) {
			console.error(err);
			toast.error("Error deleting stage");
		}
	};

	if (loading)
		return (
			<div className="flex justify-center items-center h-64">
				<p>Loading stages...</p>
			</div>
		);

	return (
		<div className="p-6 space-y-6">
			{/* ================= CREATE STAGE SECTION ================= */}
			<Card className="border rounded-xl shadow-sm">
				<CardHeader>
					<CardTitle className="text-xl font-semibold flex justify-between items-center">
						Add New Stage
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label>Stage Name</Label>
							<Input
								value={newStage.stageName}
								onChange={(e) =>
									setNewStage({ ...newStage, stageName: e.target.value })
								}
								placeholder="e.g., Excavation, Slab Casting"
							/>
						</div>

						<div>
							<Label>Project</Label>
							<Select
								value={newStage.projectId}
								onValueChange={(val) =>
									setNewStage({ ...newStage, projectId: val })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Project" />
								</SelectTrigger>
								<SelectContent>
									{projects.map((project) => (
										<SelectItem key={project.id} value={String(project.id)}>
											{project.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Progress (%)</Label>
							<Input
								type="number"
								value={newStage.progress}
								onChange={(e) =>
									setNewStage({ ...newStage, progress: e.target.value })
								}
							/>
						</div>

						<div>
							<Label>Status</Label>
							<Select
								value={newStage.status}
								onValueChange={(value) =>
									setNewStage({ ...newStage, status: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="done">Done</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="md:col-span-2">
							<Label>Notes</Label>
							<Textarea
								value={newStage.notes}
								onChange={(e) =>
									setNewStage({ ...newStage, notes: e.target.value })
								}
								placeholder="Additional details or remarks..."
							/>
						</div>
					</div>

					<div className="flex justify-end mt-4">
						<Button onClick={handleCreate}>Add Stage</Button>
					</div>
				</CardContent>
			</Card>

			{/* ================= EXISTING STAGES ================= */}
			<Card className="shadow-md border rounded-xl">
				<CardHeader>
					<CardTitle className="text-2xl font-semibold">Manage Project Stages</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Project</TableHead>
									<TableHead>Stage Name</TableHead>
									<TableHead>Progress</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Notes</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{stages.map((stage) => (
									<TableRow key={stage.id}>
										<TableCell>{stage.id}</TableCell>
										<TableCell>{stage.Project?.name || "—"}</TableCell>
										<TableCell>{stage.stageName}</TableCell>
										<TableCell>{stage.progress}%</TableCell>
										<TableCell>{stage.status}</TableCell>
										<TableCell className="max-w-[300px] truncate">
											{stage.notes || "—"}
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Dialog>
													<DialogTrigger asChild>
														<Button
															size="sm"
															variant="outline"
															onClick={() => setSelectedStage(stage)}
														>
															Edit
														</Button>
													</DialogTrigger>

													{selectedStage?.id === stage.id && (
														<DialogContent className="max-w-lg">
															<DialogHeader>
																<DialogTitle>Edit Stage</DialogTitle>
															</DialogHeader>
															<div className="space-y-3">
																<div>
																	<Label>Stage Name</Label>
																	<Input
																		value={selectedStage.stageName}
																		onChange={(e) =>
																			setSelectedStage({
																				...selectedStage,
																				stageName: e.target.value,
																			})
																		}
																	/>
																</div>

																<div>
																	<Label>Progress (%)</Label>
																	<Input
																		type="number"
																		value={selectedStage.progress}
																		onChange={(e) =>
																			setSelectedStage({
																				...selectedStage,
																				progress: e.target.value,
																			})
																		}
																	/>
																</div>

																<div>
																	<Label>Status</Label>
																	<Select
																		value={selectedStage.status}
																		onValueChange={(value) =>
																			setSelectedStage({
																				...selectedStage,
																				status: value,
																			})
																		}
																	>
																		<SelectTrigger>
																			<SelectValue placeholder="Select status" />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="pending">Pending</SelectItem>
																			<SelectItem value="in_progress">In Progress</SelectItem>
																			<SelectItem value="done">Done</SelectItem>
																		</SelectContent>
																	</Select>
																</div>

																<div>
																	<Label>Notes</Label>
																	<Textarea
																		value={selectedStage.notes || ""}
																		onChange={(e) =>
																			setSelectedStage({
																				...selectedStage,
																				notes: e.target.value,
																			})
																		}
																	/>
																</div>

																<div className="flex justify-end gap-2 mt-4">
																	<Button
																		variant="secondary"
																		onClick={() => setSelectedStage(null)}
																	>
																		Cancel
																	</Button>
																	<Button onClick={handleUpdate}>Save Changes</Button>
																</div>
															</div>
														</DialogContent>
													)}
												</Dialog>

												<Button
													size="sm"
													variant="destructive"
													onClick={() => handleDelete(stage.id)}
												>
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
