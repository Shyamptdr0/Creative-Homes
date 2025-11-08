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
import { Loader2, Trash2, Reply, ChevronDown, ChevronUp } from "lucide-react";
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

	// ✅ Fetch new query counts for both tabs on load
	const fetchCounts = async () => {
		try {
			const clientRes = await fetch(`/api/queries?type=client`);
			const contractorRes = await fetch(`/api/queries?type=contractor`);

			const clientData = await clientRes.json();
			const contractorData = await contractorRes.json();

			const c1 = Array.isArray(clientData)
				? clientData.filter((q) => !q.reply).length
				: 0;

			const c2 = Array.isArray(contractorData)
				? contractorData.filter((q) => !q.reply).length
				: 0;

			setClientNew(c1);
			setContractorNew(c2);
		} catch (err) {
			console.error("Count fetch failed:", err);
		}
	};

	// ✅ Fetch queries of current tab
	const fetchQueries = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/queries?type=${tab}`);
			let data = await res.json();
			if (!Array.isArray(data)) data = [];

			data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			setQueries(data);

			const newCount = data.filter((q) => !q.reply).length;

			if (tab === "client") setClientNew(newCount);
			else setContractorNew(newCount);

		} catch (err) {
			console.error("API Error:", err);
			setQueries([]);
		}
		setLoading(false);
	};

	// ✅ On initial load, get counts for both tabs
	useEffect(() => {
		fetchCounts();
	}, []);

	// ✅ Load tab data when switching tabs
	useEffect(() => {
		fetchQueries();
	}, [tab]);

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
		fetchCounts(); // ✅ update badges
	};

	const deleteQuery = async (id) => {
		if (!confirm("Delete this query?")) return;
		setLoading(true);
		await fetch(`/api/queries/${id}`, { method: "DELETE" });
		fetchQueries();
		fetchCounts(); // ✅ update badges
	};

	// ✅ Group queries by project
	const groupedQueries = queries.reduce((acc, q) => {
		const projectName = q.Project?.title || "Unknown Project";
		if (!acc[projectName]) acc[projectName] = [];
		acc[projectName].push(q);
		return acc;
	}, {});

	const renderGrouped = () =>
		Object.keys(groupedQueries).map((project) => {
			const projectQueries = groupedQueries[project];
			const isOpen = openProject === project;

			const newCount = projectQueries.filter((q) => !q.reply).length;
			const filter = filterByProject[project] || "all";

			const filteredQueries =
				filter === "new"
					? projectQueries.filter((q) => !q.reply)
					: filter === "resolved"
						? projectQueries.filter((q) => q.reply)
						: projectQueries;

			const firstQuery = projectQueries[0];
			const contractorName = firstQuery.Contractor?.name || "N/A";
			const clientName = firstQuery.Client?.name || "N/A";

			return (
				<Card key={project} className="mb-4 shadow-sm">
					<CardHeader
						className="flex justify-between items-center cursor-pointer"
						onClick={() => setOpenProject(isOpen ? null : project)}
					>
						<CardTitle className="flex items-center gap-2">
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

						{isOpen ? (
							<ChevronUp className="h-5 w-5" />
						) : (
							<ChevronDown className="h-5 w-5" />
						)}
					</CardHeader>

					{isOpen && (
						<CardContent className="space-y-4 pb-6">
							<div className="flex justify-between items-center px-1">
								<p className="text-sm text-gray-600">
									 🔧 Contractor:{" "}
									<strong>{contractorName}</strong>
								</p>

								<select
									className="border rounded px-2 py-1 text-xs"
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

							{filteredQueries.length > 0 ? (
								filteredQueries.map((q, index) => (
									<Card
										key={q.id}
										className="border bg-white shadow-sm p-4 rounded-lg"
									>
										<div className="flex justify-between">
											<p className="font-semibold">Query #{index + 1}</p>

											<span
												className={`text-xs px-2 py-1 rounded-full ${
													q.status === "open"
														? "bg-yellow-100 text-yellow-700"
														: "bg-green-100 text-green-700"
												}`}
											>
                        {q.status.toUpperCase()}
                      </span>
										</div>

										<p className="mt-2">
											<strong>Message:</strong> {q.message}
										</p>

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
												<Button
													size="sm"
													className="rounded-full"
													onClick={() => setReplyingId(q.id)}
												>
													<Reply className="h-4 w-4 mr-1" /> Reply
												</Button>
											)}
											<Button
												size="sm"
												variant="destructive"
												className="rounded-full"
												onClick={() => deleteQuery(q.id)}
											>
												<Trash2 className="h-4 w-4 mr-1" /> Delete
											</Button>
										</div>

										{replyingId === q.id && (
											<div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
												<Textarea
													className="rounded-lg"
													placeholder="Type reply..."
													value={replyText}
													onChange={(e) => setReplyText(e.target.value)}
												/>
												<div className="flex gap-2">
													<Button
														size="sm"
														className="rounded-full"
														onClick={() => submitReply(q.id)}
													>
														Send Reply
													</Button>
													<Button
														size="sm"
														variant="secondary"
														className="rounded-full"
														onClick={() => setReplyingId(null)}
													>
														Cancel
													</Button>
												</div>
											</div>
										)}
									</Card>
								))
							) : (
								<p className="text-gray-400 text-sm mt-3">
									No queries found for this filter
								</p>
							)}
						</CardContent>
					)}
				</Card>
			);
		});

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Support Queries</h1>

			{loading && (
				<div className="flex justify-center mb-3">
					<Loader2 className="animate-spin h-6 w-6" />
				</div>
			)}

			<Tabs defaultValue="client" className="w-full" onValueChange={setTab}>
				<TabsList className="mb-5 bg-gray-100 w-fit p-1 rounded-full">

					<TabsTrigger value="client" className="px-6 rounded-full flex items-center gap-2">
						Client Queries
						{clientNew > 0 && (
							<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {clientNew}
              </span>
						)}
					</TabsTrigger>

					<TabsTrigger value="contractor" className="px-6 rounded-full flex items-center gap-2">
						Contractor Queries
						{contractorNew > 0 && (
							<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {contractorNew}
              </span>
						)}
					</TabsTrigger>

				</TabsList>

				<TabsContent value="client">
					{queries.length > 0 ? (
						renderGrouped()
					) : (
						<p className="text-gray-500 text-center py-8">No client queries found</p>
					)}
				</TabsContent>

				<TabsContent value="contractor">
					{queries.length > 0 ? (
						renderGrouped()
					) : (
						<p className="text-gray-500 text-center py-8">No contractor queries found</p>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
