"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";

export default function MaterialsPage() {
	const [materials, setMaterials] = useState([]);
	const [projects, setProjects] = useState([]);
	const [openDialog, setOpenDialog] = useState(false);
	const [loading, setLoading] = useState(true);

	const [previewImage, setPreviewImage] = useState(null);

	const [form, setForm] = useState({
		name: "",
		quantity: "",
		unit: "pcs",
		projectId: "",
	});

	const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

	// Fetch contractor materials
	const fetchMaterials = async () => {
		setLoading(true);
		const res = await fetch("/api/material", {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		if (data.success) setMaterials(data.data);
		setLoading(false);
	};

	// Fetch contractor assigned projects
	const fetchProjects = async () => {
		const res = await fetch("/api/contractors/projects", {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		if (data.success) setProjects(data.projects);
	};

	useEffect(() => {
		fetchMaterials();
		fetchProjects();
	}, []);

	const clearForm = () => {
		setForm({ name: "", quantity: "", unit: "pcs", projectId: "" });
	};

	// Contractor creates material requirement
	const saveRequirement = async () => {
		const res = await fetch("/api/material/request", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(form),
		});

		const data = await res.json();
		if (data.success) {
			clearForm();
			setOpenDialog(false);
			fetchMaterials();
		}
	};

	// Group materials by project
	const grouped = materials.reduce((acc, item) => {
		const pid = item.project?.id || "No Project";
		if (!acc[pid]) acc[pid] = { project: item.project, items: [] };
		acc[pid].items.push(item);
		return acc;
	}, {});

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Material Requirements</h1>

				<Dialog open={openDialog} onOpenChange={(o) => { setOpenDialog(o); if (!o) clearForm(); }}>
					<DialogTrigger asChild>
						<Button>Request Material</Button>
					</DialogTrigger>

					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>Add Requirement</DialogTitle>
						</DialogHeader>

						<div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
							<Label>Project</Label>
							<select
								className="border p-2 rounded w-full"
								value={form.projectId}
								onChange={(e) => setForm({ ...form, projectId: e.target.value })}
							>
								<option value="">Select</option>
								{projects.map((p) => (
									<option key={p.id} value={p.id}>{p.title}</option>
								))}
							</select>

							<Label>Material Name</Label>
							<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

							<Label>Quantity</Label>
							<Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />

							<Label>Unit</Label>
							<Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
						</div>

						<Button className="w-full mt-4" onClick={saveRequirement}>
							Submit Request
						</Button>
					</DialogContent>
				</Dialog>
			</div>

			{loading ? (
				<div>Loading...</div>
			) : (
				Object.keys(grouped).map((pid) => {
					const { project, items } = grouped[pid];

					return (
						<div key={pid} className="border rounded p-4">
							<h2 className="text-xl font-semibold mb-2">
								{project?.title || "No Project Assigned"}
							</h2>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Qty</TableHead>
										<TableHead>Unit</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Cost</TableHead>
										<TableHead>Bill</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{items.map((m) => (
										<TableRow key={m.id}>
											<TableCell>{m.name}</TableCell>
											<TableCell>{m.quantity}</TableCell>
											<TableCell>{m.unit}</TableCell>
											<TableCell className="capitalize">{m.status}</TableCell>

											{/* Cost */}
											<TableCell>
												{m.cost ? `₹${m.cost}` : "-"}
											</TableCell>

											{/* Bill Image */}
											<TableCell>
												{m.billImage ? (
													<Button
														size="sm"
														variant="secondary"
														onClick={() => setPreviewImage(m.billImage)}
													>
														View
													</Button>
												) : (
													"-"
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					);
				})
			)}

			{/* Bill Preview Modal */}
			<Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
				<DialogContent className="max-w-xl">
					{previewImage && (
						<img
							src={previewImage}
							alt="Bill"
							className="w-full rounded border"
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
