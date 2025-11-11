"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function ProjectTypeBox() {
	const [types, setTypes] = useState([]);
	const [name, setName] = useState("");
	const [editingId, setEditingId] = useState(null);

	// ✅ Fetch all types
	async function fetchTypes() {
		const res = await fetch("/api/project-types");
		const data = await res.json();
		setTypes(data.types || []);
	}

	// ✅ Add new type
	async function addType() {
		if (!name) return alert("Enter type name");

		await fetch("/api/project-types", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});

		setName("");
		fetchTypes();
	}

	// ✅ Update existing type
	async function updateType(id) {
		if (!name) return alert("Enter new name");

		await fetch(`/api/project-types/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});

		setName("");
		setEditingId(null);
		fetchTypes();
	}

	// ✅ Delete type
	async function deleteType(id) {
		if (!confirm("Delete this type?")) return;

		await fetch(`/api/project-types/${id}`, {
			method: "DELETE",
		});

		fetchTypes();
	}

	useEffect(() => {
		fetchTypes();
	}, []);

	return (
		<div className="space-y-4 border rounded-md p-4">
			<h2 className="text-lg font-semibold">Project Types</h2>

			{/* ✅ Add / Edit Form */}
			<div className="flex gap-2">
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Type Name"
				/>

				{editingId ? (
					<Button onClick={() => updateType(editingId)}>Update</Button>
				) : (
					<Button onClick={addType}>Add</Button>
				)}
			</div>

			{/* ✅ Types List */}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>#</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{types.map((t, i) => (
						<TableRow key={t.id}>
							<TableCell>{i + 1}</TableCell>
							<TableCell>{t.name}</TableCell>
							<TableCell className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setEditingId(t.id);
										setName(t.name);
									}}
								>
									Edit
								</Button>

								<Button
									size="sm"
									variant="destructive"
									onClick={() => deleteType(t.id)}
								>
									Delete
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
