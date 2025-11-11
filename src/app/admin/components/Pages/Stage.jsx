"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "@/components/ui/sheet";

import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";

import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil, Trash2, MessageCircle, PlusCircle } from "lucide-react";

export default function StagesPage() {
	const [stages, setStages] = useState([]);
	const [projects, setProjects] = useState([]);

	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [projectId, setProjectId] = useState("");

	const [editingId, setEditingId] = useState(null);

	const [remarkSheetStage, setRemarkSheetStage] = useState(null);
	const [newRemark, setNewRemark] = useState("");

	const [fetchLoading, setFetchLoading] = useState(true);
	const [remarkLoading, setRemarkLoading] = useState(false);

	const fetchData = async () => {
		setFetchLoading(true);

		const st = await fetch("/api/stages").then((r) => r.json());
		setStages(st.stages || []);

		const pr = await fetch("/api/projects").then((r) => r.json());
		setProjects(pr.projects || []);

		setFetchLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	const resetForm = () => {
		setEditingId(null);
		setName("");
		setDescription("");
		setProjectId("");
	};

	const addStage = async () => {
		if (!name || !projectId) return alert("Enter name & select project");
		setLoading(true);

		await fetch("/api/stages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, description, projectId }),
		});

		setLoading(false);
		resetForm();
		setAddDialogOpen(false);
		fetchData();
	};

	const updateStage = async (id) => {
		setLoading(true);

		await fetch(`/api/stages/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, description, projectId }),
		});

		setLoading(false);
		resetForm();
		setAddDialogOpen(false);
		fetchData();
	};

	const deleteStage = async (id) => {
		if (!confirm("Delete stages?")) return;
		await fetch(`/api/stages/${id}`, { method: "DELETE" });
		fetchData();
	};

	// ✅ Add remark & update instantly
	const submitRemark = async () => {
		if (!newRemark.trim()) return alert("Enter remark");
		setRemarkLoading(true);

		await fetch(`/api/stages/${remarkSheetStage.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				remark: newRemark,
				by: "admin",
				isCompleted: remarkSheetStage.isCompleted,
			}),
		});

		// ✅Instant update inside sheet
		setRemarkSheetStage((prev) => ({
			...prev,
			remarks: [
				...prev.remarks,
				{
					id: Math.random(),
					by: "admin",
					message: newRemark,
					createdAt: new Date(),
				},
			],
		}));

		setNewRemark("");
		setRemarkLoading(false);
	};

	const statusBadge = (s) =>
		s.isCompleted ? (
			<Badge className="bg-green-600 text-white">✅ Completed</Badge>
		) : (
			<Badge className="bg-gray-600 text-white">Not Completed</Badge>
		);

	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	// ✅ Group stages
	const grouped = stages.reduce((acc, s) => {
		const key = s.project?.title || "Unknown Project";
		if (!acc[key]) acc[key] = [];
		acc[key].push(s);
		return acc;
	}, {});

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold tracking-tight">Project Stages (Admin)</h1>
				<Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
					<PlusCircle className="w-4 h-4" /> Add Stage
				</Button>
			</div>

			<Card className="border bg-white shadow-md rounded-xl">
				<CardHeader>
					<CardTitle className="font-semibold">All Stages (Grouped by Project)</CardTitle>
				</CardHeader>

				<CardContent className="overflow-auto max-h-[70vh] rounded-lg">
					<Table className="border border-gray-200 rounded-lg text-sm">
						<TableHeader className="bg-gray-100 sticky top-0 z-10 shadow-sm">
							<TableRow>
								<TableHead>#</TableHead>
								<TableHead>Stage Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-center">Remarks</TableHead>
								<TableHead className="text-center">Actions</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{/* ✅ Loader in table */}
							{fetchLoading && (
								<TableRow>
									<TableCell colSpan={6} className="py-6 text-center text-gray-500">
										<Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
										Loading stages...
									</TableCell>
								</TableRow>
							)}

							{/* ✅ Projects & stages */}
							{!fetchLoading &&
								Object.entries(grouped).map(([project, list]) => (
									<>
										<TableRow className="bg-blue-50">
											<TableCell colSpan={6} className="font-semibold text-blue-900">
												📌 {project}
											</TableCell>
										</TableRow>

										{list.map((s, i) => (
											<TableRow key={s.id} className="hover:bg-gray-50 transition-all">
												<TableCell>{i + 1}</TableCell>
												<TableCell className="font-medium">{s.name}</TableCell>
												<TableCell className="text-gray-600">{s.description || "-"}</TableCell>
												<TableCell>{statusBadge(s)}</TableCell>

												<TableCell className="text-center">
													<Button
														size="sm"
														variant="outline"
														onClick={() => setRemarkSheetStage(s)}
														className="gap-1"
													>
														<MessageCircle className="h-4 w-4" />
														({s.remarks?.length || 0})
													</Button>
												</TableCell>

												<TableCell className="flex gap-2 justify-center">
													<Button
														size="icon"
														variant="outline"
														onClick={() => {
															setEditingId(s.id);
															setName(s.name);
															setDescription(s.description);
															setProjectId(s.projectId.toString());
															setAddDialogOpen(true);
														}}
													>
														<Pencil className="h-4 w-4 text-blue-600" />
													</Button>

													<Button
														size="icon"
														variant="destructive"
														onClick={() => deleteStage(s.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</>
								))}

							{!fetchLoading && stages.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-4 text-gray-400">
										No stages found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* ✅ Add / Edit Stage Modal */}
			<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
				<DialogContent className="space-y-4">
					<DialogHeader>
						<DialogTitle>{editingId ? "Update Stage" : "Add New Stage"}</DialogTitle>
					</DialogHeader>

					<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Stage Name" />
					<Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />

					<Select onValueChange={setProjectId} value={projectId}>
						<SelectTrigger>
							<SelectValue placeholder="Select Project" />
						</SelectTrigger>
						<SelectContent>
							{projects.map((p) => (
								<SelectItem key={p.id} value={p.id.toString()}>
									{p.title} — {p.projectType?.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<DialogFooter>
						<Button onClick={editingId ? () => updateStage(editingId) : addStage} disabled={loading}>
							{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Update Stage" : "Add Stage"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ✅ Remark Sheet */}
			{remarkSheetStage && (
				<Sheet open={true} onOpenChange={() => setRemarkSheetStage(null)}>
					<SheetContent className="w-[420px] overflow-auto">
						<SheetHeader>
							<SheetTitle>Remarks — {remarkSheetStage.name}</SheetTitle>
						</SheetHeader>

						<div className="mt-4 space-y-3 p-2">
							{remarkSheetStage.remarks?.length > 0 ? (
								remarkSheetStage.remarks.map((r) => (
									<div
										key={r.id}
										className={`p-3 rounded-md border shadow-sm
											${r.by === "admin" ? "bg-red-50 border-red-400 text-red-700" : "bg-blue-50 border-blue-400 text-blue-700"}`}
									>
										<b>{r.by === "admin" ? "Admin" : "Contractor"}:</b>
										<p className="text-sm mt-1">{r.message}</p>
										<p className="text-xs opacity-70">{formatDate(r.createdAt)}</p>
									</div>
								))
							) : (
								<p className="text-sm text-gray-500">No remarks yet</p>
							)}

							<Separator />

							<Textarea
								placeholder="Write remark..."
								value={newRemark}
								onChange={(e) => setNewRemark(e.target.value)}
							/>

							<SheetFooter>
								<Button onClick={submitRemark} disabled={remarkLoading}>
									{remarkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Remark"}
								</Button>
							</SheetFooter>
						</div>
					</SheetContent>
				</Sheet>
			)}
		</div>
	);
}
