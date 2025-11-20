"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "@/components/ui/sheet";

import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";

export default function ContractorStages() {
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(true);

	const [projectList, setProjectList] = useState([]);
	const [selectedProjectId, setSelectedProjectId] = useState("");

	const [remarkStage, setRemarkStage] = useState(null);
	const [remarks, setRemarks] = useState([]);
	const [remarkLoading, setRemarkLoading] = useState(false);
	const [newRemark, setNewRemark] = useState("");

	const [pendingStage, setPendingStage] = useState(null);
	const [pendingReason, setPendingReason] = useState("");

	const remarkEndRef = useRef(null);

	/* =====================================================
		FETCH STAGES
	===================================================== */
	const fetchStages = async () => {
		setLoading(true);
		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/stages", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await res.json();

		const safe = (data.stages || []).map((s) => ({
			...s,
			checked: s.status === "completed",
			remarks: s.remarks || [],
		}));

		setStages(safe);

		const projectMap = {};
		safe.forEach((s) => {
			projectMap[s.project.id] = {
				id: s.project.id,
				title: s.project.title,
			};
		});

		setProjectList(Object.values(projectMap));
		setLoading(false);
	};

	useEffect(() => {
		fetchStages();
	}, []);

	/* =====================================================
		UPDATE STATUS
	===================================================== */
	const updateStageStatus = async (stage, status, message = "") => {
		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${stage.id}/complete`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ status, message }),
		});

		const data = await res.json();

		if (data.success) {
			toast.success("Stage Updated");

			setStages((prev) =>
				prev.map((x) =>
					x.id === stage.id ? { ...x, status, checked: status === "completed" } : x
				)
			);
		} else toast.error("Update failed");
	};

	const onCheckToggle = (stage, checked) => {
		if (checked) {
			updateStageStatus(stage, "completed", "Stage completed by contractor");
		} else {
			setPendingStage(stage);
			setPendingReason("");
		}
	};

	const submitPending = async () => {
		if (!pendingReason.trim()) return toast.error("Enter reason first");

		await updateStageStatus(pendingStage, "pending", pendingReason.trim());
		setPendingStage(null);
	};

	/* =====================================================
		REMARKS FETCH + MARK READ
	===================================================== */
	const openRemarks = async (stage) => {
		setRemarkStage(stage);
		setRemarkLoading(true);

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${stage.id}/remarks`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await res.json();

		if (data.success) {
			setRemarks(data.remarks);

			setRemarkStage((prev) => ({
				...prev,
				StageTemplate: { name: data.stage.templateName },
				project: data.stage.project,
			}));

			setStages((prev) =>
				prev.map((x) =>
					x.id === stage.id ? { ...x, unreadCount: 0 } : x
				)
			);
		}

		setRemarkLoading(false);

		setTimeout(() => {
			remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 120);
	};

	/* =====================================================
		SEND REMARK
	===================================================== */
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
			setRemarks((prev) => [...prev, data.remark]);

			setStages((prev) =>
				prev.map((s) =>
					s.id === remarkStage.id ? { ...s, remarks: [...(s.remarks || []), data.remark] } : s
				)
			);

			setNewRemark("");

			setTimeout(() => {
				remarkEndRef.current?.scrollIntoView({
					behavior: "smooth",
				});
			}, 120);
		}
	};

	/* =====================================================
		GROUP BY FLOOR
	===================================================== */
	const groupedByFloor = (list) => {
		const out = {};

		list.forEach((s) => {
			const floor = s.floorName || "Other";

			if (!out[floor]) out[floor] = [];
			out[floor].push(s);
		});

		return out;
	};

	/* =====================================================
		STATUS BADGE
	===================================================== */
	const statusBadge = (s) => {
		const colors = {
			pending: "bg-gray-500",
			completed: "bg-blue-600",
			approved: "bg-green-600",
			rejected: "bg-red-600",
		};

		return (
			<Badge className={`${colors[s.status]} text-white`}>
				{s.status.charAt(0).toUpperCase() + s.status.slice(1)}
			</Badge>
		);
	};

	/* =====================================================
		TIMELINE COMPONENT
	===================================================== */
	const TimelineStage = ({ stage, index, stages }) => {
		const status = stage.status.toLowerCase();

		// HIDE "MARK AS COMPLETE" when admin approved it
		const hideCheckbox = stage.status === "approved";

		const prevDone =
			index === 0 || ["approved", "completed"].includes(stages[index - 1].status);

		const isCurrent =
			(status === "pending" || status === "in_progress") && prevDone;

		const isApproved = status === "approved";
		const isCompleted = status === "completed";
		const isRejected = status === "rejected";

		const icon = (() => {
			if (isApproved)
				return (
					<div className="h-7 w-7 bg-green-600 text-white rounded-full flex items-center justify-center shadow">
						✓
					</div>
				);

			if (isCompleted)
				return (
					<div className="h-7 w-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow">
						✓
					</div>
				);

			if (isRejected)
				return (
					<div className="h-7 w-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow">
						✗
					</div>
				);

			if (isCurrent)
				return (
					<div className="h-7 w-7 bg-black text-white rounded-full flex items-center justify-center shadow">
						{index + 1}
					</div>
				);

			return (
				<div className="h-7 w-7 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center shadow">
					{index + 1}
				</div>
			);
		})();

		return (
			<div className="relative pl-10 cursor-pointer mb-6">
				<div className="absolute left-3 top-0 bottom-0 w-[3px] bg-gray-300"></div>
				<div className="absolute left-0">{icon}</div>

				<div className="ml-6">
					<div className="flex justify-between items-center">
						<p
							className={`font-medium ${
								isCurrent ? "bg-gray-100 px-3 py-1 rounded-lg" : ""
							}`}
						>
							{stage.StageTemplate?.name}
						</p>

						<div className="relative">
							<Button
								size="sm"
								variant="outline"
								onClick={(e) => {
									e.stopPropagation();
									openRemarks(stage);
								}}
							>
								<MessageCircle className="w-4 h-4" />

								{stage.unreadCount > 0 && (
									<span className="
                    absolute -top-2 -right-2
                    bg-red-600 text-white text-[10px]
                    h-4 min-w-4 px-1 flex items-center justify-center
                    rounded-full shadow
                  ">
                    {stage.unreadCount}
                  </span>
								)}
							</Button>
						</div>
					</div>

					<div className="mt-1">{statusBadge(stage)}</div>

					{/* 🔥 HIDE CHECKBOX IF ADMIN APPROVED */}
					{!hideCheckbox && (
						<div className="flex items-center gap-2 mt-3">
							<input
								type="checkbox"
								checked={stage.checked}
								onChange={(e) => onCheckToggle(stage, e.target.checked)}
							/>
							<label className="text-sm">Mark as Completed</label>
						</div>
					)}
				</div>
			</div>
		);
	};

	/* =====================================================
		UI
	===================================================== */
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">My Project Stages</h1>

			<div className="max-w-sm">
				<Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
					<SelectTrigger>
						<SelectValue placeholder="Select Project" />
					</SelectTrigger>
					<SelectContent>
						{projectList.map((p) => (
							<SelectItem key={p.id} value={String(p.id)}>
								{p.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{!selectedProjectId ? (
				<p className="text-gray-500 mt-10">Select a project.</p>
			) : loading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
			) : (
				Object.entries(
					groupedByFloor(
						stages.filter((s) => String(s.project.id) === selectedProjectId)
					)
				).map(([floorName, floorStages]) => (
					<div key={floorName} className="border rounded-lg shadow bg-white">
						<div className="px-5 py-3 border-b bg-gray-100">
							<h2 className="text-lg font-semibold">{floorName}</h2>
						</div>

						<div className="p-4">
							{floorStages.map((s, i) => (
								<TimelineStage
									key={s.id}
									stage={s}
									index={i}
									stages={floorStages}
								/>
							))}
						</div>
					</div>
				))
			)}

			{/* PENDING SHEET */}
			{pendingStage && (
				<Sheet open onOpenChange={() => setPendingStage(null)}>
					<SheetContent className="w-[420px] p-4">
						<SheetHeader>
							<SheetTitle>Reason For Pending</SheetTitle>
						</SheetHeader>

						<Textarea
							value={pendingReason}
							onChange={(e) => setPendingReason(e.target.value)}
							className="h-24 mt-3"
							placeholder="Enter reason..."
						/>

						<SheetFooter>
							<Button className="w-full mt-4" onClick={submitPending}>
								Submit
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			)}

			{/* REMARK CHAT */}
			{remarkStage && (
				<Sheet open onOpenChange={() => setRemarkStage(null)}>
					<SheetContent className="w-[420px] p-0 flex flex-col bg-white">
						<div className="p-4 border-b bg-white">
							<h2 className="font-semibold text-lg">
								{remarkStage?.StageTemplate?.name}
							</h2>
						</div>

						<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
							{remarkLoading ? (
								<div className="flex justify-center py-10">
									<Loader2 className="w-6 h-6 animate-spin" />
								</div>
							) : (
								remarks.map((r) => {
									const isMe = r.by === "contractor";
									const msgDate = new Date(r.createdAt);

									return (
										<div
											key={r.id}
											className={`flex ${
												isMe ? "justify-end" : "justify-start"
											}`}
										>
											<div
												className={`px-3 py-2 rounded-xl max-w-[75%] text-sm shadow ${
													isMe
														? "bg-primary text-primary-foreground"
														: "bg-white border text-gray-800"
												}`}
											>
												<p className="text-[10px] opacity-70 mb-1">
													{isMe ? "You" : r.by}
												</p>
												<p>{r.message}</p>
												<p className="text-[10px] opacity-70 mt-1 text-right">
													{msgDate.toLocaleTimeString()}
												</p>
											</div>
										</div>
									);
								})
							)}

							<div ref={remarkEndRef} />
						</div>

						<div className="p-3 bg-white border-t flex gap-2">
							<Textarea
								value={newRemark}
								onChange={(e) => setNewRemark(e.target.value)}
								className="h-14 flex-1 resize-none"
								placeholder="Write a message..."
							/>

							<Button onClick={sendRemark} className="h-14 px-5">
								Send
							</Button>
						</div>
					</SheetContent>
				</Sheet>
			)}
		</div>
	);
}
