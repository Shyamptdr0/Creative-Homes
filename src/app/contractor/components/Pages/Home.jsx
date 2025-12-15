"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
	Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";

import {
	Table, TableHeader, TableRow, TableHead,
	TableBody, TableCell
} from "@/components/ui/table";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

import {
	Loader2, FolderKanban, Wallet, Bell, FileText,
	Image as ImageIcon, Video, File, Download,
	ListChecks, PencilRuler, ChevronLeft, MessageCircle,
	IndianRupee, Calendar, CheckCircle, TrendingUp
} from "lucide-react";

import {
	Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

import {
	Sheet, SheetContent, SheetHeader,
	SheetTitle, SheetDescription
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";


export default function ContractorDashboard({ setActivePage }) {

	/* -------------------------------------------
		  STATES
	--------------------------------------------*/
	const [stats, setStats] = useState({
		projects: 0,
		payments: 0,
		totalPayments: 0,
		paidAmount: 0,
		remainingAmount: 0,
		upcomingPayments: 0
	});
	const [loadingStats, setLoadingStats] = useState(false);
	const [newQueries, setNewQueries] = useState(0);

	const [selectedView, setSelectedView] = useState(null);
	const [tableData, setTableData] = useState([]);
	const [tableLoading, setTableLoading] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return tableData.slice(startIndex, startIndex + itemsPerPage);
	}, [tableData, currentPage, itemsPerPage]);

	// PROJECT SHEET
	const [openProjectSheet, setOpenProjectSheet] = useState(null);

	// CHAT
	const [selectedStage, setSelectedStage] = useState(null);
	const [stageRemarks, setStageRemarks] = useState([]);
	const [remarkText, setRemarkText] = useState("");
	const [remarkLoading, setRemarkLoading] = useState(false);
	const [remarkFetching, setRemarkFetching] = useState(false);
	const remarkEndRef = useRef(null);

	// DRAWINGS
	const [previewFile, setPreviewFile] = useState(null);
	const [previewDrawing, setPreviewDrawing] = useState(null);
	const [projectDrawings, setProjectDrawings] = useState([]);

	const [totalItems, setTotalItems] = useState(0);
	// APPROVAL POPUP
	const [pendingApprovalProject, setPendingApprovalProject] = useState(null);

	// PAYMENT NOTIFICATION POPUP
	const [paymentNotification, setPaymentNotification] = useState(null);

	// SCROLL ANIMATION STATES
	const [isScrolling, setIsScrolling] = useState(false);
	const paymentTableRef = useRef(null);
	const projectsTableRef = useRef(null);

	// DEBUG: Add console log to track state changes
	useEffect(() => {
		console.log("PAYMENT NOTIFICATION - State updated:", paymentNotification);
	}, [paymentNotification]);

	/* -------------------------------------------
		   FETCH STATS + QUERIES + POPUP
	--------------------------------------------*/
	async function checkApprovalPopup() {
		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/projects", {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();
		const pending = data?.projects?.find(p => !p.contractorApproved);

		if (pending) setPendingApprovalProject(pending);
	}

	async function checkPaymentNotification() {
		const token = sessionStorage.getItem("token");

		try {
			const res = await fetch("/api/contractors/payments", {
				headers: { 
					Authorization: `Bearer ${token}`,
					"Cache-Control": "no-store"
				}
			});

			const data = await res.json();
			console.log("PAYMENT NOTIFICATION - API Response:", data);
			
			if (data.success && data.payments) {
				console.log("PAYMENT NOTIFICATION - Found payments:", data.payments.length);
				
				// Check for payments made today
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const tomorrow = new Date(today);
				tomorrow.setDate(tomorrow.getDate() + 1);
				
				console.log("PAYMENT NOTIFICATION - Checking for payments between:", today, "and", tomorrow);
				
				const todayPayments = data.payments.filter(payment => {
					// Check if any installment was paid today
					const hasTodayPayment = payment.installments?.some(inst => {
						console.log("PAYMENT NOTIFICATION - Checking installment:", inst);
						if (inst.paid) {
							// Check if paidAt exists, otherwise use updatedAt or current date
							let paidDate;
							if (inst.paidAt) {
								paidDate = new Date(inst.paidAt);
							} else if (inst.updatedAt) {
								paidDate = new Date(inst.updatedAt);
							} else {
								// If no date field, assume today for testing
								paidDate = new Date();
							}
							paidDate.setHours(0, 0, 0, 0);
							console.log("PAYMENT NOTIFICATION - Installment paid date:", paidDate, "paid:", inst.paid);
							return paidDate.getTime() === today.getTime();
						}
						return false;
					});
					return hasTodayPayment;
				});

				console.log("PAYMENT NOTIFICATION - Today's payments found:", todayPayments.length);

				if (todayPayments.length > 0) {
					// Get the most recent payment
					const latestPayment = todayPayments.reduce((latest, current) => {
						const latestPaidDate = current.installments
							.filter(inst => inst.paid && inst.paidAt)
							.reduce((mostRecent, inst) => {
								const paidDate = new Date(inst.paidAt);
								return paidDate > mostRecent ? paidDate : mostRecent;
							}, new Date(0));
						
						const currentPaidDate = current.installments
							.filter(inst => inst.paid && inst.paidAt)
							.reduce((mostRecent, inst) => {
								const paidDate = new Date(inst.paidAt);
								return paidDate > mostRecent ? paidDate : mostRecent;
							}, new Date(0));
						
						return currentPaidDate > latestPaidDate ? current : latest;
					});

					// Find the most recent paid installment
					const recentInstallment = latestPayment.installments
						.filter(inst => inst.paid)
						.reduce((mostRecent, inst) => {
							let paidDate;
							if (inst.paidAt) {
								paidDate = new Date(inst.paidAt);
							} else if (inst.updatedAt) {
								paidDate = new Date(inst.updatedAt);
							} else {
								paidDate = new Date(); // Current date as fallback
							}
							const mostRecentDate = mostRecent.paidAt ? new Date(mostRecent.paidAt) : 
								mostRecent.updatedAt ? new Date(mostRecent.updatedAt) : new Date();
							return paidDate > mostRecentDate ? inst : mostRecent;
						});

					// Find next unpaid installment date
					const nextUnpaidInstallment = latestPayment.installments?.find(inst => !inst.paid);
					const nextDueDate = nextUnpaidInstallment ? new Date(nextUnpaidInstallment.dueDate) : null;

					const notificationData = {
						projectTitle: latestPayment.project?.title || 'Unknown Project',
						stageName: latestPayment.stage?.stageName || 'Unknown Stage',
						paidAmount: recentInstallment.amount,
						paidDate: recentInstallment.paidAt || recentInstallment.updatedAt || new Date().toISOString(),
						remainingAmount: latestPayment.totalAmount - latestPayment.paidAmount,
						totalAmount: latestPayment.totalAmount,
						installmentNo: recentInstallment.installmentNo,
						nextDueDate: nextDueDate
					};

					console.log("PAYMENT NOTIFICATION - Setting notification data:", notificationData);
					setPaymentNotification(notificationData);
				} else {
					console.log("PAYMENT NOTIFICATION - No today's payments found");
				}
			} else {
				console.log("PAYMENT NOTIFICATION - No payments data or API failed");
			}
		} catch (error) {
			console.error('PAYMENT NOTIFICATION - Error checking payment notifications:', error);
		}
	}

	async function fetchStats() {
		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/projects", {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();
		console.log("HOME PAGE - fetchStats updating projects count:", data.projects?.length || 0);

		// Only update projects and payments fields, preserve payment statistics
		setStats(prev => ({
			...prev,
			projects: data.projects?.length || 0,
			payments: data.payments || 0
		}));
	}

	/* -------------------------------------------
		  LOAD PAYMENTS TABLE WITH SCROLL ANIMATION
	--------------------------------------------*/
	async function loadPaymentsTable() {
		setSelectedView("payments");
		setTableLoading(true);
		setIsScrolling(true);

		try {
			const token = sessionStorage.getItem("token");
			const res = await fetch("/api/contractors/payments", {
				headers: {
					Authorization: `Bearer ${token}`,
					"Cache-Control": "no-store"
				}
			});
			const data = await res.json();

			console.log("HOME PAGE - PAYMENTS TABLE API RESPONSE:", data);

			if (data.success) {
				// Group payments by project using proper API structure
				const groupedPayments = data.payments.reduce((acc, payment) => {
					const projectTitle = payment.project?.title || 'Unknown Project';
					if (!acc[projectTitle]) {
						acc[projectTitle] = [];
					}
					acc[projectTitle].push(payment);
					return acc;
				}, {});

				console.log("HOME PAGE - GROUPED PAYMENTS:", groupedPayments);

				// Convert to array format for table display using API-calculated values
				const tableData = Object.entries(groupedPayments).map(([projectTitle, payments]) => ({
					projectTitle,
					payments,
					totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.totalAmount || 0), 0),
					paidAmount: payments.reduce((sum, p) => sum + parseFloat(p.paidAmount || 0), 0)
				}));

				console.log("HOME PAGE - TABLE DATA:", tableData);

				setTableData(tableData);
				setTotalItems(tableData.length);

				// Scroll to payment table with smooth animation
				setTimeout(() => {
					paymentTableRef.current?.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
						inline: 'nearest'
					});
					
					// Reset scrolling state after animation completes
					setTimeout(() => {
						setIsScrolling(false);
					}, 1000);
				}, 100);
			}
		} catch (error) {
			console.error('Error loading payments table:', error);
		} finally {
			setTableLoading(false);
		}
	}
	/* -------------------------------------------
		  FETCH PAYMENT STATISTICS
	--------------------------------------------*/
	async function fetchPaymentStats() {
		setLoadingStats(true);
		const token = sessionStorage.getItem("token");

		try {
			console.log("HOME PAGE - Starting payment stats fetch...");
			console.log("HOME PAGE - Token exists:", !!token);
			console.log("HOME PAGE - Token length:", token?.length);

			const response = await fetch("/api/contractors/payments", {
				headers: {
					'Authorization': `Bearer ${token}`,
					"Cache-Control": "no-store"
				}
			});

			console.log("HOME PAGE - Response status:", response.status);
			const data = await response.json();

			console.log("HOME PAGE - Payment API response:", data);

			if (data.success) {
				const payments = data.payments || [];
				console.log("HOME PAGE - PAYMENTS DATA:", payments);

				// Calculate payment statistics using totalAmount and paidAmount from API
				const totalPayments = payments.reduce((sum, payment) =>
					sum + parseFloat(payment.totalAmount || 0), 0);

				const paidAmount = payments.reduce((sum, payment) =>
					sum + parseFloat(payment.paidAmount || 0), 0);

				const remainingAmount = totalPayments - paidAmount;

				// Calculate upcoming payments (due in next 30 days)
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const nextMonth = new Date();
				nextMonth.setDate(today.getDate() + 30);

				const upcomingPayments = payments.reduce((sum, payment) => {
					const upcoming = payment.installments?.reduce((s, i) => {
						if (!i.paid && i.dueDate) {
							const dueDate = new Date(i.dueDate);
							dueDate.setHours(0, 0, 0, 0);
							if (dueDate >= today && dueDate <= nextMonth) {
								return s + parseFloat(i.amount || 0);
							}
						}
						return s;
					}, 0) || 0;
					return sum + upcoming;
				}, 0);

				console.log("HOME PAGE - CALCULATED STATS:", {
					totalPayments,
					paidAmount,
					remainingAmount,
					upcomingPayments
				});

				const newStats = {
					payments: totalPayments,
					totalPayments,
					paidAmount,
					remainingAmount,
					upcomingPayments
				};

				console.log("HOME PAGE - Setting new stats:", newStats);
				setStats(prev => {
					console.log("HOME PAGE - Previous stats:", prev);
					console.log("HOME PAGE - Updated stats:", { ...prev, ...newStats });
					return {
						...prev,
						...newStats
					};
				});
			} else {
				console.error("HOME PAGE - API returned error:", data);
			}
		} catch (error) {
			console.error('HOME PAGE - Error fetching payment data:', error);
		} finally {
			setLoadingStats(false);
		}
	}
	async function fetchNewQueries() {
		const token = sessionStorage.getItem("token");

		const res = await fetch("/api/contractors/queries", {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();
		setNewQueries(data.newQueries || 0);
	}
	/* -------------------------------------------
		  LOAD PAYMENTS TABLE
	--------------------------------------------*/

	useEffect(() => {
		// Load data in proper order to avoid overwriting
		const loadInitialData = async () => {
			console.log("HOME PAGE - Starting initial data load...");

			// First fetch basic stats (projects count)
			await fetchStats();

			// Then fetch payment stats (this should not be overridden now)
			await fetchPaymentStats();

			// Then fetch other data
			await fetchNewQueries();
			await checkApprovalPopup();
			await checkPaymentNotification();

			console.log("HOME PAGE - Initial data load completed");
		};

		loadInitialData();
	}, []);

	/* -------------------------------------------
		  LOAD PROJECT TABLE WITH SCROLL ANIMATION
	--------------------------------------------*/
	async function loadProjectsTable() {
		setSelectedView("projects");
		setTableLoading(true);
		setIsScrolling(true);

		try {
			const token = sessionStorage.getItem("token");

			const res = await fetch("/api/contractors/projects", {
				headers: { Authorization: `Bearer ${token}` }
			});

			const data = await res.json();

			const typeRes = await fetch("/api/project-types");
			const typeData = await typeRes.json();

			const projectTypes = typeData.types || [];

			const fullData = await Promise.all(
				data.projects.map(async (p) => {
					const sRes = await fetch(`/api/project-stages/list?projectId=${p.id}`, {
						headers: { Authorization: `Bearer ${token}` }
					});

					const stageData = await sRes.json();
					const stages = stageData.stages || [];

					const unreadTotal = stages.reduce(
						(sum, st) => sum + (st.unreadRemarks || 0), 0
					);

					return {
						...p,
						projectTypeName: projectTypes.find(t => t.id === p.projectTypeId)?.name || "N/A",
						projectStages: stages,
						unreadRemarksTotal: unreadTotal
					};
				})
			);

			setTableData(fullData);

			// Scroll to projects table with smooth animation
			setTimeout(() => {
				projectsTableRef.current?.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
					inline: 'nearest'
				});
				
				// Reset scrolling state after animation completes
				setTimeout(() => {
					setIsScrolling(false);
				}, 1000);
			}, 100);

		} finally {
			setTableLoading(false);
		}
	}
	/* -------------------------------------------
		  FILE TYPE HELPERS
	--------------------------------------------*/
	const isImage = (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
	const isVideo = (url) => /\.(mp4|mov)$/i.test(url);
	const isPDF = (url) => /\.pdf$/i.test(url);

	function FileIcon(file) {
		if (isPDF(file)) return <FileText className="w-4 h-4 text-red-500" />;
		if (isImage(file)) return <ImageIcon className="w-4 h-4 text-blue-500" />;
		if (isVideo(file)) return <Video className="w-4 h-4 text-green-600" />;
		return <File className="w-4 h-4" />;
	}

	const openPreview = (drawing, allDrawings) => {
		setPreviewFile(drawing.fileUrl);
		setPreviewDrawing(drawing);
		setProjectDrawings(allDrawings);
	};

	const downloadFile = async () => {
		if (!previewFile || !previewDrawing) return;

		const response = await fetch(previewFile);
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);

		const a = document.createElement("a");
		const ext = previewFile.split(".").pop();

		a.href = url;
		a.download = `${previewDrawing.title}.${ext}`;
		document.body.appendChild(a);
		a.click();
		a.remove();

		URL.revokeObjectURL(url);
	};

	/* -------------------------------------------
		  APPROVE PROJECT POPUP
	--------------------------------------------*/
	async function approveProject() {
		const token = sessionStorage.getItem("token");

		await fetch(`/api/projects/${pendingApprovalProject.id}/approve`, {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` }
		});

		setPendingApprovalProject(null);
		checkApprovalPopup();
	}

	/* -------------------------------------------
		  OPEN STAGE CHAT PANEL
	--------------------------------------------*/
	const openStageSheet = async (stage) => {
		setSelectedStage(stage);
		setRemarkFetching(true);
		setStageRemarks([]);

		const token = sessionStorage.getItem("token");

		const res = await fetch(`/api/stages/${stage.id}/remarks`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		const data = await res.json();

		if (data.success) {
			setStageRemarks(
				data.remarks.sort(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
				)
			);

			// update unread counts in the projectStages inside tableData (if present)
			setTableData((prev) =>
				prev.map((proj) => {
					if (!proj.projectStages) return proj;
					return {
						...proj,
						projectStages: proj.projectStages.map((st) =>
							st.id === stage.id ? { ...st, unreadRemarks: 0 } : st
						),
						unreadRemarksTotal: proj.projectStages
							? proj.projectStages.reduce((sum, s) => sum + (s.unreadRemarks || 0), 0)
							: proj.unreadRemarksTotal
					};
				})
			);
		}

		setRemarkFetching(false);
	};

	/* -------------------------------------------
		  SEND REMARK (FIXED)
	--------------------------------------------*/
	const sendRemark = async () => {
		if (!remarkText.trim()) return;

		setRemarkLoading(true);

		const token = sessionStorage.getItem("token");

		// *** FIX: POST/PUT to /api/stages/:id/remarks and body should have { message }
		const res = await fetch(`/api/stages/${selectedStage.id}/remarks`, {
			method: "PUT", // matches your API route
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ message: remarkText.trim() })
		});

		const data = await res.json();

		if (data.success) {
			// Append returned remark (server returns remark object)
			// If server returns data.remark, use it; otherwise create fallback
			const newRemark = data.remark || {
				id: Date.now(),
				by: "contractor",
				message: remarkText.trim(),
				createdAt: new Date().toISOString()
			};

			// Update local chat immediately
			setStageRemarks((prev) => [...prev, newRemark]);

			// Clear input
			setRemarkText("");

			// Refresh remarks from server to ensure isRead flags and senderName are correct
			await openStageSheet(selectedStage);
		} else {
			toast?.error?.("Failed to send remark");
		}

		setRemarkLoading(false);
	};

	const formatDate = (d) =>
		new Date(d).toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});

	useEffect(() => {
		remarkEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [stageRemarks]);

	/* -------------------------------------------
		  FLOOR SORTING
	--------------------------------------------*/
	function sortFloors(name) {
		const n = (name || "").toLowerCase();

		if (n.includes("basement")) return -2;
		if (n.includes("ground")) return -1;

		const num = n.match(/\d+/);
		if (num) return parseInt(num[0]);

		if (n.includes("terrace") || n.includes("roof")) return 999;

		return 500;
	}
	/* -------------------------------------------
		  UI START
	--------------------------------------------*/
	return (
		<div className="p-8 min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">

			{/* ------------------------------------------- */}
			{/* APPROVAL POPUP */}
			{/* ------------------------------------------- */}
			{pendingApprovalProject && (
				<Dialog open={true}>
					<DialogContent className="max-w-lg text-center space-y-4">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold">
								Approve New Project
							</DialogTitle>
						</DialogHeader>

						<p className="text-gray-700">
							A new project was assigned to you. Please approve to continue.
						</p>

						<div className="p-4 bg-gray-100 rounded-md text-left">
							<p><b>Title:</b> {pendingApprovalProject.title}</p>
							<p><b>Rate:</b> ₹ {pendingApprovalProject.totalCost}</p>
						</div>

						<Button className="w-full" onClick={approveProject}>
							Approve Project
						</Button>
					</DialogContent>
				</Dialog>
			)}

			{/* ------------------------------------------- */}
			{/* DEBUG: Test Button for Payment Popup */}
			{/* ------------------------------------------- */}
			{/* Uncomment this button for testing */}
			{/*
			<div className="fixed bottom-4 right-4 z-50">
				<Button 
					onClick={() => setPaymentNotification({
						projectTitle: 'Test Project',
						stageName: 'Test Stage',
						paidAmount: 50000,
						paidDate: new Date().toISOString(),
						remainingAmount: 25000,
						totalAmount: 75000,
						installmentNo: 1,
						nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
					})}
					className="bg-red-500 hover:bg-red-600"
				>
					Test Payment Popup
				</Button>
			</div>
			*/}

			{/* ------------------------------------------- */}
			{/* PAYMENT NOTIFICATION POPUP */}
			{/* ------------------------------------------- */}
			{(() => {
				console.log("PAYMENT NOTIFICATION - Rendering check, paymentNotification:", paymentNotification);
				return paymentNotification;
			})() && (
				<Dialog open={true} onOpenChange={() => setPaymentNotification(null)}>
					<DialogContent className="max-w-md text-center space-y-4">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold flex items-center justify-center gap-2">
								<div className="p-2 bg-green-100 rounded-full">
									<TrendingUp className="h-5 w-5 text-green-600" />
								</div>
								Payment Received!
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4">
							<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
								<p className="text-sm text-gray-600 mb-1">Amount Paid</p>
								<p className="text-2xl font-bold text-green-700 flex items-center justify-center gap-2">
									<IndianRupee className="h-5 w-5" />
									{paymentNotification.paidAmount?.toLocaleString('en-IN')}
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
									<Badge className="bg-blue-100 text-blue-800">
										#{paymentNotification.installmentNo}
									</Badge>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-gray-600">Paid Date:</span>
									<span className="text-sm font-semibold flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										{new Date(paymentNotification.paidDate).toLocaleDateString('en-IN', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}
									</span>
								</div>
								<div className="border-t pt-2 mt-2 space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-600">Remaining:</span>
										<span className="text-sm font-bold text-orange-600 flex items-center gap-1">
											<IndianRupee className="h-3 w-3" />
											{paymentNotification.remainingAmount?.toLocaleString('en-IN')}
										</span>
									</div>
									{paymentNotification.nextDueDate && (
										<div className="flex justify-between items-center">
											<span className="text-sm font-medium text-gray-600">Next Due:</span>
											<span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{paymentNotification.nextDueDate.toLocaleDateString('en-IN', {
													day: 'numeric',
													month: 'short',
													year: 'numeric'
												})}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						<Button 
							className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
							onClick={() => setPaymentNotification(null)}
						>
							<CheckCircle className="h-4 w-4 mr-2" />
							Got it!
						</Button>
					</DialogContent>
				</Dialog>
			)}

			{/* ------------------------------------------- */}
			{/* DASHBOARD HEADER */}
			{/* ------------------------------------------- */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					Contractor Dashboard
				</h1>

			</div>

			{/* ------------------------------------------- */}
			{/* TOP CARDS (Projects / Stages / Drawings / Payments) */}
			{/* ------------------------------------------- */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

				{/* PROJECTS CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur
          border border-purple-200 hover:scale-[1.01] transition"
					onClick={loadProjectsTable}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Total Projects</CardTitle>
						<FolderKanban className="h-6 w-6 text-purple-600" />
					</CardHeader>
					<CardContent>
						<p className="text-4xl font-extrabold text-purple-700">
							{stats.projects}
						</p>
						<p className="text-xs text-gray-400">Click to view</p>
					</CardContent>
				</Card>

				{/* STAGES CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur
          border border-blue-200 hover:scale-[1.01] transition"
					onClick={() => setActivePage("Stage")}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Stages</CardTitle>
						<ListChecks className="h-6 w-6 text-blue-600" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl text-blue-700">View</p>
					</CardContent>
				</Card>

				{/* DRAWINGS CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur
          border border-orange-200 hover:scale-[1.01] transition"
					onClick={() => setActivePage("Drawing")}
				>
					<CardHeader className="flex justify-between items-center">
						<CardTitle>Drawings</CardTitle>
						<PencilRuler className="h-6 w-6 text-orange-600" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl text-orange-700">View</p>
					</CardContent>
				</Card>

				{/* PAYMENTS CARD */}
				<Card
					className="shadow-md hover:shadow-2xl cursor-pointer bg-white/80 backdrop-blur border border-teal-200 hover:scale-[1.01] transition"
					onClick={loadPaymentsTable}
				>
					<CardHeader className="flex justify-between items-center pb-3">
						<CardTitle className="text-lg font-semibold text-gray-800">Payments</CardTitle>
						<div className="flex items-center space-x-2">
							<Wallet className="h-6 w-6 text-teal-600" />
							<span className="text-xs text-muted-foreground">View All</span>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						{loadingStats ? (
							<div className="flex justify-center items-center py-4">
								<Loader2 className="animate-spin h-6 w-6 text-teal-600" />
							</div>
						) : (
							<>


								{/* Main Stats Row */}
								<div className="grid grid-cols-2 gap-3">
									<div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
										<p className="text-xs font-medium text-blue-700 mb-1">Total Amount</p>
										<p className="text-lg font-bold text-blue-900">
											₹{(stats?.totalPayments || 0).toLocaleString('en-IN')}
										</p>
									</div>
									<div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
										<p className="text-xs font-medium text-green-700 mb-1">Paid Amount</p>
										<p className="text-lg font-bold text-green-900">
											₹{(stats?.paidAmount || 0).toLocaleString('en-IN')}
										</p>
									</div>
								</div>

								{/* Secondary Stats Row */}
								<div className="grid grid-cols-2 gap-3">
									<div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
										<p className="text-xs font-medium text-orange-700 mb-1">Remaining</p>
										<p className="text-lg font-bold text-orange-900">
											₹{(stats?.remainingAmount || 0).toLocaleString('en-IN')}
										</p>
									</div>

								</div>

								{/* Progress Bar */}
								<div className="mt-3">
									<div className="flex justify-between items-center mb-1">
										<p className="text-xs text-gray-600">Payment Progress</p>
										<p className="text-xs font-semibold text-gray-700">
											{(stats?.totalPayments || 0) > 0 ? Math.round((stats?.paidAmount || 0) / (stats?.totalPayments || 1) * 100) : 0}%
										</p>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
										<div
											className="bg-gradient-to-r from-teal-500 to-green-600 h-2 rounded-full transition-all duration-500"
											style={{ width: `${(stats?.totalPayments || 0) > 0 ? Math.round((stats?.paidAmount || 0) / (stats?.totalPayments || 1) * 100) : 0}%` }}
										/>
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>
			{/* PAYMENTS TABLE */}
			{selectedView === "payments" && (
				<div 
					ref={paymentTableRef}
					className={`transition-all duration-700 ease-out transform ${
						isScrolling ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
					}`}
				>
				<Card className="shadow-xl p-6 bg-white/90 border backdrop-blur rounded-xl">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold">Payment Details</h2>
						<Button variant="outline" size="sm" onClick={() => setSelectedView("projects")}>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Back to Projects
						</Button>
					</div>

					{tableLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin h-10 w-10 text-gray-700" />
						</div>
					) : (
						<div className="space-y-4">
							<div className="overflow-auto max-h-[60vh] border rounded-lg">
								<Table>
									<TableHeader className="bg-gray-100/70">
										<TableRow>
											<TableHead>Project</TableHead>
											<TableHead>Total Amount</TableHead>
											<TableHead>Paid Amount</TableHead>
											<TableHead>Remaining</TableHead>
											<TableHead className="text-center">Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{paginatedData.length === 0 ? (
											<TableRow>
												<TableCell colSpan="5" className="text-center text-gray-500 py-6">
													No payment records found
												</TableCell>
											</TableRow>
										) : (
											paginatedData.map((item, i) => {
												const remaining = item.totalAmount - item.paidAmount;
												const isFullyPaid = remaining <= 0;
												const isPartiallyPaid = item.paidAmount > 0 && !isFullyPaid;

												return (
													<TableRow
														key={i}
														className="hover:bg-gray-50 cursor-pointer transition-colors"
														onClick={() => setActivePage("Payment")}
													>
														<TableCell className="font-medium">{item.projectTitle}</TableCell>
														<TableCell>₹{item.totalAmount?.toLocaleString() || '0'}</TableCell>
														<TableCell className="text-green-600">₹{item.paidAmount?.toLocaleString() || '0'}</TableCell>
														<TableCell className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>
															₹{remaining?.toLocaleString() || '0'}
														</TableCell>
														<TableCell className="text-center">
															{isFullyPaid ? (
																<Badge className="bg-green-100 text-green-800">Paid</Badge>
															) : isPartiallyPaid ? (
																<Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
															) : (
																<Badge variant="outline">Pending</Badge>
															)}
														</TableCell>
													</TableRow>
												);
											})
										)}
									</TableBody>
								</Table>
							</div>

							{paginatedData.length > 0 && (
								<div className="flex items-center justify-between px-2">
									<div className="text-sm text-muted-foreground">
										Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
										{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
									</div>
									<Pagination>
										<PaginationContent>
											<PaginationItem>
												<PaginationPrevious
													onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
													className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
												/>
											</PaginationItem>
											{Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => (
												<PaginationItem key={i}>
													<PaginationLink
														onClick={() => setCurrentPage(i + 1)}
														isActive={currentPage === i + 1}
														className="cursor-pointer"
													>
														{i + 1}
													</PaginationLink>
												</PaginationItem>
											))}
											<PaginationItem>
												<PaginationNext
													onClick={() => currentPage * itemsPerPage < totalItems && setCurrentPage(p => p + 1)}
													className={currentPage * itemsPerPage >= totalItems ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								</div>
							)}
						</div>
					)}
				</Card>
				</div>
			)}
			{/* ------------------------------------------- */}
			{/* PROJECT TABLE (ADMIN STYLE) */}
			{/* ------------------------------------------- */}
			{selectedView === "projects" && (
				<div 
					ref={projectsTableRef}
					className={`transition-all duration-700 ease-out transform ${
						isScrolling ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
					}`}
				>
				<Card className="shadow-xl p-6 bg-white/90 border backdrop-blur rounded-xl">
					<h2 className="text-xl font-bold mb-3">Project Details</h2>

					{tableLoading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="animate-spin h-10 w-10 text-gray-700" />
						</div>
					) : (
						<>
							<div className="overflow-auto max-h-[60vh] border rounded-lg">
								<Table>
									<TableHeader className="bg-gray-100/70">
										<TableRow>
											<TableHead>Project</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Client</TableHead>
											<TableHead>Rate</TableHead>
											<TableHead className="text-center">Action</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{paginatedData.length === 0 ? (
											<TableRow>
												<TableCell colSpan="5" className="text-center text-gray-500 py-6">
													No projects found
												</TableCell>
											</TableRow>
										) : (
											paginatedData.map((p, i) => (
												<TableRow key={i} className="hover:bg-gray-50 transition">
													<TableCell>{p.projectUid} - {p.title}</TableCell>
													<TableCell>{p.projectTypeName}</TableCell>
													<TableCell>{p.client?.name}</TableCell>
													<TableCell>₹ {p.totalCost || "-"}</TableCell>

													{/* ACTION BUTTON + PROJECT UNREAD BADGE */}
													<TableCell className="flex gap-2 justify-center">
														<div className="relative inline-block">
															<Button
																variant="default"
																size="sm"
																onClick={() => setOpenProjectSheet(p)}
															>
																View Stages
															</Button>

															{/* 🔥 UNREAD PROJECT BADGE (SUM OF ALL STAGES) */}
															{p.unreadRemarksTotal > 0 && (
																<span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-[5px] h-4 min-w-4 flex items-center justify-center rounded-full shadow">
																	{p.unreadRemarksTotal}
																</span>
															)}
														</div>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>

							{/* PAGINATION */}
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
											<span className="px-4">Page {currentPage} of {Math.ceil(tableData.length / itemsPerPage)}</span>
										</PaginationItem>

										<PaginationItem>
											<PaginationNext
												onClick={() =>
													currentPage < Math.ceil(tableData.length / itemsPerPage) && setCurrentPage(currentPage + 1)
												}
												className="cursor-pointer"
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</>
					)}
				</Card>
				</div>
			)}
			{/* ----------------------------------------------------- */}
			{/* PROJECT SHEET — FLOORWISE STAGES + CHAT PANEL */}
			{/* ----------------------------------------------------- */}
			{openProjectSheet && (
				<Sheet
					open={true}
					onOpenChange={() => {
						setOpenProjectSheet(null);
						setSelectedStage(null);
					}}
				>
					<SheetContent side="right" className="w-[470px] p-0 flex flex-col">

						{/* HEADER – always visible */}
						<SheetHeader className="p-4 border-b bg-white">
							<SheetTitle className="text-xl font-bold">
								{openProjectSheet.title}
							</SheetTitle>
							<SheetDescription>
								Project Type: {openProjectSheet.projectTypeName}
							</SheetDescription>
						</SheetHeader>


						{!selectedStage && (
							<div className="max-h-[85vh] overflow-y-auto p-5 relative">

								{Object.entries(
									openProjectSheet.projectStages.reduce((acc, s) => {
										const floor = s.floorName || "Other";
										(acc[floor] = acc[floor] || []).push(s);
										return acc;
									}, {})
								)
									.sort(([a], [b]) => sortFloors(a) - sortFloors(b))
									.map(([floor, stages]) => (

										<div key={floor} className="mb-6 relative">

											{/* FLOOR TITLE */}
											<h3 className="text-lg font-semibold bg-gray-100 p-2 rounded">
												{floor}
											</h3>

											{/* FIXED TIMELINE STRIP (ONE PER FLOOR) */}
											<div
												className="absolute left-[16px] top-[48px] bottom-0 w-[4px]
				                                        bg-gradient-to-b from-green-500 via-gray-300 to-gray-300 rounded-full"
											/>

											{/* STAGES */}
											<div className="relative pl-8 space-y-7 mt-4">

												{stages.map((s, index) => {
													const status = s.status?.toLowerCase();
													const isApproved = status === "approved";
													const isCompleted = status === "completed";
													const isRejected = status === "rejected";
													const isPending = status === "pending" || status === "in_progress";

													const prevDone =
														index === 0 ||
														["approved", "completed"].includes(stages[index - 1].status);

													const isCurrent = isPending && prevDone;

													const icon = (() => {
														if (isApproved)
															return <div className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center shadow">✓</div>;
														if (isCompleted)
															return <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">✓</div>;
														if (isRejected)
															return <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow">✗</div>;
														if (isCurrent)
															return <div className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center shadow">{index + 1}</div>;

														return <div className="h-6 w-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center">{index + 1}</div>;
													})();

													return (
														<div
															key={s.id}
															onClick={() => openStageSheet(s)}
															className="relative flex items-center gap-4 cursor-pointer"
														>
															<div className="relative z-10">{icon}</div>

															<div className="flex flex-col">
																<div className="flex items-center gap-2">

																	{/* STAGE NAME */}
																	<p className={`text-[16px] font-medium ${isCurrent
																			? "bg-gray-100 border px-3 py-1.5 rounded-lg shadow"
																			: "text-gray-700"
																		}`}>
																		{s.StageTemplate?.name || s.name}
																	</p>

																	{/* UNREAD BADGE */}
																	{s.unreadRemarks > 0 && (
																		<span className="bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full shadow">
																			{s.unreadRemarks}
																		</span>
																	)}

																</div>

																{/* STATUS */}
																<p className="text-xs mt-1">
																	{isApproved && <span className="text-green-600 font-semibold">Approved</span>}
																	{isCompleted && <span className="text-blue-600 font-semibold">Completed</span>}
																	{isRejected && <span className="text-red-600 font-semibold">Rejected</span>}
																	{isPending && <span className="text-gray-500">Pending</span>}
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

						{/* ------------------------------------------------- */}
						{/* VIEW 2: CHAT PANEL (when stage selected) */}
						{/* ------------------------------------------------- */}
						{selectedStage && (
							<div className="flex flex-col h-full">

								{/* HEADER */}
								<div className="px-4 py-3 border-b bg-white sticky top-0 z-30 shadow-sm">
									<div className="flex items-center gap-3">
										<Button variant="ghost" size="icon" onClick={() => setSelectedStage(null)}>
											<ChevronLeft className="h-5 w-5" />
										</Button>

										<h3 className="font-semibold text-lg">
											{selectedStage.StageTemplate?.name || selectedStage.name}
										</h3>
									</div>
								</div>

								{/* CHAT BODY */}
								<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-100"
									style={{ paddingBottom: "110px" }}
								>
									{remarkFetching ? (
										<div className="flex justify-center py-10">
											<Loader2 className="h-6 w-6 animate-spin" />
										</div>
									) : (
										stageRemarks.map((r, i) => {
											const msgDate = new Date(r.createdAt);
											const isMe = r.by === "contractor";

											return (
												<div key={r.id}>

													<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
														<div
															className={`max-w-[75%] px-3 py-2 rounded-xl border shadow-sm
                          ${isMe
																	? "bg-primary text-primary-foreground border-primary"
																	: r.by === "admin"
																		? "bg-red-200 border-red-300 text-red-900"
																		: "bg-white border-gray-300 text-gray-800"
																}
                        `}
														>
															<p className="text-[10px] opacity-70 mb-1">
																{isMe ? "You" : r.by === "admin" ? "Admin" : "Client"}
															</p>

															<p className="whitespace-pre-wrap">{r.message}</p>

															<p className="text-[10px] opacity-70 text-right mt-1">
																{msgDate.toLocaleTimeString("en-IN", {
																	hour: "2-digit",
																	minute: "2-digit"
																})}
															</p>

														</div>
													</div>

												</div>
											);
										})
									)}

									<div ref={remarkEndRef} />

								</div>

								{/* SEND BOX */}
								<div className="p-3 bg-white border-t flex gap-2 sticky bottom-0 z-40 shadow">
									<Textarea
										placeholder="Type message..."
										value={remarkText}
										onChange={(e) => setRemarkText(e.target.value)}
										className="h-16 resize-none flex-1"
									/>

									<Button className="h-16 px-6 rounded-xl"
										disabled={remarkLoading}
										onClick={sendRemark}
									>
										{remarkLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send"}
									</Button>

								</div>

							</div>
						)}

					</SheetContent>
				</Sheet>
			)}

			{previewFile && (
				<Dialog open={true} onOpenChange={() => setPreviewFile(null)}>
					<DialogContent className="max-w-screen-lg max-h-screen flex flex-col overflow-hidden">
						<DialogHeader>
							<DialogTitle className="text-lg font-bold">Drawing Preview</DialogTitle>
							<p className="text-sm text-gray-600">{previewDrawing?.title}</p>
						</DialogHeader>

						{/* MAIN PREVIEW */}
						<div className="flex-1 overflow-auto bg-gray-100 border rounded p-3">
							{isPDF(previewFile) && (
								<iframe src={previewFile} className="w-full h-full border rounded" />
							)}

							{isImage(previewFile) && (
								<img src={previewFile} className="w-full h-auto mx-auto rounded shadow-lg" />
							)}

							{isVideo(previewFile) && (
								<video controls className="w-full rounded shadow-lg">
									<source src={previewFile} />
								</video>
							)}
						</div>

						{/* THUMB LIST */}
						{projectDrawings.length > 1 && (
							<div className="flex gap-3 mt-3 overflow-x-auto border-t pt-3">
								{projectDrawings.map((pf) => (
									<div
										key={pf.id}
										onClick={() => openPreview(pf, projectDrawings)}
										className={`border rounded cursor-pointer p-1 transition ${previewFile === pf.fileUrl
												? "border-blue-500 shadow-md"
												: "border-gray-300 hover:border-blue-300"
											}`}
									>
										{isImage(pf.fileUrl) ? (
											<img src={pf.fileUrl} className="w-20 h-20 object-cover rounded" />
										) : isPDF(pf.fileUrl) ? (
											<div className="w-20 h-20 flex items-center justify-center bg-red-100 rounded">
												<FileText className="text-red-500 w-6 h-6" />
											</div>
										) : (
											<div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded">
												<Video className="text-green-600 w-6 h-6" />
											</div>
										)}
									</div>
								))}
							</div>
						)}

						{/* FOOTER */}
						<div className="mt-3 flex justify-between">
							<Button variant="outline" onClick={downloadFile}>
								<Download className="w-4 h-4 mr-2" />
								Download
							</Button>

							<Button onClick={() => setPreviewFile(null)}>Close</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}

		</div>
	);
}
