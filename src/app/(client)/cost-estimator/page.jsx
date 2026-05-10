"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Calculator,
	ArrowRight,
	CheckCircle2,
	ChevronDown,
	Info,
	Clock,
	Target
} from "lucide-react";

export default function CostEstimatorPage() {
	const [activeTab, setActiveTab] = useState("basic");
	const [formData, setFormData] = useState({
		fullName: "",
		mobile: "",
		email: "",
		city: "Indore",
		plotArea: "",
		plinthArea: "",
		floors: "Ground floor",
		timeline: "0-3 months",
		ownPlot: "Yes",
		agree: false
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value
		}));
	};

	const estimatedCost = () => {
		const area = activeTab === "basic" ? (parseFloat(formData.plotArea) || 0) * 0.7 : (parseFloat(formData.plinthArea) || 0);
		const floorMultiplier = formData.floors === "Ground floor" ? 1 : formData.floors === "G+1" ? 1.9 : 2.8;
		return area * 2300 * floorMultiplier;
	};

	const isFormValid = () => {
		const area = activeTab === "basic" ? formData.plotArea : formData.plinthArea;
		return area > 0 && formData.fullName && formData.mobile;
	};

	return (
		<div className="w-full min-h-screen bg-white text-[#0f172a] font-sans pt-32 pb-40 px-6">
			
			<div className="max-w-7xl mx-auto">
				{/* HEADER */}
				<div className="mb-16 space-y-2">
					<span className="text-primary font-bold uppercase text-[10px] tracking-[0.4em]">Investment Planner</span>
					<h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0f172a]">
						COST <span className="text-primary italic font-serif font-normal">ESTIMATOR.</span>
					</h1>
				</div>

				<div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
					
					{/* LEFT: FORM (col-span-7) */}
					<div className="lg:col-span-7 space-y-12">
						{/* TABS */}
						<div className="flex gap-2">
							<button 
								onClick={() => setActiveTab("basic")}
								className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
									activeTab === "basic" ? "bg-black text-white border-black" : "bg-white text-neutral-400 border-neutral-100 hover:border-neutral-300"
								}`}
							>
								Basic Details
							</button>
							<button 
								onClick={() => setActiveTab("advanced")}
								className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
									activeTab === "advanced" ? "bg-black text-white border-black" : "bg-white text-neutral-400 border-neutral-100 hover:border-neutral-300"
								}`}
							>
								Advanced Specs
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
							<div className="space-y-2">
								<label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Your Name</label>
								<input 
									type="text" name="fullName" value={formData.fullName} onChange={handleChange}
									className="w-full border-b-2 border-neutral-50 focus:border-primary py-4 px-1 text-sm font-bold outline-none transition-all"
									placeholder="John Doe"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Contact Number</label>
								<input 
									type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
									className="w-full border-b-2 border-neutral-50 focus:border-primary py-4 px-1 text-sm font-bold outline-none transition-all"
									placeholder="+91 00000 00000"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Project City</label>
								<div className="relative">
									<select 
										name="city" value={formData.city} onChange={handleChange}
										className="w-full border-b-2 border-neutral-50 focus:border-primary py-4 px-1 text-sm font-bold outline-none appearance-none cursor-pointer bg-transparent"
									>
										<option>Indore</option>
										<option>Mumbai</option>
										<option>Bhopal</option>
									</select>
									<ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
									{activeTab === "basic" ? "Plot Area (Sqft)" : "Plinth Area (Sqft)"}
								</label>
								<input 
									type="number" 
									name={activeTab === "basic" ? "plotArea" : "plinthArea"}
									value={activeTab === "basic" ? formData.plotArea : formData.plinthArea}
									onChange={handleChange}
									className="w-full border-b-2 border-neutral-50 focus:border-primary py-4 px-1 text-sm font-bold outline-none transition-all"
									placeholder="e.g. 1500"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Number of Floors</label>
								<div className="relative">
									<select 
										name="floors" value={formData.floors} onChange={handleChange}
										className="w-full border-b-2 border-neutral-50 focus:border-primary py-4 px-1 text-sm font-bold outline-none appearance-none cursor-pointer bg-transparent"
									>
										<option>Ground floor</option>
										<option>G+1 (Double Storey)</option>
										<option>G+2 (Triple Storey)</option>
									</select>
									<ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Timeline</label>
								<div className="relative">
									<select 
										name="timeline" value={formData.timeline} onChange={handleChange}
										className="w-full border-b-2 border-neutral-50 focus:border-primary py-4 px-1 text-sm font-bold outline-none appearance-none cursor-pointer bg-transparent"
									>
										<option>0-3 months</option>
										<option>3-6 months</option>
										<option>6-12 months</option>
									</select>
									<ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
								</div>
							</div>
						</div>

						<div className="pt-10">
							<label className="flex items-center gap-3 cursor-pointer group">
								<input 
									type="checkbox" checked={formData.agree} onChange={handleChange} name="agree"
									className="w-5 h-5 accent-primary" 
								/>
								<span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-neutral-600 transition-colors">
									Accept Privacy Policy & Terms
								</span>
							</label>
						</div>
					</div>

					{/* RIGHT: RESULTS (col-span-5) */}
					<div className="lg:col-span-5 sticky top-32">
						<div className="bg-[#0f172a] rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
							<div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
							
							<div className="relative z-10 space-y-12">
								<div className="space-y-6">
									<div className="flex items-center gap-3 text-primary">
										<Calculator className="w-5 h-5" />
										<span className="text-[10px] font-black uppercase tracking-[0.5em]">Real-time Estimate</span>
									</div>

									{isFormValid() ? (
										<motion.div 
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											className="space-y-2"
										>
											<p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estimated Investment</p>
											<h2 className="text-6xl md:text-7xl font-black tracking-tighter">
												₹{(estimatedCost() / 100000).toFixed(2)}<span className="text-xl text-primary ml-2 font-serif italic">Lakhs</span>
											</h2>
											<p className="text-[10px] font-medium text-white/30 italic mt-2">≈ ₹{Math.round(estimatedCost()).toLocaleString('en-IN')}</p>
										</motion.div>
									) : (
										<div className="py-8 space-y-4">
											<div className="w-full h-12 bg-white/5 rounded-2xl animate-pulse" />
											<p className="text-xs text-white/30 font-medium italic">Enter area and name to see estimate...</p>
										</div>
									)}
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-2">
										<Clock className="w-4 h-4 text-primary" />
										<p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Duration</p>
										<p className="text-xs font-bold">14-16 Months</p>
									</div>
									<div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-2">
										<Target className="w-4 h-4 text-primary" />
										<p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Quality</p>
										<p className="text-xs font-bold">Premium Grade</p>
									</div>
								</div>

								<div className="pt-8 border-t border-white/10 space-y-6">
									<p className="text-xs text-white/50 leading-relaxed font-medium">
										This projection includes all Civil, Structural, and Finishing works with standard premium material specs.
									</p>
									<button 
										disabled={!isFormValid() || !formData.agree}
										className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
									>
										Get Detailed Quote
										<ArrowRight className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}
