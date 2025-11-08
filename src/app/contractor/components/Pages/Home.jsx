"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
} from "@/components/ui/pagination";

import {
	Loader2,
	FolderKanban,
	Wallet,
	Bell,
} from "lucide-react";

export default function ContractorDashboard({ setActivePage }) {
	const [stats, setStats] = useState({ projects: 0, payments: 0 });
	const [newQueries, setNewQueries] = useState(0);

	const [selectedView, setSelectedView] = useState(null);
	const [tableData, setTableData] = useState([]);
	const [tableLoading, setTableLoading] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	const totalPages = Math.ceil(tableData.length / itemsPerPage);
	const paginatedData = tableData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	useEffect(() => {
		fetchStats();
		fetchNewQueries();
	}, []);

	async function fetchStats() {
		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();

			setStats({
				projects: data?.projects?.length || 0,
				payments: data?.payments || 0,
			});
		} catch {}
	}

	async function fetchNewQueries() {
		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/queries", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			setNewQueries(data.newQueries || 0);
		} catch {
			setNewQueries(0);
		}
	}

	// ✅ Load Projects table
	async function loadProjectsTable() {
		setSelectedView("projects");
		setTableLoading(true);
		setCurrentPage(1);

		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			setTableData(data.projects || []);
		} finally {
			setTableLoading(false);
		}
	}

	// ✅ Get progress bar color
	function getProgressColor(p) {
		if (p <= 30) return "bg-red-500";
		if (p <= 70) return "bg-yellow-500";
		return "bg-green-600";
	}

	return (
		<div className="p-8 min-h-screen bg-gray-50">

			{/* HEADER */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800">Contractor Dashboard</h1>

				<div className="relative cursor-pointer" onClick={() => setActivePage("Query")}>
					<Bell className="h-7 w-7 text-gray-700" />
					{newQueries > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
							{newQueries}
						</span>
					)}
				</div>
			</div>

			{/* CARDS */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

				<Card className="shadow hover:shadow-xl cursor-pointer" onClick={loadProjectsTable}>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Total Projects</CardTitle>
						<FolderKanban className="h-6 w-6 text-purple-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold text-purple-700">{stats.projects}</p>
					</CardContent>
				</Card>

				<Card className="shadow hover:shadow-xl">
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Payments</CardTitle>
						<Wallet className="h-6 w-6 text-teal-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-bold text-teal-700">₹ {stats.payments}</p>
					</CardContent>
				</Card>

			</div>

			{/* PROJECT TABLE */}
			{selectedView === "projects" && (
				<Card className="shadow-xl p-6 bg-white border">
					<h2 className="text-xl font-bold mb-3">Project Details</h2>

					{tableLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin h-10 w-10 text-gray-700" />
						</div>
					) : (
						<>
							<div className="overflow-auto max-h-[60vh] border rounded-lg">
								<Table>
									<TableHeader className="bg-gray-100">
										<TableRow>
											<TableHead>Project</TableHead>
											<TableHead>Client</TableHead>
											<TableHead>Cost</TableHead>
											<TableHead>Progress</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{paginatedData.length === 0 ? (
											<TableRow>
												<TableCell colSpan="4" className="text-center text-gray-500 py-6">
													No projects found
												</TableCell>
											</TableRow>
										) : (
											paginatedData.map((p, i) => (
												<TableRow key={i} className="hover:bg-gray-50">
													<TableCell>{p.title}</TableCell>
													<TableCell>{p.client?.name}</TableCell>
													<TableCell>₹ {p.totalCost || "-"}</TableCell>

													{/* ✅ Colored Progress Bar */}
													<TableCell>
														<div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
															<div
																className={`${getProgressColor(p.avgProgress)} h-3 rounded-full`}
																style={{ width: `${p.avgProgress}%` }}
															/>
														</div>
														<p className="text-xs text-gray-600">{p.avgProgress}%</p>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>

							{tableData.length > itemsPerPage && (
								<Pagination className="mt-4">
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
												className="cursor-pointer"
											/>
										</PaginationItem>

										<PaginationItem>
											<span className="px-4">Page {currentPage} of {totalPages}</span>
										</PaginationItem>

										<PaginationItem>
											<PaginationNext
												onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
												className="cursor-pointer"
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</>
					)}
				</Card>
			)}
		</div>
	);
}
