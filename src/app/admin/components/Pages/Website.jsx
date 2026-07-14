"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import Image from "next/image";

export default function WebsitePage() {
	const [activeTab, setActiveTab] = useState("hero");
	const [projects, setProjects] = useState([]);
	const [featuredData, setFeaturedData] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (activeTab === "featured") {
			fetchProjects();
		}
	}, [activeTab]);

	const fetchProjects = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/portfolio");
			const data = await res.json();
			if (Array.isArray(data)) {
				setProjects(data);
				// Initialize local state for toggling and ranking
				setFeaturedData(
					data.map((p) => ({
						id: p.id,
						isFeatured: p.isFeatured || false,
						featuredRank: p.featuredRank || 0,
					}))
				);
			}
		} catch (error) {
			toast.error("Failed to load projects");
		} finally {
			setLoading(false);
		}
	};

	const handleFeaturedChange = (id, field, value) => {
		setFeaturedData((prev) =>
			prev.map((item) =>
				item.id === id ? { ...item, [field]: value } : item
			)
		);
	};

	const handleSaveFeatured = async () => {
		const toastId = toast.loading("Saving featured projects...");
		try {
			const res = await fetch("/api/portfolio/featured", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ featuredData }),
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Featured projects updated!", { id: toastId });
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			toast.error(error.message || "Failed to save", { id: toastId });
		}
	};

	const handleSave = () => {
		toast.success("Page content updated successfully!");
	};

	return (
		<div className="container mx-auto py-8">
			<h2 className="text-2xl font-bold mb-4">Website Content Management</h2>

			<div className="rounded-lg border p-5 shadow-sm bg-white">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="mb-4 flex flex-wrap h-auto gap-2">
						<TabsTrigger value="hero">Hero Section</TabsTrigger>
						<TabsTrigger value="featured">Featured Projects (Hero Slider)</TabsTrigger>
						<TabsTrigger value="about">About Us</TabsTrigger>
						<TabsTrigger value="services">Services</TabsTrigger>
						<TabsTrigger value="contact">Contact</TabsTrigger>
					</TabsList>

					<TabsContent value="hero" className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1">Hero Title</label>
							<Input placeholder="Enter hero title" defaultValue="Shape the future of living." />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Hero Subtitle</label>
							<Textarea placeholder="Enter hero subtitle" defaultValue="Select your path and discover a tailored experience crafted for your unique journey in construction." />
						</div>
						<Button onClick={handleSave} className="mt-2">Save Changes</Button>
					</TabsContent>

					<TabsContent value="featured" className="space-y-6">
						<div>
							<h3 className="text-lg font-bold">Manage Featured Projects</h3>
							<p className="text-sm text-gray-500 mb-4">
								Select projects to feature on the Hero Page Slider. Enter a rank (1-5) to determine their order.
							</p>

							{loading ? (
								<p>Loading projects...</p>
							) : (
								<div className="space-y-4">
									{projects.map((project) => {
										const currentData = featuredData.find((f) => f.id === project.id) || {};
										return (
											<div key={project.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
												<div className="w-20 h-16 relative bg-gray-200 rounded overflow-hidden shrink-0">
													{project.image ? (
														<Image src={project.image} alt={project.name} fill className="object-cover" />
													) : null}
												</div>
												<div className="flex-1">
													<p className="font-bold text-sm">{project.name}</p>
													<p className="text-xs text-gray-500">{project.city} | {project.architectName}</p>
												</div>
												
												<div className="flex items-center gap-6">
													<label className="flex items-center gap-2 cursor-pointer">
														<input 
															type="checkbox" 
															className="w-4 h-4 cursor-pointer"
															checked={currentData.isFeatured || false}
															onChange={(e) => handleFeaturedChange(project.id, "isFeatured", e.target.checked)}
														/>
														<span className="text-sm font-medium">Feature</span>
													</label>

													<div className="flex items-center gap-2">
														<label className="text-sm font-medium text-gray-700">Rank:</label>
														<Input 
															type="number" 
															className="w-20" 
															min="0" 
															value={currentData.featuredRank || 0}
															onChange={(e) => handleFeaturedChange(project.id, "featuredRank", parseInt(e.target.value) || 0)}
															disabled={!currentData.isFeatured}
														/>
													</div>
												</div>
											</div>
										);
									})}
									<div className="pt-4 border-t">
										<Button onClick={handleSaveFeatured} className="w-full md:w-auto">Save Featured Projects</Button>
									</div>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value="about" className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1">About Section Title</label>
							<Input placeholder="Enter about title" />
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">About Content</label>
							<Textarea placeholder="Enter about content" className="min-h-[150px]" />
						</div>
						<Button onClick={handleSave} className="mt-2">Save Changes</Button>
					</TabsContent>

					<TabsContent value="services" className="space-y-4">
						<p className="text-gray-500">Service content settings will appear here.</p>
						<Button onClick={handleSave} className="mt-2">Save Changes</Button>
					</TabsContent>

					<TabsContent value="contact" className="space-y-4">
						<p className="text-gray-500">Contact information settings will appear here.</p>
						<Button onClick={handleSave} className="mt-2">Save Changes</Button>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
