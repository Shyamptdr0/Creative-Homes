"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Filter, 
	ChevronDown, 
	MapPin, 
	Layers, 
	Maximize, 
	Compass, 
	IndianRupee,
	Search,
	X,
	ArrowRight,
	Home
} from "lucide-react";


const filtersData = {
	cities: ["Indore"],
	floors: ["G+1", "G+2", "G+3", "G+4", "G+5"],
	dimensions: ["30x40 sq. ft", "30x50 sq. ft", "40x50 sq. ft", "40x60 sq. ft", "30x60 sq. ft"]
};

export default function ProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeFilters, setActiveFilters] = useState({
		city: "Indore",
		floor: "All",
		dimension: "All"
	});
	const [searchQuery, setSearchQuery] = useState("");

	React.useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
		try {
			const res = await fetch("/api/portfolio");
			const data = await res.json();
			if (Array.isArray(data)) {
				setProjects(data);
			}
		} catch (error) {
			console.error("Failed to fetch projects", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredProjects = projects.filter(p => {
		const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFloor = activeFilters.floor === "All" || p.floors === activeFilters.floor;
		const matchesDimension = activeFilters.dimension === "All" || p.dimensions === activeFilters.dimension;
		return matchesSearch && matchesFloor && matchesDimension;
	});

	return (
		<div className="w-full min-h-screen bg-white text-[#0f172a] font-sans">
			
			{/* HERO SECTION */}
			<section className="pt-40 pb-20 px-6 md:px-20 border-b border-neutral-50">
				<div className="max-w-7xl mx-auto space-y-4">
					<motion.span 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-primary font-bold uppercase text-[10px] tracking-[0.4em]"
					>
						Portfolio
					</motion.span>
					<motion.h1 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-5xl md:text-7xl font-black tracking-tight uppercase"
					>
						Our <span className="text-primary italic font-serif lowercase">projects.</span>
					</motion.h1>
				</div>
			</section>

			<main className="max-w-7xl mx-auto px-6 md:px-20 py-20">
				<div className="grid lg:grid-cols-12 gap-16 items-start">
					
					{/* LEFT SIDEBAR: FILTERS */}
					<aside className="lg:col-span-3 sticky top-32 space-y-12">
						<div className="flex items-center gap-3 text-neutral-900 border-b border-neutral-100 pb-4">
							<Filter className="w-4 h-4" />
							<h2 className="text-sm font-black uppercase tracking-widest">Filter By</h2>
						</div>

						<div className="space-y-10">
							{/* City Filter */}
							<div className="space-y-4">
								<h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Location</h3>
								<div className="flex flex-wrap gap-2">
									{filtersData.cities.map(c => (
										<button 
											key={c}
											className="px-6 py-2 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
										>
											<MapPin className="w-3 h-3" />
											{c}
										</button>
									))}
								</div>
							</div>

							{/* Floor Filter */}
							<div className="space-y-4">
								<h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Floors</h3>
								<div className="flex flex-col gap-2">
									<button 
										onClick={() => setActiveFilters({...activeFilters, floor: "All"})}
										className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
											activeFilters.floor === "All" ? "bg-neutral-100 text-black" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
										}`}
									>
										All Configurations
									</button>
									{filtersData.floors.map(f => (
										<button 
											key={f}
											onClick={() => setActiveFilters({...activeFilters, floor: f})}
											className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
												activeFilters.floor === f ? "bg-neutral-100 text-black" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
											}`}
										>
											{f} Residence
										</button>
									))}
								</div>
							</div>

							{/* Dimension Filter */}
							<div className="space-y-4">
								<h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Plot Dimension</h3>
								<div className="flex flex-col gap-2">
									<button 
										onClick={() => setActiveFilters({...activeFilters, dimension: "All"})}
										className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
											activeFilters.dimension === "All" ? "bg-neutral-100 text-black" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
										}`}
									>
										All Dimensions
									</button>
									{filtersData.dimensions.map(d => (
										<button 
											key={d}
											onClick={() => setActiveFilters({...activeFilters, dimension: d})}
											className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
												activeFilters.dimension === d ? "bg-neutral-100 text-black" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
											}`}
										>
											{d}
										</button>
									))}
								</div>
							</div>
						</div>
					</aside>

					{/* RIGHT CONTENT: SEARCH & GRID */}
					<div className="lg:col-span-9 space-y-12">
						{/* Search Bar */}
						<div className="relative group">
							<input 
								type="text" 
								placeholder="Search by client name..." 
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full bg-neutral-50 border-2 border-neutral-100 focus:border-primary py-5 px-8 rounded-[2rem] text-sm font-bold outline-none transition-all pr-14 shadow-sm"
							/>
							<Search className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300 group-focus-within:text-primary transition-colors" />
						</div>

						{/* Results Count */}
						<div className="flex justify-between items-center px-2">
							<p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
								Showing <span className="text-black">{filteredProjects.length}</span> Results
							</p>
						</div>

						{/* Grid */}
						{loading ? (
							<div className="flex justify-center items-center py-20">
								<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
							</div>
						) : filteredProjects.length === 0 ? (
							<div className="text-center py-20 bg-neutral-50 rounded-3xl">
								<p className="text-neutral-500 font-medium">No projects found matching your criteria.</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
								{filteredProjects.map((project) => (
									<Link href={`/projects/${project.id}`} key={project.id} className="block group">
										<motion.div 
											initial={{ opacity: 0, y: 20 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											className="bg-[#fcfbf9] rounded-[2rem] overflow-hidden hover:shadow-lg transition-all duration-300 border border-neutral-100"
										>
											<div className="relative aspect-[4/3] overflow-hidden">
												<Image 
													src={project.image} 
													alt={project.name} 
													fill 
													className="object-cover transition-transform duration-700 group-hover:scale-105" 
												/>
											</div>

											<div className="p-6 md:p-8 space-y-4">
												<h3 className="text-xl font-medium text-[#0f172a]">{project.name}</h3>
												
												<div className="flex items-center gap-2 text-neutral-500">
													<MapPin className="w-4 h-4" />
													<span className="text-sm">{project.city}</span>
												</div>

												<div className="flex flex-wrap items-center gap-4 text-neutral-600 pt-4">
													<div className="flex items-center gap-2 text-sm">
														<Home className="w-4 h-4 text-neutral-400" />
														<span>{project.floors}</span>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<Maximize className="w-4 h-4 text-neutral-400" />
														<span>{project.dimensions}</span>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<Compass className="w-4 h-4 text-neutral-400" />
														<span>{project.facing}</span>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<IndianRupee className="w-4 h-4 text-neutral-400" />
														<span>{project.budget}</span>
													</div>
												</div>
											</div>
										</motion.div>
									</Link>
								))}
							</div>
						)}

						{/* Pagination */}
						<div className="pt-12 flex justify-center">
							<div className="flex items-center gap-2">
								{[1, 2, 3, "...", 13].map((page, i) => (
									<button 
										key={i}
										className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
											page === 1 ? "bg-black text-white" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
										}`}
									>
										{page}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* CTA SECTION - BOOK A MEETING */}
			<section className="bg-[#0f172a] py-32 px-6 md:px-20 relative overflow-hidden">
				<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 opacity-30" />
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row">
						<div className="lg:w-2/5 bg-[#0a0f1d] p-12 md:p-20 flex flex-col justify-between text-white border-r border-white/5">
							<div className="space-y-12">
								<div className="space-y-6">
									<motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="inline-block px-4 py-1 border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-primary">Consultation</motion.div>
									<h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">YOU <br /> DREAM. <br /> <span className="text-primary italic font-serif normal-case">We Deliver.</span></h2>
								</div>
								<p className="text-white/40 text-sm leading-relaxed max-w-xs font-medium">Transforming your vision into an architectural masterpiece. Our experts are ready to guide your journey.</p>
							</div>
							<div className="pt-12 flex gap-10 border-t border-white/5">
								<div className="space-y-1"><p className="text-2xl font-bold text-white tracking-tight italic">100%</p><p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Transparency</p></div>
								<div className="space-y-1"><p className="text-2xl font-bold text-white tracking-tight italic">15+</p><p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Cities</p></div>
							</div>
						</div>
						<div className="flex-1 bg-white p-12 md:p-20">
							<div className="max-w-md mx-auto space-y-10">
								<div className="space-y-2"><h3 className="text-3xl font-black text-[#0f172a] tracking-tight">Reserve a slot.</h3><p className="text-neutral-400 text-xs font-medium uppercase tracking-widest">Free Architectural Vision Workshop</p></div>
								<form className="space-y-8">
									<div className="grid grid-cols-2 gap-6">
										<div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">First Name</label><input type="text" placeholder="John" className="w-full bg-neutral-50/50 border-b-2 border-neutral-100 focus:border-primary py-3 px-1 text-sm font-bold outline-none transition-all" /></div>
										<div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Last Name</label><input type="text" placeholder="Doe" className="w-full bg-neutral-50/50 border-b-2 border-neutral-100 focus:border-primary py-3 px-1 text-sm font-bold outline-none transition-all" /></div>
									</div>
									<div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Email Address</label><input type="email" placeholder="john@example.com" className="w-full bg-neutral-50/50 border-b-2 border-neutral-100 focus:border-primary py-3 px-1 text-sm font-bold outline-none transition-all" /></div>
									<div className="grid grid-cols-2 gap-6">
										<div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">City</label><div className="relative"><select className="w-full bg-neutral-50/50 border-b-2 border-neutral-100 focus:border-primary py-3 px-1 text-sm font-bold outline-none appearance-none cursor-pointer bg-transparent"><option>Indore</option><option>Mumbai</option></select><ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" /></div></div>
										<div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Plot Owned?</label><div className="flex gap-4 pt-2"><label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-widest"><input type="radio" name="plot" className="accent-primary" /> Yes</label><label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-widest"><input type="radio" name="plot" className="accent-primary" /> No</label></div></div>
									</div>
									<div className="pt-6"><button className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-primary transition-all flex items-center justify-center gap-4 group">Book Vision Workshop<ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></button></div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</section>

		</div>
	);
}
