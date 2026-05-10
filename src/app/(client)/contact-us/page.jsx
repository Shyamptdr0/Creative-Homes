"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MoveRight, Send, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "../components/footer";

// ANIMATION VARIANTS
const fadeInUp = {
	initial: { y: 40, opacity: 0 },
	whileInView: { y: 0, opacity: 1 },
	transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
	initial: {},
	whileInView: { transition: { staggerChildren: 0.1 } }
};

export default function ContactPage() {
	return (
		<div className="bg-white font-sans selection:bg-primary selection:text-white relative">
			
			{/* 1. CINEMATIC HERO */}
			<section className="relative pt-48 pb-32 flex flex-col items-center justify-center px-6 md:px-24 overflow-hidden bg-[#0A0A0A]">
				<div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
				<motion.div 
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
					className="relative z-10 text-center space-y-6"
				>
					<span className="text-primary font-bold text-xs uppercase tracking-[0.5em]">Connect with Excellence</span>
					<h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.9]">
						Let's <br />
						<span className="text-neutral-500 italic font-serif">Conceptualize</span>.
					</h1>
				</motion.div>
			</section>

			{/* 2. CONTACT HUB */}
			<section className="py-32 px-6 md:px-24 max-w-[1500px] mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
					
					{/* LEFT: INFORMATION PORTAL */}
					<div className="lg:col-span-5 space-y-16">
						<motion.div 
							initial="initial"
							whileInView="whileInView"
							viewport={{ once: true }}
							variants={staggerContainer}
							className="space-y-6"
						>
							<motion.h2 variants={fadeInUp} className="text-5xl font-bold tracking-tighter text-neutral-900 leading-none">
								Global <br /> <span className="text-neutral-300 italic font-serif">Presence</span>.
							</motion.h2>
							<motion.p variants={fadeInUp} className="text-neutral-500 text-lg leading-relaxed font-medium max-w-sm">
								Our studio operates at the intersection of precision and artistry. Reach out to our design concierge for project inquiries.
							</motion.p>
						</motion.div>

						<div className="space-y-10">
							{[
								{ icon: <Mail />, title: "Digital Correspondence", val: "concierge@urbanlandscape.com", desc: "For design proposals & media." },
								{ icon: <Phone />, title: "Direct Communication", val: "+91 98765 43210", desc: "Available Mon-Fri, 9am - 6pm." },
								{ icon: <MapPin />, title: "Design Studio", val: "240, Architectural Plaza, Jaipur", desc: "Rajasthan, India - 302001" },
							].map((item, i) => (
								<motion.div 
									key={i}
									initial={{ opacity: 0, x: -20 }}
									whileInView={{ opacity: 1, x: 0 }}
									transition={{ delay: i * 0.1 }}
									className="flex gap-8 group"
								>
									<div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
										{React.cloneElement(item.icon, { className: "w-6 h-6" })}
									</div>
									<div className="space-y-1">
										<p className="text-[10px] uppercase font-black text-neutral-400 tracking-[0.2em]">{item.title}</p>
										<p className="text-lg font-bold text-neutral-900 tracking-tight">{item.val}</p>
										<p className="text-xs text-neutral-500 font-medium">{item.desc}</p>
									</div>
								</motion.div>
							))}
						</div>

						{/* OPERATIONAL HOURS */}
						<div className="p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100 flex items-center gap-8">
							<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
								<Clock className="w-5 h-5" />
							</div>
							<div>
								<p className="text-[9px] uppercase font-black text-neutral-400 tracking-widest leading-none mb-1">Standard Operations</p>
								<p className="text-sm font-bold text-neutral-900 uppercase">Always Open for Visionaries</p>
							</div>
						</div>
					</div>

					{/* RIGHT: MESSAGE PORTAL */}
					<motion.div 
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 1 }}
						className="lg:col-span-7 bg-white p-12 md:p-20 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.04)] border border-neutral-100 relative overflow-hidden"
					>
						<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
						
						<div className="space-y-12 relative z-10">
							<div className="space-y-4">
								<h3 className="text-4xl font-bold tracking-tighter text-neutral-900">Start a <span className="text-neutral-300 italic font-serif">Dialogue</span>.</h3>
								<p className="text-neutral-500 font-medium">Please provide your details below. Our design principals review every inquiry personally.</p>
							</div>

							<form className="space-y-8">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div className="space-y-2">
										<label className="text-[10px] uppercase font-black text-neutral-400 tracking-widest ml-1">Full Identity</label>
										<Input 
											placeholder="Your Name" 
											className="h-16 rounded-2xl border-neutral-100 focus:ring-primary/20 focus:border-primary transition-all text-neutral-900 font-medium" 
										/>
									</div>
									<div className="space-y-2">
										<label className="text-[10px] uppercase font-black text-neutral-400 tracking-widest ml-1">Digital Address</label>
										<Input 
											placeholder="email@example.com" 
											className="h-16 rounded-2xl border-neutral-100 focus:ring-primary/20 focus:border-primary transition-all text-neutral-900 font-medium" 
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] uppercase font-black text-neutral-400 tracking-widest ml-1">Project Interest</label>
									<Input 
										placeholder="Construction, Interior, Consultancy..." 
										className="h-16 rounded-2xl border-neutral-100 focus:ring-primary/20 focus:border-primary transition-all text-neutral-900 font-medium" 
									/>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] uppercase font-black text-neutral-400 tracking-widest ml-1">The Vision</label>
									<Textarea 
										placeholder="Describe your architectural aspirations..." 
										className="min-h-[200px] rounded-3xl border-neutral-100 focus:ring-primary/20 focus:border-primary transition-all text-neutral-900 font-medium p-6" 
									/>
								</div>

								<button className="w-full group flex items-center justify-center gap-6 py-6 bg-black text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-primary transition-all duration-500 shadow-2xl">
									Transmit Message
									<Send className="w-4 h-4 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1" />
								</button>
							</form>
						</div>
					</motion.div>
				</div>
			</section>

			{/* 3. GLOBAL FOOTER */}
			<Footer />
		</div>
	);
}
