"use client";

import { useEffect, useState, useRef } from "react";
import {
	Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {
	Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Loader2,
	Users,
	Briefcase,
	FolderKanban,
	Wallet,
	Bell,
	FileText,
	MessageCircle
} from "lucide-react";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter
} from "@/components/ui/sheet";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard({ setActivePage }) {
	const [stats, setStats] = useState({
		clients: 0,
		contractors: 0,
		projects: 0,
		payments: 0,
	});

	const [newQueries, setNewQueries] = useState(0);

	const [tableLoading, setTableLoading] = useState(false);
	const [selectedView, setSelectedView] = useState(null);
	const [tableData, setTableData] = useState([]);

	const [openProjectDialog, setOpenProjectDialog] = useState(null);

	const [previewFile, setPreviewFile] = useState(null);
	const [selectedDrawing, setSelectedDrawing] = useState(null);
	const [projectFiles, setProjectFiles] = useState([]);

	// ✅ Remark Sheet State
	const [remarkSheetStage, setRemarkSheetStage] = useState(null);
	const [newRemark, setNewRemark] = useState("");
	const [remarkLoading, setRemarkLoading] = useState(false);
	const [remarkFetchLoading, setRemarkFetchLoading] = useState(false);

	const remarkEndRef = useRef(null);

	useEffect(() => {
		fetchStats();
		fetchNewQueries();
	}, []);

	useEffect(() => {
		if (remarkEndRef.current) {
			remarkEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [remarkSheetStage]);

	async function fetchStats() {
		const [clientsRes, contractorsRes, projectsRes] = await Promise.all([
			fetch("/api/clients"),
			fetch("/api/contractors"),
			fetch("/api/projects"),
		]);

		const clientsData = await clientsRes.json();
		const contractorsData = await contractorsRes.json();
		const projectsData = await projectsRes.json();

		setStats({
			clients: clientsData?.clients?.length || 0,
			contractors: contractorsData?.contractors?.length || 0,
			projects: projectsData?.projects?.length || 0,
			payments: 0,
		});
	}

	async function fetchNewQueries() {
		const res = await fetch("/api/queries/count");
		const data = await res.json();
		setNewQueries(data.newQueries || 0);
	}

	// ✅ OPEN REMARKS — real-time fetch with loader
	const openRemarks = async (stage) => {
		setRemarkSheetStage({ ...stage, remarks: [] }); // show empty UI until fetch completes
		setRemarkFetchLoading(true);

		const res = await fetch(`/api/stages/${stage.id}`);
		const data = await res.json();

		if (data.success) {
			const sorted = (data.stage.remarks || []).sort(
				(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
			);

			setRemarkSheetStage({ ...data.stage, remarks: sorted });
		} else {
			setRemarkSheetStage(stage);
		}

		setRemarkFetchLoading(false);
	};

	async function loadDetails(type) {
		setSelectedView(type);
		setTableLoading(true);
		setTableData([]);

		const [projectsRes, stagesRes, drawingRes, clientsRes, contractorsRes] = await Promise.all([
			fetch("/api/projects"),
			fetch("/api/stages"),
			fetch("/api/drawings"),
			fetch("/api/clients"),
			fetch("/api/contractors"),
		]);

		const projects = await projectsRes.json();
		const stages = await stagesRes.json();
		const drawings = await drawingRes.json();
		const clients = await clientsRes.json();
		const contractors = await contractorsRes.json();

		if (type === "projects") {
			const mapped = projects.projects.map((project) => {
				const projectStages = stages.stages.filter((s) => s.projectId === project.id);
				const projectDrawings = drawings.filter((d) => d.projectId === project.id);
				return {
					...project,
					projectStages,
					projectDrawings,
					projectTypeName: project?.projectType?.name || "Unknown",
				};
			});
			setTableData(mapped);
		}

		if (type === "clients") {
			const mapped = clients.clients.map((c) => {
				const clientProjects = projects.projects.filter((p) => p.clientId === c.id);

				return {
					...c,
					totalProjects: clientProjects.length,
					projectNames: clientProjects
						.map((p) => `${p.title} (${p.projectType?.name || "-"})`)
						.join(", ") || "-",
				};
			});
			setTableData(mapped);
		}

		if (type === "contractors") {
			const mapped = contractors.contractors.map((ct) => {
				const contractorProjects = projects.projects.filter((p) => p.contractorId === ct.id);

				return {
					...ct,
					totalProjects: contractorProjects.length,
					projectNames: contractorProjects
						.map((p) => `${p.title} (${p.projectType?.name || "-"})`)
						.join(", ") || "-",
				};
			});
			setTableData(mapped);
		}

		setTableLoading(false);
	}

	const statusBadge = (s) =>
		s.isCompleted ? (
			<Badge className="bg-green-600 text-white px-2">Completed</Badge>
		) : (
			<Badge className="bg-gray-600 text-white px-2">Pending</Badge>
		);

	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	// ✅ SEND REMARK — instantly update & refetch
	const sendRemark = async () => {
		if (!newRemark.trim()) return;
		setRemarkLoading(true);

		await fetch(`/api/stages/${remarkSheetStage.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				remark: newRemark,
				by: "admin",
			}),
		});

		setNewRemark("");
		setRemarkLoading(false);

		// ✅ fetch latest messages
		openRemarks(remarkSheetStage);
	};

	const openPreview = (drawing) => {
		setPreviewFile(drawing.fileUrl);
		setSelectedDrawing(drawing);
		setProjectFiles(openProjectDialog?.projectDrawings || []);
	};

	return (
		<div className="min-h-screen bg-gray-50 px-6 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

				<div className="relative cursor-pointer" onClick={() => setActivePage("Query")}>
					<Bell className="h-7 w-7 text-gray-700" />
					{newQueries > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
							{newQueries}
						</span>
					)}
				</div>
			</div>

			{/* DASHBOARD CARDS */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card onClick={() => loadDetails("projects")} className="hover:shadow-xl cursor-pointer">
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Projects</CardTitle>
						<FolderKanban className="h-7 w-7 text-purple-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-purple-700">{stats.projects}</p>
						<p className="text-xs text-gray-400 mt-1">Click to view projects</p>
					</CardContent>
				</Card>

				<Card onClick={() => loadDetails("clients")} className="hover:shadow-xl cursor-pointer">
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Clients</CardTitle>
						<Users className="h-7 w-7 text-blue-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-blue-700">{stats.clients}</p>
						<p className="text-xs text-gray-400 mt-1">Click to view clients</p>
					</CardContent>
				</Card>

				<Card onClick={() => loadDetails("contractors")} className="hover:shadow-xl cursor-pointer">
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Contractors</CardTitle>
						<Briefcase className="h-7 w-7 text-green-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-green-700">{stats.contractors}</p>
						<p className="text-xs text-gray-400 mt-1">Click to view contractors</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Payments</CardTitle>
						<Wallet className="h-7 w-7 text-teal-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-teal-700">₹ {stats.payments}</p>
					</CardContent>
				</Card>
			</div>

			{/* TABLE VIEW */}
			{selectedView && (
				<Card className="shadow-lg p-6 bg-white rounded-xl">
					<h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 capitalize">
						{selectedView} List
					</h2>

					{tableLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin h-10 w-10 text-gray-700" />
						</div>
					) : (
						<div className="overflow-auto max-h-[65vh] border rounded-lg">
							<Table>
								<TableHeader className="bg-gray-100">
									<TableRow>
										{selectedView === "projects" && (
											<>
												<TableHead>Project</TableHead>
												<TableHead>Client</TableHead>
												<TableHead>Contractor</TableHead>
												<TableHead>Total Cost</TableHead>
												<TableHead></TableHead>
											</>
										)}

										{selectedView === "clients" && (
											<>
												<TableHead>Client ID</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Phone</TableHead>
												<TableHead>Total Projects</TableHead>
												<TableHead>Projects</TableHead>
											</>
										)}

										{selectedView === "contractors" && (
											<>
												<TableHead>Contractor ID</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Phone</TableHead>
												<TableHead>Total Projects</TableHead>
												<TableHead>Projects</TableHead>
											</>
										)}
									</TableRow>
								</TableHeader>

								<TableBody>
									{tableData.map((item) => (
										<TableRow key={item.id}>
											{selectedView === "projects" && (
												<>
													<TableCell>
														{item.title}{" "}
														<span className="text-xs text-gray-500">
															({item.projectTypeName})
														</span>
													</TableCell>
													<TableCell>{item.client?.name || "-"}</TableCell>
													<TableCell>{item.contractor?.name || "-"}</TableCell>
													<TableCell>₹ {item.totalCost || "-"}</TableCell>
													<TableCell>
														<Button
															variant="outline"
															size="sm"
															onClick={() => setOpenProjectDialog(item)}
														>
															View
														</Button>
													</TableCell>
												</>
											)}

											{selectedView === "clients" && (
												<>
													<TableCell>{item.clientId}</TableCell>
													<TableCell>{item.name}</TableCell>
													<TableCell>{item.phone}</TableCell>
													<TableCell>{item.totalProjects}</TableCell>
													<TableCell>{item.projectNames}</TableCell>
												</>
											)}

											{selectedView === "contractors" && (
												<>
													<TableCell>{item.contractorId}</TableCell>
													<TableCell>{item.name}</TableCell>
													<TableCell>{item.phone}</TableCell>
													<TableCell>{item.totalProjects}</TableCell>
													<TableCell>{item.projectNames}</TableCell>
												</>
											)}
										</TableRow>
									))}

									{tableData.length === 0 && (
										<TableRow>
											<TableCell className="text-center py-4 text-gray-500" colSpan={6}>
												No records found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</Card>
			)}

			{/* PROJECT DETAILS */}
			{openProjectDialog && (
				<Dialog open={true} onOpenChange={() => setOpenProjectDialog(null)}>
					<DialogContent className="max-w-3xl">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								Project — {openProjectDialog.title}
							</DialogTitle>

							<p className="text-sm text-gray-600">
								Project Type: {openProjectDialog.projectTypeName || openProjectDialog.projectType?.name || "Unknown"}
							</p>
						</DialogHeader>

						<Tabs defaultValue="stages" className="mt-2">
							<TabsList>
								<TabsTrigger value="stages">Stages</TabsTrigger>
								<TabsTrigger value="drawings">Drawings</TabsTrigger>
							</TabsList>

							<TabsContent value="stages">
								<ScrollArea className="max-h-[60vh] pr-2">
									{openProjectDialog.projectStages.length > 0 ? (
										openProjectDialog.projectStages.map((s) => (
											<div
												key={s.id}
												className="border rounded-md p-3 mb-2 bg-gray-50 shadow-sm flex justify-between items-center"
											>
												<div>
													<p className="font-medium">{s.name}</p>
													<p className="text-sm text-gray-600">{s.description || "-"}</p>
												</div>

												<div className="flex items-center gap-2">
													{statusBadge(s)}
													<Button
														size="icon"
														variant="outline"
														onClick={() => openRemarks(s)}
													>
														<MessageCircle className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))
									) : (
										<p className="text-sm text-gray-500 mt-2">No stages found</p>
									)}
								</ScrollArea>
							</TabsContent>

							<TabsContent value="drawings">
								<ScrollArea className="max-h-[60vh] pr-2">
									{openProjectDialog.projectDrawings.length > 0 ? (
										openProjectDialog.projectDrawings.map((d) => (
											<div
												key={d.id}
												className="border rounded-md p-3 mb-2 bg-white shadow flex justify-between items-center"
											>
												<div className="flex items-center gap-2">
													<FileText className="text-purple-600 w-5 h-5" />
													{d.title}
												</div>

												<Button
													size="sm"
													variant="outline"
													onClick={() => openPreview(d)}
												>
													View
												</Button>
											</div>
										))
									) : (
										<p className="text-sm text-gray-500 mt-2">No drawings found</p>
									)}
								</ScrollArea>
							</TabsContent>
						</Tabs>
					</DialogContent>
				</Dialog>
			)}

			{previewFile && (
				<Dialog open={true} onOpenChange={() => setPreviewFile(null)}>
					<DialogContent className="max-w-4xl h-auto flex flex-col">
						<DialogHeader>
							<DialogTitle>Preview File</DialogTitle>
							<p className="text-sm text-gray-600">{selectedDrawing?.title}</p>
						</DialogHeader>

						<div className="flex-1 overflow-auto bg-gray-100 rounded p-1">
							{previewFile.endsWith(".pdf") ? (
								<iframe src={previewFile} className="w-full h-full rounded" />
							) : (
								<img
									src={previewFile}
									alt="Preview"
									className="w-full h-auto mx-auto rounded shadow"
								/>
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
										<img src={pf.fileUrl} className="w-20 h-20 object-cover rounded" />
									</div>
								))}
							</div>
						)}

						<div className="mt-3 flex justify-end">
							<Button onClick={() => setPreviewFile(null)}>Close</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* ✅ REMARK SHEET — ALWAYS FETCH FRESH DATA */}
			{remarkSheetStage && (
				<Sheet open={true} onOpenChange={() => setRemarkSheetStage(null)}>
					<SheetContent className="w-[420px] overflow-auto">
						<SheetHeader>
							<SheetTitle>Conversation — {remarkSheetStage.name}</SheetTitle>
						</SheetHeader>

						<div className="mt-4 space-y-4 px-2">
							{remarkFetchLoading ? (
								<div className="flex justify-center py-6">
									<Loader2 className="h-6 w-6 animate-spin" />
								</div>
							) : remarkSheetStage?.remarks?.length > 0 ? (
								remarkSheetStage.remarks.map((r) => {
									let bubbleColor = "bg-gray-200 border-gray-300";
									let label = "User";

									if (r.by === "admin") {
										bubbleColor = "bg-red-100 border-red-300";
										label = "Admin";
									}
									if (r.by === "contractor") {
										bubbleColor = "bg-blue-100 border-blue-300";
										label = "Contractor";
									}
									if (r.by === "client") {
										bubbleColor = "bg-green-100 border-green-300";
										label = "Client";
									}

									return (
										<div
											key={r.id}
											className={`p-3 rounded-lg shadow-sm text-sm max-w-[90%] border ${bubbleColor} ${
												r.by === "admin" ? "ml-auto" : ""
											}`}
										>
											<b className="text-xs">{label}</b>
											<p className="mt-1">{r.message}</p>
											<p className="text-[10px] opacity-50 mt-1">{formatDate(r.createdAt)}</p>
										</div>
									);
								})
							) : (
								<p className="text-sm text-gray-500">No remarks yet</p>
							)}

							<div ref={remarkEndRef} />

							<Separator className="my-2" />

							<Textarea
								placeholder="Write a message..."
								value={newRemark}
								onChange={(e) => setNewRemark(e.target.value)}
								className="h-24"
							/>

							<SheetFooter>
								<Button className="w-full" disabled={remarkLoading} onClick={sendRemark}>
									{remarkLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send"}
								</Button>
							</SheetFooter>
						</div>
					</SheetContent>
				</Sheet>
			)}
		</div>
	);
}
