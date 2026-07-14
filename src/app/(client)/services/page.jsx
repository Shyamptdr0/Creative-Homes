"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
	Hammer,
	Paintbrush,
	Ruler,
	ArrowRight,
	CheckCircle2,
	Building2,
	Compass,
	MoveRight,
	ShieldCheck,
	Zap,
	Clock,
	Gem,
	DraftingCompass
} from "lucide-react";
import construction from "../../../../public/Images/services/construction.jpg";
import interior from "../../../../public/Images/services/interior.jpg";
import Renovation from "../../../../public/Images/services/Renovation.jpg";
import Drawing from "../../../../public/Images/services/Drawingss.jpg";
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

export default function ServicePage() {
	const services = [
		{
			id: 1,
			title: "End-to-End Construction",
			subtitle: "Structural Excellence",
			description:
				"We transform empty plots into architectural legacies. Our construction methodology combines advanced civil engineering with premium material sourcing to deliver structures that stand the test of time.",
			details: ["Foundation to Handover", "RCC Structural Design", "Material Quality Audits", "Labor Management"],
			icon: <Building2 className="w-8 h-8" />,
			image: construction,
		},
		{
			id: 2,
			title: "Bespoke Interior Design",
			subtitle: "Living Art",
			description:
				"Interior design is the soul of a home. We create immersive spaces that balance your personal narrative with contemporary aesthetics, ensuring every corner reflects your lifestyle.",
			details: ["3D Visualizations", "Custom Furniture", "Lighting Design", "Texture Mapping"],
			icon: <Paintbrush className="w-8 h-8" />,
			image: interior,
		},
		{
			id: 3,
			title: "Premium Renovation",
			subtitle: "Legacy Restoration",
			description:
				"Breathing new life into existing structures. We specialize in complex renovations that upgrade the functionality and aesthetic of your space without compromising its structural integrity.",
			details: ["Space Re-modeling", "Modern Retrofitting", "Eco-friendly Upgrades", "Aesthetic Overhaul"],
			icon: <Hammer className="w-8 h-8" />,
			image: Renovation,
		},
		{
			id: 4,
			title: "Consultancy & Design",
			subtitle: "Strategic Planning",
			description:
				"Precision begins on the drawing board. Our consultancy services provide you with Vastu-compliant blueprints, structural stability reports, and comprehensive project feasibility studies.",
			details: ["Architectural Blueprints", "Vastu Consultancy", "Project Cost Estimation", "Liaisoning Support"],
			icon: <Ruler className="w-8 h-8" />,
			image: Drawing,
		},
	];

	return (
		<div className="w-full bg-white text-neutral-900 font-sans selection:bg-primary selection:text-white overflow-x-hidden relative">

			{/* 1. CINEMATIC HERO */}
			<section className="relative pt-48 pb-32 flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
				<div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
				<div className="absolute inset-0 z-0">
					<Image
						src="/Images/house.jpg"
						alt="Architecture"
						fill
						className="object-cover opacity-20 grayscale"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
				</div>

				<div className="relative z-10 text-center space-y-8 px-6">
					<motion.span
						initial={{ opacity: 0, tracking: "0.2em" }}
						animate={{ opacity: 1, tracking: "0.5em" }}
						className="text-primary font-bold uppercase text-xs tracking-[0.5em] block"
					>
						The Urban Standard
					</motion.span>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-none"
					>
						Mastering the <br />
						<span className="text-neutral-500 italic font-serif">Art</span> of Build.
					</motion.h1>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="max-w-2xl mx-auto text-neutral-400 text-lg md:text-xl font-medium"
					>
						From foundation to finish, we bring precision and passion to every square foot of your future legacy.
					</motion.p>
				</div>
			</section>

			{/* 2. SERVICES SHOWCASE - ALTERNATING FEATURE LAYOUT */}
			<section className="py-48 px-6 md:px-24 max-w-[1500px] mx-auto space-y-64">
				{services.map((service, i) => (
					<div
						key={service.id}
						className={`flex flex-col lg:flex-row items-center gap-24 lg:gap-32 ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}
					>
						{/* Image Side */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 1 }}
							className="lg:w-1/2 relative group"
						>
							<div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
								<Image
									src={service.image}
									alt={service.title}
									fill
									className="object-cover transition-transform duration-[2s] group-hover:scale-110"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
							</div>

							{/* Floating Metric Card */}
							<div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[3rem] shadow-2xl flex items-center gap-6 border border-neutral-100 group-hover:-translate-y-4 transition-transform duration-700">
								<div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
									{service.icon}
								</div>
								<div>
									<p className="text-[9px] uppercase font-black text-neutral-400 tracking-widest">Service Vertical</p>
									<p className="text-sm font-bold text-neutral-900 uppercase">{service.subtitle}</p>
								</div>
							</div>
						</motion.div>

						{/* Content Side */}
						<motion.div
							initial="initial"
							whileInView="whileInView"
							viewport={{ once: true }}
							variants={staggerContainer}
							className="lg:w-1/2 space-y-12"
						>
							<div className="space-y-4">
								<motion.span variants={fadeInUp} className="text-primary font-bold uppercase text-[10px] tracking-[0.4em]">
									{service.subtitle}
								</motion.span>
								<motion.h2 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-900 leading-tight">
									{service.title.split(' ')[0]} <br />
									<span className="text-neutral-400 italic font-serif">{service.title.split(' ').slice(1).join(' ')}</span>.
								</motion.h2>
							</div>

							<motion.p variants={fadeInUp} className="text-neutral-500 text-xl leading-relaxed font-medium">
								{service.description}
							</motion.p>

							<motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
								{service.details.map((detail, idx) => (
									<motion.div key={idx} variants={fadeInUp} className="flex items-center gap-4 group/item">
										<div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center group-hover/item:bg-primary transition-colors">
											<CheckCircle2 className="w-3 h-3 text-primary group-hover/item:text-white" />
										</div>
										<span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest group-hover/item:text-neutral-900 transition-colors">
											{detail}
										</span>
									</motion.div>
								))}
							</motion.div>

							<motion.div variants={fadeInUp} className="pt-8">
								<button className="group flex items-center gap-6 px-10 py-5 bg-neutral-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-primary transition-all duration-500 shadow-xl">
									Explore Works
									<MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
								</button>
							</motion.div>
						</motion.div>
					</div>
				))}
			</section>

			{/* 3. THE URBAN ADVANTAGE - HIGH FIDELITY HUB */}
			<section className="bg-[#0A0A0A] py-48 px-6 md:px-24 relative overflow-hidden">
				<div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "100px 100px" }} />

				<div className="max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-32 items-center relative z-10">
					<div className="space-y-16">
						<div className="space-y-6">
							<span className="text-primary font-bold uppercase tracking-[0.4em] text-xs">Our Commitment</span>
							<h2 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.85]">
								The Urban <br /> <span className="text-neutral-600 italic font-serif">Advantage</span>.
							</h2>
						</div>

						<p className="text-neutral-500 text-xl max-w-md leading-relaxed font-medium">
							We don't just build structures; we build trust through absolute transparency and architectural innovation.
						</p>

						<div className="grid grid-cols-2 gap-16 pt-10 border-t border-white/10">
							{[
								{ title: "Transparency", value: "100%", icon: <ShieldCheck /> },
								{ title: "Precision", value: "99.9%", icon: <DraftingCompass /> },
								{ title: "Efficiency", value: "Elite", icon: <Zap /> },
								{ icon: <Clock />, title: "Delivery", value: "Fixed" },
							].map((stat, i) => (
								<div key={i} className="space-y-3 group">
									<div className="text-primary group-hover:scale-110 transition-transform origin-left">
										{React.cloneElement(stat.icon, { className: "w-5 h-5" })}
									</div>
									<p className="text-4xl font-black text-white leading-none tracking-tighter">{stat.value}</p>
									<p className="text-[9px] uppercase font-black text-neutral-600 tracking-[0.2em]">{stat.title}</p>
								</div>
							))}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{[
							{ title: "Architects", desc: "Expert visionary studio.", icon: <Compass /> },
							{ title: "Materiality", desc: "Premium global sourcing.", icon: <Gem /> },
							{ title: "Safety", desc: "Certified civil standards.", icon: <ShieldCheck /> },
							{ title: "Modernity", desc: "Contemporary living tech.", icon: <Building2 /> },
						].map((item, i) => (
							<div
								key={i}
								className="bg-white/5 p-10 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all duration-500 group relative overflow-hidden"
							>
								<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
									{React.cloneElement(item.icon, { className: "w-6 h-6" })}
								</div>
								<h3 className="text-white font-bold text-xl uppercase tracking-widest mb-2">{item.title}</h3>
								<p className="text-neutral-500 text-sm font-medium">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 4. ENGAGEMENT */}
			<section className="py-20 bg-white">
				<BookMeetingPage />
			</section>

			{/* 	<Footer /> */}
		</div>
	);
}
