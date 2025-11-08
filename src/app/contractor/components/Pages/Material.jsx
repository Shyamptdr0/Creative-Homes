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
import { Loader2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
	const [deleteId, setDeleteId] = useState(null);

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
		const fd = new FormData();
		Object.entries(form).forEach(([k, v]) => fd.append(k, v));
		if (billFile) fd.append("billImage", billFile);

		const url = editId ? `/api/material/${editId}` : "/api/material";
		const method = editId ? "PUT" : "POST";

		const res = await fetch(url, {
			method,
			headers: { Authorization: `Bearer ${token}` },
			body: fd,
		});

		const data = await res.json();
		setSaving(false);

		if (data.success) {
			clearForm();
			setOpenDialog(false);
			fetchMaterials();
		}
	};

	const confirmDelete = async () => {
		await fetch(`/api/material/${deleteId}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
		setDeleteId(null);
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

	// ✅ Group materials project-wise
	const grouped = materials.reduce((acc, item) => {
		const pid = item.project?.id || "No Project";
		if (!acc[pid]) acc[pid] = { project: item.project, items: [] };
		acc[pid].items.push(item);
		return acc;
	}, {});

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Materials</h1>

				<Dialog open={openDialog} onOpenChange={(o) => { setOpenDialog(o); if (!o) clearForm(); }}>
					<DialogTrigger asChild>
						<Button>Add Material</Button>
					</DialogTrigger>

					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>{editId ? "Edit Material" : "Add Material"}</DialogTitle>
						</DialogHeader>

						<div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
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
								<option>Select</option>
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

						<Button onClick={saveMaterial} disabled={saving} className="w-full mt-3">
							{saving ? <Loader2 className="animate-spin" /> : editId ? "Update" : "Save"}
						</Button>
					</DialogContent>
				</Dialog>
			</div>

			{loading ? (
				<div>Loading...</div>
			) : (
				Object.keys(grouped).map((pid) => {
					const { project, items } = grouped[pid];
					const total = items.reduce((sum, x) => sum + Number(x.cost || 0), 0);

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
										<TableHead>Cost</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Bill</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{items.map((m) => (
										<TableRow key={m.id}>
											<TableCell>{m.name}</TableCell>
											<TableCell>{m.quantity}</TableCell>
											<TableCell>{m.unit}</TableCell>
											<TableCell>₹{m.cost}</TableCell>
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

												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button size="sm" variant="destructive" onClick={() => setDeleteId(m.id)}>
															Delete
														</Button>
													</AlertDialogTrigger>

													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Delete Material?</AlertDialogTitle>
															<AlertDialogDescription>
																This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction onClick={confirmDelete}>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</TableCell>
										</TableRow>
									))}

									{/* ✅ Footer with total cost */}
									<TableRow className="bg-gray-100 font-semibold">
										<TableCell colSpan={3}>Total Cost for this Project</TableCell>
										<TableCell>₹{total}</TableCell>
										<TableCell colSpan={3}></TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					);
				})
			)}

			<Dialog open={imageDialog} onOpenChange={setImageDialog}>
				<DialogContent className="max-w-xl">
					{selectedImage && <img src={selectedImage} className="w-full rounded border" />}
				</DialogContent>
			</Dialog>
		</div>
	);
}
