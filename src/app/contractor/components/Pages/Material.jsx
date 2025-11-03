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

export default function MaterialsPage() {
	const [materials, setMaterials] = useState([]);
	const [projects, setProjects] = useState([]);
	const [editId, setEditId] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);

	const [form, setForm] = useState({
		name: "",
		quantity: "",
		unit: "pcs",
		cost: "",
		projectId: "",
		status: "pending",
	});

	const token =
		typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

	const fetchMaterials = async () => {
		const res = await fetch("/api/material", {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		if (data.success) setMaterials(data.data);
	};

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
		setForm({
			name: "",
			quantity: "",
			unit: "pcs",
			cost: "",
			projectId: "",
			status: "pending",
		});
		setEditId(null);
	};

	const saveMaterial = async () => {
		const url = editId ? `/api/material/${editId}` : "/api/material";
		const method = editId ? "PUT" : "POST";

		const res = await fetch(url, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
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

	const deleteMaterial = async (id) => {
		await fetch(`/api/material/${id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
		fetchMaterials();
	};

	const openEdit = (m) => {
		setEditId(m.id);
		setForm({
			name: m.name,
			quantity: m.quantity,
			unit: m.unit,
			cost: m.cost,
			status: m.status,
			projectId: m.projectId,
		});
		setOpenDialog(true);
	};

	return (
		<div className="p-6">
			<div className="flex justify-between mb-4">
				<h1 className="text-xl font-bold">Materials</h1>

				<Dialog open={openDialog} onOpenChange={(open) => {
					setOpenDialog(open);
					if (!open) clearForm();
				}}>
					<DialogTrigger asChild>
						<Button onClick={() => setOpenDialog(true)}>Add Material</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>{editId ? "Edit" : "Add"} Material</DialogTitle>
						</DialogHeader>

						<div className="grid gap-3">
							<Label>Name</Label>
							<Input
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								placeholder="Material name"
							/>

							<Label>Quantity</Label>
							<Input
								type="number"
								min="0"
								value={form.quantity}
								onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
								placeholder="Quantity"
							/>

							<Label>Unit</Label>
							<Input
								value={form.unit}
								onChange={(e) => setForm({ ...form, unit: e.target.value })}
								placeholder="Unit (pcs, kg, bag...)"
							/>

							<Label>Cost</Label>
							<Input
								type="number"
								min="0"
								value={form.cost}
								onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
								placeholder="Cost"
							/>

							<Label>Project</Label>
							<select
								className="border p-2 rounded"
								value={form.projectId}
								onChange={(e) => setForm({ ...form, projectId: e.target.value })}
							>
								<option value="">Select Project</option>
								{projects.map((p) => (
									<option key={p.id} value={p.id}>
										{p.title}
									</option>
								))}
							</select>

							<Label>Status</Label>
							<select
								className="border p-2 rounded"
								value={form.status}
								onChange={(e) => setForm({ ...form, status: e.target.value })}
							>
								<option value="pending">Pending</option>
								<option value="delivered">Delivered</option>
								<option value="used">Used</option>
							</select>

							<Button onClick={saveMaterial}>
								{editId ? "Update" : "Save"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Qty</TableHead>
						<TableHead>Unit</TableHead>
					<TableHead>Cost</TableHead>
					<TableHead>Project</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{materials.map((m) => (
					<TableRow key={m.id}>
						<TableCell>{m.name}</TableCell>
						<TableCell>{m.quantity}</TableCell>
						<TableCell>{m.unit}</TableCell>
						<TableCell>₹ {m.cost}</TableCell>
						<TableCell>{m.project?.title}</TableCell>
						<TableCell className="capitalize">{m.status}</TableCell>
						<TableCell className="flex gap-2">
							<Button size="sm" onClick={() => openEdit(m)}>Edit</Button>
							<Button
								size="sm"
								variant="destructive"
								onClick={() => deleteMaterial(m.id)}
							>
								Delete
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
</div>
);
}
