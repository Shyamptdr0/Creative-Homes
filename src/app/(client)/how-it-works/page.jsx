"use client";

import React from "react";
import {
	Handshake,
	Search,
	PencilRuler,
	Hammer,
	Building2,
	Home,
	CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import BookMeetingPage from "@/app/(client)/components/BookaMeeting";

export default function HowToWorkPage() {
	const steps = [
		{
			id: "01",
			icon: <Handshake className="w-6 h-6 text-primary" />,
			title: "Book a meeting",
			description: "Schedule a session to learn about us and our process. Your journey starts with a conversation where we align your vision with our expertise.",
		},
		{
			id: "02",
			icon: <Search className="w-6 h-6 text-primary" />,
			title: "Do your research",
			description: "Explore reference sites, get a preliminary quote, and review our industry-leading contracts. Transparency is our foundation.",
		},
		{
			id: "03",
			icon: <PencilRuler className="w-6 h-6 text-primary" />,
			title: "Begin design",
			description: "Make the design phase payment to begin crafting your dream home designed by our empanelled architects. Watch your vision take form.",
		},
		{
			id: "04",
			icon: <Hammer className="w-6 h-6 text-primary" />,
			title: "Pre-Construction",
			description: "We handle the rest—soil tests, final quotations, project plans, contractor meetings, and all legal formalities while you prepare for the build.",
		},
		{
			id: "05",
			icon: <Building2 className="w-6 h-6 text-primary" />,
			title: "Construction",
			description: "Track progress through weekly updates, scheduled meetings, and detailed reports. Watch your dream rise with precision and quality.",
		},
		{
			id: "06",
			icon: <Home className="w-6 h-6 text-primary" />,
			title: "Handover and Housewarming",
			description: "From dream to reality—enjoy a seamless handover backed by a structural stability certificate and a five-year structural warranty.",
		},
	];

	return (
		<div className="w-full bg-[#f8f9fa] min-h-screen font-sans text-[#1a1a1a]">
			
			{/* HERO SECTION - CLEAN & WELCOMING */}
			<section className="w-full py-24 md:py-32 px-6 flex flex-col items-center text-center space-y-6 bg-white">
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-4 max-w-3xl"
				>
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0f172a]">
						Our Building Process at a Glance
					</h1>
					<p className="text-neutral-500 text-lg md:text-xl">
						Follow our streamlined process from concept to handover. Simple, transparent, and built for your peace of mind.
					</p>
				</motion.div>
			</section>

			{/* TIMELINE SECTION */}
			<section className="relative max-w-7xl mx-auto px-6 py-20">
				
				{/* Central Line */}
				<div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-primary/20 -translate-x-1/2 hidden md:block" />

				<div className="space-y-16 md:space-y-0">
					{steps.map((step, i) => (
						<div key={i} className={`relative flex items-center justify-between md:mb-32 last:mb-0 w-full flex-col md:flex-row ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
							
							{/* Card Container */}
							<motion.div 
								initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, margin: "-100px" }}
								transition={{ duration: 0.6, ease: "easeOut" }}
								className="w-full md:w-[42%] bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-neutral-100 relative z-10"
							>
								<div className="space-y-4">
									<div className="flex items-center gap-3 md:hidden mb-4">
										<div className="w-12 h-12 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-sm">
											{step.icon}
										</div>
										<span className="text-xs font-bold text-primary uppercase tracking-widest">Step {step.id}</span>
									</div>
									<h3 className="text-2xl md:text-3xl font-bold text-[#0f172a]">{step.title}</h3>
									<p className="text-neutral-500 leading-relaxed text-base md:text-lg">
										{step.description}
									</p>
								</div>
							</motion.div>

							{/* Central Icon (Desktop) */}
							<motion.div 
								initial={{ scale: 0 }}
								whileInView={{ scale: 1 }}
								viewport={{ once: true }}
								className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-4 border-primary/10 rounded-full items-center justify-center shadow-xl hidden md:flex z-20"
							>
								{step.icon}
							</motion.div>

							{/* Empty side for layout balance */}
							<div className="hidden md:block w-[42%]" />
						</div>
					))}
				</div>
			</section>

			{/* FINAL BOOKING */}
			<section className="w-full py-20 px-6 md:px-12 bg-[#fafafa] flex flex-col items-center">
				<div className="w-full max-w-[1400px]">
					<motion.div 
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-neutral-100 overflow-hidden min-h-[500px]"
					>
						<BookMeetingPage />
					</motion.div>
				</div>
			</section>
		</div>
	);
}
