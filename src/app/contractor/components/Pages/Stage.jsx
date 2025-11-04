"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function ContractorStages() {
	const [stages, setStages] = useState([]);
	const [editStage, setEditStage] = useState(null);
	const [updatedProgress, setUpdatedProgress] = useState("");
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(true);

	// ✅ Fetch all stages
	const fetchStages = async () => {
		try {
			setFetchLoading(true);
			const token = sessionStorage.getItem("token");

			const res = await fetch("/api/contractors/stages", {
				headers: { Authorization: `Bearer ${token}` },
			});

			const data = await res.json();
			if (data.success) setStages(data.stages);
		} catch {
			console.log("Error fetching stages");
		} finally {
			setFetchLoading(false);
		}
	};

	useEffect(() => {
		fetchStages();
	}, []);

	// ✅ Update progress function
	const handleProgressUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${editStage?.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ progress: updatedProgress }),
		});

		const data = await res.json();
		if (data.success) {
			setEditStage(null);
			setUpdatedProgress("");
			fetchStages();
		}

		setLoading(false);
	};

	// ✅ Progress color function
	const getProgressColor = (value) => {
		if (value <= 30) return "bg-red-500 text-white";
		if (value <= 60) return "bg-orange-500 text-white";
		if (value <= 90) return "bg-blue-500 text-white";
		return "bg-green-600 text-white";
	};

	// ✅ Group stages by project
	const projects = stages.reduce((acc, stage) => {
		const pid = stage.project?.id ?? "no-project";
		if (!acc[pid]) acc[pid] = { project: stage.project, stages: [] };
		acc[pid].stages.push(stage);
		return acc;
	}, {});

	return (
		<div className="container mx-auto grid grid-cols-1 gap-8 py-8">
			<h1 className="text-2xl font-bold">Stage Progress</h1>

			{/* ✅ Loading Skeleton */}
			{fetchLoading && (
				<div className="space-y-4 animate-pulse">
					<div className="h-6 bg-gray-200 rounded w-48"></div>
					<div className="h-40 bg-gray-200 rounded"></div>
					<div className="h-40 bg-gray-200 rounded"></div>
				</div>
			)}

			{/* ✅ No stages */}
			{!fetchLoading && Object.values(projects).length === 0 && (
				<p className="text-center text-sm text-gray-500">No stages found</p>
			)}

			{/* ✅ Projects */}
			{!fetchLoading &&
				Object.values(projects).map(({ project, stages }, i) => {
					if (!project) return null;

					return (
						<div key={project.id || i} className="border rounded-lg bg-white shadow p-4 mb-8">
							<h2 className="text-lg font-semibold mb-3">
								🏗️ {project.title}
							</h2>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Stage</TableHead>
										<TableHead>Timeline</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Progress</TableHead>
										<TableHead className="text-right">Action</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{stages.map((stage) => (
										<TableRow key={stage.id}>
											<TableCell className="font-medium">{stage.name}</TableCell>

											<TableCell className="text-sm">
												{stage.startDate?.slice(0, 10) || "--"} → {stage.endDate?.slice(0, 10) || "--"}
											</TableCell>

											<TableCell className="max-w-[250px]">
												<Textarea value={stage.description} disabled rows={2} />
											</TableCell>

											<TableCell className="min-w-[150px]">
												<div className="flex items-center justify-between mb-1">
													<span className="text-sm font-medium">{stage.progress}%</span>
													<Badge className={`text-xs px-2 py-1 rounded-full ${getProgressColor(stage.progress ?? 0)}`}>
														{stage.progress <= 30 ? "Starting" : stage.progress <= 60 ? "In Progress" : stage.progress <= 90 ? "Near Done" : "Completed"}
													</Badge>
												</div>

												<div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
													<div
														className={`h-3 rounded-full transition-all duration-700 ease-out ${getProgressColor(stage.progress ?? 0)}`}
														style={{ width: `${stage.progress}%` }}
													></div>
												</div>
											</TableCell>

											<TableCell className="text-right">
												<Button
													size="sm"
													onClick={() => {
														setEditStage(stage);
														setUpdatedProgress(stage.progress ?? 0);
													}}
													disabled={loading}
												>
													Update
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					);
				})}

			{/* ✅ Update Progress Dialog */}
			{editStage && (
				<Dialog open={true} onOpenChange={() => setEditStage(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Update Stage Progress</DialogTitle>
						</DialogHeader>

						<form onSubmit={handleProgressUpdate} className="space-y-4">
							<p className="font-medium">{editStage.name}</p>

							<label className="text-sm font-medium">Adjust Progress</label>
							<input
								type="range"
								min="0"
								max="100"
								value={updatedProgress}
								onChange={(e) => setUpdatedProgress(Number(e.target.value))}
								className="w-full cursor-pointer accent-blue-600"
							/>

							<div className="flex justify-between text-sm">
								<span>0%</span>
								<span>{updatedProgress}%</span>
								<span>100%</span>
							</div>

							<div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
								<div
									className={`h-3 rounded-full transition-all duration-700 ease-out ${getProgressColor(updatedProgress)}`}
									style={{ width: `${updatedProgress}%` }}
								></div>
							</div>

							<div className="flex justify-between items-center mt-2">
								<p className="text-sm text-gray-600">Selected Progress:</p>
								<Badge className={getProgressColor(updatedProgress)}>
									{updatedProgress}%
								</Badge>
							</div>

							<DialogFooter>
								<Button type="submit" disabled={loading}>
									{loading ? (
										<div className="flex items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											Saving...
										</div>
									) : (
										"Save"
									)}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
