// Updated design for Admin Materials Page
"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileImage, Trash2, X } from "lucide-react";

export default function AdminMaterialsPage() {
	const [materials, setMaterials] = useState([]);
	const [loading, setLoading] = useState(true);
	const [previewImage, setPreviewImage] = useState(null);

	const fetchData = async () => {
		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/admin/materials", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			const sorted = (data.data || []).sort(
				(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
			);
			setMaterials(sorted);
		} catch (err) {
			console.log("Fetch Error:", err);
		}
		setLoading(false);
	};


	useEffect(() => {
		fetchData();
	}, []);

	const materialsByProject = useMemo(() => {
		const grouped = {};
		for (const m of materials) {
			const projectName = m.project?.title || "Unknown Project";
			if (!grouped[projectName]) grouped[projectName] = [];
			grouped[projectName].push(m);
		}
		return grouped;
	}, [materials]);

	const statusColors = {
		pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
		approved: "bg-green-100 text-green-700 border-green-300",
		rejected: "bg-red-100 text-red-700 border-red-300",
		default: "bg-gray-100 text-gray-700 border-gray-300",
	};

	const formatDate = (d) =>
		new Date(d).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	if (loading)
		return (
			<div className="flex justify-center items-center h-[80vh]">
				<Loader2 className="animate-spin h-10 w-10 text-primary" />
			</div>
		);

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-10 text-gray-800">
				📦 Materials by Project
			</h1>

			{Object.keys(materialsByProject).map((projectName, i) => (
				<div key={i} className="mb-14">
					<h2 className="text-xl font-semibold mb-4 text-slate-700 bg-slate-100 p-3 rounded border-l-4 border-slate-500">
						🏗️ {projectName}
					</h2>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{materialsByProject[projectName].map((m) => (
							<Card
								key={m.id}
								className="shadow-md hover:shadow-lg transition rounded-xl border"
							>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg font-semibold flex justify-between items-center">
										{m.name}
										{/*<Button*/}
										{/*	variant="destructive"*/}
										{/*	size="icon"*/}
										{/*	className="h-8 w-8"*/}
										{/*	onClick={() => deleteMaterial(m.id)}*/}
										{/*>*/}
										{/*	<Trash2 className="h-4 w-4" />*/}
										{/*</Button>*/}
									</CardTitle>
								</CardHeader>

								<CardContent className="space-y-2 text-sm">
									<p>
										<span className="font-medium">Quantity:</span> {m.quantity}
									</p>
									<p>
										<span className="font-medium">Unit:</span> {m.unit}
									</p>

									<p className="text-xs text-gray-600">
										Contractor: <b>{m.contractor?.name}</b>
									</p>

									<span
										className={`text-xs font-medium px-2 py-1 rounded border w-fit inline-block ${
											statusColors[m.status] || statusColors.default
										}`}
									>
										{m.status.toUpperCase()}
									</span>

									<p className="font-bold text-emerald-700 text-sm">
										₹ {m.cost}
									</p>

									<p className="text-xs text-gray-400">
										📅 {formatDate(m.createdAt)}
									</p>

									{m.billImage ? (
										<img
											src={m.billImage}
											className="mt-2 w-full h-40 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition"
											alt="Bill"
											onClick={() => setPreviewImage(m.billImage)}
										/>
									) : (
										<div className="mt-2 w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg border text-gray-400 text-xs">
											<FileImage className="w-5 h-5 mr-1" /> No Bill
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			))}

			{/* ✅ Image Preview Modal */}
			{previewImage && (
				<div
					className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
					onClick={() => setPreviewImage(null)}
				>
					<div
						className="relative max-w-4xl w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setPreviewImage(null)}
							className="absolute -top-10 right-0 bg-white text-black p-2 rounded-full shadow hover:bg-gray-100"
						>
							<X className="w-6 h-6" />
						</button>

						<img
							src={previewImage}
							className="w-full max-h-[85vh] object-contain rounded-lg shadow-lg"
							alt="Full Bill"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
