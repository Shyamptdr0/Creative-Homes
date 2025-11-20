"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";

export default function ContractorQueriesPage() {
	const [projects, setProjects] = useState([]);
	const [queries, setQueries] = useState([]);
	const [projectId, setProjectId] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [openProject, setOpenProject] = useState(null);

	// 🆕 IMAGE STATE (only one image allowed)
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);

	const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

	let contractorId = null;
	if (token) {
		try {
			const decoded = JSON.parse(atob(token.split(".")[1]));
			contractorId = decoded.id;
		} catch (err) {
			console.error("TOKEN DECODE ERROR:", err);
		}
	}

	const fetchProjects = async () => {
		try {
			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();

			if (data.success && Array.isArray(data.projects)) {
				setProjects(data.projects);
			} else {
				setProjects([]);
			}
		} catch (error) {
			console.error("PROJECT FETCH ERROR:", error);
			setProjects([]);
		}
	};

	const fetchQueries = async () => {
		try {
			const res = await fetch("/api/contractors/queries", {
				headers: { Authorization: `Bearer ${token}` },
			});

			let data = await res.json();
			if (!data.success) return setQueries([]);

			const sorted = data.queries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setQueries(sorted);

		} catch (error) {
			console.error("QUERY FETCH ERROR:", error);
			setQueries([]);
		}
	};

	useEffect(() => {
		if (token && contractorId) {
			Promise.all([fetchProjects(), fetchQueries()]).then(() =>
				setLoading(false)
			);
		}
	}, [token]);

	/* -------------------------------------------
	   🆕 HANDLE IMAGE SELECT
	------------------------------------------- */
	function handleImageChange(e) {
		const file = e.target.files[0];
		if (!file) return;

		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
	}

	function removeImage() {
		setImageFile(null);
		setImagePreview(null);
	}

	/* -------------------------------------------
	   🆕 SUBMIT QUERY WITH IMAGE SUPPORT
	------------------------------------------- */
	const submitQuery = async () => {
		if (!projectId) return toast.error("Please select a project");
		if (!message) return toast.error("Message cannot be empty");

		setSaving(true);

		const formData = new FormData();
		formData.append("projectId", projectId);
		formData.append("contractorId", contractorId);
		formData.append("message", message);

		// 🆕 Send image only if selected
		if (imageFile) {
			formData.append("image", imageFile);
		}

		const res = await fetch("/api/queries", {
			method: "POST",
			body: formData
		});

		if (res.ok) {
			toast.success("Query submitted successfully!");
			setMessage("");
			setProjectId("");
			setImageFile(null);
			setImagePreview(null);
			fetchQueries();
		} else {
			toast.error("Failed to submit query");
		}

		setSaving(false);
	};

	// Group queries by project
	const groupedQueries = queries.reduce((acc, q) => {
		const projectName = q.Project?.title || "Unknown Project";
		if (!acc[projectName]) acc[projectName] = [];
		acc[projectName].push(q);
		return acc;
	}, {});

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">Raise a Query</h1>

			{loading ? (
				<div className="flex justify-center py-10">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			) : (
				<>
					{/* CREATE QUERY */}
					<Card className="mb-6 shadow-sm">
						<CardHeader>
							<CardTitle>Create New Query</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4">

							<select
								className="border rounded-lg px-3 py-2 w-full bg-white"
								value={projectId}
								onChange={(e) => setProjectId(e.target.value)}
							>
								<option value="">Select Project</option>
								{projects.map((p) => (
									<option key={p.id} value={p.id}>
										{p.title}
									</option>
								))}
							</select>

							<Textarea
								placeholder="Write your issue or query..."
								className="min-h-[120px]"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
							/>

							{/* 🆕 IMAGE UPLOAD INPUT */}
							<div className="space-y-2">
								<label className="font-semibold">Upload Image (optional)</label>

								<input
									type="file"
									accept="image/*"
									capture="environment"
									onChange={handleImageChange}
									className="border rounded-lg p-2 w-full bg-white"
								/>

								{/* IMAGE PREVIEW */}
								{imagePreview && (
									<div className="relative w-32 h-32 mt-2">
										<img
											src={imagePreview}
											alt="Preview"
											className="w-full h-full object-cover rounded-lg border"
										/>
										<Button
											size="icon"
											variant="destructive"
											className="absolute -top-2 -right-2 h-6 w-6"
											onClick={removeImage}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>

							<Button
								onClick={submitQuery}
								disabled={saving}
								className="w-full rounded-full"
							>
								{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Submit Query
							</Button>
						</CardContent>
					</Card>

					{/* GROUPED QUERIES */}
					<h2 className="text-xl font-semibold mb-3">Your Queries</h2>

					{Object.keys(groupedQueries).length === 0 ? (
						<p className="text-gray-500">No queries submitted yet.</p>
					) : (
						Object.keys(groupedQueries).map((project) => {
							const projectQueries = groupedQueries[project];
							const isOpen = openProject === project;

							return (
								<Card key={project} className="mb-4 shadow-sm">
									<CardHeader
										className="flex justify-between items-center cursor-pointer"
										onClick={() =>
											setOpenProject(isOpen ? null : project)
										}
									>
										<CardTitle className="flex items-center gap-2">
											🏗 {project}
											<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
												{projectQueries.length}
											</span>
										</CardTitle>

										{isOpen ? (
											<ChevronUp className="h-5 w-5" />
										) : (
											<ChevronDown className="h-5 w-5" />
										)}
									</CardHeader>

									{isOpen && (
										<CardContent className="space-y-3 pb-4">

											{projectQueries.map((q, index) => (
												<Card key={q.id} className="border shadow-sm p-3">

													<div className="flex justify-between">
														<p className="font-semibold">Query #{index + 1}</p>
														<span
															className={`text-xs px-2 py-1 rounded-full ${
																q.status === "open"
																	? "bg-yellow-100 text-yellow-700"
																	: "bg-green-100 text-green-700"
															}`}
														>
															{q.status.toUpperCase()}
														</span>
													</div>

													<p className="mt-1">
														<strong>Message:</strong> {q.message}
													</p>

													{/* 🆕 SHOW IMAGE IF EXISTS */}
													{q.imageUrl && (
														<img
															src={q.imageUrl}
															className="w-40 h-40 object-cover border rounded mt-2"
														/>
													)}

													{q.reply && (
														<p className="p-2 bg-green-50 border rounded mt-2 text-sm">
															<strong>Reply:</strong> {q.reply}
														</p>
													)}

													<p className="text-xs text-gray-400 mt-1">
														{new Date(q.createdAt).toLocaleString()}
													</p>

												</Card>
											))}

										</CardContent>
									)}
								</Card>
							);
						})
					)}
				</>
			)}
		</div>
	);
}
