"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Image, Video, File, Download } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function ClientDrawingsPage() {
	const [drawings, setDrawings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [previewFile, setPreviewFile] = useState(null);
	const [projectFiles, setProjectFiles] = useState([]);
	const [selectedDrawing, setSelectedDrawing] = useState(null);

	useEffect(() => {
		fetchDrawings();
	}, []);

	const fetchDrawings = async () => {
		setLoading(true);

		const token = sessionStorage.getItem("token");
		if (!token) return setEmpty();

		try {
			const res = await fetch("/api/clients/drawings", {
				headers: { authorization: `Bearer ${token}` },
			});

			const data = await res.json();
			setDrawings(data?.drawings || []);
		} catch {
			setEmpty();
		}

		setLoading(false);
	};

	const setEmpty = () => {
		setDrawings([]);
		setLoading(false);
	};

	const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
	const isVideo = (url) => /\.(mp4|mov)$/i.test(url);
	const isPDF = (url) => /\.pdf$/i.test(url);

	const FileIcon = (file) => {
		if (isPDF(file)) return <FileText className="w-4 h-4 text-red-500" />;
		if (isImage(file)) return <Image className="w-4 h-4 text-blue-500" />;
		if (isVideo(file)) return <Video className="w-4 h-4 text-green-600" />;
		return <File className="w-4 h-4" />;
	};

	// ✅ Store full drawing object
	const openPreview = (drawing) => {
		setPreviewFile(drawing.fileUrl);
		setSelectedDrawing(drawing);

		const related = drawings.filter((d) => d.projectId === drawing.projectId);
		setProjectFiles(related);
	};

	// ✅ Secure download with correct filename
	const downloadFile = async () => {
		if (!previewFile || !selectedDrawing) return;

		try {
			const response = await fetch(previewFile);
			const blob = await response.blob();

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");

			const project = selectedDrawing.project?.title || "Project";
			const title = selectedDrawing.title || "Drawing";
			const extension = previewFile.split(".").pop();
			const filename = `${project}-${title}.${extension}`.replace(/\s+/g, "_");

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

	return (
		<div className="p-6 space-y-6 animate-fadeIn">
			<h1 className="text-3xl font-bold tracking-tight">Project Drawings</h1>

			<Card className="shadow-md border rounded-xl">
				<CardHeader className="pb-2 border-b">
					<CardTitle className="text-xl font-semibold flex items-center gap-2">
						<FileText className="w-5 h-5" />
						Drawings Assigned By Contractor
					</CardTitle>
				</CardHeader>

				<CardContent className="p-0">
					{loading ? (
						<div className="flex justify-center py-20">
							<Loader2 className="animate-spin h-10 w-10 text-gray-600" />
						</div>
					) : (
						<div className="overflow-auto max-h-[70vh] rounded-b-xl">
							<Table>
								<TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
									<TableRow>
										<TableHead className="font-semibold">Project</TableHead>
										<TableHead className="font-semibold">Contractor</TableHead>
										<TableHead className="font-semibold">Drawing</TableHead>
										<TableHead className="text-center font-semibold">Action</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{drawings.length ? (
										drawings.map((d) => (
											<TableRow
												key={d.id}
												className="hover:bg-gray-100/70 transition border-b"
											>
												<TableCell className="font-medium">{d.project?.title}</TableCell>
												<TableCell>{d.project?.contractor?.name || "-"}</TableCell>

												<TableCell className="flex items-center gap-2">
													{FileIcon(d.fileUrl)}
													<span>{d.title}</span>
												</TableCell>

												<TableCell className="text-center">
													<Button
														size="sm"
														className="rounded-lg"
														variant="outline"
														onClick={() => openPreview(d)}
													>
														<FileText className="w-4 h-4 mr-2" />
														View
													</Button>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={4} className="text-center py-8 text-gray-500">
												No drawings uploaded yet
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{previewFile && (
				<Dialog open={true} onOpenChange={() => setPreviewFile(null)}>
					<DialogContent className="max-w-screen flex flex-col">
						<DialogHeader>
							<DialogTitle>Drawing Preview</DialogTitle>
							<p className="text-sm text-gray-600">{selectedDrawing?.title}</p>
						</DialogHeader>

						<div className="flex-1 overflow-auto bg-gray-100 rounded p-2 border">
							{isPDF(previewFile) && (
								<iframe src={previewFile} className="w-full h-full rounded" />
							)}

							{isImage(previewFile) && (
								<img
									src={previewFile}
									alt="Preview"
									className="w-full h-auto mx-auto rounded shadow-lg"
								/>
							)}

							{isVideo(previewFile) && (
								<video controls className="w-full h-full rounded shadow-lg">
									<source src={previewFile} />
								</video>
							)}
						</div>

						{projectFiles.length > 1 && (
							<div className="flex gap-3 mt-3 overflow-x-auto border-t pt-3">
								{projectFiles.map((pf) => (
									<div
										key={pf.id}
										onClick={() => openPreview(pf)}
										className={`border rounded cursor-pointer p-1 transition hover:scale-105 ${
											previewFile === pf.fileUrl ? "border-blue-500" : "border-gray-300"
										}`}
									>
										{isImage(pf.fileUrl) ? (
											<img src={pf.fileUrl} className="w-20 h-20 object-cover rounded" />
										) : isPDF(pf.fileUrl) ? (
											<div className="w-20 h-20 flex items-center justify-center bg-red-100 rounded">
												<FileText className="text-red-500 w-6 h-6" />
											</div>
										) : (
											<div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded">
												<Video className="text-green-600 w-6 h-6" />
											</div>
										)}
									</div>
								))}
							</div>
						)}

						<div className="mt-3 flex justify-between">
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
