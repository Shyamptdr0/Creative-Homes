"use client";

import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "@/components/ui/sheet";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import {
	Loader2,
	PlusCircle,
	MessageCircle,
	Edit,
	Trash,
	CheckCircle,
	XCircle,
	Eye,
} from "lucide-react";

import { toast } from "sonner";

export default function StageTemplatePage() {
	/* =========================================================
	    STATES
	========================================================= */
	const [projects, setProjects] = useState([]);
	const [projectTypes, setProjectTypes] = useState([]);
	const [stageTemplates, setStageTemplates] = useState([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [autoStages, setAutoStages] = useState([]);
	const [sheetLoading, setSheetLoading] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);

	const [selectedProject, setSelectedProject] = useState("");
	const [selectedStages, setSelectedStages] = useState([]);
	const [projectSavedStages, setProjectSavedStages] = useState([]);

	// unread count per stage
	const [unreadRemarks, setUnreadRemarks] = useState({});

	// add / edit template
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [name, setName] = useState("");
	const [projectTypeId, setProjectTypeId] = useState("");
	const [editData, setEditData] = useState(null);

	// remarks drawer
	const [remarkDrawerOpen, setRemarkDrawerOpen] = useState(false);
	const [remarkStage, setRemarkStage] = useState(null);
	const [remarks, setRemarks] = useState([]);
	const [remarkLoading, setRemarkLoading] = useState(false);
	const [newRemark, setNewRemark] = useState("");
	const remarkEndRef = useRef(null);

	// reject dialog
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [rejectMessage, setRejectMessage] = useState("");

	// view all stages
	const [allStagesSheet, setAllStagesSheet] = useState(false);

	// floor (NEW)
	const [floorName, setFloorName] = useState("");

	/* =========================================================
	    LOAD ALL DATA
	========================================================= */
	useEffect(() => {
		loadAll();
	}, []);

	const loadAll = async () => {
		setLoading(true);
		await Promise.all([loadProjects(), loadProjectTypes(), loadStageTemplates()]);
		setLoading(false);
	};

	const loadProjects = async () => {
		const res = await fetch("/api/projects");
		const data = await res.json();
		if (data.success) setProjects(data.projects);
	};

	const loadProjectTypes = async () => {
		const res = await fetch("/api/project-types");
		const data = await res.json();
		if (data.success) setProjectTypes(data.types);
	};

	const loadStageTemplates = async () => {
		const res = await fetch("/api/stages/stage-templates");
		const data = await res.json();
		if (data.success) setStageTemplates(data.stages);
	};

	const loadSavedStages = async (projectId) => {
		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/project-stages/list?projectId=${projectId}`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();

		if (data.success) {
			setProjectSavedStages(data.stages);

			// unread mapping
			const unreadMap = {};
			data.stages.forEach((st) => {
				unreadMap[st.id] = st.unreadRemarks || 0;
			});

			setUnreadRemarks(unreadMap);
		}
	};
	/* =========================================================
	    SELECT PROJECT
	========================================================= */
	const onProjectSelect = async (projectId) => {
		setSelectedProject(projectId);
		if (!projectId) return;

		await loadSavedStages(projectId);

		const project = projects.find((p) => Number(p.id) === Number(projectId));

		const res = await fetch(
			`/api/stages/by-project-type?projectTypeId=${project.projectTypeId}`
		);

		const data = await res.json();

		if (data.success) setAutoStages(data.stages);
	};

	const openAvailableStages = async () => {
		if (!selectedProject) return;

		setSheetOpen(true);
		setSheetLoading(true);

		const project = projects.find((p) => Number(p.id) === Number(selectedProject));

		const res = await fetch(
			`/api/stages/by-project-type?projectTypeId=${project.projectTypeId}`
		);

		const data = await res.json();
		if (data.success) setAutoStages(data.stages);

		setSheetLoading(false);
	};

	const toggleStage = (id) => {
		setSelectedStages((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	/* =========================================================
	    ASSIGN STAGES WITH FLOOR
	========================================================= */
	const assignStages = async () => {
		if (!selectedProject) return toast.error("Select project first");
		if (selectedStages.length === 0) return toast.error("Select stages");
		if (!floorName.trim()) return toast.error("Enter floor name");

		setSaving(true);

		const res = await fetch("/api/project-stages/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				projectId: selectedProject,
				stageTemplateIds: selectedStages,
				floorName,
			}),
		});

		const data = await res.json();
		setSaving(false);

		if (data.success) {
			toast.success("Stages Assigned");
			setFloorName("");
			await loadSavedStages(selectedProject);
			setSheetOpen(false);
		} else {
			toast.error(data.error || "Failed");
		}
	};

	/* =========================================================
	    DELETE TEMPLATE
	========================================================= */
	const deleteStageTemplate = async (id) => {
		if (!confirm("Delete this?")) return;

		setSaving(true);

		const res = await fetch(`/api/stages/stage-templates/${id}`, {
			method: "DELETE",
		});

		const data = await res.json();
		setSaving(false);

		if (data.success) {
			toast.success("Deleted");
			loadStageTemplates();
		} else toast.error(data.error);
	};

	/* =========================================================
	    UPDATE TEMPLATE
	========================================================= */
	const updateStageTemplate = async () => {
		setSaving(true);

		const res = await fetch(`/api/stages/stage-templates/${editData.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(editData),
		});

		const data = await res.json();
		setSaving(false);

		if (data.success) {
			toast.success("Updated");
			loadStageTemplates();
			setEditModalOpen(false);
		}
	};
	/* =========================================================
	    OPEN REMARKS (Fetch + Mark Read)
	========================================================= */
	const openRemarks = async (stage) => {
		setRemarkStage(stage);
		setRemarkDrawerOpen(true);
		setRemarkLoading(true);

		// Remove unread badge (UI only)
		setUnreadRemarks((prev) => ({
			...prev,
			[stage.id]: 0,
		}));

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${stage.id}/remarks`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();

		if (data.success) {
			setRemarks(data.remarks);

			// Store client + contractor name info
			setRemarkStage((prev) => ({
				...prev,
				StageTemplate: { name: data.stage?.templateName },
				project: {
					client: data.stage?.project?.client,
					contractor: data.stage?.project?.contractor,
				},
			}));

		}

		setRemarkLoading(false);

		setTimeout(() => {
			remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 150);
	};

	/* Auto scroll when drawer opens */
	useEffect(() => {
		if (remarkDrawerOpen) {
			setTimeout(() => {
				remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 150);
		}
	}, [remarkDrawerOpen]);

	/* =========================================================
	    SEND REMARK
	========================================================= */
	const sendRemark = async () => {
		if (!newRemark.trim()) return;

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${remarkStage.id}/remarks`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ message: newRemark }),
		});

		const data = await res.json();

		if (data.success) {

			// Show instantly
			setRemarks((prev) => [...prev, data.remark]);

			// Mark this stage as read (remove badge)
			setUnreadRemarks((prev) => ({
				...prev,
				[remarkStage.id]: 0,
			}));

			// Update projectSavedStages also
			setProjectSavedStages((prev) =>
				prev.map((s) =>
					s.id === remarkStage.id
						? { ...s, unreadRemarks: 0 }
						: s
				)
			);

			setNewRemark("");

			setTimeout(() => {
				remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 120);
		}

	};


	/* =========================================================
	    APPROVE STAGE
	========================================================= */
	const approveStage = async (s) => {
		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${s.id}/approve`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await res.json();

		if (data.success) {
			toast.success("Stage Approved");
			loadSavedStages(selectedProject);
		}
	};

	/* =========================================================
	    REJECT STAGE
	========================================================= */
	const rejectStage = async (s) => {
		setRejectMessage("");
		setRemarkStage(s);
		setRejectDialogOpen(true);
	};

	const confirmReject = async () => {
		if (!rejectMessage.trim())
			return toast.error("Remark required");

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${remarkStage.id}/reject`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ message: rejectMessage }),
		});

		const data = await res.json();

		if (data.success) {
			toast.success("Rejected");
			loadSavedStages(selectedProject);
			setRejectDialogOpen(false);
		}
	};

	/* =========================================================
	    REMOVE ASSIGNED STAGE
	========================================================= */
	const removeAssignedStage = async (stageId) => {
		if (!confirm("Remove this stage from project?")) return;

		const res = await fetch(`/api/project-stages/${stageId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data = await res.json();

		if (data.success) {
			toast.success("Stage Removed");
			loadSavedStages(selectedProject);
		} else {
			toast.error(data.error || "Failed to remove");
		}
	};

	/* =========================================================
	    FORMAT DATE (Used in messages)
	========================================================= */
	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	/* =========================================================
	    UI START
	========================================================= */
	return (
		<div className="space-y-10">

			{/* LOADING */}
			{loading && (
				<div className="flex items-center gap-2 text-gray-500">
					<Loader2 className="animate-spin w-4 h-4" /> Loading...
				</div>
			)}

			{/* HEADER */}
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold">Stage Templates</h2>

				<div className="flex gap-3">
					<Button variant="outline" onClick={() => setAllStagesSheet(true)}>
						<Eye className="w-4 h-4 mr-2" /> View Stages
					</Button>

					<Button onClick={() => setAddModalOpen(true)}>
						<PlusCircle className="w-4 mr-2" /> Add
					</Button>
				</div>
			</div>

			{/* SELECT PROJECT */}
			<div>
				<Label>Select Project</Label>
				<Select value={selectedProject} onValueChange={onProjectSelect}>
					<SelectTrigger className="w-72 mt-1">
						<SelectValue placeholder="Choose Project" />
					</SelectTrigger>

					<SelectContent>
						{projects.map((p) => (
							<SelectItem key={p.id} value={String(p.id)}>
								{p.projectUid} — {p.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* PROJECT DETAIL + OPEN STAGES SHEET */}
			{selectedProject && (
				<div className="space-y-3 mt-3">

					<Button onClick={openAvailableStages}>Open Available Stages</Button>

					<div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-1">
						{(() => {
							const p = projects.find((x) => Number(x.id) === Number(selectedProject));
							if (!p) return null;

							return (
								<>
									<p><strong>Project ID:</strong> {p.projectUid}</p>
									<p><strong>Project Name:</strong> {p.title}</p>
									<p><strong>Client:</strong> {p.client?.clientId} - {p.client?.name || "N/A"}</p>
									<p><strong>Contractor:</strong> {p.contractor?.contractorId} - {p.contractor?.name || "N/A"}</p>
								</>
							);
						})()}
					</div>
				</div>
			)}

			{/* ASSIGNED STAGES TABLE */}
			{selectedProject && (
				<div>
					<h3 className="font-semibold mb-2">Assigned Stages</h3>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>No</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Actions</TableHead>
								<TableHead>Remove</TableHead>
								<TableHead>Remarks</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{Object.entries(
								projectSavedStages.reduce((acc, st) => {
									const group = st.floorName || "No Floor";
									if (!acc[group]) acc[group] = [];
									acc[group].push(st);
									return acc;
								}, {})
							)
								.sort(([floorA], [floorB]) => {
									const order = (f) => {
										const t = f.toLowerCase();
										if (t.includes("basement")) return -2;
										if (t.includes("ground")) return -1;
										const m = t.match(/(\d+)/);
										if (m) return parseInt(m[1]);
										if (t.includes("terrace")) return 999;
										return 500;
									};
									return order(floorA) - order(floorB);
								})
								.map(([floor, list], idx) => (
									<>
										<TableRow key={floor + idx} className="bg-gray-100">
											<TableCell colSpan={7} className="font-semibold text-lg">
												{floor}
											</TableCell>
										</TableRow>

										{list.map((st, i) => (
											<TableRow key={st.id}>
												<TableCell>{i + 1}</TableCell>
												<TableCell>{st.StageTemplate?.name}</TableCell>

												<TableCell>
													{st.status === "approved" && (
														<span className="text-green-600 font-semibold">Approved</span>
													)}
													{st.status === "completed" && (
														<span className="text-blue-600 font-semibold">Completed</span>
													)}
													{st.status === "rejected" && (
														<span className="text-red-600 font-semibold">Rejected</span>
													)}
													{st.status === "pending" && (
														<span className="text-gray-600 font-semibold">Pending</span>
													)}
												</TableCell>

												<TableCell>
													{st.status === "completed" && (
														<div className="flex gap-2">
															<Button size="sm" onClick={() => approveStage(st)}>
																<CheckCircle className="w-4" />
															</Button>
															<Button size="sm" variant="destructive" onClick={() => rejectStage(st)}>
																<XCircle className="w-4" />
															</Button>
														</div>
													)}
												</TableCell>

												<TableCell>
													<Button size="sm" variant="destructive"
													        onClick={() => removeAssignedStage(st.id)}>
														<Trash className="w-4 h-4" />
													</Button>
												</TableCell>

												<TableCell>
													<div className="relative inline-block">
														<Button size="sm" variant="outline"
														        onClick={() => openRemarks(st)}>
															<MessageCircle className="w-4 h-4" />
														</Button>

														{unreadRemarks[st.id] > 0 && (
															<span className="
																absolute -top-1 -right-1 bg-red-600 text-white
																text-[10px] font-semibold h-4 min-w-4 px-[2px]
																flex items-center justify-center rounded-full shadow
															">
																{unreadRemarks[st.id]}
															</span>
														)}
													</div>
												</TableCell>
											</TableRow>
										))}
									</>
								))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* ASSIGN STAGES SHEET */}
			<Sheet open={sheetOpen} onOpenChange={(o) => {
				setSheetOpen(o);
				if (!o) setSelectedStages([]);
			}}>
				<SheetContent className="w-[520px] p-4">
					<SheetHeader><SheetTitle>Available Stages</SheetTitle></SheetHeader>

					<div className="space-y-3">
						<Label>Floor Name</Label>
						<Input
							value={floorName}
							onChange={(e) => setFloorName(e.target.value)}
							placeholder="Ground Floor, Basement, 1st, etc."
						/>
					</div>

					{sheetLoading ? (
						<div className="flex justify-center py-10">
							<Loader2 className="animate-spin w-6 h-6" />
						</div>
					) : (
						<Table className="mt-4">
							<TableHeader>
								<TableRow>
									<TableHead>
										<input
											type="checkbox"
											checked={
												autoStages.length > 0 &&
												selectedStages.length === autoStages.length
											}
											onChange={(e) =>
												setSelectedStages(
													e.target.checked
														? autoStages.map((s) => s.id)
														: []
												)
											}
										/>
									</TableHead>
									<TableHead>Stage Name</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{autoStages.map((st) => (
									<TableRow key={st.id}>
										<TableCell>
											<input
												type="checkbox"
												checked={selectedStages.includes(st.id)}
												onChange={() => toggleStage(st.id)}
											/>
										</TableCell>
										<TableCell>{st.name}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}

					<SheetFooter>
						<Button className="w-full mt-4" onClick={assignStages}>Assign Selected</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			{/* REMARK CHAT DRAWER */}
			<Sheet open={remarkDrawerOpen} onOpenChange={setRemarkDrawerOpen}>
				<SheetContent className="w-[420px] p-0 flex flex-col bg-white">

					<div className="p-4 border-b shadow-sm bg-white">
						<h2 className="font-semibold text-lg">{remarkStage?.StageTemplate?.name}</h2>
						<p className="text-xs text-gray-500">{projects.find((p) => Number(p.id) === Number(selectedProject))?.title}</p>
					</div>

					<div className="flex-1 p-4 bg-gray-100 space-y-4 overflow-y-auto">
						{remarkLoading ? (
							<div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
						) : (
							remarks.map((r, idx) => {
								const isMe = r.by === "admin";
								const msgDate = new Date(r.createdAt);
								const prev = remarks[idx - 1];
								const showDate = !prev || new Date(prev.createdAt).toDateString() !== msgDate.toDateString();

								const label = (() => {
									const t = new Date();
									const y = new Date(); y.setDate(t.getDate() - 1);
									if (msgDate.toDateString() === t.toDateString()) return "Today";
									if (msgDate.toDateString() === y.toDateString()) return "Yesterday";
									return msgDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
								})();

								return (
									<div key={r.id} className="space-y-2">
										{showDate && (
											<div className="text-center my-2">
												<span className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-full">{label}</span>
											</div>
										)}

										<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm text-sm
												${isMe ? "bg-primary text-primary-foreground" : "bg-white border text-gray-800"}`}>
												<p className="text-[10px] font-medium opacity-70 mb-1">
													{r.by === "admin" && "You"}
													{r.by === "contractor" && (r.senderName || remarkStage?.project?.contractor?.name || "Contractor")}
													{r.by === "client" && (r.senderName || remarkStage?.project?.client?.name || "Client")}
												</p>

												<p className="whitespace-pre-wrap">{r.message}</p>

												<p className="text-[10px] opacity-70 text-right mt-1">
													{msgDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
												</p>
											</div>
										</div>
									</div>
								);
							})
						)}

						<div ref={remarkEndRef} />
					</div>

					<div className="p-3 border-t flex gap-2 bg-white">
						<Textarea
							value={newRemark}
							onChange={(e) => setNewRemark(e.target.value)}
							placeholder="Type a message..."
							className="h-14 flex-1 resize-none rounded-xl"
						/>
						<Button className="h-14 px-5 rounded-xl" onClick={sendRemark}>Send</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* REJECT DIALOG */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader><DialogTitle>Reject Stage</DialogTitle></DialogHeader>

					<div className="space-y-4">
						<Label>Enter remark (required)</Label>
						<Textarea
							className="h-24"
							value={rejectMessage}
							onChange={(e) => setRejectMessage(e.target.value)}
						/>
					</div>

					<DialogFooter>
						<Button variant="destructive" onClick={confirmReject}>Reject</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ADD TEMPLATE */}
			<Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
				<DialogContent>
					<DialogHeader><DialogTitle>Add Stage Template</DialogTitle></DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Name</Label>
							<Input value={name} onChange={(e) => setName(e.target.value)} />
						</div>

						<div>
							<Label>Project Type</Label>
							<Select value={projectTypeId} onValueChange={setProjectTypeId}>
								<SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
								<SelectContent>
									{projectTypes.map((pt) => (
										<SelectItem key={pt.id} value={String(pt.id)}>{pt.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button disabled={saving} onClick={async () => {
							if (!name || !projectTypeId) return toast.error("Required fields missing");

							setSaving(true);

							const res = await fetch("/api/stages/stage-templates", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ name, projectTypeId }),
							});

							const data = await res.json();
							setSaving(false);

							if (data.success) {
								toast.success("Added");
								loadStageTemplates();
								setAddModalOpen(false);
								setName("");
								setProjectTypeId("");
							}
						}}>
							{saving ? <Loader2 className="animate-spin" /> : "Add"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* EDIT TEMPLATE */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent>
					<DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Name</Label>
							<Input
								value={editData?.name || ""}
								onChange={(e) => setEditData({ ...editData, name: e.target.value })}
							/>
						</div>

						<div>
							<Label>Project Type</Label>
							<Select
								value={String(editData?.projectTypeId || "")}
								onValueChange={(v) => setEditData({ ...editData, projectTypeId: v })}
							>
								<SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
								<SelectContent>
									{projectTypes.map((pt) => (
										<SelectItem key={pt.id} value={String(pt.id)}>{pt.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button disabled={saving} onClick={updateStageTemplate}>
							{saving ? <Loader2 className="animate-spin" /> : "Update"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ALL STAGES SHEET */}
			<Sheet open={allStagesSheet} onOpenChange={setAllStagesSheet}>
				<SheetContent className="w-[480px] p-5 overflow-y-auto">
					<SheetHeader><SheetTitle>All Stage Templates</SheetTitle></SheetHeader>

					<div className="mt-6 space-y-6">
						{projectTypes.map((pt) => {
							const list = stageTemplates.filter((s) => s.projectTypeId === pt.id);
							if (list.length === 0) return null;

							return (
								<div key={pt.id} className="border rounded-lg p-4 shadow-sm">
									<h3 className="font-bold text-lg mb-3">{pt.name}</h3>

									{list.map((st) => (
										<div key={st.id} className="p-2 border-b flex justify-between items-center">
											<span>{st.name}</span>

											<div className="flex gap-2">
												<Button size="sm" variant="outline"
												        onClick={() => {
													        setEditData(st);
													        setEditModalOpen(true);
												        }}>
													<Edit className="w-4 h-4" />
												</Button>

												<Button size="sm" variant="destructive"
												        onClick={() => deleteStageTemplate(st.id)}>
													<Trash className="w-4 h-4" />
												</Button>
											</div>
										</div>
									))}
								</div>
							);
						})}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
