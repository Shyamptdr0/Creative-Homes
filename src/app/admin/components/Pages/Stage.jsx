"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
	Eye
} from "lucide-react";

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

	// unread count
	const [unreadRemarks, setUnreadRemarks] = useState({});

	// template modals
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

	// NEW — View All Stages Sheet
	const [allStagesSheet, setAllStagesSheet] = useState(false);

	/* =========================================================
	   LOAD ALL DATA
	========================================================= */
	useEffect(() => {
		loadAll();
	}, []);

	const loadAll = async () => {
		setLoading(true);
		await Promise.all([
			loadProjects(),
			loadProjectTypes(),
			loadStageTemplates(),
		]);
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
		const res = await fetch(`/api/project-stages/list?projectId=${projectId}`);
		const data = await res.json();

		if (data.success) {
			setProjectSavedStages(data.stages);

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

		setSheetLoading(true);
		setSheetOpen(true);

		const project = projects.find((p) => Number(p.id) === Number(projectId));

		const res = await fetch(
			`/api/stages/by-project-type?projectTypeId=${project.projectTypeId}`
		);

		const data = await res.json();

		if (data.success) setAutoStages(data.stages);

		setSheetLoading(false);
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
	   ASSIGN STAGES
	========================================================= */
	const assignStages = async () => {
		if (!selectedProject) return toast.error("Select project");

		setSaving(true);

		const res = await fetch("/api/project-stages/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				projectId: selectedProject,
				stageTemplateIds: selectedStages,
			}),
		});

		const data = await res.json();
		setSaving(false);

		if (data.success) {
			toast.success("Stages Assigned");
			await loadSavedStages(selectedProject);
			setSheetOpen(false);
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
			headers: { "Content-Type": "application/json" },
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
	   OPEN REMARKS
	========================================================= */
	const openRemarks = async (stage) => {
		setRemarkStage(stage);
		setRemarkDrawerOpen(true);
		setRemarkLoading(true);

		setUnreadRemarks((prev) => ({
			...prev,
			[stage.id]: 0,
		}));

		const res = await fetch(`/api/stages/${stage.id}/remarks`);
		const data = await res.json();

		if (data.success) setRemarks(data.remarks);

		setRemarkLoading(false);
	};

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
			setRemarks((prev) => [
				...prev,
				{
					id: Math.random(),
					by: "admin",
					message: newRemark,
					createdAt: new Date(),
				},
			]);

			setNewRemark("");
		}
	};

	/* =========================================================
	   APPROVE / REJECT
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

	const rejectStage = async (s) => {
		setRejectMessage("");
		setRemarkStage(s);
		setRejectDialogOpen(true);
	};

	const confirmReject = async () => {
		if (!rejectMessage.trim()) return toast.error("Remark required");

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
	   FORMAT DATE
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

			{/* HEADER AREA */}
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold">Stage Templates</h2>

				<div className="flex gap-3">
					{/* NEW → View Stages Button */}
					<Button variant="outline" onClick={() => setAllStagesSheet(true)}>
						<Eye className="w-4 h-4 mr-2" /> View Stages
					</Button>

					{/* Add Stage Template */}
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

			{/* OPEN STAGE ASSIGNMENT SHEET */}
			{selectedProject && (
				<Button className="mt-3" onClick={openAvailableStages}>
					Open Available Stages
				</Button>
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
								<TableHead>Remarks</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{projectSavedStages.map((st, i) => (
								<TableRow key={st.id}>
									<TableCell>{i + 1}</TableCell>

									<TableCell>{st.StageTemplate?.name}</TableCell>

									<TableCell>
										{st.status === "approved" && (
											<span className="text-green-600 font-semibold">
												Approved
											</span>
										)}
										{st.status === "completed" && (
											<span className="text-blue-600 font-semibold">
												Completed
											</span>
										)}
										{st.status === "rejected" && (
											<span className="text-red-600 font-semibold">
												Rejected
											</span>
										)}
										{st.status === "pending" && (
											<span className="text-gray-600 font-semibold">
												Pending
											</span>
										)}
									</TableCell>

									{/* ACTION BUTTONS */}
									<TableCell>
										{st.status === "completed" && (
											<div className="flex gap-2">
												<Button size="sm" onClick={() => approveStage(st)}>
													<CheckCircle className="w-4" />
												</Button>

												<Button
													size="sm"
													variant="destructive"
													onClick={() => rejectStage(st)}
												>
													<XCircle className="w-4" />
												</Button>
											</div>
										)}
									</TableCell>

									{/* REMARK BUTTON */}
									<TableCell>
										<div className="relative inline-block">
											<Button
												size="sm"
												variant="outline"
												onClick={() => openRemarks(st)}
											>
												<MessageCircle className="w-4 h-4" />
											</Button>

											{/* UNREAD DOT */}
											{unreadRemarks[st.id] > 0 && (
												<span className="
													absolute -top-1 -right-1
													bg-red-600 w-3 h-3
													rounded-full border border-white
												"></span>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
			{/* =========================================================
			    AVAILABLE STAGES SHEET (ASSIGN TO PROJECT)
			========================================================= */}
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent className="w-[520px] p-4">
					<SheetHeader>
						<SheetTitle>Available Stages</SheetTitle>
					</SheetHeader>

					{sheetLoading ? (
						<div className="flex justify-center py-10">
							<Loader2 className="animate-spin w-6 h-6" />
						</div>
					) : (
						<Table className="mt-4">
							<TableHeader>
								<TableRow>
									<TableHead></TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Edit</TableHead>
									<TableHead>Delete</TableHead>
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

										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setEditData(st);
													setEditModalOpen(true);
												}}
											>
												<Edit className="w-4 h-4" />
											</Button>
										</TableCell>

										<TableCell>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => deleteStageTemplate(st.id)}
											>
												<Trash className="w-4 h-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}

					<SheetFooter>
						<Button className="w-full mt-4" onClick={assignStages}>
							Assign Selected
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>


			{/* =========================================================
			    REMARKS DRAWER
			========================================================= */}
			<Sheet open={remarkDrawerOpen} onOpenChange={setRemarkDrawerOpen}>
				<SheetContent className="w-[400px] p-4">
					<SheetHeader>
						<SheetTitle>
							Remarks — {remarkStage?.StageTemplate?.name}
						</SheetTitle>
					</SheetHeader>

					{remarkLoading ? (
						<div className="flex justify-center py-10">
							<Loader2 className="animate-spin" />
						</div>
					) : (
						<div className="mt-3 max-h-[70vh] overflow-y-auto space-y-3">
							{remarks.map((r) => (
								<div
									key={r.id}
									className={`p-3 rounded border ${
										r.by === "admin"
											? "bg-red-100"
											: r.by === "contractor"
												? "bg-blue-100"
												: "bg-gray-100"
									}`}
								>
									<p>{r.message}</p>
									<p className="text-xs mt-2 flex justify-between">
										<span>{r.by}</span>
										<span>{formatDate(r.createdAt)}</span>
									</p>
								</div>
							))}
						</div>
					)}

					<Separator className="my-3" />

					<Textarea
						className="h-20"
						value={newRemark}
						onChange={(e) => setNewRemark(e.target.value)}
						placeholder="Write message…"
					/>

					<SheetFooter>
						<Button className="w-full" onClick={sendRemark}>
							Send
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>


			{/* =========================================================
			    REJECT STAGE DIALOG
			========================================================= */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Stage</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<Label>Enter remark (required)</Label>
						<Textarea
							className="h-24"
							value={rejectMessage}
							onChange={(e) => setRejectMessage(e.target.value)}
						/>
					</div>

					<DialogFooter>
						<Button variant="destructive" onClick={confirmReject}>
							Reject
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>


			{/* =========================================================
			    ADD STAGE TEMPLATE MODAL
			========================================================= */}
			<Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Stage Template</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Name</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div>
							<Label>Project Type</Label>
							<Select
								value={projectTypeId}
								onValueChange={setProjectTypeId}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Type" />
								</SelectTrigger>
								<SelectContent>
									{projectTypes.map((pt) => (
										<SelectItem
											key={pt.id}
											value={String(pt.id)}
										>
											{pt.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button
							disabled={saving}
							onClick={async () => {
								if (!name || !projectTypeId)
									return toast.error("Required fields missing");

								setSaving(true);

								const res = await fetch("/api/stages/stage-templates", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										name,
										projectTypeId,
									}),
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
							}}
						>
							{saving ? <Loader2 className="animate-spin" /> : "Add"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>


			{/* =========================================================
			    EDIT TEMPLATE MODAL
			========================================================= */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Template</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Name</Label>
							<Input
								value={editData?.name || ""}
								onChange={(e) =>
									setEditData({ ...editData, name: e.target.value })
								}
							/>
						</div>

						<div>
							<Label>Project Type</Label>
							<Select
								value={String(editData?.projectTypeId || "")}
								onValueChange={(v) =>
									setEditData({ ...editData, projectTypeId: v })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Type" />
								</SelectTrigger>

								<SelectContent>
									{projectTypes.map((pt) => (
										<SelectItem key={pt.id} value={String(pt.id)}>
											{pt.name}
										</SelectItem>
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



			{/* =========================================================
			    🆕 VIEW ALL STAGES — GROUPED BY PROJECT TYPE
			========================================================= */}
			{/* ========================================================= 🆕 VIEW ALL STAGES — GROUPED BY PROJECT TYPE ========================================================= */}
			<Sheet open={allStagesSheet} onOpenChange={setAllStagesSheet}>
				<SheetContent className="w-[480px] p-5 overflow-y-auto">
					<SheetHeader>
						<SheetTitle>All Stage Templates</SheetTitle>
					</SheetHeader>

					<div className="mt-6 space-y-6">
						{projectTypes.map((pt) => {
							const filtered = stageTemplates.filter((s) => s.projectTypeId === pt.id);
							if (filtered.length === 0) return null;

							return (
								<div key={pt.id} className="border rounded-lg p-4 shadow-sm">
									<h3 className="font-bold text-lg mb-3">{pt.name}</h3>

									{filtered.map((st) => (
										<div
											key={st.id}
											className="p-2 border-b last:border-none flex justify-between items-center"
										>
											<span>{st.name}</span>

											<div className="flex gap-2">
												{/* EDIT BUTTON */}
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														setEditData(st);
														setEditModalOpen(true);
													}}
												>
													<Edit className="w-4 h-4" />
												</Button>

												{/* DELETE BUTTON */}
												<Button
													size="sm"
													variant="destructive"
													onClick={() => deleteStageTemplate(st.id)}
												>
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
