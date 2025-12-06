"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Loader2, X } from "lucide-react";

export default function AdminMaterialsPage() {
	const [materials, setMaterials] = useState([]);
	const [loading, setLoading] = useState(true);
	const [previewImage, setPreviewImage] = useState(null);
	const [saving, setSaving] = useState(false);

	const [editItem, setEditItem] = useState(null);
	const [form, setForm] = useState({
		status: "",
		cost: "",
		billImage: null,
	});

	const token =
		typeof window !== "undefined"
			? sessionStorage.getItem("token")
			: null;

	const fetchData = async () => {
		setLoading(true);
		const res = await fetch("/api/admin/materials", {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		setMaterials(data.data || []);
		setLoading(false);
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Group by project name
	const materialsByProject = useMemo(() => {
		const grouped = {};
		for (const m of materials) {
			const pname = m.project?.title || "Unknown Project";
			if (!grouped[pname]) grouped[pname] = [];
			grouped[pname].push(m);
		}
		return grouped;
	}, [materials]);

	// Open item in edit modal
	const openEdit = (item) => {
		setEditItem(item);
		setForm({
			status: item.status,
			cost: item.cost || "",
			billImage: null,
		});
	};

	// Save changes
	const saveUpdate = async () => {
		if (!editItem) return;

		setSaving(true);
		const fd = new FormData();
		fd.append("status", form.status);
		fd.append("cost", form.cost);
		if (form.billImage) fd.append("billImage", form.billImage);

		await fetch(`/api/admin/materials/${editItem.id}`, {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` },
			body: fd,
		});

		setSaving(false);
		setEditItem(null);
		fetchData();
	};

	const statusOptions = [
		"requested",
		"approved",
		"rejected",
		"delivered",
		"used",
	];

	// Loading
	if (loading)
		return (
			<div className="flex justify-center items-center h-[70vh]">
				<Loader2 className="animate-spin h-10 w-10" />
			</div>
		);

	return (
		<div className="container mx-auto py-10 space-y-10">
			<h1 className="text-3xl font-bold mb-4">Materials Management</h1>

			{/* Grouped by Project */}
			{Object.keys(materialsByProject).map((projectName, idx) => {
				const items = materialsByProject[projectName];

				return (
					<div key={idx} className="space-y-4 border rounded-md p-4 shadow-sm">
						<div className="flex justify-between items-center bg-gray-100 p-3 rounded">
							<h2 className="text-xl font-semibold">
								🏗️ {projectName}
							</h2>

							<div className="text-sm font-bold text-green-700">
								Total Cost: ₹
								{items.reduce((s, m) => s + Number(m.cost || 0), 0)}
							</div>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Material</TableHead>
									<TableHead>Qty</TableHead>
									<TableHead>Unit</TableHead>
									<TableHead>Contractor</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Cost</TableHead>
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
										<TableCell>{m.contractor?.name}</TableCell>

										<TableCell className="capitalize">{m.status}</TableCell>

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

										<TableCell>
											<Button
												size="sm"
												onClick={() => openEdit(m)}
											>
												Update
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				);
			})}

			{/* Fullscreen Image Preview */}
			{previewImage && (
				<div
					className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					onClick={() => setPreviewImage(null)}
				>
					<div
						className="relative bg-white p-3 rounded-xl shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setPreviewImage(null)}
							className="absolute -top-3 -right-3 bg-white p-1 rounded-full shadow"
						>
							<X className="w-5 h-5" />
						</button>

						<img src={previewImage} className="max-h-[80vh]" />
					</div>
				</div>
			)}

			{/* EDIT MODAL */}
			{/* EDIT MODAL */}
			{editItem && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

					{/* MODAL BOX */}
					<div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-6 relative">

						<h2 className="text-xl font-bold text-center">Update Material</h2>

						{/* FORM CONTENT */}
						<div className="space-y-4">

							{/* Status */}
							<div className="space-y-1">
								<label className="font-medium">Status</label>
								<select
									className="border p-2 rounded w-full"
									value={form.status}
									onChange={(e) =>
										setForm({ ...form, status: e.target.value })
									}
								>
									{statusOptions.map((s) => (
										<option key={s} value={s}>
											{s.toUpperCase()}
										</option>
									))}
								</select>
							</div>

							{/* Cost */}
							<div className="space-y-1">
								<label className="font-medium">Cost</label>
								<input
									type="number"
									className="border p-2 rounded w-full"
									value={form.cost}
									onChange={(e) =>
										setForm({ ...form, cost: e.target.value })
									}
								/>
							</div>

							{/* Bill Image */}
							<div className="space-y-1">
								<label className="font-medium">Bill Image</label>
								<input
									type="file"
									accept="image/*"
									onChange={(e) =>
										setForm({ ...form, billImage: e.target.files[0] })
									}
									className="border p-2 rounded w-full"
								/>
							</div>
						</div>

						{/* BUTTONS (fix max width issue) */}
						<div className="flex flex-wrap gap-2">
							<Button
								className="w-full"
								onClick={saveUpdate}
								disabled={saving}
							>
								{saving ? "Updating..." : "Save"}
							</Button>

							<Button

								variant="secondary"
								className="w-full border-2 border-gray-300 shadow-md"
								onClick={() => setEditItem(null)}
							>
								Cancel
							</Button>
						</div>

					</div>
				</div>
			)}


		</div>
	);
}
