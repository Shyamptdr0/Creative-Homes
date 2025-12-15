"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, IndianRupee, Calendar, CheckCircle, TrendingUp, Building2, Users, MapPin, Clock, ArrowRight, Star, Hash } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function HomePage() {
	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState(null);
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stageLoading, setStageLoading] = useState(false);
	const [isScrolling, setIsScrolling] = useState(false);
	const projectDetailsRef = useRef(null);

	const [selectedStage, setSelectedStage] = useState(null);
	const [stageRemarks, setStageRemarks] = useState([]);
	const [remarkText, setRemarkText] = useState("");
	const [addingRemark, setAddingRemark] = useState(false);

	const remarkEndRef = useRef(null);
	const [pendingApprovalProjects, setPendingApprovalProjects] = useState([]);

	// PAYMENT NOTIFICATION POPUP
	const [paymentNotification, setPaymentNotification] = useState(null);

	// DEBUG: Add console log to track state changes
	useEffect(() => {
		console.log("CLIENT PAYMENT NOTIFICATION - State updated:", paymentNotification);
	}, [paymentNotification]);

	/* --------------------------------------------------------
		AUTO SCROLL CHAT
	-------------------------------------------------------- */
	useEffect(() => {
		remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [stageRemarks]);

	/* --------------------------------------------------------
		FETCH PROJECTS
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
				setProjects(data.projects);
				
				// Find projects that need approval
				const pendingProjects = data.projects.filter(p => !p.clientApproved);
				setPendingApprovalProjects(pendingProjects);
				
				// Auto-select first approved project if no project selected
				if (!selectedProject) {
					const approvedProject = data.projects.find(p => p.clientApproved);
					if (approvedProject) {
						setSelectedProject(approvedProject);
					}
				}
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
		CHECK CLIENT PAYMENT NOTIFICATION
	-------------------------------------------------------- */
	async function checkClientPaymentNotification() {
		const token = sessionStorage.getItem("token");

		try {
			const res = await fetch("/api/clients/payments", {
				headers: { 
					Authorization: `Bearer ${token}`,
					"Cache-Control": "no-store"
				}
			});

			const data = await res.json();
			console.log("CLIENT PAYMENT NOTIFICATION - API Response:", data);
			
			if (data.success && data.payments) {
				console.log("CLIENT PAYMENT NOTIFICATION - Found payments:", data.payments.length);
				
				// Find next due payment (upcoming unpaid installment)
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				
				const upcomingPayments = [];
				
				data.payments.forEach(payment => {
					payment.installments?.forEach(installment => {
						if (!installment.paid) {
							const dueDate = new Date(installment.dueDate);
							dueDate.setHours(0, 0, 0, 0);
							
							// Include upcoming payments (due today or in future)
							if (dueDate >= today) {
								upcomingPayments.push({
									...installment,
									payment: payment
								});
							}
						}
					});
				});

				// Sort by due date (earliest first)
				upcomingPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
				
				console.log("CLIENT PAYMENT NOTIFICATION - Upcoming payments found:", upcomingPayments.length);

				if (upcomingPayments.length > 0) {
					const nextPayment = upcomingPayments[0];
					const dueDate = new Date(nextPayment.dueDate);
					const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
					
					const notificationData = {
						projectTitle: nextPayment.payment.project?.title || 'Unknown Project',
						stageName: nextPayment.payment.stage?.stageName || 'Unknown Stage',
						amount: nextPayment.amount,
						dueDate: nextPayment.dueDate,
						daysUntilDue: daysUntilDue,
						installmentNo: nextPayment.installmentNo,
						remainingAmount: nextPayment.payment.totalAmount - nextPayment.payment.paidAmount,
						totalAmount: nextPayment.payment.totalAmount
					};

					console.log("CLIENT PAYMENT NOTIFICATION - Setting next due notification:", notificationData);
					setPaymentNotification(notificationData);
				} else {
					console.log("CLIENT PAYMENT NOTIFICATION - No upcoming payments found");
				}
			} else {
				console.log("CLIENT PAYMENT NOTIFICATION - No payments data or API failed");
			}
		} catch (error) {
			console.error('CLIENT PAYMENT NOTIFICATION - Error checking payment notifications:', error);
		}
	}

	/* --------------------------------------------------------
		FIX: Load unread badge on page load also
	-------------------------------------------------------- */
	useEffect(() => {
		fetchProjectData();
		fetchStages();   // 🔥 FIX: unreadRemarks now available before opening sheet
		checkClientPaymentNotification(); // Check for payment notifications
	}, []);

	/* --------------------------------------------------------
		APPROVE PROJECT
	-------------------------------------------------------- */
	async function approveProject(projectId) {
		const token = sessionStorage.getItem("token");

		await fetch(`/api/projects/${projectId}/approve`, {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` },
		});

		// Remove from pending list and refresh data
		setPendingApprovalProjects(prev => prev.filter(p => p.id !== projectId));
		fetchProjectData();
	}

	/* --------------------------------------------------------
		SELECT PROJECT WITH ANIMATION
	-------------------------------------------------------- */
	const selectProject = (project) => {
		setSelectedProject(project);
		setIsScrolling(true);
		
		// Scroll to project details with smooth animation
		setTimeout(() => {
			projectDetailsRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'nearest'
			});
			
			// Reset scrolling state after animation completes
			setTimeout(() => {
				setIsScrolling(false);
			}, 1000);
		}, 100);
		setStages([]); // Clear stages when switching projects
	};

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
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
			{(() => {
				console.log("CLIENT PAYMENT NOTIFICATION - Rendering check, paymentNotification:", paymentNotification);
				return paymentNotification;
			})() && (
				<Dialog
					open={!!paymentNotification}
					onOpenChange={(open) => {
						if (!open) setPaymentNotification(null);
					}}
				>
					<DialogContent className="max-w-md text-center space-y-4">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold flex items-center justify-center gap-2">
								<div className="p-2 bg-orange-100 rounded-full">
									<Calendar className="h-5 w-5 text-orange-600" />
								</div>
								Payment Due Soon!
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4">
							<div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
								<p className="text-sm text-gray-600 mb-1">Next Payment Amount</p>
								<p className="text-2xl font-bold text-orange-700 flex items-center justify-center gap-2">
									<IndianRupee className="h-5 w-5" />
									{paymentNotification.amount?.toLocaleString('en-IN')}
								</p>
								<p className="text-sm text-orange-600 mt-1">
									{paymentNotification.daysUntilDue === 0 ? "Due Today" : 
									 paymentNotification.daysUntilDue === 1 ? "Due Tomorrow" :
									 `Due in ${paymentNotification.daysUntilDue} days`}
								</p>
							</div>

							<div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-600">Project:</span>
									<span className="text-sm font-semibold">{paymentNotification.projectTitle}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-600">Stage:</span>
									<span className="text-sm font-semibold">{paymentNotification.stageName}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-600">Installment:</span>
									<Badge className="bg-orange-100 text-orange-800">
										#{paymentNotification.installmentNo}
									</Badge>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-600">Due Date:</span>
									<span className="text-sm font-semibold flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{new Date(paymentNotification.dueDate).toLocaleDateString('en-IN', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}
									</span>
								</div>
								<div className="border-t pt-2 mt-2 space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-600">Total Remaining:</span>
										<span className="text-sm font-bold text-red-600 flex items-center gap-1">
											<IndianRupee className="h-3 w-3" />
											{paymentNotification.remainingAmount?.toLocaleString('en-IN')}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-600">Total Amount:</span>
										<span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
											<IndianRupee className="h-3 w-3" />
											{paymentNotification.totalAmount?.toLocaleString('en-IN')}
										</span>
									</div>
								</div>
							</div>
						</div>

						<Button 
							className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" 
							onClick={() => setPaymentNotification(null)}
						>
							<CheckCircle className="h-4 w-4 mr-2" />
							Got it!
						</Button>
					</DialogContent>
				</Dialog>
			)}

			{loading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="animate-spin h-10 w-10" />
				</div>
			) : projects.length === 0 ? (
				<div className="text-center py-20">
					<Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<p className="text-gray-500 text-lg">No projects found.</p>
				</div>
			) : (
				<div className="space-y-8">
					{/* Hero Section */}
					<div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl overflow-hidden relative">
						<div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-700/30 to-transparent -z-0"></div>
						<div className="relative z-10">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
								<div className="max-w-2xl">
									<h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">Welcome to Your Project Dashboard</h1>
									<p className="text-blue-100 text-lg">Track, manage, and stay updated on all your construction projects in one place</p>
							
								</div>
								<div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
									<div className="text-center p-4">
										<div className="text-3xl font-bold">{projects.length}</div>
										<div className="text-sm text-blue-100 mt-1">Total Projects</div>
									</div>
									<div className="text-center p-4">
										<div className="text-3xl font-bold">
											{projects.filter(p => p.clientApproved).length}
										</div>
										<div className="text-sm text-blue-100 mt-1">Active</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Pending Approvals */}
					{pendingApprovalProjects.length > 0 && (
						<div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
							<div className="flex items-center gap-2 mb-4">
								<Clock className="w-5 h-5 text-orange-600" />
								<h2 className="text-lg font-semibold text-orange-800">Projects Awaiting Your Approval</h2>
								<Badge className="bg-orange-100 text-orange-800">{pendingApprovalProjects.length}</Badge>
							</div>
							<div className="grid gap-4">
								{pendingApprovalProjects.map(project => (
									<Card key={project.id} className="border-orange-200 bg-white">
										<CardContent className="p-4">
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<h3 className="font-semibold text-gray-900">{project.title}</h3>
													<p className="text-sm text-gray-600">{project.projectType?.name}</p>
													<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
														<span className="flex items-center gap-1">
															<IndianRupee className="w-3 h-3" />
															{project.totalCost?.toLocaleString('en-IN')}
														</span>
														<span className="flex items-center gap-1">
															<Users className="w-3 h-3" />
															{project.contractor?.name}
														</span>
													</div>
												</div>
												<Button 
													onClick={() => approveProject(project.id)}
													className="bg-green-600 hover:bg-green-700"
												>
													<CheckCircle className="w-4 h-4 mr-2" />
													Approve
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					)}

					{/* Active Projects Grid */}
					<div>
						<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
							<Building2 className="w-5 h-5" />
							Active Projects
							<Badge className="bg-blue-100 text-blue-800">{projects.filter(p => p.clientApproved).length}</Badge>
						</h2>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{projects.filter(p => p.clientApproved).map(project => (
								<Card key={project.id} className={`border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
									selectedProject?.id === project.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
								}`} onClick={() => selectProject(project)}>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<CardTitle className="text-lg font-semibold text-gray-900 mb-1">{project.title}</CardTitle>
												<p className="text-sm text-gray-600">{project.projectType?.name}</p>
											</div>
											{selectedProject?.id === project.id && (
												<Star className="w-5 h-5 text-blue-500 fill-blue-500" />
											)}
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-3">
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-500 flex items-center gap-1">
													<IndianRupee className="w-3 h-3" />
													Cost
												</span>
												<span className="font-semibold text-gray-900">{project.totalCost?.toLocaleString('en-IN')}</span>
											</div>
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-500 flex items-center gap-1">
													<Users className="w-3 h-3" />
													Contractor
												</span>
												<span className="font-medium text-gray-900">{project.contractor?.name}</span>
											</div>
											
											<Button 
												variant="outline" 
												className="w-full mt-4"
												onClick={(e) => {
													e.stopPropagation();
													selectProject(project);
												}}
											>
												<ArrowRight className="w-4 h-4 mr-2" />
												{selectedProject?.id === project.id ? 'Viewing' : 'View Project'}
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Selected Project Details */}
					{selectedProject && (
						<div 
							ref={projectDetailsRef}
							className={`transition-all duration-700 ease-out transform ${
								isScrolling ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
							}`}
						>
						<Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white via-white to-blue-50/30 overflow-hidden">
							<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
								<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
								<div className="relative z-10">
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										<div>
											<h2 className="text-3xl md:text-4xl font-bold mb-2">{selectedProject.title}</h2>
											<p className="text-blue-100 text-lg">Project Overview & Details</p>
										</div>
										<div className="flex items-center gap-3">
											<div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
												<span className="text-sm font-medium">Status: </span>
												<Badge className="bg-green-400 text-green-900 border-0 ml-1">Active</Badge>
											</div>
										</div>
									</div>
								</div>
							</div>
							<CardContent className="p-8">
								<div className="grid md:grid-cols-2 gap-8">
									<div className="space-y-6">
										<div className="group">
											<div className="flex items-center gap-3 mb-3">
												<div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
													<Building2 className="w-5 h-5 text-blue-700" />
												</div>
												<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project Type</h3>
											</div>
											<p className="text-xl font-bold text-gray-900 ml-11">{selectedProject.projectType?.name}</p>
										</div>
										<div className="group">
											<div className="flex items-center gap-3 mb-3">
												<div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
													<Users className="w-5 h-5 text-purple-700" />
												</div>
												<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contractor</h3>
											</div>
											<p className="text-xl font-bold text-gray-900 ml-11">{selectedProject.contractor?.name}</p>
										</div>
										<div className="group">
											<div className="flex items-center gap-3 mb-3">
												<div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
													<IndianRupee className="w-5 h-5 text-green-700" />
												</div>
												<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Cost</h3>
											</div>
											<p className="text-2xl font-bold text-green-600 flex items-center gap-2 ml-11">
												<IndianRupee className="w-6 h-6" />
												{selectedProject.totalCost?.toLocaleString('en-IN')}
											</p>
										</div>
									</div>
									<div className="space-y-6">
										<div className="group">
											<div className="flex items-center gap-3 mb-3">
												<div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
													<Hash className="w-5 h-5 text-orange-700" />
												</div>
												<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project ID</h3>
											</div>
											<p className="text-xl font-bold text-gray-900 ml-11 font-mono">{selectedProject.projectUid}</p>
										</div>
										<div className="group">
											<div className="flex items-center gap-3 mb-3">
												<div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
													<CheckCircle className="w-5 h-5 text-emerald-700" />
												</div>
												<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
											</div>
											<div className="ml-11">
												<Badge className="bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 px-4 py-2 text-sm font-medium rounded-full">
													Approved & Active
												</Badge>
											</div>
										</div>
									</div>
								</div>

								{/* View Stages Button */}
								<div className="mt-6">
									<Sheet onOpenChange={(o) => !o && setSelectedStage(null)}>
										<div className="relative inline-block">
											<SheetTrigger asChild>
												<Button
													onClick={fetchStages}
													className="rounded-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
							</CardContent>
						</Card>
						</div>
					)}
				</div>
			)}
		</div>
	);
}