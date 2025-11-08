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
import { Loader2 } from "lucide-react";

export default function UserPage() {
	const [activeTab, setActiveTab] = useState("client");
	const [formData, setFormData] = useState({ name: "", phone: "", address: "", email: "" });
	const [users, setUsers] = useState([]);

	const [editUser, setEditUser] = useState(null);
	const [openEditDialog, setOpenEditDialog] = useState(false);

	const [showPassword, setShowPassword] = useState({});
	const [openAddDialog, setOpenAddDialog] = useState(false);

	const [deleteUser, setDeleteUser] = useState(null);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const [loading, setLoading] = useState(true);

	// ✅ Fetch Users
	const fetchUsers = async () => {
		try {
			setLoading(true);

			const res = await fetch("/api/admin/users");
			const data = await res.json();
			if (data.success) setUsers(data.users);

		} catch (err) {
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const res = await fetch("/api/admin/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...formData, role: activeTab }),
		});
		const data = await res.json();

		if (data.success) {
			toast.success(`User created\nID: ${data.user.userId} | Pass: ${data.user.password}`);
			setFormData({ name: "", phone: "", address: "", email: "" });
			setOpenAddDialog(false);
			fetchUsers();
		} else toast.error("Failed to create user");
	};

	const confirmDelete = (u) => {
		setDeleteUser(u);
		setOpenDeleteDialog(true);
	};

	const handleDelete = async () => {
		const res = await fetch(`/api/admin/users/${deleteUser.id}?role=${deleteUser.role}`, {
			method: "DELETE",
		});
		const data = await res.json();

		if (!res.ok) toast.error(data.msg || "Failed to delete user");
		else toast.success("User deleted");

		setOpenDeleteDialog(false);
		setDeleteUser(null);
		fetchUsers();
	};

	// ✅ UPDATE USER
	const handleUpdate = async () => {
		const res = await fetch(`/api/admin/users/${editUser.id}?role=${editUser.role}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(editUser),
		});

		if (res.ok) {
			toast.success("User updated");
			setOpenEditDialog(false);
			setEditUser(null);
			fetchUsers();
		} else toast.error("Update failed");
	};

	const filteredUsers = users.filter((u) => u.role === activeTab);

	return (
		<div className="container mx-auto grid grid-cols-1 gap-8 py-8">
			<h1 className="text-2xl font-bold mb-4">User Management</h1>

			{/* ✅ ADD USER BUTTON */}
			<div className="rounded-lg border bg-background p-5 shadow-sm">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="client">Clients</TabsTrigger>
						<TabsTrigger value="contractor">Contractors</TabsTrigger>
					</TabsList>

					<div className="mt-5 flex justify-start">
						<Button onClick={() => setOpenAddDialog(true)}>
							Add {activeTab}
						</Button>
					</div>

					<TabsContent value={activeTab}>
						<div className="mt-5 rounded-md border overflow-x-auto">
							<Table className="min-w-[900px]">
								<TableCaption>List of {activeTab} users</TableCaption>

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
											<TableCell colSpan={7} className="text-center py-6">
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
													{showPassword[u.id] ? (u.visiblePassword || u.password) : "••••••"}{" "}
													<button
														className="text-blue-600"
														onClick={() => setShowPassword((p) => ({ ...p, [u.id]: !p[u.id] }))}
													>
														{showPassword[u.id] ? "Hide" : "Show"}
													</button>
												</TableCell>

												<TableCell className="flex gap-2">
													{/* ✅ FIXED EDIT BUTTON */}
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
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={7} className="text-center text-gray-500 py-4">
												No users found
											</TableCell>
										</TableRow>
									)}
								</TableBody>

								<TableFooter>
									<TableRow>
										<TableCell colSpan={6}>Total Users</TableCell>
										<TableCell className="font-medium">{filteredUsers.length}</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						</div>
					</TabsContent>
				</Tabs>
			</div>

			{/* ✅ EDIT USER DIALOG — FIXED */}
			<Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
					</DialogHeader>

					{editUser && (
						<div className="space-y-3">
							<Label>Name</Label>
							<Input
								value={editUser.name}
								onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
							/>

							<Label>Email</Label>
							<Input
								value={editUser.email}
								onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
							/>

							<Label>Phone</Label>
							<Input
								value={editUser.phone}
								onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
							/>

							<Label>Address</Label>
							<Input
								value={editUser.address}
								onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
							/>

							<Button className="w-full" onClick={handleUpdate}>
								Update
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* ✅ DELETE CONFIRMATION */}
			<Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-red-600">Delete User?</DialogTitle>
					</DialogHeader>

					<p className="mb-3">Are you sure you want to delete <b>{deleteUser?.name}</b>?</p>

					<div className="flex justify-end gap-3">
						<Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* ✅ ADD USER DIALOG */}
			<Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New {activeTab}</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<Label>Name</Label>
						<Input
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							required
						/>

						<Label>Email</Label>
						<Input
							type="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							required
						/>

						<Label>Phone</Label>
						<Input
							value={formData.phone}
							onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
							required
						/>

						<Label>Address</Label>
						<Input
							value={formData.address}
							onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
