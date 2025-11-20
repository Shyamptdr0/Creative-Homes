"use client";

import React, { useEffect, useState, useRef } from "react";
import {
	Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";

import {
	Table, TableHeader, TableRow, TableHead,
	TableBody, TableCell
} from "@/components/ui/table";

import {
	Pagination, PaginationContent, PaginationItem,
	PaginationPrevious, PaginationNext
} from "@/components/ui/pagination";

import {
	Loader2, FolderKanban, Wallet, Bell, FileText,
	Image as ImageIcon, Video, File, Download,
	ListChecks, PencilRuler, ChevronLeft
} from "lucide-react";

import {
	Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

import {
	Sheet, SheetContent, SheetHeader,
	SheetTitle, SheetDescription
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ContractorDashboard({ setActivePage }) {

	/* -------------------------------------------
		  STATES
	--------------------------------------------*/
	const [stats, setStats] = useState({ projects: 0, payments: 0 });
	const [newQueries, setNewQueries] = useState(0);

	const [selectedView, setSelectedView] = useState(null);
	const [tableData, setTableData] = useState([]);
	const [tableLoading, setTableLoading] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	const paginatedData = tableData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// PROJECT SHEET
	const [openProjectSheet, setOpenProjectSheet] = useState(null);

	// CHAT
	const [selectedStage, setSelectedStage] = useState(null);
	const [stageRemarks, setStageRemarks] = useState([]);
	const [remarkText, setRemarkText] = useState("");
	const [remarkLoading, setRemarkLoading] = useState(false);
	const [remarkFetching, setRemarkFetching] = useState(false);
	const remarkEndRef = useRef(null);

	// DRAWINGS
	const [previewFile, setPreviewFile] = useState(null);
	const [previewDrawing, setPreviewDrawing] = useState(null);
	const [projectDrawings, setProjectDrawings] = useState([]);

	// APPROVAL POPUP
	const [pendingApprovalProject, setPendingApprovalProject] = useState(null);

	/* -------------------------------------------
		   FETCH STATS + QUERIES + POPUP
	--------------------------------------------*/
	async function checkApprovalPopup() {
		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/projects", {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();
		const pending = data?.projects?.find(p => !p.contractorApproved);

		if (pending) setPendingApprovalProject(pending);
	}

	async function fetchStats() {
		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/projects", {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();
		setStats({
			projects: data.projects?.length || 0,
			payments: data.payments || 0
		});
	}

	async function fetchNewQueries() {
		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/queries", {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();
		setNewQueries(data.newQueries || 0);
	}

	useEffect(() => {
		fetchStats();
		fetchNewQueries();
		checkApprovalPopup();
	}, []);

	/* -------------------------------------------
		  LOAD PROJECT TABLE (WITH UNREAD)
	--------------------------------------------*/
	async function loadProjectsTable() {
		setSelectedView("projects");
		setTableLoading(true);

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
					const sRes = await fetch(`/api/project-stages/list?projectId=${p.id}`, {
						headers: { Authorization: `Bearer ${token}` }
					});

					const stageData = await sRes.json();
					const stages = stageData.stages || [];

					const unreadTotal = stages.reduce(
						(sum, st) => sum + (st.unreadRemarks || 0), 0
					);

					return {
						...p,
						projectTypeName: projectTypes.find(t => t.id === p.projectTypeId)?.name || "N/A",
						projectStages: stages,
						unreadRemarksTotal: unreadTotal
					};
				})
			);

			setTableData(fullData);

		} finally {
			setTableLoading(false);
		}
	}
	/* -------------------------------------------
		  FILE TYPE HELPERS
	--------------------------------------------*/
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

		const a = document.createElement("a");
		const ext = previewFile.split(".").pop();

		a.href = url;
		a.download = `${previewDrawing.title}.${ext}`;
		document.body.appendChild(a);
		a.click();
		a.remove();

		URL.revokeObjectURL(url);
	};

	/* -------------------------------------------
		  APPROVE PROJECT POPUP
	--------------------------------------------*/
	async function approveProject() {
		const token = sessionStorage.getItem("token");

		await fetch(`/api/projects/${pendingApprovalProject.id}/approve`, {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` }
		});

		setPendingApprovalProject(null);
		checkApprovalPopup();
	}

	/* -------------------------------------------
		  OPEN STAGE CHAT PANEL
	--------------------------------------------*/
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

	/* -------------------------------------------
		  SEND REMARK
	--------------------------------------------*/
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
			body: JSON.stringify({ message: remarkText, by: "contractor" })
		});

		setRemarkText("");

		// refresh chat
		openStageSheet(selectedStage);

		setRemarkLoading(false);
	};

	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});

	useEffect(() => {
		remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [stageRemarks]);

	/* -------------------------------------------
		  FLOOR SORTING
	--------------------------------------------*/
	function sortFloors(name) {
		const n = name.toLowerCase();

		if (n.includes("basement")) return -2;
		if (n.includes("ground")) return -1;

		const num = n.match(/\d+/);
		if (num) return parseInt(num[0]);

		if (n.includes("terrace") || n.includes("roof")) return 999;

		return 500;
	}
	/* -------------------------------------------
		  UI START
	--------------------------------------------*/
	return (
		<div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">

			{/* ------------------------------------------- */}
			{/* APPROVAL POPUP */}
			{/* ------------------------------------------- */}
			{pendingApprovalProject && (
				<Dialog open={true}>
					<DialogContent className="max-w-lg text-center space-y-4">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								Approve New Project
							</DialogTitle>
						</DialogHeader>

						<p className="text-gray-700">
							A new project was assigned to you. Please approve to continue.
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

			{/* ------------------------------------------- */}
			{/* DASHBOARD HEADER */}
			{/* ------------------------------------------- */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					Contractor Dashboard
				</h1>

				{/* 🔔 NEW QUERIES BADGE */}
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

			{/* ------------------------------------------- */}
			{/* TOP CARDS (Projects / Stages / Drawings / Payments) */}
			{/* ------------------------------------------- */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

				{/* PROJECTS CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur
          border border-purple-200 hover:scale-[1.01] transition"
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
						<p className="text-xs text-gray-400">Click to view</p>
					</CardContent>
				</Card>

				{/* STAGES CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur
          border border-blue-200 hover:scale-[1.01] transition"
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

				{/* DRAWINGS CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur
          border border-orange-200 hover:scale-[1.01] transition"
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

				{/* PAYMENTS CARD */}
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

			{/* ------------------------------------------- */}
			{/* PROJECT TABLE (ADMIN STYLE) */}
			{/* ------------------------------------------- */}
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
												<TableCell colSpan="5" className="text-center text-gray-500 py-6">
													No projects found
												</TableCell>
											</TableRow>
										) : (
											paginatedData.map((p, i) => (
												<TableRow key={i} className="hover:bg-gray-50 transition">
													<TableCell>{p.title}</TableCell>
													<TableCell>{p.projectTypeName}</TableCell>
													<TableCell>{p.client?.name}</TableCell>
													<TableCell>₹ {p.totalCost || "-"}</TableCell>

													{/* ACTION BUTTON + PROJECT UNREAD BADGE */}
													<TableCell className="flex gap-2 justify-center">
														<div className="relative inline-block">
															<Button
																variant="default"
																size="sm"
																onClick={() => setOpenProjectSheet(p)}
															>
																View Stages
															</Button>

															{/* 🔥 UNREAD PROJECT BADGE (SUM OF ALL STAGES) */}
															{p.unreadRemarksTotal > 0 && (
																<span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-[5px] h-4 min-w-4 flex items-center justify-center rounded-full shadow">
                                  {p.unreadRemarksTotal}
                                </span>
															)}
														</div>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>

							{/* PAGINATION */}
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
												onClick={() =>
													currentPage < totalPages && setCurrentPage(currentPage + 1)
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
			{/* ----------------------------------------------------- */}
			{/* PROJECT SHEET — FLOORWISE STAGES + CHAT PANEL */}
			{/* ----------------------------------------------------- */}
			{openProjectSheet && (
				<Sheet
					open={true}
					onOpenChange={() => {
						setOpenProjectSheet(null);
						setSelectedStage(null);
					}}
				>
					<SheetContent side="right" className="w-[470px] p-0 flex flex-col">

						{/* HEADER – always visible */}
						<SheetHeader className="p-4 border-b bg-white">
							<SheetTitle className="text-xl font-bold">
								{openProjectSheet.title}
							</SheetTitle>
							<SheetDescription>
								Project Type: {openProjectSheet.projectTypeName}
							</SheetDescription>
						</SheetHeader>


						{!selectedStage && (
							<div className="max-h-[85vh] overflow-y-auto p-5 relative">

								{Object.entries(
									openProjectSheet.projectStages.reduce((acc, s) => {
										const floor = s.floorName || "Other";
										(acc[floor] = acc[floor] || []).push(s);
										return acc;
									}, {})
								)
									.sort(([a], [b]) => sortFloors(a) - sortFloors(b))
									.map(([floor, stages]) => (

										<div key={floor} className="mb-6 relative">

											{/* FLOOR TITLE */}
											<h3 className="text-lg font-semibold bg-gray-100 p-2 rounded">
												{floor}
											</h3>

											{/* FIXED TIMELINE STRIP (ONE PER FLOOR) */}
											<div
												className="absolute left-[16px] top-[48px] bottom-0 w-[4px]
				                                        bg-gradient-to-b from-green-500 via-gray-300 to-gray-300 rounded-full"
											/>

											{/* STAGES */}
											<div className="relative pl-8 space-y-7 mt-4">

												{stages.map((s, index) => {
													const status = s.status?.toLowerCase();
													const isApproved = status === "approved";
													const isCompleted = status === "completed";
													const isRejected = status === "rejected";
													const isPending = status === "pending" || status === "in_progress";

													const prevDone =
														index === 0 ||
														["approved", "completed"].includes(stages[index - 1].status);

													const isCurrent = isPending && prevDone;

													const icon = (() => {
														if (isApproved)
															return <div className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center shadow">✓</div>;
														if (isCompleted)
															return <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">✓</div>;
														if (isRejected)
															return <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow">✗</div>;
														if (isCurrent)
															return <div className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center shadow">{index + 1}</div>;

														return <div className="h-6 w-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center">{index + 1}</div>;
													})();

													return (
														<div
															key={s.id}
															onClick={() => openStageSheet(s)}
															className="relative flex items-center gap-4 cursor-pointer"
														>
															<div className="relative z-10">{icon}</div>

															<div className="flex flex-col">
																<div className="flex items-center gap-2">

																	{/* STAGE NAME */}
																	<p className={`text-[16px] font-medium ${
																		isCurrent
																			? "bg-gray-100 border px-3 py-1.5 rounded-lg shadow"
																			: "text-gray-700"
																	}`}>
																		{s.StageTemplate?.name || s.name}
																	</p>

																	{/* UNREAD BADGE */}
																	{s.unreadRemarks > 0 && (
																		<span className="bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full shadow">
											{s.unreadRemarks}
										</span>
																	)}

																</div>

																{/* STATUS */}
																<p className="text-xs mt-1">
																	{isApproved && <span className="text-green-600 font-semibold">Approved</span>}
																	{isCompleted && <span className="text-blue-600 font-semibold">Completed</span>}
																	{isRejected && <span className="text-red-600 font-semibold">Rejected</span>}
																	{isPending && <span className="text-gray-500">Pending</span>}
																</p>
															</div>
														</div>
													);
												})}

											</div>
										</div>
									))}


							</div>
						)}

						{/* ------------------------------------------------- */}
						{/* VIEW 2: CHAT PANEL (when stage selected) */}
						{/* ------------------------------------------------- */}
						{selectedStage && (
							<div className="flex flex-col h-full">

								{/* HEADER */}
								<div className="px-4 py-3 border-b bg-white sticky top-0 z-30 shadow-sm">
									<div className="flex items-center gap-3">
										<Button variant="ghost" size="icon" onClick={() => setSelectedStage(null)}>
											<ChevronLeft className="h-5 w-5" />
										</Button>

										<h3 className="font-semibold text-lg">
											{selectedStage.StageTemplate?.name || selectedStage.name}
										</h3>
									</div>
								</div>

								{/* CHAT BODY */}
								<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-100"
								     style={{ paddingBottom: "110px" }}
								>
									{remarkFetching ? (
										<div className="flex justify-center py-10">
											<Loader2 className="h-6 w-6 animate-spin" />
										</div>
									) : (
										stageRemarks.map((r, i) => {
											const msgDate = new Date(r.createdAt);
											const isMe = r.by === "contractor";

											return (
												<div key={r.id}>

													<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
														<div
															className={`max-w-[75%] px-3 py-2 rounded-xl border shadow-sm
                          ${isMe
																? "bg-primary text-primary-foreground border-primary"
																: r.by === "admin"
																	? "bg-red-200 border-red-300 text-red-900"
																	: "bg-white border-gray-300 text-gray-800"
															}
                        `}
														>
															<p className="text-[10px] opacity-70 mb-1">
																{isMe ? "You" : r.by === "admin" ? "Admin" : "Client"}
															</p>

															<p className="whitespace-pre-wrap">{r.message}</p>

															<p className="text-[10px] opacity-70 text-right mt-1">
																{msgDate.toLocaleTimeString("en-IN", {
																	hour: "2-digit",
																	minute: "2-digit"
																})}
															</p>

														</div>
													</div>

												</div>
											);
										})
									)}

									<div ref={remarkEndRef} />

								</div>

								{/* SEND BOX */}
								<div className="p-3 bg-white border-t flex gap-2 sticky bottom-0 z-40 shadow">
									<Textarea
										placeholder="Type message..."
										value={remarkText}
										onChange={(e) => setRemarkText(e.target.value)}
										className="h-16 resize-none flex-1"
									/>

									<Button className="h-16 px-6 rounded-xl"
									        disabled={remarkLoading}
									        onClick={sendRemark}
									>
										{remarkLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send"}
									</Button>

								</div>

							</div>
						)}

					</SheetContent>
				</Sheet>
			)}




			{previewFile && (
				<Dialog open={true} onOpenChange={() => setPreviewFile(null)}>
					<DialogContent className="max-w-screen-lg max-h-screen flex flex-col overflow-hidden">
						<DialogHeader>
							<DialogTitle className="text-lg font-bold">Drawing Preview</DialogTitle>
							<p className="text-sm text-gray-600">{previewDrawing?.title}</p>
						</DialogHeader>

						{/* MAIN PREVIEW */}
						<div className="flex-1 overflow-auto bg-gray-100 border rounded p-3">
							{isPDF(previewFile) && (
								<iframe src={previewFile} className="w-full h-full border rounded" />
							)}

							{isImage(previewFile) && (
								<img src={previewFile} className="w-full h-auto mx-auto rounded shadow-lg" />
							)}

							{isVideo(previewFile) && (
								<video controls className="w-full rounded shadow-lg">
									<source src={previewFile} />
								</video>
							)}
						</div>

						{/* THUMB LIST */}
						{projectDrawings.length > 1 && (
							<div className="flex gap-3 mt-3 overflow-x-auto border-t pt-3">
								{projectDrawings.map((pf) => (
									<div
										key={pf.id}
										onClick={() => openPreview(pf, projectDrawings)}
										className={`border rounded cursor-pointer p-1 transition ${
											previewFile === pf.fileUrl
												? "border-blue-500 shadow-md"
												: "border-gray-300 hover:border-blue-300"
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

						{/* FOOTER */}
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
