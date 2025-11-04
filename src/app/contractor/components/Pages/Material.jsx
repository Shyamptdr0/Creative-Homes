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
import { Loader2 } from "lucide-react";

export default function MaterialsPage() {
	const [materials, setMaterials] = useState([]);
	const [projects, setProjects] = useState([]);
	const [editId, setEditId] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [imageDialog, setImageDialog] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [billFile, setBillFile] = useState(null);
	const [billPreview, setBillPreview] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState({
		name: "",
		quantity: "",
		unit: "pcs",
		cost: "",
		projectId: "",
		status: "pending",
	});

	const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

	const fetchMaterials = async () => {
		setLoading(true);
		const res = await fetch("/api/material", {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		if (data.success) setMaterials(data.data);
		setLoading(false);
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
		setForm({ name: "", quantity: "", unit: "pcs", cost: "", projectId: "", status: "pending" });
		setEditId(null);
		setBillFile(null);
		setBillPreview(null);
	};

	const saveMaterial = async () => {
		setSaving(true);
		const formData = new FormData();
		Object.keys(form).forEach((k) => formData.append(k, form[k]));
		if (billFile) formData.append("billImage", billFile);

		const url = editId ? `/api/material/${editId}` : "/api/material";
		const method = editId ? "PUT" : "POST";

		const res = await fetch(url, {
			method,
			headers: { Authorization: `Bearer ${token}` },
			body: formData,
		});

		const data = await res.json();
		setSaving(false);

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
		setBillPreview(m.billImage);
		setOpenDialog(true);
	};

	return (
		<div className="container mx-auto grid grid-cols-1 py-8 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Materials</h1>

				<Dialog open={openDialog} onOpenChange={(o) => { setOpenDialog(o); if (!o) clearForm(); }}>
					<DialogTrigger asChild>
						<Button>Add Material</Button>
					</DialogTrigger>

					<DialogContent className="max-h-[90vh] overflow-hidden">
						<DialogHeader>
							<DialogTitle>{editId ? "Edit Material" : "Add Material"}</DialogTitle>
						</DialogHeader>

						<div className="overflow-y-auto max-h-[70vh] pr-2 space-y-3">
							<div className="grid gap-3">
								<Label>Name</Label>
								<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

								<Label>Quantity</Label>
								<Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />

								<Label>Unit</Label>
								<Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />

								<Label>Cost</Label>
								<Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />

								<Label>Project</Label>
								<select className="border p-2 rounded" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
									<option>Select Project</option>
									{projects.map((p) => (
										<option key={p.id} value={p.id}>{p.title}</option>
									))}
								</select>

								<Label>Status</Label>
								<select className="border p-2 rounded" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
									<option value="pending">Pending</option>
									<option value="delivered">Delivered</option>
									<option value="used">Used</option>
								</select>

								<Label>Bill Image</Label>
								<input
									type="file"
									accept="image/*"
									onChange={(e) => {
										setBillFile(e.target.files[0]);
										setBillPreview(URL.createObjectURL(e.target.files[0]));
									}}
								/>

								{billPreview && <img src={billPreview} className="w-32 h-32 object-cover border rounded" />}
							</div>
						</div>

						<Button onClick={saveMaterial} disabled={saving} className="w-full mt-3">
							{saving ? <Loader2 className="animate-spin w-5 h-5" /> : editId ? "Update" : "Save"}
						</Button>
					</DialogContent>
				</Dialog>
			</div>

			{loading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="h-12 rounded bg-gray-200 animate-pulse"></div>
					))}
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Qty</TableHead>
							<TableHead>Unit</TableHead>
							<TableHead>Cost</TableHead>
							<TableHead>Project</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Bill</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{materials.map((m) => (
							<TableRow key={m.id}>
								<TableCell>{m.name}</TableCell>
								<TableCell>{m.quantity}</TableCell>
								<TableCell>{m.unit}</TableCell>
								<TableCell>₹{m.cost}</TableCell>
								<TableCell>{m.project?.title}</TableCell>
								<TableCell className="capitalize">{m.status}</TableCell>

								<TableCell>
									{m.billImage ? (
										<Button size="sm" variant="secondary"
										        onClick={() => { setSelectedImage(m.billImage); setImageDialog(true); }}>
											View
										</Button>
									) : "-"}
								</TableCell>

								<TableCell className="flex gap-2">
									<Button size="sm" onClick={() => openEdit(m)}>Edit</Button>
									<Button size="sm" variant="destructive" onClick={() => deleteMaterial(m.id)}>Delete</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			<Dialog open={imageDialog} onOpenChange={setImageDialog}>
				<DialogContent className="max-w-xl">
					{selectedImage && (
						<img src={selectedImage} className="w-full h-auto rounded border" alt="Bill" />
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
