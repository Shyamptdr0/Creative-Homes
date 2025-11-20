"use client";

import React, {useEffect, useState, useRef} from "react";
import {
	Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {
	Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Separator} from "@/components/ui/separator";

import {
	Loader2, Users, Briefcase, FolderKanban, Wallet, Bell, ChevronLeft
} from "lucide-react";

import {
	Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";

import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export default function AdminDashboard({setActivePage}) {

	// STATES
	const [stats, setStats] = useState({
		clients: 0, contractors: 0, projects: 0, payments: 0,
	});
	const [newQueries, setNewQueries] = useState(0);
	const [tableLoading, setTableLoading] = useState(false);
	const [selectedView, setSelectedView] = useState(null);
	const [tableData, setTableData] = useState([]);

	// PROJECT SHEET
	const [openProjectSheet, setOpenProjectSheet] = useState(null);

	// STAGE CHAT
	const [selectedStage, setSelectedStage] = useState(null);
	const [stageRemarks, setStageRemarks] = useState([]);
	const [remarkText, setRemarkText] = useState("");
	const [remarkLoading, setRemarkLoading] = useState(false);
	const [remarkFetching, setRemarkFetching] = useState(false);

	const remarkEndRef = useRef(null);

	// CONTRACTOR DIALOG STATES
	const [openContractorDialog, setOpenContractorDialog] = useState(false);
	const [selectedContractor, setSelectedContractor] = useState(null);
	const [contractorProjects, setContractorProjects] = useState([]);

	// OPEN DIALOG FOR CONTRACTOR PROJECTS
	function toggleRow(contractor) {
		setSelectedContractor(contractor);
		loadContractorProjects(contractor);
		setOpenContractorDialog(true);
	}


	async function loadContractorProjects(contractor) {
		const res = await fetch("/api/projects");
		const data = await res.json();
		const projects = data.projects.filter((p) => p.contractorId === contractor.id);
		setContractorProjects(projects);
	}

	useEffect(() => {
		fetchStats();
		fetchNewQueries();
	}, []);

	useEffect(() => {
		if (remarkEndRef.current) {
			remarkEndRef.current.scrollIntoView({behavior: "smooth"});
		}
	}, [stageRemarks]);

	/* ------------------------------
	   FETCH STATS
	------------------------------ */
	async function fetchStats() {
		const [clientsRes, contractorsRes, projectsRes] = await Promise.all([fetch("/api/clients"), fetch("/api/contractors"), fetch("/api/projects"),]);

		const c = await clientsRes.json();
		const ct = await contractorsRes.json();
		const p = await projectsRes.json();

		setStats({
			clients: c.clients?.length || 0,
			contractors: ct.contractors?.length || 0,
			projects: p.projects?.length || 0,
			payments: 0,
		});
	}

	async function fetchNewQueries() {
		const res = await fetch("/api/queries/count");
		const data = await res.json();
		setNewQueries(data.newQueries || 0);
	}

	/* ------------------------------
	   LOAD TABLE DATA
	------------------------------ */
	async function loadDetails(type) {
		setSelectedView(type);
		setTableLoading(true);

		const [projectsRes, clientsRes, contractorsRes] = await Promise.all([fetch("/api/projects"), fetch("/api/clients"), fetch("/api/contractors")]);

		const projects = await projectsRes.json();
		const clients = await clientsRes.json();
		const contractors = await contractorsRes.json();

		if (type === "projects") {

			const token = sessionStorage.getItem("token");

			const enhanced = await Promise.all(
				projects.projects.map(async (proj) => {
					const res = await fetch(`/api/project-stages/list?projectId=${proj.id}`, {
						headers: { Authorization: `Bearer ${token}` }
					});
					const data = await res.json();

					const stages = data.stages || [];

					return {
						...proj,
						projectStages: stages,
						unreadCount: stages.reduce(
							(sum, s) => sum + (s.unreadRemarks || 0),
							0
						),
					};
				})
			);

			setTableData(enhanced);
		}


		if (type === "clients") {
			const mapped = clients.clients.map((c) => {
				const cps = projects.projects.filter(p => p.clientId === c.id);

				return {
					...c,
					totalProjects: cps.length,
					projectNames: cps.map(p => p.title).join(", ") || "-",
					projectUids: cps.map(p => p.projectUid)
				};
			});

			setTableData(mapped);
		}

		if (type === "contractors") {
			const mapped = contractors.contractors.map((ct) => {
				const cps = projects.projects.filter(p => p.contractorId === ct.id);

				return {
					...ct,
					totalProjects: cps.length,
					projectNames: cps.map(p => p.title).join(", ") || "-",
					projectUids: cps.map(p => p.projectUid)
				};
			});

			setTableData(mapped);
		}

		setTableLoading(false);
	}

	function formatProjectStatus(project) {
		const {status, clientApproved, contractorApproved} = project;

		// If project is pending
		if (status === "pending_approval") {
			if (!clientApproved && !contractorApproved) return "Pending Approval (Client + Contractor)";
			if (!clientApproved) return "Pending (Client Approval)";
			if (!contractorApproved) return "Pending (Contractor Approval)";
		}

		// Normal statuses
		const mapping = {
			approved: "Approved", planned: "Planned", in_progress: "In Progress", completed: "Completed",
		};

		return mapping[status] || status;
	}

	/* ----------------------------------------
	   LOAD PROJECT STAGES
	---------------------------------------- */
	async function loadProjectStages(projectId) {
		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/project-stages/list?projectId=${projectId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await res.json();

		let stages = data.stages || data.projectStages || [];

		if (data.data?.stages) stages = data.data.stages;
		if (data.data?.projectStages) stages = data.data.projectStages;

		if (!Array.isArray(stages)) return [];

		return stages.sort((a, b) => a.order - b.order);
	}

	function ExpandedContractorProjects({projects}) {
		const [activeTab, setActiveTab] = useState("all");

		const tabs = [{key: "all", label: "All Projects"}, // { key: "pending_approval", label: "Pending Approval" },
			// { key: "approved", label: "Approved" },
			// { key: "planned", label: "Planned" },
			// { key: "in_progress", label: "In Progress" },
			// { key: "completed", label: "Completed" },
		];

		const filtered = activeTab === "all" ? projects : projects.filter((p) => p.status === activeTab);

		return (<div className="border rounded-lg p-4 bg-gray-50">

			{/* TAB BUTTONS */}
			<div className="flex gap-3 mb-4 overflow-x-auto">
				{tabs.map((t) => (<Button
					key={t.key}
					variant={activeTab === t.key ? "default" : "outline"}
					onClick={() => setActiveTab(t.key)}
					className="whitespace-nowrap"
				>
					{t.label}
				</Button>))}
			</div>

			{/* PROJECT LIST */}
			<div className="space-y-3">
				{filtered.length === 0 ? (
					<p className="text-gray-500 text-sm">No projects in this category.</p>) : (filtered.map((p) => (<div
					key={p.id}
					className="p-3 border rounded-lg bg-white shadow-sm"
				>
					<p className="font-semibold text-lg">{p.title}</p>

					<div className="text-sm text-gray-700 mt-1">
						<p><b>Project ID:</b> {p.projectUid}</p>
						<p>
							<b>Status:</b>{" "}
							<span className="capitalize">
										{formatProjectStatus(p)}
									</span>
						</p>
						<p><b>Client:</b> {p.client?.name}</p>
					</div>
				</div>)))}
			</div>

		</div>);
	}

	/* ------------------------------
	   OPEN STAGE SHEET
	------------------------------ */
	const openStageSheet = async (stage) => {
		setSelectedStage(stage);
		setRemarkFetching(true);
		setStageRemarks([]);

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${stage.id}/remarks`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await res.json();

		if (data.success) {
			setStageRemarks(data.remarks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
		}

		setRemarkFetching(false);
	};

	/* ------------------------------
	   SEND REMARK
	------------------------------ */
	const sendRemark = async () => {
		if (!remarkText.trim()) return;

		setRemarkLoading(true);

		await fetch(`/api/stages/${selectedStage.id}`, {
			method: "PUT", headers: {
				"Content-Type": "application/json", authorization: `Bearer ${localStorage.getItem("token")}`
			}, body: JSON.stringify({
				message: remarkText,
			})
		});

		setRemarkText("");

		openStageSheet(selectedStage);
		setRemarkLoading(false);
	};

	/* ------------------------------
	   FORMAT DATE
	------------------------------ */
	const formatDate = (d) => new Date(d).toLocaleString("en-IN", {
		day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
	});
	/* ------------------------------
	   UI STARTS
	------------------------------ */
	return (<div className="p-6">

		{/* HEADER */}
		<div className="flex justify-between items-center mb-8">
			<h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

			<div onClick={() => setActivePage("Query")} className="relative cursor-pointer">
				<Bell className="h-7 w-7 text-gray-700"/>
				{newQueries > 0 && (<span
					className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full animate-pulse">
							{newQueries}
						</span>)}
			</div>
		</div>

		{/* CARDS */}
		<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

			<Card onClick={() => loadDetails("projects")} className="cursor-pointer hover:shadow-xl transition-all">
				<CardHeader className="flex justify-between items-center">
					<CardTitle>Projects</CardTitle>
					<FolderKanban className="h-7 w-7 text-purple-600"/>
				</CardHeader>
				<CardContent>
					<p className="text-4xl font-bold text-purple-700">{stats.projects}</p>
					<p className="text-xs text-gray-500">Click to view</p>
				</CardContent>
			</Card>

			<Card onClick={() => loadDetails("clients")} className="cursor-pointer hover:shadow-xl transition-all">
				<CardHeader className="flex justify-between items-center">
					<CardTitle>Clients</CardTitle>
					<Users className="h-7 w-7 text-blue-600"/>
				</CardHeader>
				<CardContent>
					<p className="text-4xl font-bold text-blue-700">{stats.clients}</p>
					<p className="text-xs text-gray-500">Click to view</p>
				</CardContent>
			</Card>

			<Card onClick={() => loadDetails("contractors")}
			      className="cursor-pointer hover:shadow-xl transition-all">
				<CardHeader className="flex justify-between items-center">
					<CardTitle>Contractors</CardTitle>
					<Briefcase className="h-7 w-7 text-green-600"/>
				</CardHeader>
				<CardContent>
					<p className="text-4xl font-bold text-green-700">{stats.contractors}</p>
					<p className="text-xs text-gray-500">Click to view</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex justify-between items-center">
					<CardTitle>Payments</CardTitle>
					<Wallet className="h-7 w-7 text-teal-600"/>
				</CardHeader>
				<CardContent>
					<p className="text-4xl font-bold text-teal-700">₹ {stats.payments}</p>
				</CardContent>
			</Card>
		</div>

		{/* TABLE */}
		{selectedView && (<Card className="shadow-lg p-6 bg-white rounded-xl">
			<h2 className="text-xl font-bold mb-4 border-b pb-3 capitalize flex justify-between">
				{selectedView} List

				{selectedView === "projects" && (<Button onClick={() => setActivePage("Project")}>
					View All Projects
				</Button>)}
			</h2>

			{tableLoading ? (<div className="flex justify-center items-center h-40">
				<Loader2 className="animate-spin h-10 w-10"/>
			</div>) : (<div className="overflow-auto max-h-[60vh] border rounded-lg">
				<Table>
					<TableHeader className="bg-gray-100">
						<TableRow>

							{/* PROJECTS HEADER */}
							{selectedView === "projects" && (<>
								<TableHead>Project ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Client</TableHead>
								<TableHead>Contractor</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>View Stage</TableHead>
							</>)}

							{/* CLIENTS HEADER */}
							{selectedView === "clients" && (<>
								<TableHead>ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Project ID</TableHead>
								<TableHead>Project Name</TableHead>
							</>)}

							{/* CONTRACTORS HEADER UPDATED */}
							{selectedView === "contractors" && (<>
								<TableHead>ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Total Projects</TableHead> {/* NEW FIELD */}
								<TableHead>View</TableHead>
							</>)}

						</TableRow>
					</TableHeader>

					<TableBody>

						{tableData.map((item) => (<React.Fragment key={item.id}>
							<TableRow>

								{/* PROJECTS ROW */}
								{selectedView === "projects" && (<>
									<TableCell>{item.projectUid}</TableCell>
									<TableCell>{item.title}</TableCell>
									<TableCell>{item.client?.name}</TableCell>
									<TableCell>{item.contractor?.name}</TableCell>
									<TableCell>{formatProjectStatus(item)}</TableCell>

									<TableCell>
										<div className="relative inline-block">
											<Button
												variant="outline"
												size="sm"
												onClick={async () => {
													const projectStages = await loadProjectStages(item.id);
													setOpenProjectSheet({...item, projectStages});
												}}
											>
												View
											</Button>

											{/* 🔥 UNREAD BADGE FOR PROJECT */}
											{item.unreadCount > 0 && (
												<span
													className="
            absolute -top-2 -right-2
            bg-red-600 text-white text-[10px]
            font-semibold h-4 min-w-4 px-[4px]
            flex items-center justify-center
            rounded-full shadow
        "
												>
        {item.unreadCount}
    </span>
											)}

										</div>

									</TableCell>
								</>)}

								{/* CLIENTS ROW */}
								{selectedView === "clients" && (<>
									<TableCell>{item.clientId}</TableCell>
									<TableCell>{item.name}</TableCell>
									<TableCell>{item.phone}</TableCell>
									<TableCell>{item.projectUids?.join(", ") || "-"}</TableCell>
									<TableCell>{item.projectNames}</TableCell>
								</>)}

								{/* CONTRACTORS ROW UPDATED */}
								{selectedView === "contractors" && (<>
									<TableCell>{item.contractorId}</TableCell>
									<TableCell>{item.name}</TableCell>
									<TableCell>{item.phone}</TableCell>
									<TableCell>{item.totalProjects}</TableCell>
									<TableCell>
										<Button
											size="sm"
											variant="outline"
											onClick={() => toggleRow(item)}
										>
											View
										</Button>
									</TableCell>
								</>)}

							</TableRow>
						</React.Fragment>))}

					</TableBody>
				</Table>
			</div>)}
		</Card>)}


		{openProjectSheet && (<Sheet
			open={true}
			onOpenChange={() => {
				setOpenProjectSheet(null);
				setSelectedStage(null);
			}}
		>
			<SheetContent
				side="right"
				className="w-[470px] flex flex-col p-0"
			>


				<div className="p-4 border-b bg-white">
					<h2 className="text-xl font-bold">{openProjectSheet.title}</h2>
					<p className="text-sm text-gray-500">
						Project Type: {openProjectSheet.projectType?.name}
					</p>
				</div>

				<div className="flex-1 overflow-y-auto">

					{selectedStage ? (<div className="flex flex-col h-full">

						{/* ---- STAGE HEADER WITH CLIENT + CONTRACTOR ---- */}
						<div className="px-4 py-3 border-b bg-white sticky top-0 z-20">

							{/* Back Button */}
							<div className="flex items-center gap-3 mb-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setSelectedStage(null)}
								>
									<ChevronLeft className="h-5 w-5"/>
								</Button>

								<h3 className="font-semibold text-lg">
									{selectedStage.StageTemplate?.name || selectedStage.name}
								</h3>
							</div>


						</div>

						{/* ---- CHAT AREA ---- */}
						<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">

							{remarkFetching ? (<div className="flex justify-center py-10">
								<Loader2 className="h-6 w-6 animate-spin"/>
							</div>) : (stageRemarks.map((r, index) => {
								const msgDate = new Date(r.createdAt);

								const isMe = r.by === "admin";

								const prevMsg = stageRemarks[index - 1];
								const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;

								const showDate = !prevDate || prevDate.toDateString() !== msgDate.toDateString();

								const dateLabel = (() => {
									const today = new Date();
									const yesterday = new Date();
									yesterday.setDate(today.getDate() - 1);

									if (msgDate.toDateString() === today.toDateString()) return "Today";

									if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";

									return msgDate.toLocaleDateString("en-IN", {
										day: "2-digit", month: "short", year: "numeric",
									});
								})();

								const senderName = r.by === "admin" ? "Admin" : r.by === "contractor" ? openProjectSheet.contractor?.name || "Contractor" : r.by === "client" ? openProjectSheet.client?.name || "Client" : "User";

								return (<div key={r.id}>

									{/* DATE BUBBLE */}
									{showDate && (<div className="text-center my-3">
                                    <span className="text-xs bg-gray-300 px-3 py-1 rounded-full">
                                        {dateLabel}
                                    </span>
									</div>)}

									{/* MESSAGE BUBBLE */}
									<div
										className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
										<div
											className={`
                                        max-w-[75%] px-3 py-2 rounded-xl border shadow-sm
                                        ${isMe ? "bg-primary text-primary-foreground" : "bg-white text-gray-800"}
                                    `}
										>
											<p className="text-[10px] opacity-70 mb-1 font-semibold">
												{isMe ? "You (Admin)" : senderName}
											</p>

											<p className="whitespace-pre-wrap">{r.message}</p>

											<p className="text-[10px] opacity-70 mt-1 text-right">
												{msgDate.toLocaleTimeString("en-IN", {
													hour: "2-digit", minute: "2-digit",
												})}
											</p>
										</div>
									</div>
								</div>);
							}))}

							<div ref={remarkEndRef}/>
						</div>

						{/* ---- FIXED INPUT BOX ---- */}
						<div className="p-3 bg-white border-t flex gap-2">
							<Textarea
								placeholder="Write message..."
								value={remarkText}
								onChange={(e) => setRemarkText(e.target.value)}
								className="resize-none h-16 flex-1 rounded-xl"
							/>

							<Button
								className="h-16 px-6 rounded-xl"
								disabled={remarkLoading}
								onClick={sendRemark}
							>
								{remarkLoading ? (<Loader2 className="animate-spin h-4 w-4"/>) : ("Send")}
							</Button>
						</div>

					</div>) : (

						<div className="p-4">
							<h3 className="font-semibold mb-3">Work Stages (Floor Wise)</h3>

							{(() => {
								if (!openProjectSheet.projectStages) return null;

								// GROUP BY FLOOR
								const grouped = openProjectSheet.projectStages.reduce((acc, s) => {
									const floor = s.floorName || "No Floor";
									if (!acc[floor]) acc[floor] = [];
									acc[floor].push(s);
									return acc;
								}, {});

								// SORT FLOORS CORRECTLY
								const sortFloors = (name) => {
									const n = name.toLowerCase();

									if (n.includes("basement")) return -2;
									if (n.includes("ground")) return -1;

									const num = n.match(/\d+/);
									if (num) return parseInt(num[0]);

									if (n.includes("terrace") || n.includes("roof")) return 999;

									return 500;
								};

								return Object.entries(grouped)
									.sort(([a], [b]) => sortFloors(a) - sortFloors(b))
									.map(([floor, stages]) => (<div key={floor} className="mb-6">

										{/* FLOOR HEADING */}
										<h2 className="text-lg font-bold mb-3 bg-gray-100 p-2 rounded">
											{floor}
										</h2>

										{/* TIMELINE */}
										<div className="relative pl-10 space-y-6">

											{/* Vertical Line */}
											<div className="absolute left-5 top-0 bottom-0 w-[3px]
                            bg-gradient-to-b from-green-500 via-gray-300 to-gray-300
                            rounded-full"></div>

											{stages.map((s, index) => {
												const status = s.status?.toLowerCase();

												const isApproved = status === "approved";
												const isCompleted = status === "completed";
												const isRejected = status === "rejected";
												const isPending = status === "pending" || status === "in_progress";

												const prevDone = index === 0 || ["approved", "completed"].includes(stages[index - 1].status);

												const isCurrent = isPending && prevDone;

												const icon = (() => {
													if (isApproved) return (<div className="h-7 w-7 rounded-full bg-green-600 text-white
                                            flex items-center justify-center text-xs font-bold shadow-md">
														✓
													</div>);

													if (isCompleted) return (<div className="h-7 w-7 rounded-full bg-blue-600 text-white
                                            flex items-center justify-center text-xs font-bold shadow-md">
														✓
													</div>);

													if (isRejected) return (<div className="h-7 w-7 rounded-full bg-red-600 text-white
                                            flex items-center justify-center text-sm font-bold shadow-md">
														✗
													</div>);

													if (isCurrent) return (<div className="h-7 w-7 rounded-full bg-black text-white
                                            flex items-center justify-center text-xs font-bold shadow-md">
														{index + 1}
													</div>);

													return (<div className="h-6 w-6 rounded-full bg-gray-300 text-gray-600
                                        flex items-center justify-center text-xs">
														{index + 1}
													</div>);
												})();

												return (<div
													key={s.id}
													onClick={() => openStageSheet(s)}
													className="relative flex items-start gap-4 cursor-pointer"
												>
													{/* ICON */}
													<div className="relative z-10 mt-1">{icon}</div>

													{/* TEXT */}
													<div className="flex flex-col">
														<div className="flex items-center gap-2">
															<p className="text-[16px] font-medium">
																{s.StageTemplate?.name || s.name}
															</p>

															{/* 🔥 UNREAD BADGE NEXT TO STAGE */}
															{s.unreadRemarks > 0 && (
																<span className="
            bg-red-600 text-white text-[10px]
            px-2 py-[2px] rounded-full shadow
        ">
            {s.unreadRemarks}
        </span>
															)}
														</div>


														<p className="text-xs mt-1">
															{isApproved && (
																<span className="text-green-600 font-semibold">
                                                    Approved
                                                </span>)}
															{isCompleted && (
																<span className="text-blue-600 font-semibold">
                                                    Completed
                                                </span>)}
															{isRejected && (
																<span className="text-red-600 font-semibold">
                                                    Rejected
                                                </span>)}
															{isPending && (
																<span className="text-gray-500">Pending</span>)}
														</p>
													</div>

												</div>);
											})}
										</div>
									</div>));
							})()}

						</div>


					)}

				</div>
			</SheetContent>
		</Sheet>)}


		{/* CONTRACTOR PROJECT DIALOG */}
		<Dialog open={openContractorDialog} onOpenChange={setOpenContractorDialog}>
			<DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">

				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						Contractor: {selectedContractor?.name}
					</DialogTitle>
					<DialogDescription>
						Phone: {selectedContractor?.phone}
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4">
					<ExpandedContractorProjects projects={contractorProjects}/>
				</div>

			</DialogContent>
		</Dialog>

	</div>);
}
