"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
	Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Loader2, ImageIcon, X } from "lucide-react";

// ✅ Delete Confirmation Dialog imports
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminDrawingsPage() {
	const [projects, setProjects] = useState([]);
	const [drawings, setDrawings] = useState([]);
	const [title, setTitle] = useState("");
	const [projectId, setProjectId] = useState("");
	const [files, setFiles] = useState([]);
	const [previewUrls, setPreviewUrls] = useState([]);
	const [loading, setLoading] = useState(false);

	// Edit State
	const [editModal, setEditModal] = useState(false);
	const [editData, setEditData] = useState({ id: "", title: "", projectId: "", fileUrl: "" });
	const [editFile, setEditFile] = useState(null);

	// View modal
	const [viewModal, setViewModal] = useState(false);
	const [viewFile, setViewFile] = useState("");

	const loadData = async () => {
		const [projRes, drawRes] = await Promise.all([
			fetch("/api/projects"),
			fetch("/api/drawings"),
		]);

		const projJson = await projRes.json();
		const drawJson = await drawRes.json();

		setProjects(projJson.projects || []);
		setDrawings(Array.isArray(drawJson) ? drawJson : []);
	};

	useEffect(() => { loadData(); }, []);

	// ✅ Allow only images/videos
	const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "video/mp4", "video/mov"];

	const handleFileSelect = (e) => {
		const selectedFiles = Array.from(e.target.files);
		const validFiles = selectedFiles.filter(file => allowedTypes.includes(file.type));

		if (validFiles.length !== selectedFiles.length) {
			alert("❌ Only images & videos allowed!");
		}

		setFiles(validFiles);
		setPreviewUrls(validFiles.map(file => URL.createObjectURL(file)));
	};

	const handleUpload = async () => {
		if (!title || !projectId || files.length === 0)
			return alert("All fields required");

		setLoading(true);

		try {
			for (const file of files) {
				const cloudForm = new FormData();
				cloudForm.append("file", file);

				const cloudRes = await fetch("/api/drawings/upload", { method: "POST", body: cloudForm });
				const cloud = await cloudRes.json();

				const form = new FormData();
				form.append("title", title);
				form.append("projectId", projectId);
				form.append("fileUrl", cloud.url);

				await fetch("/api/drawings", { method: "POST", body: form });
			}

			// ✅ Do NOT reset title/projectId
			// Only reset the files and previews if you want to clear selection
			setFiles([]);
			setPreviewUrls([]);
			loadData();
		} catch (err) {
			console.error("Upload failed:", err);
			alert("Upload failed, try again.");
		} finally {
			setLoading(false);
		}
	};

	const deleteDrawing = async (id) => {
		await fetch(`/api/drawings/${id}`, { method: "DELETE" });
		loadData();
	};

	const openEdit = (d) => {
		setEditData(d);
		setEditModal(true);
	};

	const saveEdit = async () => {
		let newUrl = editData.fileUrl;

		if (editFile) {
			const cloudForm = new FormData();
			cloudForm.append("file", editFile);
			const res = await fetch("/api/drawings/upload", { method: "POST", body: cloudForm });
			const cloud = await res.json();
			newUrl = cloud.url;
		}

		const form = new FormData();
		form.append("title", editData.title);
		form.append("projectId", editData.projectId);
		form.append("fileUrl", newUrl);

		await fetch(`/api/drawings/${editData.id}`, { method: "PUT", body: form });

		setEditModal(false);
		setEditFile(null);
		loadData();
	};

	const openView = (url) => {
		setViewFile(url);
		setViewModal(true);
	};

	const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
	const isVideo = (url) => /\.(mp4|mov)$/i.test(url);

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">Manage Drawings</h1>

			{/* Upload Form */}
			<div className="grid gap-3 md:grid-cols-4">
				<Input
					placeholder="Drawing title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>

				<select
					className="border p-2 rounded"
					value={projectId}
					onChange={(e) => setProjectId(e.target.value)}
				>
					<option value="">Select Project</option>
					{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
				</select>

				<Input
					type="file"
					multiple
					onChange={handleFileSelect}
					accept="image/*,video/*"
				/>

				<Button
					onClick={handleUpload}
					disabled={loading}
				>
					{loading ? <Loader2 className="animate-spin" /> : "Upload"}
				</Button>
			</div>

			{/* Previews (before uploading) */}
			{previewUrls.length > 0 && (
				<div className="flex gap-2 flex-wrap mt-2">
					{previewUrls.map((src, idx) => (
						<div key={idx} className="relative">
							{isVideo(src) ? (
								<video
									autoPlay
									loop
									muted
									src={src}
									className="w-20 h-20 object-cover rounded border"
								/>
							) : (
								<img
									src={src}
									className="w-20 h-20 object-cover rounded border"
								/>
							)}
							<X
								className="absolute top-1 right-1 bg-white cursor-pointer"
								size={16}
								onClick={() => {
									// Remove file and preview without resetting form
									setFiles(files.filter((_, i) => i !== idx));
									setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
								}}
							/>
						</div>
					))}
				</div>
			)}


			<h2 className="text-lg font-semibold">Uploaded Drawings (Project-wise)</h2>

			<div className="space-y-8">
				{projects.map((project) => {
					const drawingsForProject = drawings.filter((d) => d.projectId == project.id);
					if (!drawingsForProject.length) return null;

					return (
						<div key={project.id} className="space-y-2">
							<h3 className="text-xl font-bold">{project.title}</h3>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Preview</TableHead>
										<TableHead>Title</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{drawingsForProject.map((d) => (
										<TableRow key={d.id}>
											<TableCell>
												{isImage(d.fileUrl) ? (
													<img
														src={d.fileUrl}
														className="w-14 h-14 rounded cursor-pointer border"
														onClick={() => openView(d.fileUrl)}
													/>
												) : isVideo(d.fileUrl) ? (
													<video
														src={d.fileUrl}
														className="w-14 h-14 rounded cursor-pointer border"
														onClick={() => openView(d.fileUrl)}
													/>
												) : (
													<div
														className="flex items-center gap-1 cursor-pointer text-blue-600"
														onClick={() => openView(d.fileUrl)}
													>
														<ImageIcon /> File
													</div>
												)}
											</TableCell>

											<TableCell>{d.title}</TableCell>

											<TableCell className="flex gap-2">
												<Button size="sm" onClick={() => openEdit(d)}>Edit</Button>

												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button size="sm" variant="destructive">Delete</Button>
													</AlertDialogTrigger>

													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Are you sure?</AlertDialogTitle>
															<AlertDialogDescription>
																This will permanently delete the file.
															</AlertDialogDescription>
														</AlertDialogHeader>

														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction onClick={() => deleteDrawing(d.id)}>
																Yes, Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					);
				})}
			</div>


			{/* View File Dialog */}
			<Dialog open={viewModal} onOpenChange={setViewModal}>
				<DialogContent className="max-w-4xl">
					<DialogHeader><DialogTitle>Preview</DialogTitle></DialogHeader>

					{isImage(viewFile) && (
						<img src={viewFile} className="max-h-[80vh] w-auto mx-auto border rounded" />
					)}

					{isVideo(viewFile) && (
						<video src={viewFile} controls className="w-full max-h-[80vh] rounded border" />
					)}
				</DialogContent>
			</Dialog>

			{/* Edit Modal */}
			<Dialog open={editModal} onOpenChange={setEditModal}>
				<DialogContent>
					<DialogHeader><DialogTitle>Edit Drawing</DialogTitle></DialogHeader>

					<Input
						value={editData.title}
						onChange={(e) => setEditData({ ...editData, title: e.target.value })}
						className="mb-3"
					/>

					<select
						className="border p-2 rounded mb-3"
						value={editData.projectId}
						onChange={(e) => setEditData({ ...editData, projectId: e.target.value })}
					>
						{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
					</select>

					<Input type="file" onChange={(e) => setEditFile(e.target.files[0])} accept="image/*,video/*" />

					<Button className="mt-4 w-full" onClick={saveEdit}>
						Save Changes
					</Button>
				</DialogContent>
			</Dialog>
		</div>
	);
}
