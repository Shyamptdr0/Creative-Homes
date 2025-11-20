"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";

export default function HomePage() {
	const [project, setProject] = useState(null);
	const [projectTypes, setProjectTypes] = useState([]);
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stageLoading, setStageLoading] = useState(false);

	const [selectedStage, setSelectedStage] = useState(null);
	const [remarkText, setRemarkText] = useState("");
	const [addingRemark, setAddingRemark] = useState(false);

	const remarkEndRef = useRef(null);

	// NEW: Approval Popup
	const [pendingApprovalProject, setPendingApprovalProject] = useState(null);

	useEffect(() => {
		if (remarkEndRef.current) {
			remarkEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [selectedStage]);

	const fetchProjectData = async () => {
		try {
			setLoading(true);
			const token = sessionStorage.getItem("token");

			if (!token) {
				setLoading(false);
				return;
			}

			const res = await fetch("/api/clients/projects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();

			const typeRes = await fetch("/api/project-types");
			const typeData = await typeRes.json();
			const types = typeData.types || [];
			setProjectTypes(types);

			if (data.success && data.projects.length > 0) {
				const p = data.projects[0];
				const typeName =
					types.find((t) => t.id === p.projectTypeId)?.name || "N/A";

				setProject({ ...p, typeName });

				// NEW: Approval Trigger
				if (!p.clientApproved) {
					setPendingApprovalProject(p);
				}
			} else {
				setProject(null);
			}
		} finally {
			setLoading(false);
		}
	};

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

	// NEW: Approve Project Function
	async function approveProject() {
		const token = sessionStorage.getItem("token");
		await fetch(`/api/projects/${pendingApprovalProject.id}/approve`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		setPendingApprovalProject(null);
		fetchProjectData();
	}

	const addRemark = async () => {
		if (!remarkText.trim()) return toast.error("Remark cannot be empty");

		try {
			setAddingRemark(true);

			const token = sessionStorage.getItem("token");
			const res = await fetch(`/api/stages/${selectedStage.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					remark: remarkText,
					by: "client",
				}),
			});

			const data = await res.json();

			if (data.success) {
				toast.success("Remark added!");

				setSelectedStage((prev) => {
					const sorted = [
						...(prev.remarks || []),
						{
							id: Date.now(),
							message: remarkText,
							by: "client",
							createdAt: new Date(),
						},
					].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

					return { ...prev, remarks: sorted };
				});

				setRemarkText("");

				setTimeout(() => {
					if (remarkEndRef.current) {
						remarkEndRef.current.scrollIntoView({ behavior: "smooth" });
					}
				}, 50);
			} else {
				toast.error("Failed to add remarks");
			}
		} finally {
			setAddingRemark(false);
		}
	};

	useEffect(() => {
		fetchProjectData();
	}, []);

	return (
		<div className="p-3 md:p-6">

			{/* ================================ */}
			{/* NEW PROJECT APPROVAL POPUP */}
			{/* ================================ */}
			{pendingApprovalProject && (
				<Dialog open={true}>
					<DialogContent className="max-w-lg space-y-4 text-center">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								New Project Requires Your Approval
							</DialogTitle>
						</DialogHeader>

						<p className="text-gray-600 text-sm">
							Please approve the project to allow work to begin.
						</p>

						<div className="bg-gray-100 p-4 rounded-md text-left">
							<p><b>Title:</b> {pendingApprovalProject.title}</p>
							<p><b>Type:</b> {pendingApprovalProject.typeName}</p>
							<p><b>Total Cost:</b> ₹ {pendingApprovalProject.totalCost}</p>
						</div>

						<Button className="w-full" onClick={approveProject}>
							Approve Project
						</Button>
					</DialogContent>
				</Dialog>
			)}
			{/* ================================ */}

			{loading ? (
				<div className="flex justify-center py-14">
					<Loader2 className="h-9 w-9 animate-spin text-gray-600" />
				</div>
			) : !project ? (
				<p className="text-gray-500 text-center">No project assigned yet.</p>
			) : (
				<Card className="rounded-2xl shadow-lg border bg-white overflow-hidden transition-all">
					<div className="flex flex-col md:flex-row">
						<div className="flex-1 p-8 md:p-10 space-y-5">
							<h1 className="text-4xl font-extrabold">{project.title}</h1>

							<p className="text-gray-600 text-sm">
								{project.area ? `${project.area} SF` : ""}{" "}
								{project.address ? ` | ${project.address}` : ""}
							</p>

							<p className="text-gray-600 text-sm">
								{project.totalCost ? `${project.totalCost} INR Budget` : ""}{" "}
								{project.status ? ` | ${project.status}` : ""}
							</p>

							<div className="grid sm:grid-cols-2 gap-5 pt-3">
								{[
									{ label: "Project Type", value: project.typeName },
									{ label: "Contractor", value: project.contractor?.name || "N/A" },
									{ label: "Your Name", value: project.client?.name || "N/A" },
									{ label: "Total Cost", value: `₹ ${project.totalCost || 0}` },
								].map((item, i) => (
									<div
										key={i}
										className="bg-gray-50 hover:bg-gray-100 transition p-4 rounded-lg border"
									>
										<p className="text-xs text-gray-500 uppercase">{item.label}</p>
										<p className="text-lg font-semibold text-gray-800 mt-1">
											{item.value}
										</p>
									</div>
								))}
							</div>

							<Sheet onOpenChange={(open) => {
								if (!open) {
									setSelectedStage(null);
									setRemarkText("");
								}
							}}>
								<SheetTrigger asChild>
									<Button onClick={fetchStages} className="mt-4 rounded-full px-6 py-2">
										View Stages
									</Button>
								</SheetTrigger>

								<SheetContent
									side="right"
									className="w-full sm:w-[420px] md:w-[480px] lg:w-[520px] px-6 py-6 overflow-hidden pt-10"
								>

									{selectedStage ? (
										<div className="flex flex-col h-full animate-fadeIn">
											<div className="flex items-center gap-3 border-b pb-3 sticky top-0 bg-white z-30">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														setSelectedStage(null);
														setRemarkText("");
													}}
												>
													<ChevronLeft className="h-5 w-5" />
												</Button>
												<h2 className="text-xl font-bold">{selectedStage.name}</h2>
											</div>

											<div className="flex-1 overflow-y-auto pr-2 py-3 space-y-3">
												{selectedStage.remarks?.length ? (
													selectedStage.remarks.map((r) => {
														let isClient = r.by === "client";
														let isContractor = r.by === "contractor";

														let name = "Admin";
														if (isClient) name = project.client?.name || "Client";
														if (isContractor) name = project.contractor?.name || "Contractor";

														return (
															<div
																key={r.id}
																className={`flex w-full ${isClient ? "justify-end" : "justify-start"}`}
															>
																<div
																	className={`max-w-[80%] p-3 rounded-xl shadow-sm border ${
																		isClient
																			? "bg-green-100 border-green-300 text-green-700"
																			: isContractor
																				? "bg-blue-100 border-blue-300 text-blue-700"
																				: "bg-gray-100 border-gray-300 text-gray-700"
																	}`}
																>
																	<p className="text-sm font-medium">{r.message}</p>
																	<p className="text-[11px] text-gray-500 mt-1 flex justify-between">
																		<span>{name}</span>
																		<span>{new Date(r.createdAt).toLocaleString()}</span>
																	</p>
																</div>
															</div>
														);
													})
												) : (
													<p className="text-gray-500 text-sm">No remarks yet.</p>
												)}

												<div ref={remarkEndRef} />
											</div>

											<div className="border-t pt-3 pb-2 bg-white sticky bottom-0">
												<p className="text-sm text-gray-600 mb-2">Add Your Remark:</p>
												<div className="flex gap-2">
													<Input
														placeholder="Write a remark..."
														value={remarkText}
														onChange={(e) => setRemarkText(e.target.value)}
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
										</div>
									) : (
										<>
											<div className="sticky top-0 bg-white pb-3 border-b pt-5 z-20">
												<SheetHeader>
													<SheetTitle className="text-xl font-bold">Work Stages</SheetTitle>
													<SheetDescription className="text-gray-600">
														Click a stage to view remarks
													</SheetDescription>
												</SheetHeader>
											</div>

											<div className="mt-6 max-h-[80vh] relative pl-10 space-y-6">
												<div className="absolute top-2 left-5 w-[3px] h-full bg-gradient-to-b from-green-500 via-gray-300 to-gray-300 rounded-full"></div>

												{stageLoading ? (
													<div className="flex justify-center py-6">
														<Loader2 className="h-6 w-6 animate-spin" />
													</div>
												) : stages.length === 0 ? (
													<p className="text-gray-500 text-center py-4">
														No stages found
													</p>
												) : (
													stages.map((s, index) => {
														const completed = s.isCompleted === true;
														const current =
															!completed &&
															(index === 0 || stages[index - 1].isCompleted);

														return (
															<div
																key={s.id}
																className="relative flex items-center gap-4 cursor-pointer"
																onClick={() =>
																	setSelectedStage({
																		...s,
																		remarks: (s.remarks || []).sort(
																			(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
																		),
																	})
																}
															>
																<div className="relative z-10">
																	{completed ? (
																		<div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
																			✓
																		</div>
																	) : current ? (
																		<div className="h-7 w-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shadow-md">
																			{index + 1}
																		</div>
																	) : (
																		<div className="h-6 w-6 rounded-full bg-gray-300 text-gray-600 flex items	center justify-center text-xs">
																			{index + 1}
																		</div>
																	)}
																</div>

																<div className="flex-1">
																	<p
																		className={`text-[16px] transition font-medium ${
																			current
																				? "bg-gray-100 border px-3 py-1.5 rounded-lg shadow-sm"
																				: "text-gray-700"
																		}`}
																	>
																		{s.name}
																	</p>
																</div>
															</div>
														);
													})
												)}
											</div>
										</>
									)}
								</SheetContent>
							</Sheet>
						</div>

						<div className="w-full md:w-[45%] bg-gray-100">
							<img
								src="/Images/images.jpeg"
								alt="project"
								className="w-full h-[430px] object-cover rounded-r-xl"
							/>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
}
