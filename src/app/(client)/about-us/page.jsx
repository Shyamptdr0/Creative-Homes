"use client";

import React from "react";
import Image from "next/image";
import architect from "../../../../public/Images/services/Drawing.jpg"; // left image
import sketch from "../../../../public/Images/workimg.jpg"; // right image
import { motion } from "framer-motion";
import { 
	Award, 
	Users, 
	Layers, 
	History, 
	ArrowRight, 
	MoveRight,
	Compass,
	DraftingCompass
} from "lucide-react";
import BookMeetingPage from "@/app/(client)/components/BookaMeeting";
import HeaderPage from "../components/header";
import Footer from "../components/footer";

// ANIMATION VARIANTS
const fadeInUp = {
	initial: { y: 60, opacity: 0 },
	whileInView: { y: 0, opacity: 1 },
	transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
	initial: {},
	whileInView: { transition: { staggerChildren: 0.1 } }
};

export default function AboutPage() {
	return (
		<div className="bg-white font-sans selection:bg-primary selection:text-white relative">

			{/* 1. CINEMATIC HERO */}
			<section className="relative w-full pt-48 pb-32 flex flex-col items-center justify-center px-6 md:px-24 overflow-hidden bg-[#0A0A0A]">
				<div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
				<motion.div 
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
					className="relative z-10 text-center space-y-6"
				>
					<span className="text-primary font-bold text-xs uppercase tracking-[0.5em]">About Urban Landscape</span>
					<h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.9]">
						Building <br />
						<span className="text-neutral-500 italic font-serif">Together</span>.
					</h1>
				</motion.div>
			</section>

			{/* 2. THE PHILOSOPHY SECTION */}
			<section className="w-full py-40 px-6 md:px-24 bg-white relative">
				<div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
					{/* LEFT: THE NARRATIVE */}
					<motion.div 
						initial="initial"
						whileInView="whileInView"
						viewport={{ once: true }}
						variants={staggerContainer}
						className="space-y-12"
					>
						<motion.div variants={fadeInUp} className="space-y-4">
							<h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-neutral-900 leading-tight">
								A Smart <br />
								<span className="text-neutral-400 italic font-serif">All-in-One Platform</span>.
							</h2>
						</motion.div>

						<motion.div variants={fadeInUp} className="text-neutral-500 text-lg leading-relaxed font-medium max-w-xl space-y-4">
							<p>Urban Landscape is a smart, all-in-one platform designed to bring the entire construction ecosystem together. It empowers architects, engineers, interior designers, contractors, and material dealers to register themselves and become part of a growing, trusted community.</p>
							<p>For businesses, Urban Landscape opens doors to genuine potential clients. And for clients, it simplifies the journey of building or designing their space by helping them easily discover the right professionals based on their needs, style, and budget.</p>
						</motion.div>

						{/* STATS HUB */}
						<motion.div variants={staggerContainer} className="grid grid-cols-2 gap-12 pt-10 border-t border-neutral-100">
							{[
								{ icon: <Users />, label: "Registered Pros", val: "1000+" },
								{ icon: <Layers />, label: "Projects Planned", val: "500+" },
								{ icon: <Award />, label: "Verified Dealers", val: "300+" },
								{ icon: <History />, label: "Happy Clients", val: "2000+" }
							].map((stat, i) => (
								<motion.div key={i} variants={fadeInUp} className="space-y-2">
									<div className="flex items-center gap-3 text-primary">
										{React.cloneElement(stat.icon, { className: "w-4 h-4" })}
										<p className="text-3xl font-black text-neutral-900 tracking-tighter">{stat.val}</p>
									</div>
									<p className="text-[10px] uppercase font-bold text-neutral-400 tracking-[0.2em]">{stat.label}</p>
								</motion.div>
							))}
						</motion.div>
					</motion.div>

					{/* RIGHT: THE ARTISTRY */}
					<motion.div 
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 1.2 }}
						className="relative h-[80vh] rounded-[4rem] overflow-hidden shadow-2xl group"
					>
						<Image src={sketch} alt="Architectural Sketch" fill className="object-cover transition-transform duration-[2s] group-hover:scale-110" />
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
						
						{/* FLOATING BADGE */}
						<div className="absolute bottom-10 right-10 bg-white p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-6">
							<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
								<DraftingCompass className="w-6 h-6" />
							</div>
							<div>
								<p className="text-[9px] uppercase font-black text-neutral-400 tracking-widest">Verified Network</p>
								<p className="text-sm font-bold text-neutral-900 uppercase">Trusted Pros</p>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* 3. CORE VALUES SECTION */}
			<section className="w-full py-32 px-6 md:px-24 bg-[#0A0A0A] text-white overflow-hidden relative">
				<div className="max-w-[1500px] mx-auto">
					<motion.div 
						initial="initial"
						whileInView="whileInView"
						viewport={{ once: true }}
						variants={staggerContainer}
						className="grid grid-cols-1 md:grid-cols-3 gap-20"
					>
						{[
							{ title: "Seamless Connections", desc: "Thoughtfully integrating price estimation, rate comparison, and direct communication into one unified platform.", icon: <Users /> },
							{ title: "Reliable Choices", desc: "No more endless searching or confusion. Find verified professionals based on your specific needs, style, and budget.", icon: <Award /> },
							{ title: "Complete Clarity", desc: "Removing the hassle from construction and design, giving you the confidence to plan and create from the comfort of your home.", icon: <Compass /> }
						].map((value, i) => (
							<motion.div key={i} variants={fadeInUp} className="space-y-6 group">
								<div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
									{React.cloneElement(value.icon, { className: "w-8 h-8" })}
								</div>
								<h3 className="text-2xl font-bold tracking-tight">{value.title}</h3>
								<p className="text-neutral-500 leading-relaxed font-medium group-hover:text-neutral-300 transition-colors">{value.desc}</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* 4. THE FOUNDER / DESIGNER VISION */}
			<section className="w-full py-40 px-6 md:px-24 bg-white overflow-hidden relative">
				<div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
					{/* IMAGE POD */}
					<div className="lg:col-span-5 relative h-[70vh] rounded-[4rem] overflow-hidden shadow-2xl">
						<Image src={architect} alt="Architect" fill className="object-cover" />
						<div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
					</div>

					{/* CONTENT POD */}
					<motion.div 
						initial="initial"
						whileInView="whileInView"
						viewport={{ once: true }}
						variants={staggerContainer}
						className="lg:col-span-7 space-y-10"
					>
						<motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full">
							<span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em]">The Vision</span>
						</motion.div>
						<motion.h2 variants={fadeInUp} className="text-5xl md:text-8xl font-bold tracking-tighter text-neutral-900 leading-[0.85]">
							Create with <br />
							<span className="text-neutral-300 italic font-serif">Confidence</span>.
						</motion.h2>
						<motion.div variants={fadeInUp} className="text-neutral-500 text-xl leading-relaxed font-medium space-y-4">
							<p>From price estimation and rate comparison to seamless connections—all the essentials are thoughtfully integrated into one platform. No more endless searching or confusion—just clarity, convenience, and reliable choices.</p>
							<p>Urban Landscape is built to remove the hassle from construction and design, so you can plan, connect, and create your dream space with confidence—right from the comfort of your home.</p>
						</motion.div>
						<motion.button 
							variants={fadeInUp}
							className="group flex items-center gap-6 px-12 py-6 bg-black text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-primary transition-all duration-500 shadow-2xl"
						>
							Join the Community
							<MoveRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
						</motion.button>
					</motion.div>
				</div>
			</section>

			{/* 5. ENGAGEMENT */}
			<section className="py-20 bg-neutral-50">
				<BookMeetingPage />
			</section>

			<Footer />
		</div>
	);
}
