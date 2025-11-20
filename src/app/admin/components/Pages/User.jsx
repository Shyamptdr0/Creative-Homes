"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function UserPage() {
	const [activeTab, setActiveTab] = useState("client");
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		email: "",
		address: "",
	});

	const [users, setUsers] = useState([]);
	const [projects, setProjects] = useState([]);
	const [projectTypes, setProjectTypes] = useState([]);

	const [editUser, setEditUser] = useState(null);
	const [openEditDialog, setOpenEditDialog] = useState(false);

	const [openAddDialog, setOpenAddDialog] = useState(false);

	const [deleteUser, setDeleteUser] = useState(null);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const [showPassword, setShowPassword] = useState({});
	const [loading, setLoading] = useState(true);

	// NEW: UPDATE LOADER STATE
	const [updateLoading, setUpdateLoading] = useState(false);

	// VALIDATION FUNCTIONS
	const isValidPhone = (num) => /^\d{10}$/.test(num);
	const isValidEmail = (email) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	// LOAD USERS
	const fetchUsers = async () => {
		try {
			setLoading(true);
			const [usersRes, projectRes, typeRes] = await Promise.all([
				fetch("/api/admin/users"),
				fetch("/api/projects"),
				fetch("/api/project-types"),
			]);

			const usersData = await usersRes.json();
			const projectsData = await projectRes.json();
			const typesData = await typeRes.json();

			setUsers(usersData.users || []);
			setProjects(projectsData.projects || []);
			setProjectTypes(typesData.types || []);
		} catch {
			toast.error("Failed loading data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	/* CREATE USER */
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isValidPhone(formData.phone)) {
			toast.error("Phone must be 10 digits");
			return;
		}

		if (!isValidEmail(formData.email)) {
			toast.error("Enter valid email");
			return;
		}

		const res = await fetch("/api/admin/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...formData, role: activeTab }),
		});

		const data = await res.json();
		if (data.success) {
			toast.success(
				`User created\nID: ${data.user.userId} | Pass: ${data.user.password}`
			);
			setFormData({ name: "", phone: "", email: "", address: "" });
			setOpenAddDialog(false);
			fetchUsers();
		} else {
			toast.error(data.msg || "Failed creating user");
		}
	};

	/* DELETE USER */
	const confirmDelete = (u) => {
		setDeleteUser(u);
		setOpenDeleteDialog(true);
	};

	const handleDelete = async () => {
		const res = await fetch(
			`/api/admin/users/${deleteUser.id}?role=${deleteUser.role}`,
			{ method: "DELETE" }
		);
		const data = await res.json();

		if (!res.ok) toast.error(data.msg || "Delete failed");
		else toast.success("User deleted");

		setOpenDeleteDialog(false);
		setDeleteUser(null);
		fetchUsers();
	};

	/* ================================
	    UPDATE USER (WITH SPINNER)
	================================ */
	const handleUpdate = async () => {
		if (!isValidPhone(editUser.phone)) {
			toast.error("Phone must be 10 digits");
			return;
		}

		if (!isValidEmail(editUser.email)) {
			toast.error("Invalid email");
			return;
		}

		setUpdateLoading(true); // START LOADING

		const res = await fetch(
			`/api/admin/users/${editUser.id}?role=${editUser.role}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editUser),
			}
		);

		setUpdateLoading(false); // STOP LOADING

		if (!res.ok) {
			toast.error("Update failed");
			return;
		}

		toast.success("User updated");
		setOpenEditDialog(false);
		setEditUser(null);
		fetchUsers();
	};

	/* FILTER USERS */
	const filteredUsers = users.filter((u) => u.role === activeTab);

	/* UI START */
	return (
		<div className="container mx-auto grid grid-cols-1 gap-8 py-8">
			<h2 className="text-2xl font-bold">User Management</h2>

			<div className="rounded-lg border bg-background p-5 shadow-sm">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="client">Clients</TabsTrigger>
						<TabsTrigger value="contractor">Contractors</TabsTrigger>
					</TabsList>

					<div className="mt-5">
						<Button onClick={() => setOpenAddDialog(true)}>
							Add {activeTab}
						</Button>
					</div>

					<TabsContent value={activeTab}>
						<div className="mt-5 rounded-md border overflow-x-auto">
							<Table className="min-w-[1100px]">
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Phone</TableHead>
										<TableHead>Address</TableHead>
										<TableHead>User ID</TableHead>
										<TableHead>Password</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-10">
												<Loader2 className="animate-spin w-6 h-6 mx-auto" />
											</TableCell>
										</TableRow>
									) : filteredUsers.length > 0 ? (
										filteredUsers.map((u) => (
											<TableRow key={u.id}>
												<TableCell>{u.name}</TableCell>
												<TableCell>{u.email}</TableCell>
												<TableCell>{u.phone}</TableCell>
												<TableCell>{u.address}</TableCell>
												<TableCell>{u.userId}</TableCell>

												<TableCell>
													{showPassword[u.id]
														? u.visiblePassword
														: "••••••"}{" "}
													<button
														className="text-blue-600"
														onClick={() =>
															setShowPassword((p) => ({
																...p,
																[u.id]: !p[u.id],
															}))
														}
													>
														{showPassword[u.id] ? "Hide" : "Show"}
													</button>
												</TableCell>

												<TableCell>
													<div className="flex gap-2">
														<Button
															size="sm"
															onClick={() => {
																setEditUser({ ...u });
																setOpenEditDialog(true);
															}}
														>
															Edit
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={() => confirmDelete(u)}
														>
															Delete
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-6">
												No Users Found
											</TableCell>
										</TableRow>
									)}
								</TableBody>

								<TableFooter>
									<TableRow>
										<TableCell colSpan={6}>Total Users</TableCell>
										<TableCell>{filteredUsers.length}</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						</div>
					</TabsContent>
				</Tabs>
			</div>

			{/* EDIT USER DIALOG */}
			<Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
					</DialogHeader>

					{editUser && (
						<div className="space-y-4">
							<Label>Name</Label>
							<Input
								value={editUser.name}
								onChange={(e) =>
									setEditUser({ ...editUser, name: e.target.value })
								}
							/>

							{/* EMAIL VALIDATION */}
							<Label>Email</Label>
							<div className="relative">
								<Input
									type="email"
									className={
										isValidEmail(editUser.email)
											? "border-green-600"
											: "border-red-600"
									}
									value={editUser.email}
									onChange={(e) =>
										setEditUser({ ...editUser, email: e.target.value })
									}
								/>

								{isValidEmail(editUser.email) ? (
									<CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
								) : (
									<XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />
								)}
							</div>

							{/* PHONE VALIDATION */}
							<Label>Phone</Label>
							<div className="relative">
								<Input
									type="tel"
									maxLength={10}
									className={
										editUser.phone.length === 10
											? "border-green-600"
											: "border-red-600"
									}
									value={editUser.phone}
									onChange={(e) => {
										const val = e.target.value.replace(/\D/g, "");
										if (val.length <= 10) {
											setEditUser({ ...editUser, phone: val });
										}
									}}
								/>
								{editUser.phone.length === 10 ? (
									<CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
								) : (
									<XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />
								)}
							</div>

							<Label>Address</Label>
							<Input
								value={editUser.address}
								onChange={(e) =>
									setEditUser({ ...editUser, address: e.target.value })
								}
							/>

							{/* LOADING BUTTON */}
							<Button
								className="w-full"
								onClick={handleUpdate}
								disabled={updateLoading}
							>
								{updateLoading ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Updating...
									</>
								) : (
									"Update"
								)}
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* DELETE USER */}
			<Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-red-600">
							Delete User?
						</DialogTitle>
					</DialogHeader>

					<p>
						Are you sure you want to delete <b>{deleteUser?.name}</b>?
					</p>

					<div className="flex justify-end gap-3 mt-4">
						<Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* ADD USER */}
			<Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New {activeTab}</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<Label>Name</Label>
						<Input
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>

						{/* EMAIL VALIDATION */}
						<Label>Email</Label>
						<div className="relative">
							<Input
								type="email"
								className={
									isValidEmail(formData.email)
										? "border-green-600"
										: formData.email.length > 0
											? "border-red-600"
											: ""
								}
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
							/>

							{isValidEmail(formData.email) ? (
								<CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
							) : formData.email.length > 0 ? (
								<XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />
							) : null}
						</div>

						{/* PHONE VALIDATION */}
						<Label>Phone</Label>
						<div className="relative">
							<Input
								type="tel"
								maxLength={10}
								className={
									formData.phone.length === 10
										? "border-green-600"
										: formData.phone.length > 0
											? "border-red-600"
											: ""
								}
								value={formData.phone}
								onChange={(e) => {
									const val = e.target.value.replace(/\D/g, "");
									if (val.length <= 10) {
										setFormData({ ...formData, phone: val });
									}
								}}
								required
							/>

							{formData.phone.length === 10 ? (
								<CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
							) : formData.phone.length > 0 ? (
								<XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />
							) : null}
						</div>

						<Label>Address</Label>
						<Input
							value={formData.address}
							onChange={(e) =>
								setFormData({ ...formData, address: e.target.value })
							}
							required
						/>

						<Button type="submit" className="w-full">
							Save
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
