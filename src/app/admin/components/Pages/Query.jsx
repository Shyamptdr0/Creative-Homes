"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Loader2,
	Trash2,
	Reply,
	ChevronDown,
	ChevronUp,
	X,
	ZoomIn,
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/components/ui/tabs";

export default function AdminQueriesPage() {
	const [queries, setQueries] = useState([]);
	const [loading, setLoading] = useState(false);
	const [replyingId, setReplyingId] = useState(null);
	const [replyText, setReplyText] = useState("");
	const [tab, setTab] = useState("client");
	const [filterByProject, setFilterByProject] = useState({});
	const [openProject, setOpenProject] = useState(null);

	const [clientNew, setClientNew] = useState(0);
	const [contractorNew, setContractorNew] = useState(0);
	const [pageLoading, setPageLoading] = useState(true);

	// 🆕 IMAGE MODAL
	const [imageModal, setImageModal] = useState({
		open: false,
		url: null,
	});

	// FETCH COUNTS
	const fetchCounts = async () => {
		try {
			const clientRes = await fetch(`/api/queries?type=client`);
			const contractorRes = await fetch(`/api/queries?type=contractor`);

			let clientData = await clientRes.json();
			let contractorData = await contractorRes.json();

			if (!Array.isArray(clientData)) clientData = [];
			if (!Array.isArray(contractorData)) contractorData = [];

			setClientNew(clientData.filter((q) => !q.reply).length);
			setContractorNew(contractorData.filter((q) => !q.reply).length);
		} catch (err) {
			console.error("Count fetch failed:", err);
		}
	};

	// FETCH QUERIES
	const fetchQueries = async () => {
		setPageLoading(true);
		try {
			const res = await fetch(`/api/queries?type=${tab}`);
			let data = await res.json();

			if (!Array.isArray(data)) data = [];

			data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setQueries(data);

			const newCount = data.filter((q) => !q.reply).length;
			if (tab === "client") setClientNew(newCount);
			else setContractorNew(newCount);
		} catch {
			setQueries([]);
		}
		setPageLoading(false);
	};

	useEffect(() => {
		fetchCounts();
	}, []);

	useEffect(() => {
		fetchQueries();
	}, [tab]);

	// SUBMIT REPLY
	const submitReply = async (id) => {
		if (!replyText) return alert("Reply cannot be empty");

		setLoading(true);

		await fetch(`/api/queries/reply/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ reply: replyText }),
		});

		setReplyingId(null);
		setReplyText("");
		fetchQueries();
		fetchCounts();
		setLoading(false);
	};

	// DELETE QUERY
	const deleteQuery = async (id) => {
		if (!confirm("Delete this query?")) return;
		setLoading(true);

		await fetch(`/api/queries/${id}`, { method: "DELETE" });

		fetchQueries();
		fetchCounts();
		setLoading(false);
	};

	// GROUP BY PROJECT
	const groupedQueries = queries.reduce((acc, q) => {
		const projectName = q.Project?.title || "Unknown Project";
		if (!acc[projectName]) acc[projectName] = [];
		acc[projectName].push(q);
		return acc;
	}, {});

	// RENDER GROUPED CARDS
	const renderGrouped = () =>
		Object.keys(groupedQueries).map((project) => {
			const projectQueries = groupedQueries[project];
			const isOpen = openProject === project;

			const newCount = projectQueries.filter((q) => !q.reply).length;

			const filter = filterByProject[project] || "all";

			const filtered =
				filter === "new"
					? projectQueries.filter((q) => !q.reply)
					: filter === "resolved"
						? projectQueries.filter((q) => q.reply)
						: projectQueries;

			const firstQuery = projectQueries[0];
			const contractorName = firstQuery.Contractor?.name || "N/A";

			return (
				<Card key={project} className="mb-4 border shadow-md rounded-xl bg-white">
					<CardHeader
						className="flex justify-between items-center cursor-pointer py-4 px-5 hover:bg-gray-50 transition"
						onClick={() => setOpenProject(isOpen ? null : project)}
					>
						<CardTitle className="flex items-center gap-2 text-lg">
							🏗 {project}
							<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
								{projectQueries.length}
							</span>
							{newCount > 0 && (
								<span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full">
									{newCount} New
								</span>
							)}
						</CardTitle>

						{isOpen ? <ChevronUp /> : <ChevronDown />}
					</CardHeader>

					{isOpen && (
						<CardContent className="space-y-4 pb-6">
							<div className="flex justify-between items-center px-1">
								<p className="text-sm text-gray-600">
									🔧 Contractor: <strong>{contractorName}</strong>
								</p>

								<select
									className="border rounded px-2 py-1 text-xs bg-white"
									value={filter}
									onChange={(e) =>
										setFilterByProject({
											...filterByProject,
											[project]: e.target.value,
										})
									}
								>
									<option value="all">Show All</option>
									<option value="new">Only New</option>
									<option value="resolved">Resolved</option>
								</select>
							</div>

							{filtered.length === 0 && (
								<p className="text-gray-400 text-sm mt-3">
									No queries found for this filter
								</p>
							)}

							{filtered.map((q, index) => (
								<Card key={q.id} className="border bg-white shadow-sm p-4 rounded-lg">
									<div className="flex justify-between">
										<p className="font-semibold text-sm">Query #{index + 1}</p>

										<span
											className={`text-xs px-2 py-1 rounded-full ${
												q.reply
													? "bg-green-100 text-green-700"
													: "bg-yellow-100 text-yellow-700"
											}`}
										>
											{q.reply ? "RESOLVED" : "OPEN"}
										</span>
									</div>

									<p className="mt-2 text-sm">
										<strong>Message:</strong> {q.message}
									</p>

									{/* 🆕 SHOW IMAGE THUMBNAIL IF EXISTS */}
									{q.imageUrl && (
										<div className="mt-3">
											<img
												src={q.imageUrl}
												className="w-28 h-28 object-cover rounded-lg border cursor-pointer"
												onClick={() =>
													setImageModal({ open: true, url: q.imageUrl })
												}
											/>
											<Button
												size="sm"
												variant="ghost"
												className="mt-1 flex items-center gap-1 text-blue-600"
												onClick={() =>
													setImageModal({ open: true, url: q.imageUrl })
												}
											>
												<ZoomIn className="h-4 w-4" /> View Image
											</Button>
										</div>
									)}

									{q.reply && (
										<p className="p-2 bg-green-50 border rounded mt-2 text-sm">
											<strong>Reply:</strong> {q.reply}
										</p>
									)}

									<p className="text-xs text-gray-400 mt-1">
										{new Date(q.createdAt).toLocaleString()}
									</p>

									<div className="flex gap-2 mt-3">
										{!q.reply && (
											<Button size="sm" onClick={() => setReplyingId(q.id)}>
												<Reply className="h-4 w-4 mr-1" /> Reply
											</Button>
										)}

										<Button
											size="sm"
											variant="destructive"
											onClick={() => deleteQuery(q.id)}
										>
											<Trash2 className="h-4 w-4 mr-1" /> Delete
										</Button>
									</div>

									{/* ------------------------------
										 REPLY INPUT BOX
									 -------------------------------- */}
									{replyingId === q.id && (
										<div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
											<Textarea
												placeholder="Type reply..."
												value={replyText}
												onChange={(e) => setReplyText(e.target.value)}
											/>

											<div className="flex gap-2">
												<Button
													size="sm"
													onClick={() => submitReply(q.id)}
													disabled={loading}
												>
													{loading ? (
														<Loader2 className="animate-spin h-4 w-4" />
													) : (
														"Send Reply"
													)}
												</Button>

												<Button
													size="sm"
													variant="secondary"
													onClick={() => setReplyingId(null)}
												>
													Cancel
												</Button>
											</div>
										</div>
									)}
								</Card>
							))}
						</CardContent>
					)}
				</Card>
			);
		});

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Support Queries</h1>

			<Tabs defaultValue="client" className="w-full" onValueChange={setTab}>
				<TabsList className="mb-5 bg-gray-100 w-fit p-1 rounded-full shadow-sm">
					<TabsTrigger
						value="client"
						className="px-6 rounded-full flex items-center gap-2"
					>
						Client Queries
						{clientNew > 0 && (
							<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
								{clientNew}
							</span>
						)}
					</TabsTrigger>

					<TabsTrigger
						value="contractor"
						className="px-6 rounded-full flex items-center gap-2"
					>
						Contractor Queries
						{contractorNew > 0 && (
							<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
								{contractorNew}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="client">
					{pageLoading ? (
						<div className="flex justify-center py-10">
							<Loader2 className="animate-spin h-7 w-7 text-gray-600" />
						</div>
					) : queries.length > 0 ? (
						renderGrouped()
					) : (
						<p className="text-gray-500 text-center py-8">No client queries found</p>
					)}
				</TabsContent>

				<TabsContent value="contractor">
					{pageLoading ? (
						<div className="flex justify-center py-10">
							<Loader2 className="animate-spin h-7 w-7 text-gray-600" />
						</div>
					) : queries.length > 0 ? (
						renderGrouped()
					) : (
						<p className="text-gray-500 text-center py-8">No contractor queries found</p>
					)}
				</TabsContent>
			</Tabs>

			{/* FULL SCREEN IMAGE MODAL */}
			<Dialog open={imageModal.open} onOpenChange={(v) => setImageModal({ open: v, url: null })}>
				<DialogContent className="max-w-3xl p-0 overflow-hidden">
					<DialogHeader className="p-4 flex justify-between items-center border-b">
						<DialogTitle>Image Preview</DialogTitle>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setImageModal({ open: false, url: null })}
						>
							<X className="h-5 w-5" />
						</Button>
					</DialogHeader>

					<div className="w-full h-[70vh] bg-black flex justify-center items-center">
						<img
							src={imageModal.url}
							className="max-h-full max-w-full object-contain"
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
