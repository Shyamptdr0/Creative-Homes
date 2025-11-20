"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
	Loader2,
	FileText,
	Image,
	Video,
	File,
	Download,
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";

export default function ContractorDrawingsPage() {
	const [drawings, setDrawings] = useState([]);
	const [loading, setLoading] = useState(true);

	const [previewFile, setPreviewFile] = useState(null);
	const [selectedDrawing, setSelectedDrawing] = useState(null);

	const [projectGrouped, setProjectGrouped] = useState({});
	const [projectList, setProjectList] = useState([]);

	// selected project for filter
	const [selectedProjectId, setSelectedProjectId] = useState("");

	useEffect(() => {
		fetchDrawings();
	}, []);

	/* =====================================================
	    FETCH DRAWINGS
	===================================================== */
	const fetchDrawings = async () => {
		setLoading(true);

		const token = sessionStorage.getItem("token");
		if (!token) return setEmpty();

		try {
			const res = await fetch("/api/contractors/drawings", {
				headers: { authorization: `Bearer ${token}` },
			});

			const data = await res.json();
			const list = data?.drawings || [];

			setDrawings(list);
			groupByProject(list);
			buildProjectList(list);
		} catch {
			setEmpty();
		}

		setLoading(false);
	};

	const setEmpty = () => {
		setDrawings([]);
		setProjectGrouped({});
		setProjectList([]);
		setLoading(false);
	};

	/* =====================================================
	    GROUP DRAWINGS BY PROJECT
	===================================================== */
	const groupByProject = (list) => {
		const grouped = {};

		list.forEach((d) => {
			const id = d.project?.id;

			if (!grouped[id]) {
				grouped[id] = {
					project: d.project,
					drawings: [],
				};
			}
			grouped[id].drawings.push(d);
		});

		setProjectGrouped(grouped);
	};

	/* =====================================================
	    CREATE PROJECT DROPDOWN LIST
	===================================================== */
	const buildProjectList = (list) => {
		const map = {};

		list.forEach((d) => {
			map[d.project.id] = {
				id: d.project.id,
				name: d.project.title,
				uid: d.project.projectUid,
			};
		});

		setProjectList(Object.values(map));
	};

	/* =====================================================
	    FILE TYPE HELPERS
	===================================================== */
	const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
	const isVideo = (url) => /\.(mp4|mov)$/i.test(url);
	const isPDF = (url) => /\.pdf$/i.test(url);

	/* =====================================================
	    OPEN PREVIEW
	===================================================== */
	const openPreview = (drawing) => {
		setPreviewFile(drawing.fileUrl);
		setSelectedDrawing(drawing);
	};

	/* =====================================================
	    DOWNLOAD FILE
	===================================================== */
	const downloadFile = async () => {
		if (!previewFile || !selectedDrawing) return;

		try {
			const response = await fetch(previewFile);
			const blob = await response.blob();

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");

			const { project, title } = selectedDrawing;
			const extension = previewFile.split(".").pop();
			const filename = `${project?.title}-${title}.${extension}`.replace(/\s+/g, "_");

			link.href = url;
			link.setAttribute("download", filename);
			document.body.appendChild(link);
			link.click();
			link.remove();

			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error("DOWNLOAD ERROR:", err);
		}
	};

	/* =====================================================
	    UI
	===================================================== */
	return (
		<div className="p-6 space-y-8 animate-fadeIn">
			<h1 className="text-3xl font-bold tracking-tight">Project Drawings</h1>

			{/* ==========================
			    PROJECT DROPDOWN
			========================== */}
			<div className="max-w-sm mb-6">
				<Select
					value={selectedProjectId}
					onValueChange={(v) => setSelectedProjectId(v)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select Project" />
					</SelectTrigger>

					<SelectContent>
						{projectList.map((p) => (
							<SelectItem key={p.id} value={String(p.id)}>
								{p.name} ({p.uid})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* ==========================
			    PROJECT DRAWINGS CARD
			========================== */}
			<Card className="shadow-md border rounded-xl">
				<CardHeader className="pb-2 border-b">
					<CardTitle className="text-xl font-semibold">
						Project Drawings
					</CardTitle>
				</CardHeader>

				<CardContent className="p-4">
					{loading ? (
						<div className="flex justify-center py-20">
							<Loader2 className="animate-spin h-10 w-10 text-gray-600" />
						</div>
					) : !selectedProjectId ? (
						<p className="text-center text-gray-500 py-10">
							Please select a project to view drawings.
						</p>
					) : projectGrouped[selectedProjectId] ? (
						<div>
							{/* PROJECT HEADER */}
							<div className="mb-4">
								<h2 className="text-xl font-bold">
									{projectGrouped[selectedProjectId].project.title}
								</h2>
								<p className="text-gray-600 text-sm">
									Project ID: <b>{projectGrouped[selectedProjectId].project.projectUid}</b>
								</p>
								<p className="text-gray-600 text-sm">
									Client: <b>{projectGrouped[selectedProjectId].project.client?.name}</b>
								</p>
								<p className="text-gray-600 text-sm">
									Type: <b>{projectGrouped[selectedProjectId].project.projectType?.name || "N/A"}</b>
								</p>
							</div>

							{/* DRAWINGS GRID */}
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
								{projectGrouped[selectedProjectId].drawings.map((d) => (
									<div
										key={d.id}
										onClick={() => openPreview(d)}
										className="cursor-pointer border rounded-lg p-3 bg-white hover:shadow-lg transition"
									>
										<div className="h-28 w-full bg-gray-100 flex items-center justify-center rounded">
											{isImage(d.fileUrl) && (
												<img
													src={d.fileUrl}
													className="h-full w-full object-cover rounded"
												/>
											)}
											{isPDF(d.fileUrl) && (
												<FileText className="w-10 h-10 text-red-500" />
											)}
											{isVideo(d.fileUrl) && (
												<Video className="w-10 h-10 text-green-600" />
											)}
										</div>

										<p className="text-sm mt-2 font-medium text-gray-800 truncate">
											{d.title}
										</p>
									</div>
								))}
							</div>
						</div>
					) : (
						<p className="text-center text-gray-500 py-10">
							No drawings found for this project.
						</p>
					)}
				</CardContent>
			</Card>

			{/* ==========================
			    PREVIEW MODAL
			========================== */}
			{previewFile && (
				<Dialog open={true} onOpenChange={() => setPreviewFile(null)}>
					<DialogContent className="max-w-screen-lg p-3">
						<DialogHeader>
							<DialogTitle className="text-xl">
								{selectedDrawing?.title}
							</DialogTitle>
						</DialogHeader>

						<div className="mt-3 max-h-[70vh] rounded overflow-auto bg-gray-100 p-3 border">
							{isPDF(previewFile) && (
								<iframe src={previewFile} className="w-full h-[70vh]" />
							)}

							{isImage(previewFile) && (
								<img
									src={previewFile}
									className="w-full max-h-[70vh] object-contain mx-auto rounded"
								/>
							)}

							{isVideo(previewFile) && (
								<video controls className="w-full max-h-[70vh] rounded">
									<source src={previewFile} />
								</video>
							)}
						</div>

						<div className="mt-4 flex justify-between">
							<Button variant="outline" onClick={downloadFile}>
								<Download className="w-4 h-4 mr-2" />
								Download
							</Button>

							<Button onClick={() => setPreviewFile(null)}>Close</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
