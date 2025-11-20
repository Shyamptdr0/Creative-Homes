"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Loader2, FolderOpen, ImagePlus } from "lucide-react";

export default function AdminDrawingsPage() {
	const [projects, setProjects] = useState([]);
	const [drawings, setDrawings] = useState([]);

	const [projectId, setProjectId] = useState("");

	// FILE STATES
	const [folderFiles, setFolderFiles] = useState([]);
	const [singleFiles, setSingleFiles] = useState([]);

	const [folderPreview, setFolderPreview] = useState([]);
	const [singlePreview, setSinglePreview] = useState([]);

	const [folderDisabled, setFolderDisabled] = useState(false);
	const [singleDisabled, setSingleDisabled] = useState(false);

	const [selectedProject, setSelectedProject] = useState(null);
	const [selectedProjectDrawings, setSelectedProjectDrawings] = useState([]);

	// PREVIEW CAROUSEL
	const [previewIndex, setPreviewIndex] = useState(null);
	const [openPreview, setOpenPreview] = useState(false);

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		const p = await fetch("/api/projects");
		const d = await fetch("/api/drawings");

		const proj = await p.json();
		const draw = await d.json();

		setProjects(proj.projects || []);
		setDrawings(draw);
	};

	const allowed = ["image/", "video/"];

	/* -------- Folder Upload -------- */
	const handleFolderSelect = (e) => {
		const files = Array.from(e.target.files).filter((f) =>
			allowed.some((t) => f.type.startsWith(t))
		);

		setFolderFiles(files);
		setFolderPreview(files.map((f) => URL.createObjectURL(f)));
		setSingleDisabled(files.length > 0);
	};

	/* -------- Single Upload -------- */
	const handleSingleSelect = (e) => {
		const files = Array.from(e.target.files).filter((f) =>
			allowed.some((t) => f.type.startsWith(t))
		);

		setSingleFiles(files);
		setSinglePreview(files.map((f) => URL.createObjectURL(f)));
		setFolderDisabled(files.length > 0);
	};

	/* -------- Upload to Server -------- */
	const handleUpload = async () => {
		if (!projectId) return alert("Select project");
		const all = [...folderFiles, ...singleFiles];
		if (all.length === 0) return alert("Upload files first");

		setLoading(true);

		try {
			const fd = new FormData();
			all.forEach((f) => fd.append("files", f));

			const cloud = await fetch("/api/drawings/upload", { method: "POST", body: fd });
			const { urls, names } = await cloud.json();

			const save = new FormData();
			save.append("projectId", Number(projectId));
			save.append("fileUrls", JSON.stringify(urls));
			save.append("fileNames", JSON.stringify(names));

			await fetch("/api/drawings", { method: "POST", body: save });

			resetForm();
			loadData();
		} catch (e) {
			console.log(e);
			alert("Upload failed");
		}

		setLoading(false);
	};

	const resetForm = () => {
		setProjectId("");
		setFolderFiles([]);
		setSingleFiles([]);
		setFolderPreview([]);
		setSinglePreview([]);

		setFolderDisabled(false);
		setSingleDisabled(false);

		document.getElementById("folderInput").value = "";
		document.getElementById("singleInput").value = "";
	};

	/* -------- Filter Drawings -------- */
	const filterProjectDrawings = (id) => {
		const pid = Number(id);
		setSelectedProject(pid);
		setSelectedProjectDrawings(drawings.filter((d) => Number(d.projectId) === pid));
	};

	/* -------- Delete One -------- */
	const deleteDrawingConfirmed = async (id) => {
		await fetch(`/api/drawings/${id}`, { method: "DELETE" });
		loadData();
		if (selectedProject) filterProjectDrawings(selectedProject);
	};

	/* -------- Delete All -------- */
	const deleteAllConfirmed = async () => {
		await fetch(`/api/drawings/delete-all/${selectedProject}`, { method: "DELETE" });
		loadData();
		setSelectedProjectDrawings([]);
	};

	const isImage = (u) => /\.(jpg|jpeg|png|gif|webp)$/i.test(u);
	const projectDetails =
		selectedProject ? projects.find((p) => p.id === selectedProject) : null;

	/* -------- Carousel Controls -------- */
	const nextImage = () => {
		setPreviewIndex((prev) =>
			prev + 1 < selectedProjectDrawings.length ? prev + 1 : 0
		);
	};
	const prevImage = () => {
		setPreviewIndex((prev) =>
			prev - 1 >= 0 ? prev - 1 : selectedProjectDrawings.length - 1
		);
	};

	return (
		<div className="p-6 space-y-10">
			<h1 className="text-3xl font-bold">Manage Drawings</h1>

			{/* ================= Upload Controls ================= */}
			<div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-4 rounded-lg shadow border">

				{/* Select Project */}
				<select
					className="border p-2 rounded w-full md:w-48 text-sm"
					value={projectId}
					onChange={(e) => setProjectId(e.target.value)}
				>
					<option value="">Project</option>
					{projects.map((p) => (
						<option key={p.id} value={p.id}>
							{p.projectUid}
						</option>
					))}
				</select>

				{/* Folder Upload */}
				<label
					className={`flex items-center gap-2 border p-2 rounded cursor-pointer text-sm w-full md:w-48 
						${folderDisabled ? "bg-gray-200 cursor-not-allowed" : ""}`}
				>
					<FolderOpen className="text-blue-600 w-4 h-4" />
					<span>Folder</span>
					<input
						id="folderInput"
						type="file"
						multiple
						webkitdirectory=""
						directory=""
						disabled={folderDisabled}
						accept="image/*,video/*"
						onChange={handleFolderSelect}
						className="hidden"
					/>
				</label>

				{/* Single Image Upload */}
				<label
					className={`flex items-center gap-2 border p-2 rounded cursor-pointer text-sm w-full md:w-48 
						${singleDisabled ? "bg-gray-200 cursor-not-allowed" : ""}`}
				>
					<ImagePlus className="text-green-600 w-4 h-4" />
					<span>Image</span>
					<input
						id="singleInput"
						type="file"
						disabled={singleDisabled}
						accept="image/*,video/*"
						onChange={handleSingleSelect}
						className="hidden"
					/>
				</label>

				{/* Upload Button */}
				<Button
					className="md:ml-auto px-4 py-2 text-sm"
					onClick={handleUpload}
					disabled={loading || (!folderFiles.length && !singleFiles.length)}
				>
					{loading ? <Loader2 className="animate-spin" /> : "Upload"}
				</Button>
			</div>

			{/* ================= Small Previews ================= */}
			{folderPreview.length > 0 || singlePreview.length > 0 ? (
				<div className="grid grid-cols-6 gap-3 mt-3">
					{folderPreview.concat(singlePreview).map((src, i) => (
						<img key={i} src={src} className="w-full h-20 rounded border object-cover shadow-sm" />
					))}
				</div>
			) : null}

			{/* ================= Drawings Section ================= */}
			<h2 className="text-xl font-semibold">Project Drawings</h2>

			<select
				className="border p-2 rounded w-full md:w-48 text-sm"
				value={selectedProject || ""}
				onChange={(e) => filterProjectDrawings(e.target.value)}
			>
				<option value="">Select Project</option>
				{projects.map((p) => (
					<option key={p.id} value={p.id}>
						{p.projectUid} - {p.title}
					</option>
				))}
			</select>

			{/* ================= Project Details ================= */}
			{projectDetails && (
				<div className="bg-white border rounded-lg p-4 shadow mt-4">
					<h3 className="font-semibold text-lg mb-2">Project Details</h3>

					<div className="grid grid-cols-2 gap-4 text-sm">
						<p><strong>Client ID:</strong> {projectDetails.client?.clientId}</p>
						<p><strong>Client Name:</strong> {projectDetails.client?.name}</p>
						<p><strong>Contractor ID:</strong> {projectDetails.contractor?.contractorId}</p>
						<p><strong>Contractor Name:</strong> {projectDetails.contractor?.name}</p>
					</div>
				</div>
			)}

			{/* ================= Drawing List ================= */}
			{selectedProject && (
				<Card className="mt-4">
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Drawings</CardTitle>

						{selectedProjectDrawings.length > 0 && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="sm">Delete All</Button>
								</AlertDialogTrigger>

								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you sure?</AlertDialogTitle>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={deleteAllConfirmed}>Delete</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Preview</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Action</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{selectedProjectDrawings.map((d, i) => (
									<TableRow key={d.id}>
										<TableCell>
											<img
												src={d.fileUrl}
												className="w-16 h-16 rounded cursor-pointer object-cover"
												onClick={() => {
													setPreviewIndex(i);
													setOpenPreview(true);
												}}
											/>
										</TableCell>

										<TableCell>{d.title}</TableCell>

										<TableCell>{new Date(d.uploadedAt).toLocaleString()}</TableCell>

										<TableCell>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button size="sm" variant="destructive">Delete</Button>
												</AlertDialogTrigger>

												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete this image?</AlertDialogTitle>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction onClick={() => deleteDrawingConfirmed(d.id)}>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* ================= Carousel Preview Modal ================= */}
			{openPreview && (
				<Dialog open={openPreview} onOpenChange={setOpenPreview}>
					<DialogContent className="max-w-screen-md">
						<DialogHeader>
							<DialogTitle>
								{selectedProjectDrawings[previewIndex]?.title}
							</DialogTitle>
						</DialogHeader>

						<div className="bg-gray-100 p-4 rounded flex flex-col items-center">

							{/* IMAGE OR VIDEO */}
							{isImage(selectedProjectDrawings[previewIndex].fileUrl) ? (
								<img
									src={selectedProjectDrawings[previewIndex].fileUrl}
									className="max-h-[70vh] rounded"
								/>
							) : (
								<video
									controls
									className="max-h-[70vh] rounded"
									src={selectedProjectDrawings[previewIndex].fileUrl}
								/>
							)}

							{/* NEXT / PREV */}
							<div className="flex gap-4 mt-4">
								<Button variant="outline" onClick={prevImage}>Previous</Button>
								<Button variant="outline" onClick={nextImage}>Next</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
