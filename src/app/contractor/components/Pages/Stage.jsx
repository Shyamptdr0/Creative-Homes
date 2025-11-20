"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export default function ContractorStages() {
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(true);

	// REMARK SHEET
	const [remarkStage, setRemarkStage] = useState(null);
	const [newRemark, setNewRemark] = useState("");
	const [remarks, setRemarks] = useState([]);
	const [remarkLoading, setRemarkLoading] = useState(false);

	const remarkEndRef = useRef(null);

	/* =========================================================
	   LOAD STAGES
	========================================================= */
	const fetchStages = async () => {
		setLoading(true);

		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/stages", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const data = await res.json();

		const safe = (data.stages || []).map((s) => ({
			...s,
			project: s.project ?? { id: "unknown", title: "Unknown Project" },
			remarks: s.remarks || [],
		}));

		setStages(safe);
		setLoading(false);
	};

	useEffect(() => {
		fetchStages();
	}, []);

	// Auto scroll inside drawer
	useEffect(() => {
		if (remarkEndRef.current) {
			remarkEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [remarks]);

	/* =========================================================
	   STATUS BADGE
	========================================================= */
	const statusBadge = (s) => {
		if (s.status === "approved")
			return <Badge className="bg-green-600 text-white">Approved</Badge>;

		if (s.status === "completed")
			return <Badge className="bg-blue-600 text-white">Completed</Badge>;

		if (s.status === "rejected")
			return <Badge className="bg-red-600 text-white">Rejected</Badge>;

		return <Badge className="bg-gray-600 text-white">Pending</Badge>;
	};

	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	/* =========================================================
	   COMPLETE STAGE Check
	========================================================= */
	const toggleComplete = async (stage) => {
		const token = sessionStorage.getItem("token");

		// instant UI
		setStages((prev) =>
			prev.map((s) =>
				s.id === stage.id
					? { ...s, status: s.status === "completed" ? "pending" : "completed" }
					: s
			)
		);

		// API
		const res = await fetch(`/api/stages/${stage.id}/complete`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				message:
					stage.status === "completed"
						? "Marked pending"
						: "Stage completed by contractor",
			}),
		});

		const data = await res.json();

		if (!data.success) {
			toast.error("Failed to update");

			// rollback
			setStages((prev) =>
				prev.map((s) =>
					s.id === stage.id ? { ...s, status: stage.status } : s
				)
			);
		}
	};

	/* =========================================================
	   OPEN REMARKS
	========================================================= */
	const openRemarks = async (stage) => {
		setRemarkStage(stage);
		setRemarkLoading(true);

		const res = await fetch(`/api/stages/${stage.id}/remarks`);
		const data = await res.json();

		if (data.success) setRemarks(data.remarks);

		setRemarkLoading(false);
	};

	/* =========================================================
	   SEND REMARK
	========================================================= */
	const sendRemark = async () => {
		if (!newRemark.trim()) return toast.error("Enter remark");

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${remarkStage.id}/remarks`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				message: newRemark,
			}),
		});

		const data = await res.json();

		if (data.success) {
			const newMsg = {
				id: Math.random(),
				by: "contractor",
				message: newRemark,
				createdAt: new Date(),
			};

			// drawer add
			setRemarks((prev) => [...prev, newMsg]);

			// main list update
			setStages((prev) =>
				prev.map((s) =>
					s.id === remarkStage.id
						? { ...s, remarks: [...(s.remarks || []), newMsg] }
						: s
				)
			);

			setNewRemark("");
		}
	};

	/* =========================================================
	  GROUP BY PROJECT
	========================================================= */
	const grouped = stages.reduce((acc, s) => {
		const key = s.project?.id || "unknown";
		if (!acc[key]) {
			acc[key] = {
				project: s.project,
				stages: [],
			};
		}

		acc[key].stages.push(s);
		return acc;
	}, {});

	/* =========================================================
	   UI
	========================================================= */
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">My Project Stages</h1>

			{loading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="w-8 h-8 animate-spin text-gray-700" />
				</div>
			) : (
				Object.values(grouped).map(({ project, stages }) => (
					<div
						key={project.id}
						className="border rounded-lg shadow bg-white overflow-hidden"
					>
						<div className="bg-gray-100 px-5 py-3 border-b">
							<h2 className="text-xl font-semibold">
								Project — {project.title}
							</h2>
						</div>

						<div className="p-4 space-y-4">
							{stages.map((s) => (
								<div
									key={s.id}
									className="border p-4 rounded bg-gray-50 shadow-sm"
								>
									<div className="flex justify-between items-center">
										<div className="space-y-2">
											<p className="font-semibold text-lg">
												{s.StageTemplate?.name}
											</p>

											<div className="flex items-center gap-3">
												<input
													type="checkbox"
													checked={s.status === "completed"}
													onChange={() => toggleComplete(s)}
												/>
												<label className="text-sm select-none">
													Mark as Completed
												</label>
											</div>
										</div>

										<div className="flex items-center gap-2">
											{statusBadge(s)}

											<Button
												size="sm"
												variant="outline"
												onClick={() => openRemarks(s)}
											>
												<MessageCircle className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))
			)}

			{/* =========================================================
			    REMARKS SHEET
			========================================================= */}
			{remarkStage && (
				<Sheet open onOpenChange={() => setRemarkStage(null)}>
					<SheetContent className="w-[420px] p-3">
						<SheetHeader>
							<SheetTitle className="text-lg font-semibold">
								Remarks — {remarkStage.StageTemplate?.name}
							</SheetTitle>
						</SheetHeader>

						<div className="mt-4 max-h-[70vh] overflow-y-auto space-y-4">
							{remarkLoading ? (
								<div className="flex justify-center py-10">
									<Loader2 className="w-6 h-6 animate-spin" />
								</div>
							) : (
								<>
									{remarks.map((r) => {
										const isMe = r.by === "contractor";

										return (
											<div
												key={r.id}
												className={`flex ${
													isMe ? "justify-end" : "justify-start"
												}`}
											>
												<div
													className={`px-3 py-2 rounded-xl shadow max-w-[75%] border ${
														isMe
															? "bg-blue-100 border-blue-300"
															: r.by === "admin"
																? "bg-red-100 border-red-300"
																: "bg-green-100 border-green-300"
													}`}
												>
													<p className="text-sm">{r.message}</p>
													<p className="text-[11px] text-gray-600 mt-1 flex justify-between">
														<span>{isMe ? "You" : r.by}</span>
														<span>{formatDate(r.createdAt)}</span>
													</p>
												</div>
											</div>
										);
									})}

									<div ref={remarkEndRef} />
								</>
							)}
						</div>

						<Separator className="my-4" />

						<Textarea
							className="h-20"
							placeholder="Write a message..."
							value={newRemark}
							onChange={(e) => setNewRemark(e.target.value)}
						/>

						<SheetFooter>
							<Button
								onClick={sendRemark}
								className="w-full"
								disabled={remarkLoading}
							>
								{remarkLoading ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									"Send"
								)}
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			)}
		</div>
	);
}

