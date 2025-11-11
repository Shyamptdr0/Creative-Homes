"use client";

import {useEffect, useState} from "react";
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
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
} from "@/components/ui/pagination";

import {
	Loader2,
	FolderKanban,
	Wallet,
	Bell,
	FileText,
	MessageCircle,
	Image as ImageIcon,
	Video,
	File,
	Download,
	ListChecks,      // ✅ Stage icon
	Archive, PencilRuler          // ✅ Drawing icon
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "@/components/ui/sheet";

import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";

export default function ContractorDashboard({setActivePage}) {
	const [stats, setStats] = useState({projects: 0, payments: 0});
	const [newQueries, setNewQueries] = useState(0);

	const [selectedView, setSelectedView] = useState(null);
	const [tableData, setTableData] = useState([]);
	const [tableLoading, setTableLoading] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;
	const totalPages = Math.ceil(tableData.length / itemsPerPage);
	const paginatedData = tableData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// ✅ Dialog/Remarks
	const [openProjectDialog, setOpenProjectDialog] = useState(null);
	const [selectedStageRemark, setSelectedStageRemark] = useState(null);
	const [newRemark, setNewRemark] = useState("");
	const [remarkLoading, setRemarkLoading] = useState(false);

	// ✅ Drawing Preview
	const [previewFile, setPreviewFile] = useState(null);
	const [previewDrawing, setPreviewDrawing] = useState(null);
	const [projectDrawings, setProjectDrawings] = useState([]);

	async function fetchStats() {
		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/projects", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await res.json();

			setStats({
				projects: data?.projects?.length || 0,
				payments: data?.payments || 0,
			});
		} catch {}
	}

	async function fetchNewQueries() {
		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/queries", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await res.json();
			setNewQueries(data.newQueries || 0);
		} catch {
			setNewQueries(0);
		}
	}

	useEffect(() => {
		fetchStats();
		fetchNewQueries();
	}, []);

	async function loadProjectsTable() {
		setSelectedView("projects");
		setTableLoading(true);
		setCurrentPage(1);

		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/projects", {
				headers: {Authorization: `Bearer ${token}`},
			});
			const data = await res.json();

			const fullData = await Promise.all(
				data.projects.map(async (p) => {
					const sRes = await fetch(`/api/contractors/stages?projectId=${p.id}`, {
						headers: {Authorization: `Bearer ${token}`},
					});
					const dRes = await fetch(`/api/contractors/drawings?projectId=${p.id}`, {
						headers: {Authorization: `Bearer ${token}`},
					});

					const stages = await sRes.json();
					const drawings = await dRes.json();

					return {
						...p,
						projectStages: stages.stages || [],
						projectDrawings: drawings.drawings || []
					};
				})
			);

			setTableData(fullData);
		} finally {
			setTableLoading(false);
		}
	}

	// ✅ Check file type
	const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
	const isVideo = (url) => /\.(mp4|mov)$/i.test(url);
	const isPDF = (url) => /\.pdf$/i.test(url);

	function FileIcon(file) {
		if (isPDF(file)) return <FileText className="w-4 h-4 text-red-500" />;
		if (isImage(file)) return <ImageIcon className="w-4 h-4 text-blue-500" />;
		if (isVideo(file)) return <Video className="w-4 h-4 text-green-600" />;
		return <File className="w-4 h-4" />;
	}

	// ✅ Open Preview with related project files
	const openPreview = (drawing, allDrawings) => {
		setPreviewFile(drawing.fileUrl);
		setPreviewDrawing(drawing);
		setProjectDrawings(allDrawings);
	};

	// ✅ Download file
	const downloadFile = async () => {
		if (!previewFile || !previewDrawing) return;

		try {
			const response = await fetch(previewFile);
			const blob = await response.blob();

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");

			const project = previewDrawing.project?.title || "Project";
			const title = previewDrawing.title || "Drawing";
			const ext = previewFile.split(".").pop();
			const filename = `${project}-${title}.${ext}`.replace(/\s+/g, "_");

			link.href = url;
			link.setAttribute("download", filename);

			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error("Download failed", e);
		}
	};

	return (
		<div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">

			{/* HEADER */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800">Contractor Dashboard</h1>

				<div className="relative cursor-pointer" onClick={() => setActivePage("Query")}>
					<Bell className="h-7 w-7 text-gray-700"/>
					{newQueries > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
							{newQueries}
						</span>
					)}
				</div>
			</div>

			{/* ✅ DASHBOARD CARDS */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

				{/* ✅ PROJECT CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur border border-purple-200 hover:scale-[1.01] transition"
					onClick={loadProjectsTable}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="font-semibold">Total Projects</CardTitle>
						<FolderKanban className="h-6 w-6 text-purple-600"/>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-purple-700">{stats.projects}</p>
						<p className="text-xs text-gray-400 mt-1">Click to view projects</p>
					</CardContent>
				</Card>

				{/* ✅ PAYMENT CARD */}


				{/* ✅ STAGES CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur border border-blue-200 hover:scale-[1.01] transition"
					onClick={() => setActivePage("Stage")}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="font-semibold">Stages</CardTitle>
						<ListChecks className="h-6 w-6 text-blue-600"/>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-stretch-normal text-blue-700">View</p>

					</CardContent>
				</Card>

				{/* ✅ DRAWINGS CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur border border-orange-200 hover:scale-[1.01] transition"
					onClick={() => setActivePage("Drawing")}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="font-semibold">Drawings</CardTitle>
						<PencilRuler className="h-6 w-6 text-orange-600"/>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-stretch-normal text-orange-700">View</p>
					</CardContent>
				</Card>

				<Card
					className="shadow-md hover:shadow-2xl bg-white/80 backdrop-blur border border-teal-200 hover:scale-[1.01] transition">
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="font-semibold">Payments</CardTitle>
						<Wallet className="h-6 w-6 text-teal-600"/>
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-teal-700">₹ {stats.payments}</p>
					</CardContent>
				</Card>
			</div>

			{/* PROJECT TABLE remains unchanged */}
			{selectedView === "projects" && (
				<Card className="shadow-xl p-6 bg-white/90 border backdrop-blur rounded-xl">
					<h2 className="text-xl font-bold mb-3">Project Details</h2>

					{tableLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin h-10 w-10 text-gray-700"/>
						</div>
					) : (
						<>
							<div className="overflow-auto max-h-[60vh] border rounded-lg">
								<Table>
									<TableHeader className="bg-gray-100/70">
										<TableRow>
											<TableHead>Project</TableHead>
											<TableHead>Client</TableHead>
											<TableHead>Cost</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{paginatedData.length === 0 ? (
											<TableRow>
												<TableCell colSpan="4" className="text-center text-gray-500 py-6">
													No projects found
												</TableCell>
											</TableRow>
										) : (
											paginatedData.map((p, i) => (
												<TableRow key={i} className="hover:bg-gray-50 transition">
													<TableCell>{p.title}</TableCell>
													<TableCell>{p.client?.name}</TableCell>
													<TableCell>₹ {p.totalCost || "-"}</TableCell>

													<TableCell className="flex gap-2 justify-center">
														<Button
															variant="outline"
															size="sm"
															onClick={() => setOpenProjectDialog(p)}
														>
															View
														</Button>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>

							{tableData.length > itemsPerPage && (
								<Pagination className="mt-4">
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
												className="cursor-pointer"
											/>
										</PaginationItem>

										<PaginationItem>
											<span className="px-4">Page {currentPage} of {totalPages}</span>
										</PaginationItem>

										<PaginationItem>
											<PaginationNext
												onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
												className="cursor-pointer"
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</>
					)}
				</Card>
			)}

			{/* ✅ PROJECT DIALOG WITH TABS */}
			{openProjectDialog && (
				<Dialog open={true} onOpenChange={() => setOpenProjectDialog(null)}>
					<DialogContent className="max-w-3xl rounded-2xl shadow-xl">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								Project — {openProjectDialog.title}
							</DialogTitle>
						</DialogHeader>

						<Tabs defaultValue="stages" className="w-full mt-2">
							<TabsList className="grid grid-cols-2">
								<TabsTrigger value="stages">Stages</TabsTrigger>
								<TabsTrigger value="drawings">Drawings</TabsTrigger>
							</TabsList>

							{/* TAB — STAGES */}
							<TabsContent value="stages">
								<ScrollArea className="max-h-[55vh] pr-2 space-y-3 mt-2">
									{openProjectDialog.projectStages.length > 0 ? (
										openProjectDialog.projectStages.map((s) => (
											<div
												key={s.id}
												className="border rounded-md p-3 mb-2 bg-gray-50 shadow-sm flex justify-between items-center"
											>
												<div>
													<p className="font-medium">{s.name}</p>
													<p className="text-sm text-gray-600 mb-1">
														{s.description || "-"}
													</p>
												</div>
												<div className="flex flex-row gap-2">
													{s.isCompleted ? (
														<Badge className="bg-green-600 text-white px-2 py-1 text-xs">
															Completed
														</Badge>
													) : (
														<Badge className="bg-gray-600 text-white px-2 py-1 text-xs">
															Pending
														</Badge>
													)}

													<Button
														size="sm"
														variant="outline"
														onClick={() => setSelectedStageRemark(s)}
														className="flex items-center gap-1"
													>
														<MessageCircle className="w-4 h-4" /> Remarks
													</Button>
												</div>
											</div>
										))
									) : (
										<p className="text-sm text-gray-500">No stages found</p>
									)}
								</ScrollArea>
							</TabsContent>

							{/* ✅ TAB — DRAWINGS */}
							<TabsContent value="drawings">
								<ScrollArea className="max-h-[55vh] pr-2 space-y-3 mt-2">
									{openProjectDialog.projectDrawings.length > 0 ? (
										openProjectDialog.projectDrawings.map((d) => (
											<div
												key={d.id}
												className="border rounded-md p-3 mb-2 bg-white shadow flex justify-between items-center"
											>
												<div className="flex items-center gap-2">
													{FileIcon(d.fileUrl)}
													{d.title}
												</div>

												<Button
													size="sm"
													variant="outline"
													onClick={() => openPreview(d, openProjectDialog.projectDrawings)}
												>
													View
												</Button>
											</div>
										))
									) : (
										<p className="text-sm text-gray-500">No drawings found</p>
									)}
								</ScrollArea>
							</TabsContent>
						</Tabs>
					</DialogContent>
				</Dialog>
			)}

			{/* ✅ REMARK SHEET */}
			{selectedStageRemark && (
				<Sheet open={true} onOpenChange={() => setSelectedStageRemark(null)}>
					<SheetContent className="w-[420px] overflow-auto">
						<SheetHeader>
							<SheetTitle className="font-semibold text-lg">
								Remarks — {selectedStageRemark.name}
							</SheetTitle>
						</SheetHeader>

						<div className="mt-4 space-y-3 px-2">
							{selectedStageRemark.remarks?.length > 0 ? (
								selectedStageRemark.remarks.map((r) => (
									<div
										key={r.id}
										className={`p-3 rounded-md shadow-sm border text-sm ${
											r.by === "admin"
												? "bg-red-100 border-red-300"
												: "bg-blue-100 border-blue-300"
										}`}
									>
										<b className="text-xs">{r.by === "admin" ? "Admin" : "You"}</b>
										<p className="mt-1">{r.message}</p>
										<p className="text-[10px] opacity-50">
											{new Date(r.createdAt).toLocaleString()}
										</p>
									</div>
								))
							) : (
								<p className="text-sm text-gray-500">No remarks found</p>
							)}

							<Textarea
								placeholder="Write message..."
								value={newRemark}
								onChange={(e) => setNewRemark(e.target.value)}
								className="h-24"
							/>

							<SheetFooter>
								<Button
									className="w-full"
									disabled={remarkLoading}
									onClick={async () => {
										if (!newRemark.trim()) return;
										setRemarkLoading(true);

										const token = sessionStorage.getItem("token");
										await fetch(`/api/stages/${selectedStageRemark.id}`, {
											method: "PUT",
											headers: {
												"Content-Type": "application/json",
												Authorization: `Bearer ${token}`,
											},
											body: JSON.stringify({
												remark: newRemark,
												by: "contractor",
											}),
										});

										setSelectedStageRemark((prev) => ({
											...prev,
											remarks: [
												...prev.remarks,
												{
													id: Math.random(),
													message: newRemark,
													by: "contractor",
													createdAt: new Date(),
												},
											],
										}));

										setNewRemark("");
										setRemarkLoading(false);
									}}
								>
									{remarkLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Send"}
								</Button>
							</SheetFooter>
						</div>
					</SheetContent>
				</Sheet>
			)}

			{/* ✅ FILE PREVIEW WITH RELATED FILES AND DOWNLOAD */}
			{previewFile && (
				<Dialog open={true} onOpenChange={() => setPreviewFile(null)}>
					<DialogContent className="max-w-screen flex flex-col">
						<DialogHeader>
							<DialogTitle>Drawing Preview</DialogTitle>
							<p className="text-sm text-gray-600">{previewDrawing?.title}</p>
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

						{/* ✅ Related files */}
						{projectDrawings.length > 1 && (
							<div className="flex gap-3 mt-3 overflow-x-auto border-t pt-3">
								{projectDrawings.map((pf) => (
									<div
										key={pf.id}
										onClick={() => openPreview(pf, projectDrawings)}
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
