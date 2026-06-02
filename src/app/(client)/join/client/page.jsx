"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
	ShieldCheck, 
	IndianRupee, 
	Users, 
	CheckCircle2, 
	ArrowRight,
	Compass,
	Building2,
	Paintbrush,
	Wrench,
	Truck
} from "lucide-react";
import imgClient from "../../../../../public/Images/house.jpg";

// ANIMATION VARIANTS
const fadeInUp = {
	initial: { y: 40, opacity: 0 },
	animate: { y: 0, opacity: 1 },
	transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
	initial: {},
	animate: { transition: { staggerChildren: 0.1 } }
};

export default function JoinClientPage() {
	return (
		<div className="bg-white font-sans selection:bg-primary selection:text-white min-h-screen relative overflow-hidden">
			
			{/* 1. CINEMATIC HERO */}
			<section className="relative w-full pt-48 pb-32 flex flex-col items-center justify-center px-6 md:px-24 overflow-hidden bg-[#0A0A0A]">
				<div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
				<motion.div 
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
					className="relative z-10 text-center space-y-6 max-w-4xl"
				>
					<span className="text-primary font-bold text-xs uppercase tracking-[0.5em] block">For Homeowners & Creators</span>
					<h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-tight">
						Build Your Dream Project <br />
						<span className="text-neutral-400 italic font-serif">With Confidence</span>.
					</h1>
					<p className="text-neutral-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
						Find Architects, Engineers, Interior Designers, Contractors, and Material Suppliers.
					</p>
					<div className="pt-4">
						<Link href="/client/login">
							<motion.button 
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="px-10 py-5 bg-primary text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-primary/95 transition-all shadow-xl flex items-center gap-3 mx-auto"
							>
								Get Started Now
								<ArrowRight className="w-4 h-4" />
							</motion.button>
						</Link>
					</div>
				</motion.div>
			</section>

			{/* 2. THE VALUE PROPOSITION */}
			<section className="w-full py-28 px-6 md:px-24 bg-white relative">
				<div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
					{/* LEFT: THE DETAILS */}
					<motion.div 
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						variants={staggerContainer}
						className="lg:col-span-7 space-y-10"
					>
						<div className="space-y-4">
							<span className="text-primary font-bold text-xs uppercase tracking-widest">Platform Benefits</span>
							<h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-neutral-900 leading-tight">
								A Seamless Journey from <br />
								<span className="text-neutral-400 italic font-serif">Blueprint to Reality</span>.
							</h2>
						</div>

						{/* BENEFITS GRID */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
							{[
								{
									icon: <Users className="w-6 h-6 text-primary" />,
									title: "Compare professionals",
									desc: "Compare architects, interior designers, engineers, and contractors based on verified reviews and comprehensive portfolios."
								},
								{
									icon: <IndianRupee className="w-6 h-6 text-primary" />,
									title: "Get budget estimates",
									desc: "Receive competitive quotes and detailed estimations to align with your design objectives and budget parameters."
								},
								{
									icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
									title: "Compare material rates",
									desc: "Get real-time pricing on essential construction materials from trusted dealers in your locality."
								},
								{
									icon: <ShieldCheck className="w-6 h-6 text-primary" />,
									title: "Find trusted experts near you",
									desc: "Every single contractor and professional goes through our rigorous onboarding validation checks for peace of mind."
								}
							].map((item, index) => (
								<motion.div key={index} variants={fadeInUp} className="space-y-3 p-5 rounded-2xl border border-neutral-100 hover:shadow-md transition-all">
									<div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
										{item.icon}
									</div>
									<h4 className="text-lg font-bold text-neutral-900">{item.title}</h4>
									<p className="text-neutral-500 text-xs leading-relaxed font-medium">{item.desc}</p>
								</motion.div>
							))}
						</div>
					</motion.div>

					{/* RIGHT: IMAGE */}
					<div className="lg:col-span-5 relative h-[65vh] rounded-[3rem] overflow-hidden shadow-2xl group">
						<Image 
							src={imgClient} 
							alt="Luxury Modern House" 
							fill 
							className="object-cover transition-transform duration-[2s] group-hover:scale-105" 
							placeholder="blur"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
						
						{/* FLOATING CARD */}
						<div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-white/20">
							<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
								<ShieldCheck className="w-5 h-5" />
							</div>
							<div>
								<p className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">Quality Guarantee</p>
								<p className="text-xs font-bold text-neutral-800">Verified Construction Partners</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 3. WHO CAN YOU FIND SECTION */}
			<section className="w-full py-24 px-6 md:px-24 bg-[#0A0A0A] text-white relative">
				<div className="max-w-[1500px] mx-auto space-y-16">
					<div className="text-center space-y-4">
						<span className="text-primary font-bold text-xs uppercase tracking-widest">Available Services</span>
						<h2 className="text-3xl md:text-5xl font-bold tracking-tight">Our Professional Network</h2>
						<p className="text-neutral-400 text-xs md:text-sm max-w-xl mx-auto">
							Connect with a wide range of vetted design, engineering, and execution specialists.
						</p>
					</div>

					<motion.div 
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						variants={staggerContainer}
						className="grid grid-cols-2 md:grid-cols-5 gap-6"
					>
						{[
							{ icon: <Compass className="w-8 h-8" />, label: "Architects", desc: "For blueprints and layout design" },
							{ icon: <Building2 className="w-8 h-8" />, label: "Engineers", desc: "For structural & soil analysis" },
							{ icon: <Paintbrush className="w-8 h-8" />, label: "Interior Designers", desc: "For finishes and space aesthetics" },
							{ icon: <Wrench className="w-8 h-8" />, label: "Contractors", desc: "For execution and builds" },
							{ icon: <Truck className="w-8 h-8" />, label: "Material Suppliers", desc: "For premium building material supply" }
						].map((item, i) => (
							<motion.div key={i} variants={fadeInUp} className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-4 hover:bg-white/[0.08] transition-all">
								<div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-primary mx-auto">
									{item.icon}
								</div>
								<div className="space-y-1">
									<h4 className="font-bold text-sm text-white">{item.label}</h4>
									<p className="text-neutral-400 text-[10px] leading-relaxed">{item.desc}</p>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* 4. FINAL CTA */}
			<section className="w-full py-28 px-6 text-center bg-white relative">
				<div className="max-w-2xl mx-auto space-y-8">
					<h3 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">
						Ready to construct your masterpiece?
					</h3>
					<p className="text-neutral-500 text-sm md:text-base leading-relaxed">
						Join Urban Landscape as a client, list your project, and start receiving quotations from qualified contractors today.
					</p>
					<div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
						<Link href="/client/login">
							<button className="w-full sm:w-auto px-8 py-4 bg-black text-white hover:bg-neutral-900 rounded-xl font-bold text-xs tracking-widest uppercase transition-colors shadow-lg">
								Explore Services
							</button>
						</Link>
						<Link href="/client/login">
							<button className="w-full sm:w-auto px-8 py-4 border border-neutral-300 hover:bg-neutral-50 rounded-xl font-bold text-xs tracking-widest uppercase transition-colors">
								Login / Signup
							</button>
						</Link>
					</div>
				</div>
			</section>

		</div>
	);
}
