"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Trash2, Eye, EyeOff, Pencil } from "lucide-react";

export default function UserPage() {
	const [activeTab, setActiveTab] = useState("client");

	const [users, setUsers] = useState([]);
	const [contractorTypes, setContractorTypes] = useState([]);

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [openEditTypeDialog, setOpenEditTypeDialog] = useState(false);

	const [editUser, setEditUser] = useState(null);
	const [viewUser, setViewUser] = useState(null);
	const [editingType, setEditingType] = useState(null);

	const [addingType, setAddingType] = useState("");
	const [showPasswordId, setShowPasswordId] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	/* =======================================
		LOAD USERS & CONTRACTOR TYPES
	======================================= */
	const fetchData = async () => {
		const [userRes, typeRes] = await Promise.all([
			fetch("/api/admin/users"),
			fetch("/api/contractor-types"),
		]);

		const userData = await userRes.json();
		const typeData = await typeRes.json();

		setUsers(userData.users || []);
		setContractorTypes(typeData.types || []);
	};

	/* =======================================
		ADD CONTRACTOR TYPE
	======================================= */
	const addType = async () => {
		if (!addingType.trim()) return toast.error("Type required");

		const res = await fetch("/api/contractor-types", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: addingType }),
		});

		const data = await res.json();
		if (!data.success) return toast.error(data.msg);

		toast.success("Type Added");
		setAddingType("");
		fetchData();
	};

	/* =======================================
		DELETE CONTRACTOR TYPE
	======================================= */
	const deleteType = async (id) => {
		const res = await fetch(`/api/contractor-types/${id}`, { method: "DELETE" });
		const data = await res.json();

		if (!data.success) return toast.error("Delete failed");
		toast.success("Type Deleted");
		fetchData();
	};

	/* =======================================
		UPDATE CONTRACTOR TYPE
	======================================= */
	const updateType = async () => {
		const res = await fetch(`/api/contractor-types/${editingType.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: editingType.name }),
		});

		const data = await res.json();
		if (!data.success) return toast.error("Update failed");

		toast.success("Type Updated");
		setOpenEditTypeDialog(false);
		fetchData();
	};

	/* =======================================
		VALIDATION HELPERS
	======================================= */
	const isValidPhone = (v) => /^\d{10}$/.test(v);
	const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
	const isValidAadhaar = (v) => /^\d{4}-\d{4}-\d{4}$/.test(v);
	const isValidPAN = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);

	const formatAadhaar = (v) => {
		const digits = v.replace(/\D/g, "").slice(0, 12);
		return digits.replace(/(\d{4})(?=\d)/g, "$1-");
	};

	const formatPAN = (v) =>
		v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

	/* =======================================
		UPDATE USER (with validation)
	======================================= */
	const handleUpdate = async () => {
		const u = editUser;

		if (!isValidPhone(u.phone)) return toast.error("Phone must be 10 digits");
		if (!isValidEmail(u.email)) return toast.error("Invalid email format");
		if (u.aadhaar && !isValidAadhaar(u.aadhaar))
			return toast.error("Aadhaar must be XXXX-XXXX-XXXX");
		if (u.pan && !isValidPAN(u.pan)) return toast.error("Invalid PAN format");

		const payload = {
			...editUser,
			types: editUser.types || [],
		};

		const res = await fetch(`/api/admin/users/${editUser.id}?role=${editUser.role}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		const data = await res.json();
		if (!data.success) return toast.error("Update failed");

		toast.success("User Updated");
		setOpenEditDialog(false);
		fetchData();
	};

	/* =======================================
		DELETE USER
	======================================= */
	const deleteUser = async (id, role) => {
		const res = await fetch(`/api/admin/users/${id}?role=${role}`, {
			method: "DELETE",
		});

		const data = await res.json();
		if (!data.success) return toast.error(data.msg || "Delete failed");

		toast.success("User Deleted");
		fetchData();
	};

	const filteredUsers = users.filter((u) => u.role === activeTab);

	/* =======================================
		UI
	======================================= */
	return (
		<div className="container mx-auto py-8">
			<h2 className="text-2xl font-bold mb-4">User Management</h2>

			{/* CONTRACTOR TYPE MANAGEMENT */}
			{activeTab === "contractor" && (
				<div className="mb-8 p-4 border rounded-lg">
					<h3 className="font-semibold mb-3">Contractor Types</h3>

					<div className="flex gap-3 mb-3">
						<Input
							placeholder="Add contractor type"
							value={addingType}
							onChange={(e) => setAddingType(e.target.value)}
						/>
						<Button onClick={addType}>Add</Button>
					</div>

					<div className="flex flex-wrap gap-3">
						{contractorTypes.map((t) => (
							<div
								key={t.id}
								className="px-3 py-1 bg-gray-200 rounded flex items-center gap-2"
							>
								{t.name}

								<Pencil
									className="w-4 h-4 text-blue-600 cursor-pointer"
									onClick={() => {
										setEditingType(t);
										setOpenEditTypeDialog(true);
									}}
								/>

								<Trash2
									className="w-4 h-4 text-red-600 cursor-pointer"
									onClick={() => deleteType(t.id)}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* USER TABLE */}
			<div className="rounded-lg border p-5 shadow-sm">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="client">Clients</TabsTrigger>
						<TabsTrigger value="contractor">Contractors</TabsTrigger>
					</TabsList>

					<TabsContent value={activeTab}>
						<Table className="mt-5">
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Address</TableHead>
									{activeTab === "contractor" && (
										<TableHead>Types</TableHead>
									)}
									<TableHead>User ID</TableHead>
									<TableHead>Password</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filteredUsers.map((u) => (
									<TableRow key={u.id}>
										<TableCell>{u.name}</TableCell>
										<TableCell>{u.email}</TableCell>
										<TableCell>{u.phone}</TableCell>
										<TableCell>{u.address}</TableCell>

										{activeTab === "contractor" && (
											<TableCell>
												{u.types?.map((t) => t.name).join(", ") || "N/A"}
											</TableCell>
										)}

										<TableCell>{u.userId}</TableCell>

										<TableCell>
											<div className="flex items-center gap-2">
												{showPasswordId === u.id
													? u.visiblePassword
													: "••••••"}
												<button
													onClick={() =>
														setShowPasswordId(
															showPasswordId === u.id ? null : u.id
														)
													}
												>
													{showPasswordId === u.id ? (
														<EyeOff className="w-4" />
													) : (
														<Eye className="w-4" />
													)}
												</button>
											</div>
										</TableCell>

										<TableCell>
											<div className="flex gap-2">
												<Button
													size="sm"
													onClick={() => {
														setViewUser(u);
														setOpenViewDialog(true);
													}}
												>
													View
												</Button>

												<Button
													size="sm"
													onClick={() => {
														setEditUser({
															...u,
															types: u.types?.map((t) => t.id) || [],
														});
														setOpenEditDialog(true);
													}}
												>
													Edit
												</Button>

												<Button
													size="sm"
													variant="destructive"
													onClick={() => deleteUser(u.id, u.role)}
												>
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TabsContent>
				</Tabs>
			</div>

			{/* EDIT TYPE DIALOG */}
			<Dialog open={openEditTypeDialog} onOpenChange={setOpenEditTypeDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Contractor Type</DialogTitle>
					</DialogHeader>

					<Input
						value={editingType?.name || ""}
						onChange={(e) =>
							setEditingType({ ...editingType, name: e.target.value })
						}
					/>

					<Button className="w-full mt-3" onClick={updateType}>
						Update
					</Button>
				</DialogContent>
			</Dialog>

			{/* EDIT USER DIALOG */}
			<Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
					</DialogHeader>

					{editUser && (
						<div className="space-y-3">
							<Input
								placeholder="Name"
								value={editUser.name}
								onChange={(e) =>
									setEditUser({ ...editUser, name: e.target.value })
								}
							/>

							<Input
								placeholder="Email"
								value={editUser.email}
								onChange={(e) =>
									setEditUser({ ...editUser, email: e.target.value })
								}
							/>

							<Input
								placeholder="Phone"
								value={editUser.phone}
								onChange={(e) =>
									setEditUser({
										...editUser,
										phone: e.target.value.replace(/\D/g, ""),
									})
								}
							/>

							<Input
								placeholder="Address"
								value={editUser.address}
								onChange={(e) =>
									setEditUser({ ...editUser, address: e.target.value })
								}
							/>

							{/* Aadhaar */}
							<Input
								placeholder="Aadhaar (XXXX-XXXX-XXXX)"
								value={editUser.aadhaar || ""}
								onChange={(e) =>
									setEditUser({
										...editUser,
										aadhaar: formatAadhaar(e.target.value),
									})
								}
							/>

							{/* PAN */}
							<Input
								placeholder="PAN (ABCDE1234F)"
								value={editUser.pan || ""}
								onChange={(e) =>
									setEditUser({
										...editUser,
										pan: formatPAN(e.target.value),
									})
								}
							/>

							{/* Contractor Types */}
							{editUser.role === "contractor" && (
								<div className="mt-3">
									<b>Contractor Types:</b>
									<div className="grid grid-cols-2 gap-2 mt-2">
										{contractorTypes.map((t) => (
											<label
												key={t.id}
												className="flex items-center gap-2 border p-2 rounded"
											>
												<input
													type="checkbox"
													checked={editUser.types?.includes(t.id)}
													onChange={(e) => {
														let updated = [...editUser.types];
														if (e.target.checked) {
															updated.push(t.id);
														} else {
															updated = updated.filter(
																(id) => id !== t.id
															);
														}
														setEditUser({
															...editUser,
															types: updated,
														});
													}}
												/>
												{t.name}
											</label>
										))}
									</div>
								</div>
							)}

							<Button className="w-full" onClick={handleUpdate}>
								Update
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* VIEW USER */}
			<Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>User Details</DialogTitle>
					</DialogHeader>

					{viewUser && (
						<div className="space-y-3 text-sm">
							<img
								src={viewUser.photo || "/no-image.jpg"}
								className="w-24 h-24 rounded-full object-cover mx-auto"
							/>

							<p><b>Name:</b> {viewUser.name}</p>
							<p><b>Email:</b> {viewUser.email}</p>
							<p><b>Phone:</b> {viewUser.phone}</p>
							<p><b>Address:</b> {viewUser.address}</p>

							<p><b>Aadhaar:</b> {viewUser.aadhaar || "N/A"}</p>
							<p><b>PAN:</b> {viewUser.pan || "N/A"}</p>

							{viewUser.role === "contractor" && (
								<p>
									<b>Types:</b>{" "}
									{viewUser.types?.map((t) => t.name).join(", ") || "N/A"}
								</p>
							)}

							<p><b>User ID:</b> {viewUser.userId}</p>
							<p><b>Password:</b> {viewUser.visiblePassword}</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
