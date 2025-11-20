"use client";

import { useEffect, useState, useRef } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent
} from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationPrevious,
	PaginationNext
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
	ListChecks,
	PencilRuler,
	ChevronLeft
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
	SheetDescription,
	SheetFooter
} from "@/components/ui/sheet";

import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent
} from "@/components/ui/tabs";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ContractorDashboard({ setActivePage }) {

	const [stats, setStats] = useState({ projects: 0, payments: 0 });
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

	// ========= Admin-style sheet ==============
	const [openProjectSheet, setOpenProjectSheet] = useState(null);

	// ========= Stage chat ==============
	const [selectedStage, setSelectedStage] = useState(null);
	const [stageRemarks, setStageRemarks] = useState([]);
	const [remarkText, setRemarkText] = useState("");
	const [remarkLoading, setRemarkLoading] = useState(false);
	const [remarkFetching, setRemarkFetching] = useState(false);
	const remarkEndRef = useRef(null);

	// ========= Drawing preview ==============
	const [previewFile, setPreviewFile] = useState(null);
	const [previewDrawing, setPreviewDrawing] = useState(null);
	const [projectDrawings, setProjectDrawings] = useState([]);

	// ========= Approval popup ==============
	const [pendingApprovalProject, setPendingApprovalProject] = useState(null);

	async function checkApprovalPopup() {
		const token = sessionStorage.getItem("token");
		const res = await fetch("/api/contractors/projects", {
			headers: { Authorization: `Bearer ${token}` }
		});
		const data = await res.json();

		const pending = data.projects.find(p => !p.contractorApproved);

		if (pending) setPendingApprovalProject(pending);
	}

	async function fetchStats() {
		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();

			setStats({
				projects: data?.projects?.length || 0,
				payments: data?.payments || 0
			});
		} catch {}
	}

	async function fetchNewQueries() {
		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/queries", {
				headers: { Authorization: `Bearer ${token}` }
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
		checkApprovalPopup();
	}, []);

	// ======================================================
	// LOAD PROJECT TABLE — WITH STAGES + DRAWINGS
	// ======================================================
	async function loadProjectsTable() {
		setSelectedView("projects");
		setTableLoading(true);
		setCurrentPage(1);

		try {
			const token = sessionStorage.getItem("token");

			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();

			const typeRes = await fetch("/api/project-types");
			const typeData = await typeRes.json();
			const projectTypes = typeData.types || [];

			const fullData = await Promise.all(
				data.projects.map(async (p) => {

					// ⭐ GET ALL PROJECT STAGES (not only contractor assigned)
					const sRes = await fetch(
						`/api/project-stages/list?projectId=${p.id}`,
						{ headers: { Authorization: `Bearer ${token}` } }
					);

					const dRes = await fetch(
						`/api/contractors/drawings?projectId=${p.id}`,
						{ headers: { Authorization: `Bearer ${token}` } }
					);

					const stages = await sRes.json();
					const drawings = await dRes.json();

					const typeName =
						projectTypes.find((t) => t.id === p.projectTypeId)?.name || "N/A";

					return {
						...p,
						projectTypeName: typeName,

						// ⭐ FIX: Always return ALL stages
						projectStages:
							stages.stages ||
							stages.projectStages ||
							stages.data?.stages ||
							[],

						projectDrawings: drawings.drawings || []
					};
				})
			);

			setTableData(fullData);
		} finally {
			setTableLoading(false);
		}
	}


	// FILE TYPE HELPERS
	const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
	const isVideo = (url) => /\.(mp4|mov)$/i.test(url);
	const isPDF = (url) => /\.pdf$/i.test(url);

	function FileIcon(file) {
		if (isPDF(file)) return <FileText className="w-4 h-4 text-red-500" />;
		if (isImage(file)) return <ImageIcon className="w-4 h-4 text-blue-500" />;
		if (isVideo(file)) return <Video className="w-4 h-4 text-green-600" />;
		return <File className="w-4 h-4" />;
	}

	const openPreview = (drawing, allDrawings) => {
		setPreviewFile(drawing.fileUrl);
		setPreviewDrawing(drawing);
		setProjectDrawings(allDrawings);
	};

	const downloadFile = async () => {
		if (!previewFile || !previewDrawing) return;
		const response = await fetch(previewFile);
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		const ext = previewFile.split(".").pop();
		link.href = url;
		link.setAttribute("download", `${previewDrawing.title}.${ext}`);
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	};

	// ======================================================
	// Approve new project
	// ======================================================
	async function approveProject() {
		const token = sessionStorage.getItem("token");
		await fetch(`/api/projects/${pendingApprovalProject.id}/approve`, {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` }
		});

		setPendingApprovalProject(null);
		checkApprovalPopup();
	};
	// ======================================================
	// Load Stage Remarks (Admin Style)
	// ======================================================
	const openStageSheet = async (stage) => {
		setSelectedStage(stage);
		setRemarkFetching(true);
		setStageRemarks([]);

		const token = sessionStorage.getItem("token");
		const res = await fetch(`/api/stages/${stage.id}/remarks`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();

		if (data.success) {
			setStageRemarks(
				data.remarks.sort(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
				)
			);
		}

		setRemarkFetching(false);
	};

	// ======================================================
	// Send Stage Remark
	// ======================================================
	const sendRemark = async () => {
		if (!remarkText.trim()) return;

		setRemarkLoading(true);

		const token = sessionStorage.getItem("token");

		await fetch(`/api/stages/${selectedStage.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				message: remarkText,
				by: "contractor"
			})
		});

		setRemarkText("");
		openStageSheet(selectedStage);
		setRemarkLoading(false);
	};

	// Format Date
	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});

	useEffect(() => {
		if (remarkEndRef.current) {
			remarkEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [stageRemarks]);

	// ======================================================
	// UI START
	// ======================================================
	return (
		<div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">

			{/* ======================================================== */}
			{/* APPROVAL POPUP */}
			{/* ======================================================== */}
			{pendingApprovalProject && (
				<Dialog open={true}>
					<DialogContent className="max-w-lg text-center space-y-4">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								Approve New Project
							</DialogTitle>
						</DialogHeader>

						<p className="text-gray-700 text-sm">
							A new project has been assigned to you.
							Please approve to continue.
						</p>

						<div className="p-4 bg-gray-100 rounded-md text-left">
							<p><b>Title:</b> {pendingApprovalProject.title}</p>
							<p><b>Type:</b> {pendingApprovalProject.projectTypeName}</p>
							<p><b>Cost:</b> ₹ {pendingApprovalProject.totalCost}</p>
						</div>

						<Button className="w-full" onClick={approveProject}>
							Approve Project
						</Button>
					</DialogContent>
				</Dialog>
			)}

			{/* ======================================================== */}
			{/* HEADER */}
			{/* ======================================================== */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					Contractor Dashboard
				</h1>

				<div
					className="relative cursor-pointer"
					onClick={() => setActivePage("Query")}
				>
					<Bell className="h-7 w-7 text-gray-700" />
					{newQueries > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                            {newQueries}
                        </span>
					)}
				</div>
			</div>

			{/* ======================================================== */}
			{/* TOP CARDS */}
			{/* ======================================================== */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur border border-purple-200 hover:scale-[1.01] transition"
					onClick={loadProjectsTable}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Total Projects</CardTitle>
						<FolderKanban className="h-6 w-6 text-purple-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-purple-700">
							{stats.projects}
						</p>
						<p className="text-xs text-gray-400 mt-1">Click to view</p>
					</CardContent>
				</Card>

				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur border border-blue-200 hover:scale-[1.01] transition"
					onClick={() => setActivePage("Stage")}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Stages</CardTitle>
						<ListChecks className="h-6 w-6 text-blue-600" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl text-blue-700">View</p>
					</CardContent>
				</Card>

				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur border border-orange-200 hover:scale-[1.01] transition"
					onClick={() => setActivePage("Drawing")}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Drawings</CardTitle>
						<PencilRuler className="h-6 w-6 text-orange-600" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl text-orange-700">View</p>
					</CardContent>
				</Card>

				<Card
					className="shadow-md hover:shadow-2xl bg-white/80 backdrop-blur border border-teal-200 hover:scale-[1.01] transition"
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Payments</CardTitle>
						<Wallet className="h-6 w-6 text-teal-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-teal-700">
							₹ {stats.payments}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* ======================================================== */}
			{/* PROJECT TABLE */}
			{/* ======================================================== */}
			{selectedView === "projects" && (
				<Card className="shadow-xl p-6 bg-white/90 border backdrop-blur rounded-xl">
					<h2 className="text-xl font-bold mb-3">Project Details</h2>

					{tableLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin h-10 w-10 text-gray-700" />
						</div>
					) : (
						<>
							<div className="overflow-auto max-h-[60vh] border rounded-lg">
								<Table>
									<TableHeader className="bg-gray-100/70">
										<TableRow>
											<TableHead>Project</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Client</TableHead>
											<TableHead>Cost</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{paginatedData.length === 0 ? (
											<TableRow>
												<TableCell
													colSpan="5"
													className="text-center text-gray-500 py-6"
												>
													No projects found
												</TableCell>
											</TableRow>
										) : (
											paginatedData.map((p, i) => (
												<TableRow
													key={i}
													className="hover:bg-gray-50 transition"
												>
													<TableCell>{p.title}</TableCell>
													<TableCell>{p.projectTypeName}</TableCell>
													<TableCell>{p.client?.name}</TableCell>
													<TableCell>₹ {p.totalCost || "-"}</TableCell>

													<TableCell className="flex gap-2 justify-center">
														<Button
															variant="default"
															size="sm"
															onClick={() =>
																setOpenProjectSheet(p)
															}
														>
															View Stages
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
												onClick={() =>
													currentPage > 1 &&
													setCurrentPage(currentPage - 1)
												}
												className="cursor-pointer"
											/>
										</PaginationItem>

										<PaginationItem>
                                            <span className="px-4">
                                                Page {currentPage} of {totalPages}
                                            </span>
										</PaginationItem>

										<PaginationItem>
											<PaginationNext
												onClick={() =>
													currentPage < totalPages &&
													setCurrentPage(currentPage + 1)
												}
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

			{/* ======================================================== */}
			{/* ADMIN STYLE — PROJECT SHEET (TIMELINE + REMARKS) */}
			{/* ======================================================== */}
			{openProjectSheet && (
				<Sheet
					open={true}
					onOpenChange={() => {
						setOpenProjectSheet(null);
						setSelectedStage(null);
					}}
				>
					<SheetContent side="right" className="w-[470px] overflow-auto">
						<SheetHeader>
							<SheetTitle className="text-xl font-bold">
								{openProjectSheet.title}
							</SheetTitle>
							<SheetDescription>
								Project Type: {openProjectSheet.projectTypeName}
							</SheetDescription>
						</SheetHeader>

						{/* ================================================== */}
						{/* SELECTED STAGE CHAT VIEW */}
						{/* ================================================== */}
						{selectedStage ? (
							<div className="animate-fadeIn">
								{/* HEADER */}
								<div className="flex items-center gap-3 border-b pb-3 sticky top-0 bg-white z-30">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setSelectedStage(null)}
									>
										<ChevronLeft className="h-5 w-5" />
									</Button>
									<h2 className="text-xl font-bold">
										{selectedStage.StageTemplate?.name || selectedStage.name}
									</h2>
								</div>

								{/* REMARK LIST */}
								<div className="max-h-[70vh] overflow-y-auto py-4 space-y-3 p-3">
									{remarkFetching ? (
										<div className="flex justify-center py-6">
											<Loader2 className="h-6 w-6 animate-spin" />
										</div>
									) : stageRemarks.length > 0 ? (
										stageRemarks.map((r) => {
											let color = "bg-gray-200 border-gray-300";
											if (r.by === "admin") color = "bg-red-100 border-red-300";
											if (r.by === "contractor") color = "bg-blue-100 border-blue-300";

											return (
												<div
													key={r.id}
													className={`p-3 rounded-lg shadow-sm text-sm border ${color}`}
												>
													<b className="text-xs capitalize">{r.by}</b>
													<p className="mt-1">{r.message}</p>
													<p className="text-[10px] opacity-60 mt-1">
														{formatDate(r.createdAt)}
													</p>
												</div>
											);
										})
									) : (
										<p className="text-sm text-gray-500">No remarks</p>
									)}

									<div ref={remarkEndRef} />

									{/* MESSAGE INPUT */}
									<Textarea
										placeholder="Write message..."
										value={remarkText}
										onChange={(e) => setRemarkText(e.target.value)}
										className="h-24"
									/>

									<SheetFooter>
										<Button
											className="w-full"
											disabled={remarkLoading}
											onClick={sendRemark}
										>
											{remarkLoading ? (
												<Loader2 className="animate-spin h-4 w-4" />
											) : (
												"Send"
											)}
										</Button>
									</SheetFooter>
								</div>
							</div>
						) : (
							<>
								{/* ================================================== */}
								{/* TIMELINE STAGE LIST */}
								{/* ================================================== */}
								<div className="sticky top-0 bg-white pb-3 border-b pt-3 z-20">
									<SheetHeader>
										<SheetTitle className="text-lg font-bold">
											Work Stages
										</SheetTitle>
										<SheetDescription className="text-gray-600">
											Click a stage to view remarks
										</SheetDescription>
									</SheetHeader>
								</div>

								<div className="mt-6 max-h-[80vh] relative pl-10 space-y-6 p-4">
									<div className="absolute top-2 left-5 w-[3px] h-full bg-gradient-to-b from-green-500 via-gray-300 to-gray-300 rounded-full"></div>

									{openProjectSheet.projectStages.length > 0 ? (
										openProjectSheet.projectStages.map((s, index) => {

											const status = s.status?.toLowerCase();

											// STATUS TYPES
											const isApproved = status === "approved";
											const isCompleted = status === "completed";
											const isRejected = status === "rejected";
											const isPending = status === "pending" || status === "in_progress";

											// Check previous completed stage
											const prevDone =
												index === 0 ||
												["approved", "completed"].includes(
													openProjectSheet.projectStages[index - 1].status
												);

											const isCurrent = isPending && prevDone;

											// ICON UI
											const icon = (() => {
												if (isApproved)
													return (
														<div className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
															✓
														</div>
													);

												if (isCompleted)
													return (
														<div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
															✓
														</div>
													);

												if (isRejected)
													return (
														<div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
															✗
														</div>
													);

												if (isCurrent)
													return (
														<div className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shadow-md">
															{index + 1}
														</div>
													);

												return (
													<div className="h-6 w-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs">
														{index + 1}
													</div>
												);
											})();

											return (
												<div
													key={s.id}
													onClick={() => openStageSheet(s)}
													className="relative flex items-start gap-4 cursor-pointer"
												>
													{/* CIRCLE ICON */}
													<div className="relative z-10 mt-1">
														{icon}
													</div>

													{/* NAME + STATUS */}
													<div className="flex flex-col">
														<p
															className={`text-[16px] font-medium ${
																isCurrent
																	? "bg-gray-100 border px-3 py-1.5 rounded-lg shadow-sm"
																	: "text-gray-700"
															}`}
														>
															{s.StageTemplate?.name || s.name}
														</p>

														{/* STATUS LABEL */}
														<p className="text-xs mt-1">
															{isApproved && (
																<span className="text-green-600 font-semibold">Approved</span>
															)}
															{isCompleted && (
																<span className="text-blue-600 font-semibold">Completed</span>
															)}
															{isRejected && (
																<span className="text-red-600 font-semibold">Rejected</span>
															)}
															{isPending && (
																<span className="text-gray-500">Pending</span>
															)}
														</p>
													</div>
												</div>
											);
										})
									) : (
										<p className="text-gray-500 text-center py-4">No stages found</p>
									)}

								</div>
							</>
						)}
					</SheetContent>
				</Sheet>
			)}

			{/* ======================================================== */}
			{/* DRAWING PREVIEW MODAL */}
			{/* ======================================================== */}
			{previewFile && (
				<Dialog open={true} onOpenChange={() => setPreviewFile(null)}>
					<DialogContent className="max-w-screen flex flex-col">
						<DialogHeader>
							<DialogTitle>Drawing Preview</DialogTitle>
							<p className="text-sm text-gray-600">
								{previewDrawing?.title}
							</p>
						</DialogHeader>

						<div className="flex-1 overflow-auto bg-gray-100 rounded p-2 border">
							{isPDF(previewFile) && (
								<iframe
									src={previewFile}
									className="w-full h-full rounded"
								/>
							)}

							{isImage(previewFile) && (
								<img
									src={previewFile}
									className="w-full h-auto mx-auto rounded shadow-lg"
								/>
							)}

							{isVideo(previewFile) && (
								<video controls className="w-full rounded shadow-lg">
									<source src={previewFile} />
								</video>
							)}
						</div>

						{/* Thumbnail strip */}
						{projectDrawings.length > 1 && (
							<div className="flex gap-3 mt-3 overflow-x-auto border-t pt-3">
								{projectDrawings.map((pf) => (
									<div
										key={pf.id}
										onClick={() => openPreview(pf, projectDrawings)}
										className={`border rounded cursor-pointer p-1 ${
											previewFile === pf.fileUrl
												? "border-blue-500"
												: "border-gray-300"
										}`}
									>
										{isImage(pf.fileUrl) ? (
											<img
												src={pf.fileUrl}
												className="w-20 h-20 object-cover rounded"
											/>
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

							<Button onClick={() => setPreviewFile(null)}>
								Close
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

