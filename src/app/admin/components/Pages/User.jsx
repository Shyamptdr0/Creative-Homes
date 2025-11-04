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
	DialogTrigger,
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
import { Loader2 } from "lucide-react"; // ✅ added loader icon

export default function UserPage() {
	const [activeTab, setActiveTab] = useState("client");
	const [formData, setFormData] = useState({ name: "", phone: "", address: "", email: "" });
	const [users, setUsers] = useState([]);
	const [editUser, setEditUser] = useState(null);
	const [showPassword, setShowPassword] = useState({});
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);

	// Delete dialog states
	const [deleteUser, setDeleteUser] = useState(null);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	// ✅ loading state
	const [loading, setLoading] = useState(true);

	const fetchUsers = async () => {
		try {
			setLoading(true); // ✅ start loading

			const res = await fetch("/api/admin/users");
			const data = await res.json();
			if (data.success) setUsers(data.users);

		} catch (err) {
			console.log("Error fetching users:", err);
			toast.error("Failed to load users");
		} finally {
			setLoading(false); // ✅ stop loading
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
			toast.success(`User created!\nID: ${data.user.userId} | Pass: ${data.user.password}`);
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
		if (!deleteUser?.id) {
			return toast.error("User not selected");
		}

		const res = await fetch(`/api/admin/users/${deleteUser.id}?role=${deleteUser.role}`, {
			method: "DELETE",
		});
		const data = await res.json();

		if (!res.ok) {
			toast.error(data.msg || "Failed to delete user");
		} else {
			toast.success("User deleted");
		}

		setOpenDeleteDialog(false);
		setDeleteUser(null);
		fetchUsers();
	};

	const handleUpdate = async () => {
		const res = await fetch(`/api/admin/users/${editUser.id}?role=${editUser.role}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(editUser),
		});

		if (res.ok) {
			toast.success("User updated");
			setEditUser(null);
			setOpenEditDialog(false);
			fetchUsers();
		} else toast.error("Update failed");
	};

	const filteredUsers = users.filter((u) => u.role === activeTab);

	// ✅ LOADING SCREEN
	// if (loading) {
	// 	return (
	// 		<div className="flex justify-center items-center h-64">
	// 			<Loader2 className="animate-spin w-10 h-10" />
	// 		</div>
	// 	);
	// }

	return (
		<div className="container max-auto grid grid-cols-1 gap-8 py-8">
			<h1 className="text-xl md:text-2xl font-bold mb-6">User Management</h1>

			<div className="rounded-lg border bg-background p-5 shadow-sm">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="client">Clients</TabsTrigger>
						<TabsTrigger value="contractor">Contractors</TabsTrigger>
					</TabsList>

					<div className="mt-5 flex justify-start">
						<Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
							<DialogTrigger asChild>
								<Button>Add {activeTab}</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add New {activeTab}</DialogTitle>
								</DialogHeader>

								<form onSubmit={handleSubmit} className="space-y-4">
									<div>
										<Label>Name</Label>
										<Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
									</div>
									<div>
										<Label>Email</Label>
										<Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
									</div>
									<div>
										<Label>Phone</Label>
										<Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
									</div>
									<div>
										<Label>Address</Label>
										<Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
									</div>
									<Button className="w-full" type="submit">Save</Button>
								</form>
							</DialogContent>
						</Dialog>
					</div>

					<TabsContent value={activeTab}>
						<div className="mt-5 rounded-md border overflow-x-auto">
							<Table className="min-w-[1000px]">
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
												<div className="flex justify-center items-center gap-2">
													<Loader2 className="animate-spin w-6 h-6" />
													<span>Loading users...</span>
												</div>
											</TableCell>
										</TableRow>
									) : filteredUsers.length > 0 ? (
										filteredUsers.map((u) => (
											<TableRow key={u.id} className="text-[18px]">
												<TableCell>{u.name}</TableCell>
												<TableCell>{u.email}</TableCell>
												<TableCell>{u.phone}</TableCell>
												<TableCell>{u.address}</TableCell>
												<TableCell>{u.userId}</TableCell>
												<TableCell>
													{showPassword[u.id] ? (u.visiblePassword || u.password) : "••••••"}{" "}
													<button
														className="text-blue-600 text-[16px]"
														onClick={() => setShowPassword((p) => ({ ...p, [u.id]: !p[u.id] }))}
													>
														{showPassword[u.id] ? "Hide" : "Show"}
													</button>
												</TableCell>

												<TableCell className="flex gap-2">
													<Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
														<DialogTrigger asChild>
															<Button size="sm" onClick={() => { setEditUser(u); setOpenEditDialog(true); }}>
																Edit
															</Button>
														</DialogTrigger>
													</Dialog>

													<Button variant="destructive" size="sm" onClick={() => confirmDelete(u)}>
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

			{/* Delete Dialog */}
			<Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-red-600">Delete User?</DialogTitle>
					</DialogHeader>

					<p className="text-gray-700">
						Are you sure you want to delete <b>{deleteUser?.name}</b>? This action cannot be undone.
					</p>

					<div className="flex justify-end gap-3 mt-4">
						<Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
						<Button variant="destructive" onClick={handleDelete}>Delete</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
