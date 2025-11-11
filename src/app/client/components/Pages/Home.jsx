"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	const [project, setProject] = useState(null);
	const [projectTypes, setProjectTypes] = useState([]);
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stageLoading, setStageLoading] = useState(false);

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

			// ✅ Fetch project types
			const typeRes = await fetch("/api/project-types");
			const typeData = await typeRes.json();
			const types = typeData.types || [];
			setProjectTypes(types);

			if (data.success && data.projects.length > 0) {
				const p = data.projects[0];
				const typeName = types.find((t) => t.id === p.projectTypeId)?.name || "N/A";

				setProject({
					...p,
					typeName,
				});
			} else {
				setProject(null);
			}
		} finally {
			setLoading(false);
		}
	};

	// ✅ Fetch stages
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

	useEffect(() => {
		fetchProjectData();
	}, []);

	return (
		<div className="p-3 md:p-6">

			{loading ? (
				<div className="flex justify-center py-14">
					<Loader2 className="h-9 w-9 animate-spin text-gray-600" />
				</div>
			) : !project ? (
				<p className="text-gray-500 text-center">No project assigned yet.</p>
			) : (
				<Card className="rounded-2xl shadow-lg border bg-white overflow-hidden transition-all">

					<div className="flex flex-col md:flex-row">

						{/* ✅ LEFT SIDE CONTENT */}
						<div className="flex-1 p-8 md:p-10 space-y-5">
							<h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
								{project.title}
							</h1>

							<p className="text-gray-600 text-sm">
								{project.area ? `${project.area} SF` : ""}
								{project.address ? ` | ${project.address}` : ""}
							</p>

							<p className="text-gray-600 text-sm">
								{project.totalCost ? `${project.totalCost} INR Budget` : ""}
								{project.status ? ` | ${project.status}` : ""}
							</p>

							<div className="grid sm:grid-cols-2 gap-5 pt-3">
								{[
									{ label: "Project Type", value: project.typeName },
									{ label: "Contractor", value: project.contractor?.name || "N/A" },
									{ label: "Client Name", value: project.client?.name || "N/A" },
									{ label: "Total Cost", value: `₹ ${project.totalCost || 0}` },
								].map((item, i) => (
									<div
										key={i}
										className="bg-gray-50 hover:bg-gray-100 transition cursor-default p-4 rounded-lg border"
									>
										<p className="text-xs text-gray-500 uppercase tracking-wide">
											{item.label}
										</p>
										<p className="text-lg font-semibold text-gray-800 mt-1">
											{item.value}
										</p>
									</div>
								))}
							</div>

							{/* ✅ OPEN STAGE SHEET */}
							<Sheet>
								<SheetTrigger asChild>
									<Button
										onClick={fetchStages}
										className="mt-4 rounded-full px-6 py-2 text-md"
									>
										View Stages
									</Button>
								</SheetTrigger>

								{/* ✅ MODERN SHEET UI */}
								<SheetContent side="right" className="w-full sm:w-[420px] md:w-[480px] lg:w-[520px] px-6 py-6 overflow-y-auto pt-10">

									{/* Sticky Header */}
									<div className="sticky top-0 bg-white pb-3 z-20 border-b pt-5">
										<SheetHeader>
											<SheetTitle className="text-xl font-bold">Work Status</SheetTitle>
											<SheetDescription className="text-gray-600">
												Track construction progress visually
											</SheetDescription>
										</SheetHeader>
									</div>

									{/* Body */}
									<div className="mt-6">
										{stageLoading ? (
											<div className="flex justify-center py-6">
												<Loader2 className="h-6 w-6 animate-spin" />
											</div>
										) : stages.length === 0 ? (
											<p className="text-gray-500 text-center py-4">No stages found</p>
										) : (
											<div className="relative pl-10 space-y-6">

												{/* ✅ Vertical Active Progress Line */}
												<div className="absolute top-2 left-5 w-[3px] h-full bg-gradient-to-b from-green-500 via-gray-300 to-gray-300 rounded-full"></div>

												{stages.map((s, index) => {
													const isCompleted = s.isCompleted === true;
													const isCurrent =
														!isCompleted &&
														(index === 0 || stages[index - 1].isCompleted);

													return (
														<div key={s.id} className="relative flex items-center gap-4 group">

															{/* ✅ Status Indicator */}
															<div className="relative z-10">
																{isCompleted ? (
																	<div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
																		✓
																	</div>
																) : isCurrent ? (
																	<div className="h-7 w-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shadow-md">
																		{index + 1}
																	</div>
																) : (
																	<div className="h-6 w-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs">
																		{index + 1}
																	</div>
																)}
															</div>

															{/* ✅ Stage Name */}
															<div className="flex-1">
																<p
																	className={`text-[16px] transition font-medium ${
																		isCurrent
																			? "bg-gray-100 border px-3 py-1.5 rounded-lg shadow-sm"
																			: "text-gray-700"
																	}`}
																>
																	{s.name}
																</p>

															</div>
														</div>
													);
												})}
											</div>
										)}
									</div>
								</SheetContent>
							</Sheet>

						</div>

						{/* ✅ RIGHT SIDE IMAGE */}
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
