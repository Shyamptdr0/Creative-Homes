"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

import { Loader2, CheckSquare, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ContractorStages() {
	const [stages, setStages] = useState([]);
	const [editStage, setEditStage] = useState(null);
	const [loading, setLoading] = useState(false);

	const [fetchLoading, setFetchLoading] = useState(true);
	const [remarkLoading, setRemarkLoading] = useState(false);

	const [isCompleted, setIsCompleted] = useState(false);
	const [remark, setRemark] = useState("");

	const [remarkSheetStage, setRemarkSheetStage] = useState(null);
	const [newRemark, setNewRemark] = useState("");

	const remarkEndRef = useRef(null);

	const fetchStages = async () => {
		try {
			setFetchLoading(true);
			const token = sessionStorage.getItem("token");

			const res = await fetch("/api/contractors/stages", {
				headers: { Authorization: `Bearer ${token}` },
			});

			const data = await res.json();

			if (data.success) {
				const normalized = data.stages.map((s) => ({
					...s,
					remarks: s.remarks || [],
					project: s.project || {
						id: `unknown-${Math.random()}`,
						title: "Unknown Project",
					},
				}));

				setStages(normalized);
			}
		} finally {
			setFetchLoading(false);
		}
	};

	useEffect(() => {
		fetchStages();
	}, []);

	useEffect(() => {
		if (remarkEndRef.current) {
			remarkEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [remarkSheetStage]);

	const saveChanges = async () => {
		setLoading(true);
		const token = sessionStorage.getItem("token");

		await fetch(`/api/stages/${editStage.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				isCompleted,
				remark: remark || (isCompleted ? "Stage completed ✅" : ""),
				by: "contractor",
			}),
		});

		setEditStage(null);
		setRemark("");
		setIsCompleted(false);

		await fetchStages();
		setLoading(false);
	};

	const submitRemark = async () => {
		if (!newRemark.trim()) return alert("Enter remark");
		setRemarkLoading(true);

		const token = sessionStorage.getItem("token");

		await fetch(`/api/stages/${remarkSheetStage.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}` },
			body: JSON.stringify({
				remark: newRemark,
				by: "contractor",
			}),
		});

		// ✅ Add and sort by time
		setRemarkSheetStage((prev) => {
			const sorted = [
				...(prev.remarks || []),
				{
					id: Math.random(),
					by: "contractor",
					message: newRemark,
					createdAt: new Date(),
				},
			].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

			return { ...prev, remarks: sorted };
		});

		setNewRemark("");
		setRemarkLoading(false);

		setTimeout(() => {
			if (remarkEndRef.current)
				remarkEndRef.current.scrollIntoView({ behavior: "smooth" });
		}, 50);
	};

	const grouped = stages.reduce((acc, s) => {
		const pid = s.project.id;
		if (!acc[pid]) acc[pid] = { project: s.project, stages: [] };
		acc[pid].stages.push(s);
		return acc;
	}, {});

	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	const statusBadge = (s) =>
		s.isCompleted ? (
			<Badge className="bg-green-600 text-white px-3 py-1">✅ Completed</Badge>
		) : (
			<Badge className="bg-gray-700 text-white px-3 py-1">Not Completed</Badge>
		);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<h1 className="text-3xl font-bold">Stages</h1>

			{fetchLoading && stages.length === 0 && (
				<div className="flex justify-center py-20">
					<div className="flex items-center gap-3 text-lg p-4">
						<Loader2 className="w-6 h-6 animate-spin text-gray-600" />
						Loading...
					</div>
				</div>
			)}

			{!fetchLoading &&
				Object.values(grouped).map(({ project, stages }) => (
					<div
						key={project.id}
						className="shadow-sm border bg-white rounded-xl overflow-hidden"
					>
						<div className="border-b bg-gray-50 px-5 py-3">
							<h2 className="text-xl font-bold text-gray-800">
								Project Name - {project.title}
							</h2>
						</div>

						{stages.length === 0 ? (
							<div className="p-5 text-center text-gray-500">No stages found</div>
						) : (
							<div className="space-y-4 p-4">
								{stages.map((s) => (
									<div
										key={s.id}
										className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition shadow-sm"
									>
										<div className="flex justify-between items-start">
											<div>
												<p className="font-semibold text-lg text-gray-800">{s.name}</p>
												<p className="text-sm text-gray-600">{s.description}</p>
											</div>

											<div className="flex justify-end gap-2 mt-3">
												{statusBadge(s)}
												<Button
													size="sm"
													variant="outline"
													className="flex items-center gap-1"
													onClick={() =>
														setRemarkSheetStage({
															...s,
															remarks: (s.remarks || []).sort(
																(a, b) =>
																	new Date(a.createdAt) -
																	new Date(b.createdAt)
															),
														})
													}
												>
													<MessageCircle className="w-4 h-4" />
													Remarks ({s.remarks?.length || 0})
												</Button>

												<Button
													size="sm"
													className="flex items-center gap-1"
													onClick={() => {
														setEditStage(s);
														setIsCompleted(s.isCompleted ?? false);
														setRemark("");
													}}
												>
													<CheckSquare className="w-4 h-4" />
													Update
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				))}

			{editStage && (
				<Dialog open={true} onOpenChange={() => setEditStage(null)}>
					<DialogContent className="space-y-3">
						<DialogHeader>
							<DialogTitle className="font-semibold">Update Stage</DialogTitle>
						</DialogHeader>

						<p className="font-semibold text-lg">{editStage.name}</p>

						<label className="flex items-center gap-2 text-sm font-medium">
							<input
								type="checkbox"
								checked={isCompleted}
								onChange={(e) => setIsCompleted(e.target.checked)}
							/>
							Mark as Completed ✅
						</label>

						<DialogFooter>
							<Button onClick={saveChanges} disabled={loading}>
								{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{remarkSheetStage && (
				<Sheet open={true} onOpenChange={() => setRemarkSheetStage(null)}>
					<SheetContent className="w-[420px] overflow-auto p-2">
						<SheetHeader>
							<SheetTitle className="font-semibold text-lg">
								Conversation — {remarkSheetStage.name}
							</SheetTitle>
						</SheetHeader>

						<div className="mt-4 space-y-3 px-1 max-h-[78vh] overflow-y-auto">
							{remarkSheetStage.remarks?.length > 0 ? (
								remarkSheetStage.remarks.map((r) => {
									let bubble = "";
									let align = "justify-start";
									let name = "Admin";

									if (r.by === "contractor") {
										bubble = "bg-blue-100 border-blue-300 text-blue-700";
										align = "justify-end";
										name = "You";
									} else if (r.by === "client") {
										bubble = "bg-green-100 border-green-300 text-green-700";
										name = "Client";
									} else {
										bubble = "bg-red-100 border-red-300 text-red-700";
										name = "Admin";
									}

									return (
										<div key={r.id} className={`flex w-full ${align}`}>
											<div
												className={`max-w-[80%] p-3 rounded-xl shadow-sm border ${bubble}`}
											>
												<p className="text-sm font-medium">{r.message}</p>
												<p className="text-[11px] mt-1 flex justify-between text-gray-600">
													<span>{name}</span>
													<span>{formatDate(r.createdAt)}</span>
												</p>
											</div>
										</div>
									);
								})
							) : (
								<p className="text-gray-500 text-sm">No remarks yet</p>
							)}

							<div ref={remarkEndRef} />
						</div>

						<Separator className="my-3" />

						<Textarea
							placeholder="Write your message..."
							value={newRemark}
							onChange={(e) => setNewRemark(e.target.value)}
							className="h-20"
						/>

						<SheetFooter>
							<Button onClick={submitRemark} disabled={remarkLoading} className="w-full">
								{remarkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			)}
		</div>
	);
}
