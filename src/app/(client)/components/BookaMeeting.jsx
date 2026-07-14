"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Mail, MapPin, PhoneCall } from "lucide-react";
import Image from "next/image";
import projectThumb from "../../../../public/Images/home img1.jpg";

export default function BookMeetingPage() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		message: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
		alert("Inquiry sent successfully!");
	};

	return (
		<div className="w-full h-full bg-white flex flex-col md:flex-row overflow-hidden rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-neutral-100">
			{/* Left Side: Brand Narrative */}
			<div className="md:w-[40%] bg-[#0A0A0A] text-white p-12 md:p-20 flex flex-col justify-between relative overflow-hidden">
				{/* ARCHITECTURAL GRID OVERLAY */}
				<div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

				<div className="relative z-10 space-y-12">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full"
					>
						<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
						<span className="text-[10px] uppercase font-bold tracking-[0.3em]">Direct Engagement</span>
					</motion.div>

					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter"
					>
						Design your <br />
						<span className="text-neutral-500 italic font-serif font-medium">Future</span> with us.
					</motion.h2>

					<div className="space-y-6">
						{[
							{ icon: <Mail />, label: "Email Us", val: "sharadchaurasia@urbanlandscape.in" },
							{ icon: <PhoneCall />, label: "Call Directly", val: "+91 98276 02453" },
							{ icon: <MapPin />, label: "Visit Studio", val: "Vijay Nagar, Indore" }
						].map((item, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ delay: i * 0.1 }}
								className="flex items-center gap-5 group"
							>
								<div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors">
									{React.cloneElement(item.icon, { className: "w-5 h-5" })}
								</div>
								<div>
									<p className="text-[9px] uppercase font-bold text-neutral-600 tracking-widest">{item.label}</p>
									<p className="text-sm font-medium text-neutral-300">{item.val}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>


			</div>

			{/* Right Side: Form */}
			<div className="flex-1 bg-white p-12 md:p-20 flex flex-col justify-center">
				<div className="max-w-xl w-full mx-auto space-y-12">
					<div className="space-y-4">
						<h3 className="text-3xl font-bold text-neutral-900 tracking-tight">Project Inquiry</h3>
						<p className="text-neutral-500 text-sm font-medium">Please provide a brief overview of your vision. Our team will contact you within 24 hours.</p>
					</div>

					<form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8" onSubmit={handleSubmit}>
						<div className="space-y-3">
							<label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">First Name</label>
							<input
								type="text"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
								placeholder="e.g. Rahul"
								className="w-full bg-transparent border-b-2 border-neutral-100 px-0 py-3 text-base font-medium focus:border-primary outline-none transition-all"
								required
							/>
						</div>
						<div className="space-y-3">
							<label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Last Name</label>
							<input
								type="text"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								placeholder="e.g. Sharma"
								className="w-full bg-transparent border-b-2 border-neutral-100 px-0 py-3 text-base font-medium focus:border-primary outline-none transition-all"
								required
							/>
						</div>
						<div className="md:col-span-2 space-y-3">
							<label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Email Address</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="rahul@example.com"
								className="w-full bg-transparent border-b-2 border-neutral-100 px-0 py-3 text-base font-medium focus:border-primary outline-none transition-all"
								required
							/>
						</div>
						<div className="md:col-span-2 space-y-3">
							<label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Inquiry Details</label>
							<textarea
								rows={3}
								name="message"
								value={formData.message}
								onChange={handleChange}
								placeholder="Tell us about your dream home..."
								className="w-full bg-transparent border-b-2 border-neutral-100 px-0 py-3 text-base font-medium focus:border-primary outline-none transition-all resize-none"
								required
							/>
						</div>

						<div className="md:col-span-2 pt-6">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								type="submit"
								className="group bg-black text-white px-12 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-primary transition-all shadow-2xl"
							>
								<span>Initialize Project</span>
								<ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
							</motion.button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
