"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Calendar, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight, Eye, Wallet, TrendingUp, Users, BarChart3, CreditCard, Filter } from "lucide-react";

export default function ClientPaymentsPage() {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [expandedProjects, setExpandedProjects] = useState(new Set());
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [showInstallments, setShowInstallments] = useState(false);
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [selectedInstallment, setSelectedInstallment] = useState(null);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [paymentFilter, setPaymentFilter] = useState("all");
	
	// Payment statistics
	const [stats, setStats] = useState({
		totalAmount: 0,
		paidAmount: 0,
		remainingAmount: 0,
		totalProjects: 0,
		upcomingPayments: 0
	});

	useEffect(() => {
		fetchClientPayments();
	}, []);

	const fetchClientPayments = async () => {
		try {
			const token = sessionStorage.getItem("token");
			if (!token) {
				setError("Authentication token not found");
				return;
			}

			console.log("FETCHING CLIENT PAYMENTS WITH TOKEN:", token ? "exists" : "missing");

			const response = await fetch("/api/clients/payments", {
				headers: { 
					Authorization: `Bearer ${token}`,
					"Cache-Control": "no-store"
				},
			});
			const data = await response.json();

			console.log("CLIENT PAYMENTS API RESPONSE:", data);
			console.log("CLIENT PAYMENTS COUNT:", data.payments?.length);

			if (data.success) {
				setPayments(data.payments);
				console.log("CLIENT PAYMENTS STATE UPDATED:", data.payments.length);
				
				// Calculate payment statistics
				calculatePaymentStats(data.payments);
			} else {
				setError(data.message || data.error || "Failed to fetch payments");
			}
		} catch (err) {
			console.error("CLIENT PAYMENTS FETCH ERROR:", err);
			setError("Error fetching payments");
		} finally {
			setLoading(false);
		}
	};

	// Calculate payment statistics
	const calculatePaymentStats = (paymentsData) => {
		let totalAmount = 0;
		let paidAmount = 0;
		let upcomingPayments = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		const uniqueProjects = new Set();

		for (const payment of paymentsData) {
			totalAmount += Number(payment.totalAmount);
			paidAmount += Number(payment.paidAmount);
			
			// Count unique projects
			if (payment.project?.id) {
				uniqueProjects.add(payment.project.id);
			}

			// Count upcoming payments (due in next 7 days)
			if (payment.dueDate) {
				const dueDate = new Date(payment.dueDate);
				dueDate.setHours(0, 0, 0, 0);
				const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
				
				if (daysUntilDue > 0 && daysUntilDue <= 7 && !payment.paid) {
					upcomingPayments++;
				}
			}
		}

		const remainingAmount = totalAmount - paidAmount;

		setStats({
			totalAmount,
			paidAmount,
			remainingAmount,
			totalProjects: uniqueProjects.size,
			upcomingPayments
		});
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800 hover:bg-green-200";
			case "partial":
				return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
			case "pending":
				return "bg-blue-100 text-blue-800 hover:bg-blue-200";
			case "overdue":
				return "bg-red-100 text-red-800 hover:bg-red-200";
			default:
				return "bg-gray-100 text-gray-800 hover:bg-gray-200";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="w-3 h-3" />;
			case "partial":
				return <Clock className="w-3 h-3" />;
			case "pending":
				return <Calendar className="w-3 h-3" />;
			case "overdue":
				return <AlertCircle className="w-3 h-3" />;
			default:
				return <Clock className="w-3 h-3" />;
		}
	};

	const getInstallmentStatus = (installment) => {
		if (installment.paid) return "completed";
		const dueDate = new Date(installment.dueDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		dueDate.setHours(0, 0, 0, 0);
		return dueDate < today ? "overdue" : "pending";
	};

	const toggleProjectExpansion = (projectId) => {
		const newExpanded = new Set(expandedProjects);
		if (newExpanded.has(projectId)) {
			newExpanded.delete(projectId);
		} else {
			newExpanded.add(projectId);
		}
		setExpandedProjects(newExpanded);
	};

	const viewInstallments = (payment) => {
		setSelectedPayment(payment);
		setShowInstallments(true);
	};

	const makePayment = async (installment) => {
		setSelectedInstallment(installment);
		setShowPaymentDialog(true);
	};

	const processPayment = async () => {
		if (!selectedInstallment) return;

		setPaymentLoading(true);
		try {
			const token = sessionStorage.getItem("token");
			if (!token) {
				setError("Authentication token not found");
				return;
			}

			const response = await fetch("/api/clients/make-payment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					installmentId: selectedInstallment.id,
					amount: selectedInstallment.amount
				}),
			});

			const data = await response.json();

			if (data.success) {
				// Refresh payments data
				await fetchClientPayments();
				setShowPaymentDialog(false);
				setSelectedInstallment(null);
			} else {
				setError(data.message || "Payment failed");
			}
		} catch (err) {
			console.error("PAYMENT ERROR:", err);
			setError("Error processing payment");
		} finally {
			setPaymentLoading(false);
		}
	};

	// Group payments by project
	const groupedPayments = payments.reduce((acc, payment) => {
		const projectId = payment.project?.id;
		if (!acc[projectId]) {
			acc[projectId] = {
				project: payment.project,
				payments: []
			};
		}
		acc[projectId].payments.push(payment);
		return acc;
	}, {});

	console.log("CLIENT GROUPED PAYMENTS:", Object.keys(groupedPayments));
	console.log("CLIENT RAW PAYMENTS ARRAY:", payments);

	if (loading) {
		return (
			<div className="p-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
					<div className="space-y-4">
						<div className="h-20 bg-gray-200 rounded"></div>
						<div className="h-20 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<IndianRupee className="w-6 h-6" />
					Payments to Admin
				</h1>
				<div className="text-sm text-gray-500">
					{Object.keys(groupedPayments).length} project{Object.keys(groupedPayments).length !== 1 ? "s" : ""}, {payments.length} payment{payments.length !== 1 ? "s" : ""} total
				</div>
			</div>

			{payments.length === 0 ? (
				<div className="bg-gray-50 rounded-lg p-8 text-center">
					<IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
					<p className="text-gray-500">You don't have any payments to admin yet.</p>
				</div>
			) : (
				<div className="space-y-4">
					{Object.entries(groupedPayments).map(([projectId, projectData]) => (
						<div key={projectId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
							{/* Project Header - Clickable */}
							<div 
								className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
								onClick={() => toggleProjectExpansion(projectId)}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{expandedProjects.has(projectId) ? (
											<ChevronDown className="w-5 h-5 text-gray-600" />
										) : (
											<ChevronRight className="w-5 h-5 text-gray-600" />
										)}
										<div>
											<h3 className="text-lg font-semibold text-gray-900">
												{projectData.project?.title || "Unknown Project"}
											</h3>
											<p className="text-sm text-gray-600">
												{projectData.project?.projectUid} • {projectData.payments.length} stage{projectData.payments.length !== 1 ? "s" : ""}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right">
											<p className="text-sm text-gray-500">Total Value</p>
											<p className="text-lg font-semibold flex items-center gap-1">
												<IndianRupee className="w-4 h-4" />
												{projectData.payments.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
											</p>
										</div>
									</div>
								</div>
							</div>
							
							{/* Project Content - Collapsible */}
							{expandedProjects.has(projectId) && (
								<div className="border-t border-gray-200">
									<Table>
										<TableHeader>
											<TableRow className="bg-gray-50">
												<TableHead className="w-12">#</TableHead>
												<TableHead>Stage</TableHead>
												<TableHead>Total Amount</TableHead>
												<TableHead>Paid Amount</TableHead>
												<TableHead>Remaining</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Due Date</TableHead>
												<TableHead>Installments</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{projectData.payments.map((payment, index) => (
												<TableRow key={payment.id} className="hover:bg-gray-50">
													<TableCell className="font-medium">{index + 1}</TableCell>
													<TableCell>
														<div>
															<p className="font-medium">{payment.stage?.stageName || "Unknown Stage"}</p>
															<p className="text-sm text-gray-500">Order: {payment.stage?.stageOrder}</p>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1">
															<IndianRupee className="w-3 h-3" />
															{payment.totalAmount.toLocaleString()}
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1 text-green-600 font-medium">
															<IndianRupee className="w-3 h-3" />
															{payment.paidAmount.toLocaleString()}
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1 text-orange-600 font-medium">
															<IndianRupee className="w-3 h-3" />
															{(payment.totalAmount - payment.paidAmount).toLocaleString()}
														</div>
													</TableCell>
													<TableCell>
														<Badge className={getStatusColor(payment.status)}>
															<div className="flex items-center gap-1">
																{getStatusIcon(payment.status)}
																{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
															</div>
														</Badge>
													</TableCell>
													<TableCell>
														{(() => {
															// Find the next due date from installments
															const unpaidInstallments = payment.installments?.filter(inst => !inst.paid) || [];
															if (unpaidInstallments.length === 0) {
																return payment.installments?.length > 0 ? "All paid" : "No installments";
															}
															const nextDue = unpaidInstallments.reduce((next, current) => {
																const currentDue = new Date(current.dueDate);
																const nextDueDate = new Date(next.dueDate);
																return currentDue < nextDueDate ? current : next;
															});
															return new Date(nextDue.dueDate).toLocaleDateString('en-IN', {
																day: 'numeric',
																month: 'short',
																year: 'numeric'
															});
														})()}
													</TableCell>
													<TableCell>
														<div className="flex flex-col items-center gap-1">
															<div className="flex items-center gap-2">
																<span className="text-sm font-medium">
																	{payment.installments?.filter(inst => inst.paid).length || 0}/{payment.installments?.length || 0}
																</span>
																{payment.installments && payment.installments.length > 0 && (
																	<div className="flex items-center gap-2">
																		<div className="flex gap-1">
																			{payment.installments.slice(0, 5).map((inst) => {
																				const status = getInstallmentStatus(inst);
																				return (
																					<div
																						key={inst.id}
																						className={`w-2 h-2 rounded-full ${
																							status === "completed" ? "bg-green-500" :
																							status === "overdue" ? "bg-red-500" :
																							"bg-gray-300"
																						}`}
																						title={`Installment ${inst.installmentNo}: ${status}`}
																					/>
																				);
																			})}
																		</div>
																		{payment.installments.length > 5 && (
																			<span className="text-xs text-gray-500">+{payment.installments.length - 5}</span>
																		)}
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => viewInstallments(payment)}
																			className="flex items-center gap-1 h-6 px-2"
																		>
																			<Eye className="w-3 h-3" />
																			View
																		</Button>
																	</div>
																)}
															</div>
															<span className="text-xs text-gray-500">
																{payment.installments?.length || 0} installments
															</span>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									
									{projectData.payments.some(p => p.remarks) && (
										<div className="border-t border-gray-200 p-4 bg-gray-50">
											<h4 className="font-medium text-gray-900 mb-2">Remarks</h4>
											<div className="space-y-2">
												{projectData.payments.filter(p => p.remarks).map(payment => (
													<div key={payment.id} className="text-sm">
														<span className="font-medium">{payment.stage?.stageName}:</span> {payment.remarks}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Installments Dialog */}
			<Dialog open={showInstallments} onOpenChange={setShowInstallments}>
				<DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl">
					<DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6 rounded-t-2xl">
						<DialogTitle className="flex items-center gap-4 text-2xl">
							<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
								<IndianRupee className="w-6 h-6 text-white" />
							</div>
							<div className="flex-1">
								<div className="font-bold text-gray-900">Payment Installments</div>
								<div className="text-sm font-medium text-gray-600">{selectedPayment?.stage?.stageName}</div>
								<div className="text-xs text-gray-500 mt-1">Project: {selectedPayment?.project?.title}</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge className="bg-blue-100 text-blue-800 px-3 py-1">
									{selectedPayment?.installments?.length || 0} Installments
								</Badge>
								<Badge className={`${getStatusColor(selectedPayment?.status)} px-3 py-1`}>
									{selectedPayment?.status?.charAt(0).toUpperCase() + selectedPayment?.status?.slice(1)}
								</Badge>
							</div>
						</DialogTitle>
					</DialogHeader>
					
					<div className="py-6 space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
						{/* Payment Summary Card */}
						<Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-6">
								<CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
									<BarChart3 className="w-5 h-5 text-blue-600" />
									Payment Overview
								</CardTitle>
								<p className="text-sm text-gray-600 mt-1">{selectedPayment?.stage?.stageName}</p>
							</CardHeader>
							<CardContent className="pt-6">
								{/* Payment Statistics Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Total Amount Card */}
    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg text-white">
        <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Total Amount
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold text-white">
                ₹ {selectedPayment?.totalAmount?.toLocaleString('en-IN') || 0}
            </p>
            <div className="mt-2 text-xs text-blue-100">Full payment amount</div>
        </CardContent>
    </Card>

    {/* Paid Amount Card */}
    <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg text-white">
        <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Paid Amount
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold text-white">
                ₹ {selectedPayment?.paidAmount?.toLocaleString('en-IN') || 0}
            </p>
            <div className="mt-2 text-xs text-green-100">Amount received</div>
        </CardContent>
    </Card>

    {/* Remaining Amount Card */}
    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg text-white">
        <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Remaining
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold text-white">
                ₹ {(selectedPayment?.totalAmount - selectedPayment?.paidAmount)?.toLocaleString('en-IN') || 0}
            </p>
            <div className="mt-2 text-xs text-orange-100">Balance due</div>
        </CardContent>
    </Card>
</div>

    							</CardContent>
						</Card>

						{/* Installment Schedule Card */}
						<Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4 border-b">
								<CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Calendar className="w-5 h-5 text-gray-600" />
										Installment Schedule
									</div>
									<div className="flex items-center gap-2">
										<Badge className="bg-gray-100 text-gray-800 px-3 py-1">
											{selectedPayment?.installments?.length || 0} installments
										</Badge>
										<Badge className="bg-green-100 text-green-800 px-3 py-1">
											{selectedPayment?.installments?.filter(inst => inst.paid).length || 0} paid
										</Badge>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<div className="max-h-[400px] overflow-y-auto">
									<Table>
										<TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 border-b">
											<TableRow>
												<TableHead className="w-20 font-bold text-gray-800 py-4">#</TableHead>
												<TableHead className="font-bold text-gray-800 py-4">Amount</TableHead>
												<TableHead className="font-bold text-gray-800 py-4 flex items-center gap-2">
												Due Date
												<Badge className="bg-red-100 text-red-800 text-xs px-2 py-1">Next Due</Badge>
											</TableHead>
												<TableHead className="font-bold text-gray-800 py-4">Status</TableHead>
												<TableHead className="font-bold text-gray-800 py-4">Days Remaining</TableHead>
												<TableHead className="font-bold text-gray-800 py-4">Remarks</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{(() => {
												// Find the next due date (closest upcoming unpaid installment)
												const today = new Date();
												today.setHours(0, 0, 0, 0);
												const unpaidInstallments = selectedPayment?.installments?.filter(inst => !inst.paid) || [];
												const nextDueInstallment = unpaidInstallments.reduce((next, current) => {
													const currentDue = new Date(current.dueDate);
													currentDue.setHours(0, 0, 0, 0);
													const nextDue = next ? new Date(next.dueDate) : null;
													if (nextDue) nextDue.setHours(0, 0, 0, 0);
													
													if (currentDue >= today && (!nextDue || currentDue < nextDue)) {
														return current;
													}
													return next;
												}, null);
												
												return selectedPayment?.installments?.map((installment, index) => {
													const status = getInstallmentStatus(installment);
													const dueDate = new Date(installment.dueDate);
													dueDate.setHours(0, 0, 0, 0);
													const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
													const isNextDue = nextDueInstallment && installment.id === nextDueInstallment.id;
												
												return (
													<TableRow key={installment.id} className={`${isNextDue ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'} border-b transition-colors`}>
														<TableCell className="font-medium">
															<div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm">
																{installment.installmentNo}
															</div>
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2 font-semibold">
																<IndianRupee className="w-4 h-4 text-gray-500" />
																{installment.amount.toLocaleString()}
															</div>
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<Calendar className={`w-4 h-4 ${isNextDue ? 'text-red-500' : 'text-gray-400'}`} />
																<span className={`font-medium ${isNextDue ? 'text-red-600 font-bold' : ''}`}>
																	{new Date(installment.dueDate).toLocaleDateString('en-IN', {
																		day: 'numeric',
																		month: 'short',
																		year: 'numeric'
																	})}
																</span>
																{isNextDue && (
																	<Badge className="bg-red-100 text-red-800 text-xs px-2 py-1 ml-2">
																		Next Due
																	</Badge>
																)}
															</div>
														</TableCell>
														<TableCell>
															<Badge className={`${getStatusColor(status)} px-3 py-1 rounded-full font-medium`}>
																<div className="flex items-center gap-1.5">
																	{getStatusIcon(status)}
																	{status.charAt(0).toUpperCase() + status.slice(1)}
																</div>
															</Badge>
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<div className={`font-semibold ${
																	installment.paid ? "text-green-600 bg-green-50 px-2 py-1 rounded" :
																	daysRemaining < 0 ? "text-red-600 bg-red-50 px-2 py-1 rounded" :
																	daysRemaining <= 7 ? "text-yellow-600 bg-yellow-50 px-2 py-1 rounded" :
																	"text-gray-600 bg-gray-50 px-2 py-1 rounded"
																}`}>
																	{installment.paid ? "Paid" :
																	 daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` :
																	 daysRemaining === 0 ? "Due today" :
																	 `${daysRemaining} days`}
																</div>
																{!installment.paid && (
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => makePayment(installment)}
																		className="flex items-center gap-1 h-6 px-2 bg-green-50 border-green-200 hover:bg-green-100"
																	>
																		<CreditCard className="w-3 h-3" />
																		Pay Now
																	</Button>
																)}
															</div>
														</TableCell>
														<TableCell className="text-gray-600">
															{installment.remark || (
																<span className="text-gray-400 italic">No remarks</span>
															)}
														</TableCell>
													</TableRow>
												);
												});
											})()}
										</TableBody>
									</Table>
									
									{!selectedPayment?.installments?.length && (
										<div className="text-center py-12 text-gray-500">
											<Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
											<p className="font-medium">No installments found</p>
											<p className="text-sm text-gray-400">This payment doesn't have any installments scheduled.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Progress Overview */}
						<Card className="border shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-600">Payment Progress</p>
										<p className="text-2xl font-bold text-gray-900">
											{Math.round((selectedPayment?.paidAmount / selectedPayment?.totalAmount) * 100) || 0}% Complete
										</p>
									</div>
									<div className="text-right space-y-1">
										<p className="text-sm font-medium text-gray-600">Total Amount</p>
										<p className="text-xl font-bold text-gray-900 flex items-center gap-1">
											<IndianRupee className="w-5 h-5" />
											{selectedPayment?.totalAmount?.toLocaleString()}
										</p>
									</div>
								</div>
								
								{/* Progress Bar */}
								<div className="mt-4">
									<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
										<div 
											className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
											style={{ width: `${Math.round((selectedPayment?.paidAmount / selectedPayment?.totalAmount) * 100) || 0}%` }}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</DialogContent>
			</Dialog>

			{/* Payment Confirmation Dialog */}
			<Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
				<DialogContent className="max-w-md rounded-2xl">
					<DialogHeader className="pb-4">
						<DialogTitle className="flex items-center gap-3 text-xl">
							<div className="p-2 bg-green-100 rounded-lg">
								<CreditCard className="w-6 h-6 text-green-600" />
							</div>
							Confirm Payment
						</DialogTitle>
					</DialogHeader>
					
					{selectedInstallment && (
						<div className="space-y-4 py-4">
							<Card className="border-0 bg-gray-50">
								<CardContent className="pt-4">
									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">Installment:</span>
											<span className="font-medium">#{selectedInstallment.installmentNo}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">Amount:</span>
											<span className="font-semibold text-lg flex items-center gap-1">
												<IndianRupee className="w-4 h-4" />
												{selectedInstallment.amount.toLocaleString()}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">Due Date:</span>
											<span className="font-medium">
												{new Date(selectedInstallment.dueDate).toLocaleDateString('en-IN', {
													day: 'numeric',
													month: 'short',
													year: 'numeric'
												})}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
								<p className="text-sm text-blue-800">
									<strong>Note:</strong> This payment will be processed immediately. Please ensure all details are correct before proceeding.
								</p>
							</div>

							<div className="flex gap-3 pt-2">
								<Button
									variant="outline"
									onClick={() => setShowPaymentDialog(false)}
									className="flex-1"
									disabled={paymentLoading}
								>
									Cancel
								</Button>
								<Button
									onClick={processPayment}
									disabled={paymentLoading}
									className="flex-1 bg-green-600 hover:bg-green-700"
								>
									{paymentLoading ? (
										<div className="flex items-center gap-2">
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											Processing...
										</div>
									) : (
										<div className="flex items-center gap-2">
											<CreditCard className="w-4 h-4" />
											Pay Now
										</div>
									)}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
