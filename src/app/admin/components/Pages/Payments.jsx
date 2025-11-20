"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableRow, TableHead, TableHeader, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Payments() {

	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadPayments();
	}, []);

	async function loadPayments() {
		setLoading(true);
		const res = await fetch("/api/payments");
		const data = await res.json();
		setPayments(data.payments || []);
		setLoading(false);
	}

	const statusColor = (status) => {
		if (status === "completed") return "text-green-700 font-bold";
		if (status === "overdue") return "text-red-700 font-bold";
		if (status === "pending") return "text-yellow-700 font-bold";
		return "text-gray-700";
	};

	return (
		<div className="p-8">

			<h1 className="text-3xl font-bold mb-5">Payments</h1>

			<Card>
				<CardHeader>
					<CardTitle>All Payments</CardTitle>
				</CardHeader>

				<CardContent>
					{loading ? (
						<div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8"/></div>
					) : (
						<div className="overflow-auto max-h-[70vh]">
							<Table>
								<TableHeader className="bg-gray-100">
									<TableRow>
										<TableHead>Project</TableHead>
										<TableHead>Payer</TableHead>
										<TableHead>Receiver</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Installment</TableHead>
										<TableHead>Due Date</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{payments.map((p) => (
									<TableRow key={p.id}>
										<TableCell>{p.Project?.title}</TableCell>
										<TableCell>{p.payerType}</TableCell>
										<TableCell>{p.receiverType}</TableCell>

										<TableCell>₹ {p.amount}</TableCell>

										<TableCell>
											{p.installmentNo} / {p.totalInstallments}
										</TableCell>

										<TableCell>{p.dueDate}</TableCell>

										<TableCell>
											<span className={statusColor(p.status)}>{p.status}</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						</div>
						)}
				</CardContent>
			</Card>
		</div>
	);
}
