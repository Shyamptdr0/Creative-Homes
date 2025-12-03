"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function HomePage() {
	const [project, setProject] = useState(null);
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stageLoading, setStageLoading] = useState(false);

	const [selectedStage, setSelectedStage] = useState(null);
	const [stageRemarks, setStageRemarks] = useState([]);
	const [remarkText, setRemarkText] = useState("");
	const [addingRemark, setAddingRemark] = useState(false);

	const remarkEndRef = useRef(null);
	const [pendingApprovalProject, setPendingApprovalProject] = useState(null);

	/* --------------------------------------------------------
		AUTO SCROLL CHAT
	-------------------------------------------------------- */
	useEffect(() => {
		remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [stageRemarks]);

	/* --------------------------------------------------------
		FETCH PROJECT
	-------------------------------------------------------- */
	const fetchProjectData = async () => {
		try {
			setLoading(true);
			const token = sessionStorage.getItem("token");

			if (!token) return;

			const res = await fetch("/api/clients/projects", {
				headers: { Authorization: `Bearer ${token}` },
			});

			const data = await res.json();

			if (data.success && data.projects.length > 0) {
				const p = data.projects[0];
				setProject(p);

				if (!p.clientApproved) setPendingApprovalProject(p);
			}
		} finally {
			setLoading(false);
		}
	};

	/* --------------------------------------------------------
		FETCH STAGES (used everywhere)
	-------------------------------------------------------- */
	const fetchStages = async () => {
		try {
			setStageLoading(true);
			const token = sessionStorage.getItem("token");

			const res = await fetch("/api/clients/stages", {
				headers: { Authorization: `Bearer ${token}` },
			});

			const data = await res.json();

			if (data.success) {
				const sorted = [...data.stages].sort((a, b) => a.id - b.id);
				setStages(sorted);
			}
		} finally {
			setStageLoading(false);
		}
	};

	/* --------------------------------------------------------
		FIX: Load unread badge on page load also
	-------------------------------------------------------- */
	useEffect(() => {
		fetchProjectData();
		fetchStages();   // 🔥 FIX: unreadRemarks now available before opening sheet
	}, []);

	/* --------------------------------------------------------
		APPROVE PROJECT
	-------------------------------------------------------- */
	async function approveProject() {
		const token = sessionStorage.getItem("token");

		await fetch(`/api/projects/${pendingApprovalProject.id}/approve`, {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` },
		});

		setPendingApprovalProject(null);
		fetchProjectData();
	}

	/* --------------------------------------------------------
		OPEN STAGE PANEL WITH READ UPDATE
	-------------------------------------------------------- */
	const openStagePanel = async (stage) => {
		setSelectedStage(stage);
		setStageRemarks([]);

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${stage.id}/remarks`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await res.json();

		if (data.success) {
			setStageRemarks(
				data.remarks.sort(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
				)
			);
		}

		// mark unread = 0 for this stage
		setStages((prev) =>
			prev.map((s) =>
				s.id === stage.id ? { ...s, unreadRemarks: 0 } : s
			)
		);
	};

	/* --------------------------------------------------------
		SEND REMARK
	-------------------------------------------------------- */
	const addRemark = async () => {
		if (!remarkText.trim()) return toast.error("Remark is empty");

		setAddingRemark(true);

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${selectedStage.id}/remarks`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				message: remarkText,
			}),
		});

		const data = await res.json();

		if (data.success) {
			setStageRemarks((prev) => [...prev, data.remark]);
			setRemarkText("");
		}

		setAddingRemark(false);
	};

	/* --------------------------------------------------------
		SORT FLOORS
	-------------------------------------------------------- */
	function sortFloors(name = "") {
		const f = name.toLowerCase();

		if (f.includes("basement")) return -2;
		if (f.includes("ground")) return -1;

		const n = f.match(/\d+/);
		if (n) return parseInt(n[0]);

		if (f.includes("terrace") || f.includes("roof")) return 100;

		return 50;
	}

	/* --------------------------------------------------------
		UI
	-------------------------------------------------------- */
	return (
		<div className="p-4 md:p-6">

			{/* APPROVAL POPUP */}
			{pendingApprovalProject && (
				<Dialog open={true}>
					<DialogContent className="max-w-lg text-center space-y-4">
						<DialogHeader>
							<DialogTitle className="text-lg font-bold">
								New Project Requires Your Approval
							</DialogTitle>
						</DialogHeader>

						<div className="p-4 bg-gray-100 rounded text-left">
							<p><b>Title:</b> {pendingApprovalProject.title}</p>
							<p><b>Cost:</b> ₹{pendingApprovalProject.totalCost}</p>
						</div>

						<Button className="w-full" onClick={approveProject}>
							Approve Project
						</Button>
					</DialogContent>
				</Dialog>
			)}

			{loading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="animate-spin h-10 w-10" />
				</div>
			) : !project ? (
				<p className="text-center text-gray-500">No project found.</p>
			) : (
				<Card className="rounded-2xl shadow-xl border bg-white overflow-hidden">

					<div className="flex flex-col md:flex-row">

						{/* LEFT SIDE */}
						<div className="flex-1 p-8 space-y-6">

							<h1 className="text-4xl font-extrabold">{project.title}</h1>

							<div className="grid sm:grid-cols-2 gap-5">

								<div className="p-4 bg-gray-50 border rounded-lg">
									<p className="text-xs text-gray-500">Project Type</p>
									<p className="text-lg font-semibold">{project.projectType?.name}</p>
								</div>

								<div className="p-4 bg-gray-50 border rounded-lg">
									<p className="text-xs text-gray-500">Contractor</p>
									<p className="text-lg font-semibold">{project.contractor?.name}</p>
								</div>

							</div>

							{/* BUTTON - VIEW STAGES */}
							<Sheet onOpenChange={(o) => !o && setSelectedStage(null)}>
								<div className="relative inline-block">

									<SheetTrigger asChild>
										<Button
											onClick={fetchStages}
											className="rounded-full px-6 py-2 mt-2"
										>
											View Stages
										</Button>
									</SheetTrigger>

									{/* BADGE ALWAYS LIVE (FIXED) */}
									{stages.some((s) => s.unreadRemarks > 0) && (
										<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-[6px] py-[1px] rounded-full shadow">
                                            {stages.reduce(
	                                            (sum, s) => sum + (s.unreadRemarks || 0),
	                                            0
                                            )}
                                        </span>
									)}
								</div>

								{/* RIGHT PANEL */}
								<SheetContent
									side="right"
									className="w-full sm:w-[460px] p-0 flex flex-col"
								>
									<SheetHeader className="p-4 border-b">
										<SheetTitle className="text-lg font-bold">
											Project Stages
										</SheetTitle>
									</SheetHeader>

									{/* LIST VIEW */}
									{!selectedStage && (
										<div className="max-h-[85vh] overflow-y-auto p-5 relative">

											{Object.entries(
												stages.reduce((acc, st) => {
													const floor = st.floorName || "Other";
													(acc[floor] = acc[floor] || []).push(st);
													return acc;
												}, {})
											)
												.sort(([a], [b]) => sortFloors(a) - sortFloors(b))
												.map(([floor, items]) => (
													<div key={floor} className="mb-6 relative">

														<h3 className="text-lg font-semibold bg-gray-100 p-2 rounded">
															{floor}
														</h3>

														<div className="absolute left-6 top-14 bottom-2 w-[4px]
                                                            bg-gradient-to-b from-green-500 via-gray-300 to-gray-300 rounded-full" />

														<div className="relative pl-10 space-y-7 mt-4">

															{items.map((s, idx) => {
																const status = s.status?.toLowerCase();
																const done =
																	status === "completed" ||
																	status === "approved";

																const icon = done ? (
																	<div className="h-7 w-7 flex items-center justify-center bg-green-600 text-white rounded-full">
																		✓
																	</div>
																) : (
																	<div className="h-7 w-7 flex items-center justify-center bg-gray-300 rounded-full">
																		{idx + 1}
																	</div>
																);

																return (
																	<div
																		key={s.id}
																		onClick={() => openStagePanel(s)}
																		className="flex gap-4 items-center cursor-pointer"
																	>
																		<div className="z-10">{icon}</div>

																		<div>
																			<p className="font-medium text-[16px] flex items-center gap-2">
																				{s.StageTemplate?.name}

																				{s.unreadRemarks > 0 && (
																					<span className="px-2 py-[2px] bg-red-600 text-white text-[10px] rounded-full">
                                                                                        {s.unreadRemarks}
                                                                                    </span>
																				)}
																			</p>

																			<p className="text-xs text-gray-600 mt-[2px]">
																				{s.status}
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

									{/* CHAT VIEW */}
									{selectedStage && (
										<div className="flex flex-col h-full">

											<div className="p-4 border-b flex items-center gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setSelectedStage(null)}
												>
													<ChevronLeft />
												</Button>

												<h2 className="font-bold text-lg">
													{selectedStage.StageTemplate?.name}
												</h2>
											</div>

											<div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">

												{stageRemarks.map((r) => {
													const isMe = r.by === "client";

													return (
														<div
															key={r.id}
															className={`flex ${isMe ? "justify-end" : "justify-start"}`}
														>
															<div
																className={`max-w-[70%] px-3 py-2 rounded-xl shadow border ${
																	isMe
																		? "bg-green-100 border-green-300"
																		: r.by === "admin"
																			? "bg-red-100 border-red-300"
																			: "bg-blue-100 border-blue-300"
																}`}
															>
																<p className="text-xs opacity-70">
																	{r.by === "client"
																		? "You"
																		: r.by === "admin"
																			? "Admin"
																			: "Contractor"}
																</p>

																<p>{r.message}</p>

																<p className="text-[10px] opacity-70 text-right mt-1">
																	{new Date(r.createdAt).toLocaleTimeString()}
																</p>
															</div>
														</div>
													);
												})}

												<div ref={remarkEndRef} />
											</div>

											<div className="border-t p-3 flex gap-2 bg-white sticky bottom-0">
												<Input
													value={remarkText}
													onChange={(e) => setRemarkText(e.target.value)}
													placeholder="Write a remark..."
												/>
												<Button onClick={addRemark} disabled={addingRemark}>
													{addingRemark ? (
														<Loader2 className="animate-spin h-4 w-4" />
													) : (
														"Send"
													)}
												</Button>
											</div>

										</div>
									)}
								</SheetContent>
							</Sheet>
						</div>

						{/* IMAGE */}
						<div className="w-full md:w-[45%] bg-gray-100">
							<img
								src="/Images/images.jpeg"
								className="w-full h-[430px] object-cover rounded-r-xl"
							/>
						</div>

					</div>

				</Card>
			)}
		</div>
	);
}
