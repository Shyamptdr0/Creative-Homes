"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
	Loader2,
	Users,
	Briefcase,
	FolderKanban,
	Wallet,
	Bell,
} from "lucide-react";

export default function AdminDashboard({ setActivePage }) {
	const [stats, setStats] = useState({
		clients: 0,
		contractors: 0,
		projects: 0,
		payments: 0,
	});

	const [newQueries, setNewQueries] = useState(0);
	const [loading, setLoading] = useState(true);
	const [tableLoading, setTableLoading] = useState(false);
	const [selectedView, setSelectedView] = useState(null);
	const [tableData, setTableData] = useState([]);

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
		setLoading(true);
		try {
			const [clientsRes, contractorsRes, projectsRes] = await Promise.all([
				fetch("/api/clients"),
				fetch("/api/contractors"),
				fetch("/api/projects"),
			]);

			const clientsData = await clientsRes.json();
			const contractorsData = await contractorsRes.json();
			const projectsData = await projectsRes.json();

			setStats({
				clients: clientsData?.clients?.length || 0,
				contractors: contractorsData?.contractors?.length || 0,
				projects: projectsData?.projects?.length || 0,
				payments: 0,
			});
		} finally {
			setLoading(false);
		}
	}

	async function fetchNewQueries() {
		try {
			const res = await fetch("/api/queries/count");
			const data = await res.json();
			setNewQueries(data.newQueries || 0);
		} catch {
			setNewQueries(0);
		}
	}

	async function loadDetails(type) {
		setSelectedView(type);
		setTableLoading(true);
		setTableData([]);
		setCurrentPage(1);

		try {
			const clientsRes = await fetch("/api/clients");
			const contractorsRes = await fetch("/api/contractors");
			const projectsRes = await fetch("/api/projects");
			const stagesRes = await fetch("/api/stages/all");

			const clientsData = await clientsRes.json();
			const contractorsData = await contractorsRes.json();
			const projectsData = await projectsRes.json();
			const stagesData = await stagesRes.json();

			if (type === "clients") {
				const mapped = clientsData.clients.map((client) => {
					const clientProjects = projectsData.projects.filter(
						(p) => p.clientId === client.id
					);
					const contractorsList = clientProjects.map((p) => p.contractor?.name).filter(Boolean);
					const projectNames = clientProjects.map((p) => p.title).join(", ") || "-";

					return {
						...client,
						totalProjects: clientProjects.length,
						projectNames,
						contractors: [...new Set(contractorsList)].join(", ") || "-",
					};
				});

				setTableData(mapped);
			}

			if (type === "contractors") {
				const mapped = contractorsData.contractors.map((contractor) => {
					const contractorProjects = projectsData.projects.filter(
						(p) => p.contractorId === contractor.id
					);
					const clientsList = contractorProjects.map((p) => p.client?.name).filter(Boolean);
					const projectNames = contractorProjects.map((p) => p.title).join(", ") || "-";

					return {
						...contractor,
						totalProjects: contractorProjects.length,
						projectNames,
						clients: [...new Set(clientsList)].join(", ") || "-",
					};
				});

				setTableData(mapped);
			}

			if (type === "projects") {
				const mapped = projectsData.projects.map((project) => {
					const projectStages = stagesData.stages.filter(
						(stage) => stage.projectId === project.id
					);

					let avgProgress = 0;
					if (projectStages.length > 0) {
						const sum = projectStages.reduce(
							(total, s) => total + (s.progress || 0),
							0
						);
						avgProgress = Math.round(sum / projectStages.length);
					}

					return { ...project, avgProgress };
				});

				setTableData(mapped);
			}
		} finally {
			setTableLoading(false);
		}
	}

	// ✅ get progress bar color
	const getColor = (p) =>
		p < 30 ? "bg-red-500" :
			p < 70 ? "bg-yellow-500" :
				"bg-green-600";

	return (
		<div className="min-h-screen bg-gray-50 px-6 py-10">

			{/* HEADER */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold tracking-tight text-gray-800">
					Admin Dashboard
				</h1>

				<div className="relative cursor-pointer" onClick={() => setActivePage("Query")}>
					<Bell className="h-7 w-7 text-gray-700" />
					{newQueries > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
							{newQueries}
						</span>
					)}
				</div>
			</div>

			{/* STATS CARDS */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card className="transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={() => loadDetails("clients")}>
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="text-gray-700">Total Clients</CardTitle>
						<Users className="h-7 w-7 text-blue-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-blue-700">{stats.clients}</p>
					</CardContent>
				</Card>

				<Card className="transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={() => loadDetails("contractors")}>
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="text-gray-700">Contractors</CardTitle>
						<Briefcase className="h-7 w-7 text-green-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-green-700">{stats.contractors}</p>
					</CardContent>
				</Card>

				<Card className="transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={() => loadDetails("projects")}>
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="text-gray-700">Projects</CardTitle>
						<FolderKanban className="h-7 w-7 text-purple-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-purple-700">{stats.projects}</p>
					</CardContent>
				</Card>

				<Card className="transition-all hover:shadow-xl hover:-translate-y-1">
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="text-gray-700">Payments</CardTitle>
						<Wallet className="h-7 w-7 text-teal-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-teal-700">₹ {stats.payments}</p>
					</CardContent>
				</Card>
			</div>

			{/* TABLE SECTION */}
			{selectedView && (
				<Card className="shadow-xl p-6 bg-white border">

					<div className="flex justify-between items-center mb-5 border-b pb-3">
						<h2 className="text-xl font-bold text-gray-800 capitalize">
							{selectedView} Details
						</h2>

						{selectedView === "projects" && (
							<Button className="rounded-full cursor-pointer" onClick={() => setActivePage("Project")}>
								View All Projects
							</Button>
						)}
					</div>

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
											{selectedView === "projects" ? (
												<>
													<TableHead>Project</TableHead>
													<TableHead>Client</TableHead>
													<TableHead>Contractor</TableHead>
													<TableHead>Total Cost</TableHead>
													<TableHead>Avg Progress</TableHead>
												</>
											) : selectedView === "clients" ? (
												<>
													<TableHead>Client ID</TableHead>
													<TableHead>Name</TableHead>
													<TableHead>Phone</TableHead>
													<TableHead>Total Projects</TableHead>
													<TableHead>Projects</TableHead>
													<TableHead>Contractors</TableHead>
												</>
											) : (
												<>
													<TableHead>Contractor ID</TableHead>
													<TableHead>Name</TableHead>
													<TableHead>Phone</TableHead>
													<TableHead>Total Projects</TableHead>
													<TableHead>Projects</TableHead>
													<TableHead>Clients</TableHead>
												</>
											)}
										</TableRow>
									</TableHeader>

									<TableBody>
										{paginatedData.length === 0 ? (
											<TableRow>
												<TableCell colSpan="7" className="text-center text-gray-500 py-6">
													No data found
												</TableCell>
											</TableRow>
										) : (
											paginatedData.map((item, i) => (
												<TableRow key={i} className="hover:bg-gray-50 transition">
													{selectedView === "projects" && (
														<>
															<TableCell>{item.title}</TableCell>
															<TableCell>{item.client?.clientId} - {item.client?.name}</TableCell>
															<TableCell>{item.contractor?.contractorId} - {item.contractor?.name}</TableCell>
															<TableCell>₹ {item.totalCost || "-"}</TableCell>
															<TableCell>
																<div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
																	<div
																		className={`${getColor(item.avgProgress)} h-3 rounded-full`}
																		style={{ width: `${item.avgProgress}%` }}
																	></div>
																</div>
																<p className="text-xs text-gray-600">{item.avgProgress}%</p>
															</TableCell>
														</>
													)}

													{selectedView === "clients" && (
														<>
															<TableCell>{item.clientId}</TableCell>
															<TableCell>{item.name}</TableCell>
															<TableCell>{item.phone}</TableCell>
															<TableCell>{item.totalProjects}</TableCell>
															<TableCell>{item.projectNames}</TableCell>
															<TableCell>{item.contractors}</TableCell>
														</>
													)}

													{selectedView === "contractors" && (
														<>
															<TableCell>{item.contractorId}</TableCell>
															<TableCell>{item.name}</TableCell>
															<TableCell>{item.phone}</TableCell>
															<TableCell>{item.totalProjects}</TableCell>
															<TableCell>{item.projectNames}</TableCell>
															<TableCell>{item.clients}</TableCell>
														</>
													)}
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
											<PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} className="cursor-pointer" />
										</PaginationItem>

										<PaginationItem>
											<span className="px-4">Page {currentPage} of {totalPages}</span>
										</PaginationItem>

										<PaginationItem>
											<PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} className="cursor-pointer" />
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
