"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardHeader,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "@/components/ui/select";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import {
	Pencil,
	Trash2,
	PlusCircle,
	ListOrdered,
} from "lucide-react";

/**
 * PaymentPage
 * - Save All Stages button is active only when totalPercentUsed === 100
 * - Loading states added for: saveAllStages, saveStage (add/update), deleteStage, saveProjectAmountToDB
 */

export default function PaymentPage() {
	// ---------------------- STATE ----------------------
	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState(null);

	const [totalAmount, setTotalAmount] = useState("");
	const [totalAmountLocked, setTotalAmountLocked] = useState(false);

	const [loadingProjects, setLoadingProjects] = useState(true);
	const [loadingStages, setLoadingStages] = useState(false);
	const [loadingPayments, setLoadingPayments] = useState(false);

	const [stages, setStages] = useState([]);
	const [payments, setPayments] = useState([]);

	// NEW → Toggle Show/Hide Stage Table
	const [showStages, setShowStages] = useState(true);

	// Stage Sheet
	const [stageOpen, setStageOpen] = useState(false);
	const [editingStage, setEditingStage] = useState(null);

	const [stageForm, setStageForm] = useState({
		id: null,
		stageOrder: "",
		stageName: "",
		percentage: "",
		amount: "",
		remarks: "",
	});

	// Installments
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [installments, setInstallments] = useState({});
	const [firstDueDate, setFirstDueDate] = useState({});
	const [installCount, setInstallCount] = useState({});
	const [gapDays, setGapDays] = useState({});

	const [paymentFilter, setPaymentFilter] = useState("all");

	// -------- Loading/Action states ----------
	const [savingStages, setSavingStages] = useState(false); // saveAllStages
	const [stageSaving, setStageSaving] = useState(false); // add/update stage
	const [deletingStageId, setDeletingStageId] = useState(null); // id being deleted
	const [savingProjectAmount, setSavingProjectAmount] = useState(false);

	// ---------------------- LOAD DATA ----------------------
	useEffect(() => {
		loadProjects();
	}, []);

	useEffect(() => {
		if (selectedProject) {
			loadStages(selectedProject.id);
			loadPayments(selectedProject.id);

			setTotalAmount(selectedProject.totalAmount || "");
			setTotalAmountLocked(!!selectedProject.totalAmount); // Lock if already saved
		}
	}, [selectedProject]);

	// ------------- AUTO LOAD INSTALLMENTS FOR ALL PAYMENTS -------------
	useEffect(() => {
		if (payments.length > 0) {
			payments.forEach((p) => {
				loadInstallments(p.id);
			});
		}
	}, [payments]);

	// ---------------------- FETCH PROJECTS ----------------------
	const loadProjects = async () => {
		setLoadingProjects(true);

		try {
			const res = await fetch("/api/projects");
			const data = await res.json();

			setProjects(data.projects || []);
		} catch (err) {
			console.error("Error loading projects", err);
			toast.error("Error loading projects");
		} finally {
			setLoadingProjects(false);
		}
	};

	// ---------------------- FETCH STAGES ----------------------
	const loadStages = async (projectId) => {
		if (!projectId) return;
		setLoadingStages(true);

		try {
			const res = await fetch(`/api/paymentStage/list/${projectId}`);
			const data = await res.json();

			if (data.success) setStages(data.stages || []);
			else setStages([]);
		} catch (err) {
			console.error("Error loading stages", err);
			toast.error("Error loading stages");
		} finally {
			setLoadingStages(false);
		}
	};

	// ---------------------- FETCH PAYMENTS ----------------------
	const loadPayments = async (projectId) => {
		if (!projectId) return;

		setLoadingPayments(true);

		try {
			const res = await fetch(`/api/payment?projectId=${projectId}`);
			const data = await res.json();

			setPayments(data.payments || []);
		} catch (err) {
			console.error("Error loading payments", err);
			toast.error("Error loading payments");
		} finally {
			setLoadingPayments(false);
		}
	};

	// ---------------------- SAVE PROJECT AMOUNT ----------------------
	const saveProjectAmountToDB = async () => {
		if (!totalAmount) return toast.error("Enter project amount");

		setSavingProjectAmount(true);
		try {
			await fetch("/api/projects/updateAmount", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					projectId: selectedProject.id,
					totalAmount,
				}),
			});

			toast.success("Project amount saved");
			setTotalAmountLocked(true);
		} catch (err) {
			console.error("Error saving project amount", err);
			toast.error("Error saving project amount");
		} finally {
			setSavingProjectAmount(false);
		}
	};

	// ---------------------- STAGE ACTIONS ----------------------
	const openAddStage = () => {
		setEditingStage(null);
		setStageForm({
			id: null,
			stageOrder: stages.length + 1,
			stageName: "",
			percentage: "",
			amount: "",
			remarks: "",
		});
		setStageOpen(true);
	};

	const openEditStage = (stage) => {
		setEditingStage(stage);
		setStageForm({
			id: stage.id,
			stageOrder: stage.stageOrder,
			stageName: stage.stageName,
			percentage: stage.percentage,
			amount: stage.amount,
			remarks: stage.remarks || "",
		});
		setStageOpen(true);
	};

	const updateStageField = (key, value) => {
		const updated = { ...stageForm, [key]: value };

		if (key === "percentage" && totalAmount) {
			const pct = Number(value) || 0;
			updated.amount = (Number(totalAmount) * pct) / 100;
		}

		setStageForm(updated);
	};

	const saveStage = async () => {
		if (!stageForm.stageName || !stageForm.percentage)
			return toast.error("Enter all stage details");

		setStageSaving(true);
		try {
			if (editingStage) {
				await fetch("/api/paymentStage/update", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(stageForm),
				});
			} else {
				await fetch("/api/paymentStage/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						projectId: selectedProject.id,
						stageOrder: stageForm.stageOrder,
						stageName: stageForm.stageName,
						percentage: stageForm.percentage,
						amount: stageForm.amount,
						remarks: stageForm.remarks,
					}),
				});
			}

			toast.success("Stage saved");
			setStageOpen(false);
			await loadStages(selectedProject.id);
		} catch (err) {
			console.error("Error saving stage", err);
			toast.error("Error saving stage");
		} finally {
			setStageSaving(false);
		}
	};

	const deleteStage = async (id) => {
		const ok = confirm("Are you sure you want to delete this stage?");
		if (!ok) return;

		setDeletingStageId(id);
		try {
			await fetch(`/api/paymentStage/delete/${id}`, {
				method: "DELETE",
			});

			toast.success("Stage deleted");
			await loadStages(selectedProject.id);
		} catch (err) {
			console.error("Error deleting stage", err);
			toast.error("Error deleting stage");
		} finally {
			setDeletingStageId(null);
		}
	};

	// ---------------------- SAVE ALL STAGES ----------------------
	const saveAllStages = async () => {
		// Only allow if totalPercentUsed === 100 (UI should already enforce, but safety check)
		if (totalPercentUsed !== 100) {
			return toast.error("Total stages percentage must equal 100%");
		}

		setSavingStages(true);

		try {
			for (const s of stages) {
				await fetch("/api/paymentStage/update", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: s.id,
						stageOrder: Number(s.stageOrder),
						stageName: s.stageName,
						percentage: Number(s.percentage),
						amount: Number(s.amount),
						remarks: s.remarks || "",
					}),
				});
			}

			await fetch("/api/payment/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ projectId: selectedProject.id }),
			});

			toast.success("All stages & payments saved");

			await loadStages(selectedProject.id);
			await loadPayments(selectedProject.id);

			setShowStages(false);
		} catch (err) {
			console.error("Save error:", err);
			toast.error("Error saving stages");
		} finally {
			setSavingStages(false);
		}
	};

	// ---------------------- INSTALLMENTS ----------------------
	const loadInstallments = async (paymentId) => {
		try {
			const res = await fetch(`/api/payment/installments/list/${paymentId}`);
			const data = await res.json();

			if (!data.success) return toast.error(data.error);

			setInstallments((prev) => ({
				...prev,
				[paymentId]: data.installments,
			}));
		} catch (err) {
			console.error("Error loading installments", err);
			toast.error("Error loading installments");
		}
	};

	const generateInstallments = async () => {
		const p = selectedPayment;
		const startDate = firstDueDate[p.id];
		const count = installCount[p.id];
		const days = gapDays[p.id];

		if (!startDate) return toast.error("Select first due date");
		if (!count) return toast.error("Enter installment count");
		if (!days) return toast.error("Enter gap days");

		const res = await fetch("/api/payment/installments/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				paymentId: p.id,
				count,
				gapDays: days,
				startDate,
			}),
		});

		const data = await res.json();
		if (!data.success) return toast.error(data.error);

		toast.success("Installments generated");

		loadInstallments(p.id);
		loadPayments(selectedProject.id);
	};

	const togglePaid = async (inst, paid) => {
		let remark = inst.remark || "";

		if (!paid && new Date(inst.dueDate) < new Date() && !remark) {
			remark = prompt("Overdue. Enter remark:");
			if (!remark) return toast.error("Remark required");
		}

		await fetch("/api/payment/installments/update", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: inst.id, paid, remark }),
		});

		loadInstallments(inst.paymentId);
		loadPayments(selectedProject.id);
	};

	// ---------------------- UTILS ----------------------
	const nextDue = (payment) => {
		const inst = installments[payment.id];
		if (!inst || inst.length === 0) return "-";
		const next = inst.find((i) => !i.paid);
		return next ? next.dueDate : "Completed";
	};

	const paidAmount = (payment) => {
		const inst = installments[payment.id];
		if (!inst || inst.length === 0) return 0;
		return inst.filter((i) => i.paid).reduce((sum, i) => sum + i.amount, 0);
	};

	const remainingAmount = (payment) =>
		payment.totalAmount - paidAmount(payment);

	const paymentStatus = (payment) => {
		const inst = installments[payment.id];
		if (!inst || inst.length === 0) return "Unpaid";
		const rem = remainingAmount(payment);
		if (rem === 0) return "Paid";
		if (rem === payment.totalAmount) return "Unpaid";
		return "Partial";
	};

	const totalPercentUsed = stages.reduce(
		(sum, s) => sum + Number(s.percentage || 0),
		0
	);

	const amountUsed = stages.reduce(
		(sum, s) => sum + Number(s.amount || 0),
		0
	);

	const remainingProjectAmount = Number(totalAmount || 0) - amountUsed;

	// ---------------------- Helper small spinner ----------------------
	const SmallSpinner = ({ className = "inline-block w-4 h-4 mr-2 align-middle" }) => (
		<svg
			className={className}
			viewBox="0 0 50 50"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<circle
				cx="25"
				cy="25"
				r="20"
				fill="none"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				strokeDasharray="31.415, 31.415"
			>
				<animateTransform
					attributeName="transform"
					type="rotate"
					from="0 25 25"
					to="360 25 25"
					dur="0.9s"
					repeatCount="indefinite"
				/>
			</circle>
		</svg>
	);

	// ---------------------- RENDER ----------------------
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-3xl font-bold">Payment Management</h1>

			{/* PROJECT SELECT */}
			<Card>
				<CardHeader>
					<h2 className="text-xl font-semibold">Select Project</h2>
				</CardHeader>

				<CardContent className="space-y-4">
					<Select
						onValueChange={(id) => {
							const proj = projects.find((p) => p.id == id);
							setSelectedProject(proj);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose Project" />
						</SelectTrigger>

						<SelectContent>
							{projects.map((p) => (
								<SelectItem key={p.id} value={String(p.id)}>
									{p.title} ({p.projectUid})
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Project Info */}
					{selectedProject && (
						<>
							<div className="p-4 bg-gray-100 border rounded">
								<p><b>Client:</b> {selectedProject.client?.name}</p>
								<p><b>Contractor:</b> {selectedProject.contractor?.name}</p>
								<p><b>Project UID:</b> {selectedProject.projectUid}</p>
							</div>

							{/* Improved Project Amount Field */}
							<div className="flex items-center gap-2">
								<Input
									type="number"
									disabled={totalAmountLocked}
									placeholder={
										totalAmountLocked
											? `Total Amount: ₹${totalAmount}`
											: "Enter Total Project Amount"
									}
									value={totalAmountLocked ? "" : totalAmount}
									onChange={(e) => setTotalAmount(e.target.value)}
								/>

								{!totalAmountLocked ? (
									<Button onClick={saveProjectAmountToDB} disabled={savingProjectAmount}>
										{savingProjectAmount ? (
											<>
												<SmallSpinner className="inline-block w-4 h-4 mr-2" />
												Saving...
											</>
										) : (
											"Save"
										)}
									</Button>
								) : (
									<Button
										variant="outline"
										onClick={() => {
											setTotalAmountLocked(false);
											setTotalAmount(selectedProject.totalAmount);
										}}
									>
										Edit
									</Button>
								)}
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Stages Section */}
			{selectedProject && (
				<Card>
					<CardHeader className="flex justify-between items-center">
						<h2 className="text-xl font-semibold">Stages</h2>

						<div className="flex gap-3">
							<Button
								variant="secondary"
								onClick={() => setShowStages(!showStages)}
							>
								{showStages ? "Hide Stages" : "Show Stages"}
							</Button>

							<Button onClick={openAddStage} className="flex gap-2">
								<PlusCircle size={18} /> Add Stage
							</Button>
						</div>
					</CardHeader>

					<CardContent>
						{showStages && (
							<>
								{stages.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="w-full border">
											<thead>
											<tr className="bg-gray-100">
												<th className="p-2 text-left">No</th>
												<th className="p-2 text-left">Stage Name</th>
												<th className="p-2 text-left">%</th>
												<th className="p-2 text-left">Amount</th>
												<th className="p-2 text-center">Actions</th>
											</tr>
											</thead>

											<tbody>
											{stages.map((s) => (
												<tr key={s.id} className="border-b">
													<td className="p-2">{s.stageOrder}</td>
													<td className="p-2">{s.stageName}</td>
													<td className="p-2">{s.percentage}%</td>
													<td className="p-2">₹{s.amount}</td>

													<td className="p-2 text-center">
														<div className="flex justify-center gap-2">
															<Button
																size="sm"
																variant="outline"
																onClick={() => openEditStage(s)}
																disabled={stageSaving || savingStages}
															>
																<Pencil size={16} />
															</Button>

															<Button
																size="sm"
																variant="destructive"
																onClick={() => deleteStage(s.id)}
																disabled={deletingStageId === s.id || savingStages}
															>
																{deletingStageId === s.id ? (
																	<>
																		<SmallSpinner className="inline-block w-3 h-3 mr-1" />
																		Deleting...
																	</>
																) : (
																	<Trash2 size={16} />
																)}
															</Button>
														</div>
													</td>
												</tr>
											))}
											</tbody>
										</table>
									</div>
								) : (
									<p className="text-gray-400">No stages added.</p>
								)}

								{/* Summary */}
								{stages.length > 0 && (
									<div className="p-4 bg-gray-50 border rounded mt-3 space-y-1">
										<p><b>Total % Used:</b> {totalPercentUsed}%</p>
										<p><b>Total Amount Used:</b> ₹{amountUsed}</p>
										<p><b>Remaining:</b> ₹{remainingProjectAmount}</p>

										{/* Save All Stages button: active only when totalPercentUsed === 100 */}
										<Button
											className="mt-3 w-full"
											onClick={saveAllStages}
											disabled={totalPercentUsed !== 100 || savingStages}
										>
											{savingStages ? (
												<>
													<SmallSpinner className="inline-block w-4 h-4 mr-2" />
													Saving...
												</>
											) : totalPercentUsed !== 100 ? (
												`Save All Stages (requires 100% — current ${totalPercentUsed}%)`
											) : (
												"Save All Stages"
											)}
										</Button>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			)}

			{/* Payments */}
			{selectedProject && (
				<>
					<div className="flex justify-end mb-3">
						<Select onValueChange={setPaymentFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter payments" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
								<SelectItem value="unpaid">Unpaid</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Tabs defaultValue="client">
						<TabsList>
							<TabsTrigger value="client">Client → Admin</TabsTrigger>
							<TabsTrigger value="contractor">Admin → Contractor</TabsTrigger>
						</TabsList>

						{/* CLIENT PAYMENTS */}
						<TabsContent value="client">
							<Card className="mt-4">
								<CardHeader>
									<h3 className="text-xl font-semibold">Client Payments</h3>
								</CardHeader>

								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full border">
											<thead>
											<tr className="bg-gray-100 border-b">
												<th className="p-2 text-left">Stage</th>
												<th className="p-2 text-left">Status</th>
												<th className="p-2 text-left">Paid / Total</th>
												<th className="p-2 text-left">Remaining</th>
												<th className="p-2 text-left">Next Due</th>
												<th className="p-2 text-center">Installments</th>
											</tr>
											</thead>

											<tbody>
											{payments
												.filter((p) => p.payerType === "client")
												.filter((p) => {
													if (paymentFilter === "paid") return remainingAmount(p) === 0;
													if (paymentFilter === "unpaid") return remainingAmount(p) > 0;
													return true;
												})
												.map((p) => (
													<tr key={p.id} className="border-b hover:bg-gray-50">
														<td className="p-2">{p.stage.stageName}</td>

														<td className="p-2">
                                                    <span
	                                                    className={`px-2 py-1 rounded text-xs ${
		                                                    paymentStatus(p) === "Paid"
			                                                    ? "bg-green-200 text-green-800"
			                                                    : paymentStatus(p) === "Partial"
				                                                    ? "bg-yellow-200 text-yellow-800"
				                                                    : "bg-red-200 text-red-800"
	                                                    }`}
                                                    >
                                                        {paymentStatus(p)}
                                                    </span>
														</td>

														<td className="p-2">
															₹{paidAmount(p)} / ₹{p.totalAmount}
														</td>

														<td className="p-2">₹{remainingAmount(p)}</td>

														<td className="p-2">{nextDue(p)}</td>

														<td className="p-2 text-center">
															<Button
																size="sm"
																variant="outline"
																onClick={() => {
																	setSelectedPayment(p);
																	loadInstallments(p.id);
																}}
															>
																<ListOrdered size={16} className="mr-1" />
																View
															</Button>
														</td>
													</tr>
												))}
											</tbody>

											{/* TOTAL SUMMARY ROW */}
											<tfoot>
											<tr className="bg-gray-50 font-semibold border-t">
												<td className="p-2" colSpan={2}>Total</td>
												<td className="p-2">
													₹{
													payments
														.filter((p) => p.payerType === "client")
														.reduce((sum, p) => sum + paidAmount(p), 0)
												}
												</td>
												<td className="p-2">
													₹{
													payments
														.filter((p) => p.payerType === "client")
														.reduce((sum, p) => sum + remainingAmount(p), 0)
												}
												</td>
												<td colSpan={2}></td>
											</tr>
											</tfoot>
										</table>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* CONTRACTOR PAYMENTS */}
						<TabsContent value="contractor">
							<Card className="mt-4">
								<CardHeader>
									<h3 className="text-xl font-semibold">Contractor Payments</h3>
								</CardHeader>

								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full border">
											<thead>
											<tr className="bg-gray-100 border-b">
												<th className="p-2 text-left">Stage</th>
												<th className="p-2 text-left">Status</th>
												<th className="p-2 text-left">Paid / Total</th>
												<th className="p-2 text-left">Remaining</th>
												<th className="p-2 text-left">Next Due</th>
												<th className="p-2 text-center">Installments</th>
											</tr>
											</thead>

											<tbody>
											{payments
												.filter((p) => p.receiverType === "contractor")
												.filter((p) => {
													if (paymentFilter === "paid") return remainingAmount(p) === 0;
													if (paymentFilter === "unpaid") return remainingAmount(p) > 0;
													return true;
												})
												.map((p) => (
													<tr key={p.id} className="border-b hover:bg-gray-50">
														<td className="p-2">{p.stage.stageName}</td>

														<td className="p-2">
                                                    <span
	                                                    className={`px-2 py-1 rounded text-xs ${
		                                                    paymentStatus(p) === "Paid"
			                                                    ? "bg-green-200 text-green-800"
			                                                    : paymentStatus(p) === "Partial"
				                                                    ? "bg-yellow-200 text-yellow-800"
				                                                    : "bg-red-200 text-red-800"
	                                                    }`}
                                                    >
                                                        {paymentStatus(p)}
                                                    </span>
														</td>

														<td className="p-2">
															₹{paidAmount(p)} / ₹{p.totalAmount}
														</td>

														<td className="p-2">₹{remainingAmount(p)}</td>

														<td className="p-2">{nextDue(p)}</td>

														<td className="p-2 text-center">
															<Button
																size="sm"
																variant="outline"
																onClick={() => {
																	setSelectedPayment(p);
																	loadInstallments(p.id);
																}}
															>
																<ListOrdered size={16} className="mr-1" />
																View
															</Button>
														</td>
													</tr>
												))}
											</tbody>

											{/* TOTAL SUMMARY ROW */}
											<tfoot>
											<tr className="bg-gray-50 font-semibold border-t">
												<td className="p-2" colSpan={2}>Total</td>
												<td className="p-2">
													₹{
													payments
														.filter((p) => p.receiverType === "contractor")
														.reduce((sum, p) => sum + paidAmount(p), 0)
												}
												</td>
												<td className="p-2">
													₹{
													payments
														.filter((p) => p.receiverType === "contractor")
														.reduce((sum, p) => sum + remainingAmount(p), 0)
												}
												</td>
												<td colSpan={2}></td>
											</tr>
											</tfoot>
										</table>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</>
			)}


			{/* Stage Sheet */}
			<Sheet open={stageOpen} onOpenChange={setStageOpen}>
				<SheetContent className="w-[420px]">
					<SheetHeader>
						<SheetTitle className="text-lg font-semibold">
							{editingStage ? "Edit Stage" : "Add Stage"}
						</SheetTitle>
						<SheetDescription>
							Configure payment stage details below.
						</SheetDescription>
					</SheetHeader>

					<div className="mt-6 space-y-5 p-3">
						<div className="space-y-1.5">
							<label className="font-medium text-sm">Stage Name</label>
							<Input
								placeholder="Enter Stage Name"
								value={stageForm.stageName}
								onChange={(e) => updateStageField("stageName", e.target.value)}
							/>
						</div>

						<div className="space-y-1.5">
							<label className="font-medium text-sm">Percentage (%)</label>
							<Input
								type="number"
								placeholder="Enter %"
								value={stageForm.percentage}
								onChange={(e) => updateStageField("percentage", e.target.value)}
							/>
						</div>

						<div className="space-y-1.5">
							<label className="font-medium text-sm">Calculated Amount</label>
							<Input
								disabled
								value={stageForm.amount ? `₹${stageForm.amount}` : "₹0"}
								className="bg-gray-100 font-semibold"
							/>
						</div>

						<Button className="w-full h-10 mt-4" onClick={saveStage} disabled={stageSaving}>
							{stageSaving ? (
								<>
									<SmallSpinner className="inline-block w-4 h-4 mr-2" />
									Saving...
								</>
							) : editingStage ? "Update Stage" : "Save Stage"}
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* Installment Sheet */}
			<Sheet open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
				<SheetContent className="w-[600px] overflow-y-auto">
					{selectedPayment && (
						<>
							<SheetHeader>
								<SheetTitle className="text-lg font-semibold">
									Installments — {selectedPayment.stage.stageName}
								</SheetTitle>

								<SheetDescription className="text-sm">
									Total Payable Amount: <b>₹{selectedPayment.totalAmount}</b>
								</SheetDescription>
							</SheetHeader>

							<div className="mt-6 space-y-5 p-3">
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-1.5">
										<label className="text-sm font-medium">First Due Date</label>
										<Input
											type="date"
											value={firstDueDate[selectedPayment.id] || ""}
											onChange={(e) =>
												setFirstDueDate({
													...firstDueDate,
													[selectedPayment.id]: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-sm font-medium">Installments</label>
										<Input
											type="number"
											placeholder="Count"
											value={installCount[selectedPayment.id] || ""}
											onChange={(e) =>
												setInstallCount({
													...installCount,
													[selectedPayment.id]: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-sm font-medium">Gap Days</label>
										<Input
											type="number"
											placeholder="Days"
											value={gapDays[selectedPayment.id] || ""}
											onChange={(e) =>
												setGapDays({
													...gapDays,
													[selectedPayment.id]: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<Button className="w-full h-10" onClick={generateInstallments}>
									Generate Installments
								</Button>

								{installments[selectedPayment.id]?.length > 0 && (
									<div className="border rounded-lg overflow-hidden mt-5">
										<table className="w-full text-sm">
											<thead className="bg-gray-100">
											<tr>
												<th className="p-2 text-left">No</th>
												<th className="p-2 text-left">Amount</th>
												<th className="p-2 text-left">Due Date</th>
												<th className="p-2 text-center">Paid</th>
												<th className="p-2 text-left">Remark</th>
											</tr>
											</thead>

											<tbody>
											{installments[selectedPayment.id].map((inst) => {
												const isOverdue =
													!inst.paid && new Date(inst.dueDate) < new Date();

												return (
													<tr
														key={inst.id}
														className={`border-b ${isOverdue ? "bg-red-100" : ""}`}
													>
														<td className="p-2">{inst.installmentNo}</td>
														<td className="p-2">₹{inst.amount}</td>
														<td className="p-2">{inst.dueDate}</td>

														<td className="p-2 text-center">
															<Checkbox
																checked={inst.paid}
																onCheckedChange={(checked) =>
																	togglePaid(inst, checked)
																}
															/>
														</td>

														<td className="p-2">
															{inst.remark || (
																<span className="text-gray-400">-</span>
															)}
														</td>
													</tr>
												);
											})}
											</tbody>
										</table>
									</div>
								)}

							</div>
						</>
					)}
				</SheetContent>
			</Sheet>

		</div>
	);
}
