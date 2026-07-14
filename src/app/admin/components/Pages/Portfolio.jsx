"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioPage() {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProject, setEditingProject] = useState(null);
	const fileInputRef = useRef(null);

	const [formData, setFormData] = useState({
		name: "",
		city: "",
		floors: "",
		dimensions: "",
		facing: "",
		budget: "",
		description: "",
		architectName: "",
		work: "",
		image: null,
		imagePreview: null
	});

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/portfolio");
			const data = await res.json();
			if (Array.isArray(data)) {
				setProjects(data);
			}
		} catch (error) {
			toast.error("Failed to fetch portfolio projects");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prev) => ({
				...prev,
				image: file,
				imagePreview: URL.createObjectURL(file)
			}));
		}
	};

	const openModal = (project = null) => {
		if (project) {
			setEditingProject(project);
			setFormData({
				name: project.name || "",
				city: project.city || "",
				floors: project.floors || "",
				dimensions: project.dimensions || "",
				facing: project.facing || "",
				budget: project.budget || "",
				description: project.description || "",
				architectName: project.architectName || "",
				work: project.work || "",
				image: null,
				imagePreview: project.image || null
			});
		} else {
			setEditingProject(null);
			setFormData({
				name: "",
				city: "",
				floors: "",
				dimensions: "",
				facing: "",
				budget: "",
				description: "",
				architectName: "",
				work: "",
				image: null,
				imagePreview: null
			});
		}
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingProject(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const toastId = toast.loading("Saving project...");

		try {
			const data = new FormData();
			data.append("name", formData.name);
			data.append("city", formData.city);
			data.append("floors", formData.floors);
			data.append("dimensions", formData.dimensions);
			data.append("facing", formData.facing);
			data.append("budget", formData.budget);
			data.append("description", formData.description);
			data.append("architectName", formData.architectName);
			data.append("work", formData.work);
			if (formData.image) {
				data.append("image", formData.image);
			}

			const url = editingProject ? `/api/portfolio/${editingProject.id}` : "/api/portfolio";
			const method = editingProject ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				body: data
			});

			const result = await res.json();

			if (result.success) {
				toast.success(editingProject ? "Project updated!" : "Project added!", { id: toastId });
				fetchProjects();
				closeModal();
			} else {
				throw new Error(result.error || "Failed to save project");
			}
		} catch (error) {
			toast.error(error.message, { id: toastId });
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this project?")) return;

		const toastId = toast.loading("Deleting project...");
		try {
			const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
			const result = await res.json();

			if (result.success) {
				toast.success("Project deleted", { id: toastId });
				fetchProjects();
			} else {
				throw new Error(result.error || "Failed to delete project");
			}
		} catch (error) {
			toast.error(error.message, { id: toastId });
		}
	};

	return (
		<div className="p-6 md:p-8 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-800">Portfolio Projects</h1>
				<button
					onClick={() => openModal()}
					className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
				>
					<Plus className="w-5 h-5" /> Add Project
				</button>
			</div>

			{loading ? (
				<div className="flex justify-center py-20">
					<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
				</div>
			) : projects.length === 0 ? (
				<div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
					<p className="text-gray-500 mb-4">No portfolio projects found.</p>
					<button
						onClick={() => openModal()}
						className="text-blue-600 font-medium hover:underline"
					>
						Add your first project
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => (
						<div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
							<div className="relative h-48 w-full bg-gray-100">
								{project.image ? (
									<Image src={project.image} alt={project.name} fill className="object-cover" />
								) : (
									<div className="flex items-center justify-center h-full text-gray-400">No Image</div>
								)}
							</div>
							<div className="p-5 space-y-3">
								<h3 className="font-bold text-lg text-gray-800 truncate">{project.name}</h3>
								<div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
									<p><span className="font-medium">City:</span> {project.city}</p>
									<p><span className="font-medium">Floors:</span> {project.floors}</p>
									<p><span className="font-medium">Dimensions:</span> {project.dimensions}</p>
									<p><span className="font-medium">Facing:</span> {project.facing}</p>
									<p className="col-span-2"><span className="font-medium">Budget:</span> {project.budget}</p>
									<p className="col-span-2"><span className="font-medium">Architect:</span> {project.architectName || "-"}</p>
									<p className="col-span-2"><span className="font-medium">Work:</span> {project.work || "-"}</p>
								</div>
								<div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
									<button
										onClick={() => openModal(project)}
										className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
										title="Edit"
									>
										<Edit2 className="w-4 h-4" />
									</button>
									<button
										onClick={() => handleDelete(project.id)}
										className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										title="Delete"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
					<div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
						<div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
							<h2 className="text-xl font-bold text-gray-800">
								{editingProject ? "Edit Project" : "Add New Project"}
							</h2>
							<button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
								<X className="w-5 h-5 text-gray-500" />
							</button>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-6">
							<div className="space-y-4">
								<div className="flex flex-col items-center justify-center w-full">
									<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative">
										{formData.imagePreview ? (
											<img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
										) : (
											<div className="flex flex-col items-center justify-center pt-5 pb-6">
												<Upload className="w-8 h-8 mb-3 text-gray-400" />
												<p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload image</span></p>
												<p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
											</div>
										)}
										<input
											ref={fileInputRef}
											type="file"
											className="hidden"
											accept="image/*"
											onChange={handleImageChange}
										/>
									</label>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
										<input
											type="text"
											name="name"
											required
											value={formData.name}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. Mr. Smith's Residence"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">City</label>
										<input
											type="text"
											name="city"
											value={formData.city}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. Indore"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
										<input
											type="text"
											name="floors"
											value={formData.floors}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. G+1"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
										<input
											type="text"
											name="dimensions"
											value={formData.dimensions}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. 30x50 sq. ft"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
										<input
											type="text"
											name="facing"
											value={formData.facing}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. North"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
										<input
											type="text"
											name="budget"
											value={formData.budget}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. 40-50L"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Architect Name</label>
										<input
											type="text"
											name="architectName"
											value={formData.architectName}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. Urban Design Studio"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Work / Scope</label>
										<input
											type="text"
											name="work"
											value={formData.work}
											onChange={handleInputChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
											placeholder="e.g. Architecture & Interior"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
										<textarea
											name="description"
											value={formData.description}
											onChange={handleInputChange}
											rows={3}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
											placeholder="Brief description of the project..."
										/>
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
								<button
									type="button"
									onClick={closeModal}
									className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
								>
									{editingProject ? "Save Changes" : "Create Project"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
