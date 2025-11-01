"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StageForm from "@/components/StageForm";

export default function ContractorStagesPage() {
	const [stages, setStages] = useState([]);
	const [editing, setEditing] = useState(null);

	async function fetchStages() {
		const res = await fetch("/api/admin/stages");
		const data = await res.json();
		setStages(data);
	}

	useEffect(() => {
		fetchStages();
	}, []);

	async function handleCreate(data) {
		await fetch("/api/admin/stages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		await fetchStages();
	}

	async function handleUpdate(data) {
		await fetch(`/api/admin/stages/${editing.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		setEditing(null);
		await fetchStages();
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-semibold">Manage Project Stages</h1>
				<Dialog>
					<DialogTrigger asChild>
						<Button>Add Stage</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Stage</DialogTitle>
						</DialogHeader>
						<StageForm onSubmit={handleCreate} />
					</DialogContent>
				</Dialog>
			</div>

			<table className="w-full border text-sm">
				<thead className="bg-gray-100">
				<tr>
					<th className="border p-2">Stage</th>
					<th className="border p-2">Progress</th>
					<th className="border p-2">Status</th>
					<th className="border p-2">Actions</th>
				</tr>
				</thead>
				<tbody>
				{stages.map((stage) => (
					<tr key={stage.id}>
						<td className="border p-2">{stage.stageName}</td>
						<td className="border p-2">{stage.progress}%</td>
						<td className="border p-2 capitalize">{stage.status}</td>
						<td className="border p-2 space-x-2">
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setEditing(stage)}
									>
										Edit
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Edit Stage</DialogTitle>
									</DialogHeader>
									<StageForm initialData={editing} onSubmit={handleUpdate} />
								</DialogContent>
							</Dialog>
						</td>
					</tr>
				))}
				</tbody>
			</table>
		</div>
	);
}
