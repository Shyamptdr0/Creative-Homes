"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectForm({ onSubmit, initialData }) {
	const emptyForm = {
		title: "",
		description: "",
		startDate: "",
		endDate: "",
		status: "planned",
		totalCost: "",
		clientId: "",
		contractorId: "",
		projectTypeId: "",
	};

	const [form, setForm] = useState(emptyForm);
	const [clients, setClients] = useState([]);
	const [contractors, setContractors] = useState([]);
	const [projectTypes, setProjectTypes] = useState([]);

	// ✅ Fill form on edit
	useEffect(() => {
		setForm(initialData ? { ...initialData } : emptyForm);
	}, [initialData]);

	// ✅ Fetch dropdown data
	useEffect(() => {
		async function loadData() {
			const c = await fetch("/api/clients").then((r) => r.json());
			const co = await fetch("/api/contractors").then((r) => r.json());
			const pt = await fetch("/api/project-types").then((r) => r.json());

			setClients(c.clients || []);
			setContractors(co.contractors || []);
			setProjectTypes(pt.types || []);
		}
		loadData();
	}, []);

	function handleChange(e) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	return (
		<div className="max-h-[70vh] overflow-y-auto pr-2">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit(form);
				}}
				className="space-y-4 pb-4"
			>
				{/* ✅ Project Type */}
				<Label>Project Type</Label>
				<select
					name="projectTypeId"
					value={form.projectTypeId}
					onChange={handleChange}
					className="border p-2 rounded w-full"
					required
				>
					<option value="">Select Project Type</option>
					{projectTypes.map((pt) => (
						<option key={pt.id} value={pt.id}>
							{pt.name}
						</option>
					))}
				</select>
				<Label>Project Title</Label>
				<Input name="title" value={form.title} onChange={handleChange} required />

				<Label>Description</Label>
				<Textarea name="description" value={form.description} onChange={handleChange} />

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label>Start Date</Label>
						<Input
							type="date"
							name="startDate"
							value={form.startDate}
							onChange={handleChange}
						/>
					</div>
					<div>
						<Label>End Date</Label>
						<Input
							type="date"
							name="endDate"
							value={form.endDate}
							onChange={handleChange}
						/>
					</div>
				</div>

				<Label>Status</Label>
				<select
					name="status"
					value={form.status}
					onChange={handleChange}
					className="border p-2 rounded w-full"
				>
					<option value="planned">Planned</option>
					<option value="in_progress">In Progress</option>
					<option value="completed">Completed</option>
				</select>

				<Label>rate(₹)</Label>
				<Input
					placeHolder="rate in per sq ft"
					type="number"
					name="totalCost"
					value={form.totalCost}
					onChange={handleChange}
				/>



				<Label>Assign Client</Label>
				<select
					name="clientId"
					value={form.clientId}
					onChange={handleChange}
					className="border p-2 rounded w-full"
				>
					<option value="">Select Client</option>
					{clients.map((c) => (
						<option key={c.id} value={c.id}>
							{c.clientId} — {c.name}
						</option>
					))}
				</select>

				<Label>Assign Contractor</Label>
				<select
					name="contractorId"
					value={form.contractorId}
					onChange={handleChange}
					className="border p-2 rounded w-full"
				>
					<option value="">Select Contractor</option>
					{contractors.map((c) => (
						<option key={c.id} value={c.id}>
							{c.contractorId} — {c.name}
						</option>
					))}
				</select>

				<Button type="submit" className="w-full">
					{initialData ? "Update Project" : "Create Project"}
				</Button>
			</form>
		</div>
	);
}
