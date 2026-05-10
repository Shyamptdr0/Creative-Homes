"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Background & Hero images
import bgHome from "../../../../public/Images/img4.jpg";
import bgHero from "../../../../public/Images/image-home-back.png";
import fgHero from "../../../../public/Images/image-home-bg.png";
import modernProject from "../../../../public/Images/home img2.jpg";
import projectThumb from "../../../../public/Images/home img1.jpg";
import projectsideimg from "../../../../public/Images/img8.jpg";

// Project gallery images
import project1 from "../../../../public/Images/img2.jpg";
import project2 from "../../../../public/Images/img3.jpg";
import project3 from "../../../../public/Images/img4.jpg";
import project4 from "../../../../public/Images/img5.jpg";
import project5 from "../../../../public/Images/img6.jpg";
import project6 from "../../../../public/Images/img7.jpg";

import {
	Search,
	ArrowRight,
	ChevronRight,
	ShieldCheck,
	Construction,
	Clock,
	CheckCircle2,
	MapPin,
	Handshake,
	House,
	TabletSmartphone,
	Key,
	BrickWall,
	Gem,
	IndianRupee,
	Speaker,
	ChevronDown,
	DraftingCompass
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import BookMeetingPage from "@/app/(client)/components/BookaMeeting";
import HeaderPage from "./header";
import FooterPage from "./footer";

const SECTIONS_COUNT = 7; 

export default function HeroPage() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [showNav, setShowNav] = useState(false);
	const navTimerRef = useRef(null);
	const touchStartRef = useRef(0);

	// SMART HIDE LOGIC
	const triggerNav = () => {
		setShowNav(true);
		if (navTimerRef.current) clearTimeout(navTimerRef.current);
		navTimerRef.current = setTimeout(() => {
			setShowNav(false);
		}, 2000);
	};

	// Handle wheel scroll for section-jacking
	useEffect(() => {
		const handleWheel = (e) => {
			if (isAnimating) return;
			if (e.deltaY > 50) {
				if (activeIndex < SECTIONS_COUNT) scrollToSection(activeIndex + 1);
			} else if (e.deltaY < -50) {
				if (activeIndex > 0) scrollToSection(activeIndex - 1);
			}
		};

		const handleTouchStart = (e) => {
			touchStartRef.current = e.touches[0].clientY;
		};

		const handleTouchEnd = (e) => {
			if (isAnimating) return;
			const touchEnd = e.changedTouches[0].clientY;
			const diff = touchStartRef.current - touchEnd;

			if (Math.abs(diff) > 50) {
				if (diff > 0 && activeIndex < SECTIONS_COUNT) scrollToSection(activeIndex + 1);
				else if (diff < 0 && activeIndex > 0) scrollToSection(activeIndex - 1);
			}
		};

		window.addEventListener("wheel", handleWheel, { passive: false });
		window.addEventListener("touchstart", handleTouchStart, { passive: true });
		window.addEventListener("touchend", handleTouchEnd, { passive: true });
		
		return () => {
			window.removeEventListener("wheel", handleWheel);
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [activeIndex, isAnimating]);

	const scrollToSection = (index) => {
		if (index >= 0 && index <= SECTIONS_COUNT) {
			setIsAnimating(true);
			setActiveIndex(index);
			triggerNav();
			setTimeout(() => setIsAnimating(false), 1000);
		}
	};

	const { scrollYProgress } = useScroll();
	const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

	// Animation Variants
	const fadeInUp = {
		initial: { y: 60, opacity: 0 },
		whileInView: { y: 0, opacity: 1 },
		transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
	};

	const fadeInRight = {
		initial: { x: -40, opacity: 0 },
		whileInView: { x: 0, opacity: 1 },
		transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
	};

	const staggerContainer = {
		initial: {},
		whileInView: { transition: { staggerChildren: 0.1 } }
	};

	return (
		<div className="relative w-full h-screen overflow-hidden bg-white font-sans text-gray-900">
			{/* PREMIUM SIDE NAVIGATION */}
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: showNav ? 1 : 0, x: showNav ? 0 : 20 }}
				transition={{ duration: 0.8, ease: "circOut" }}
				onMouseEnter={() => setShowNav(true)}
				onMouseLeave={triggerNav}
				className="fixed right-4 md:right-10 top-1/2 -translate-y-1/2 z-[100] flex items-center gap-10"
			>
				<div className="absolute right-[11px] top-0 bottom-0 w-[1px] bg-neutral-200/30 hidden md:block" />

				<div className="relative z-10 flex flex-col gap-6 md:gap-8">
					{[...Array(SECTIONS_COUNT + 1)].map((_, i) => (
						<button
							key={i}
							onClick={() => scrollToSection(i)}
							className="group relative flex items-center justify-center py-1"
						>
							{activeIndex === i && (
								<motion.div 
									layoutId="navRing"
									className="absolute inset-0 w-6 h-6 -left-[9px] -top-[1px] border border-primary/40 rounded-full"
									initial={{ scale: 0.5, opacity: 0 }}
									animate={{ scale: [1, 1.2, 1], opacity: 1 }}
									transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
								/>
							)}
							<motion.div
								animate={{
									height: activeIndex === i ? 20 : 6,
									width: 6,
									backgroundColor: activeIndex === i ? "#006688" : "#d1d5db",
									scale: activeIndex === i ? 1 : 0.8
								}}
								className={`rounded-full transition-all duration-700 relative z-10 ${activeIndex === i ? "shadow-[0_0_20px_rgba(0,102,136,0.5)]" : "group-hover:bg-neutral-500"}`}
							/>
							<div className="absolute right-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 pointer-events-none hidden md:flex items-center gap-4">
								<div className="h-[1px] w-8 bg-primary/30" />
								<span className="px-5 py-2 bg-black/80 backdrop-blur-xl text-white text-[9px] uppercase tracking-[0.4em] font-black rounded-sm border border-white/10 shadow-2xl whitespace-nowrap">
									{["Introduction", "Discovery", "Excellence", "Portfolio", "Process", "Testimonials", "Engagement", "Finish"][i]}
								</span>
							</div>
						</button>
					))}
				</div>
			</motion.div>

			<div onMouseMove={triggerNav} className="fixed right-0 top-0 bottom-0 w-20 z-[99] pointer-events-auto hidden md:block" />

			<motion.div
				className="w-full"
				animate={{ y: `-${activeIndex * 100}vh` }}
				transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
			>
				{/* 1. HERO SECTION */}
				<section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden px-6">
					<HeaderPage isGlobal={false} />
					<motion.div style={{ scale }} className="absolute inset-0 z-0">
						<Image src={bgHero} alt="Background" fill className="object-cover" priority />
						<div className="absolute inset-0 bg-black/20" />
					</motion.div>

					<div className="relative z-10 text-center space-y-4 max-w-4xl">
						<motion.h1
							initial={{ y: 100, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 1.2, ease: "easeOut" }}
							className="text-6xl sm:text-8xl lg:text-[10vw] font-bold text-white uppercase tracking-tighter leading-none"
						>
							Urban <span className="text-primary italic font-serif lowercase">Landscape</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8 }}
							className="text-white/80 text-[10px] sm:text-sm md:text-lg uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light"
						>
							Architecture • Construction • Design
						</motion.p>
					</div>

					<div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
						<span className="text-white/50 text-[10px] uppercase tracking-widest">Scroll to explore</span>
						<motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
							<ChevronDown className="text-white w-6 h-6" />
						</motion.div>
					</div>
				</section>

				{/* 2. PROPERTY SEARCH */}
				<section className="w-full h-screen bg-[#FDFDFD] flex items-center justify-center px-6 md:px-24 relative overflow-hidden">
					<div className="absolute top-0 right-0 w-1/3 h-full bg-neutral-50/50 -skew-x-12 translate-x-20 z-0 hidden lg:block" />

					<motion.div
						initial="initial"
						animate={activeIndex === 1 ? "whileInView" : "initial"}
						variants={staggerContainer}
						className="max-w-[1500px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center z-10"
					>
						<div className="space-y-8 lg:space-y-12">
							<div className="space-y-4">
								<motion.div variants={fadeInRight} className="flex items-center gap-3">
									<div className="w-8 md:w-12 h-[1px] bg-primary" />
									<span className="text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.4em]">Asset Discovery</span>
								</motion.div>
								<motion.h2 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-8xl font-bold text-[#1a1a1a] leading-[0.9] tracking-tighter">
									Unrivaled <br className="hidden md:block" />
									<span className="text-neutral-400 italic font-serif pr-4">Selection</span>.
								</motion.h2>
								<motion.p variants={fadeInUp} className="text-neutral-500 text-sm md:text-lg max-w-lg leading-relaxed pt-2 font-medium">
									Explore our curated selection of premium architectural plots and luxury residences designed for the modern landscape.
								</motion.p>
							</div>

							<motion.div variants={fadeInUp} className="relative group">
								<div className="absolute -inset-2 md:-inset-4 bg-white/40 backdrop-blur-2xl rounded-3xl md:rounded-[3rem] border border-white/60 shadow-xl z-0" />
								<div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-6 p-4 md:p-2">
									<div className="md:col-span-4 px-4 md:px-8 border-b md:border-b-0 md:border-r border-neutral-100 pb-4 md:pb-0">
										<p className="text-[9px] uppercase font-black text-neutral-400 tracking-[0.2em] mb-1">Prime Location</p>
										<div className="flex items-center gap-3">
											<MapPin className="w-4 h-4 text-primary" />
											<span className="text-sm md:text-base font-bold text-neutral-800">Jaipur Studio</span>
										</div>
									</div>
									<div className="md:col-span-4 px-4 md:px-8 border-b md:border-b-0 md:border-r border-neutral-100 pb-4 md:pb-0">
										<p className="text-[9px] uppercase font-black text-neutral-400 tracking-[0.2em] mb-1">Architecture</p>
										<div className="flex items-center gap-3">
											<House className="w-4 h-4 text-primary" />
											<span className="text-sm md:text-base font-bold text-neutral-800">Luxury Villa</span>
										</div>
									</div>
									<div className="md:col-span-4 p-1">
										<button className="w-full bg-black text-white h-12 md:h-16 rounded-2xl md:rounded-[2.5rem] font-bold uppercase tracking-widest text-[10px] md:text-[11px] flex items-center justify-center gap-3 hover:bg-primary transition-all">
											Search
											<ArrowRight className="w-4 h-4" />
										</button>
									</div>
								</div>
							</motion.div>
						</div>

						<div className="relative h-full hidden lg:flex justify-center items-center">
							<motion.div
								initial={{ scale: 1.1, opacity: 0, x: 50 }}
								animate={activeIndex === 1 ? { scale: 1, opacity: 1, x: 0 } : { scale: 1.1, opacity: 0, x: 50 }}
								transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
								className="relative aspect-[4/5] w-full max-w-[480px] rounded-[4rem] overflow-hidden shadow-2xl group"
							>
								<Image src={project2} alt="Legacy" fill className="object-cover" />
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
								<div className="absolute bottom-10 left-10 right-10 flex items-center justify-between p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
									<div className="text-white">
										<p className="text-[9px] uppercase font-bold tracking-[0.4em] text-primary">Signature Plot</p>
										<p className="text-lg font-bold">The Emerald Estate</p>
									</div>
									<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white"><ArrowRight className="w-4 h-4" /></div>
								</div>
							</motion.div>
						</div>
					</motion.div>
				</section>

				{/* 3. EXCELLENCE */}
				<section className="w-full h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 md:px-24 relative overflow-hidden">
					<div className="absolute top-20 right-[-10%] text-[10rem] md:text-[15rem] font-black text-neutral-200/20 select-none pointer-events-none uppercase tracking-tighter">Craft</div>
					<motion.div
						initial="initial"
						animate={activeIndex === 2 ? "whileInView" : "initial"}
						className="max-w-[1500px] w-full h-full flex flex-col justify-center py-10"
					>
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
							<div className="lg:col-span-5 space-y-8 md:space-y-12">
								<motion.div variants={fadeInRight} className="space-y-4">
									<div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
										<Construction className="w-3 h-3 text-primary" />
										<span className="text-[9px] md:text-[10px] uppercase font-bold text-primary tracking-[0.3em]">Engineering Authority</span>
									</div>
									<h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
										Masterful <br />
										<span className="text-neutral-400 italic font-serif">Structuralism</span>.
									</h2>
								</motion.div>
								<motion.p variants={fadeInUp} className="text-neutral-500 text-sm md:text-lg leading-relaxed max-w-md font-medium">
									We redefine stability through architectural innovation. Every project is a testament to rigorous engineering and uncompromising material integrity.
								</motion.p>
								<motion.div variants={staggerContainer} className="grid grid-cols-2 gap-8 border-t border-neutral-200 pt-8">
									<div className="space-y-1">
										<p className="text-[9px] uppercase font-bold text-neutral-400 tracking-widest">Reinforcement</p>
										<p className="text-2xl md:text-3xl font-black text-neutral-900">FE 550D</p>
										<div className="w-10 h-1 bg-primary rounded-full" />
									</div>
									<div className="space-y-1">
										<p className="text-[9px] uppercase font-bold text-neutral-400 tracking-widest">Grade</p>
										<p className="text-2xl md:text-3xl font-black text-neutral-900">M40 / M50</p>
										<div className="w-10 h-1 bg-neutral-300 rounded-full" />
									</div>
								</motion.div>
							</div>

							<div className="lg:col-span-7 relative h-full hidden lg:flex items-center">
								<div className="grid grid-cols-12 grid-rows-6 gap-6 w-full h-[55vh]">
									<motion.div variants={fadeInUp} className="col-span-8 row-span-6 relative rounded-[3rem] overflow-hidden shadow-2xl">
										<Image src={projectsideimg} alt="Struct" fill className="object-cover" />
										<div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white">
											<p className="text-3xl font-black">100%</p>
											<p className="text-[8px] uppercase tracking-widest opacity-70">Quality Assurance</p>
										</div>
									</motion.div>
									<motion.div variants={fadeInUp} className="col-span-4 row-span-3 relative rounded-[2rem] overflow-hidden border-2 border-white shadow-xl">
										<Image src={project4} alt="Detail" fill className="object-cover" />
									</motion.div>
									<motion.div variants={fadeInUp} className="col-span-4 row-span-3 relative rounded-[2rem] overflow-hidden bg-primary p-6 flex flex-col justify-between text-white">
										<ShieldCheck className="w-8 h-8 opacity-50" />
										<p className="text-lg font-bold leading-tight">Safety <br />Certified</p>
									</motion.div>
								</div>
							</div>
						</div>

						<motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12 md:mt-16">
							{[
								{ label: "Warranty", val: "10 Years", icon: <Construction /> },
								{ label: "Delivery", val: "On-Time", icon: <Clock /> },
								{ label: "Standard", val: "ISO 9001", icon: <CheckCircle2 /> },
								{ label: "Expertise", val: "Expert Hub", icon: <MapPin /> }
							].map((s, i) => (
								<motion.div key={i} variants={fadeInUp} className="flex items-center gap-3 md:gap-6 p-4 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-neutral-100">
									<div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-neutral-50 flex items-center justify-center text-primary shrink-0">
										{React.cloneElement(s.icon, { className: "w-5 h-5 md:w-6 md:h-6" })}
									</div>
									<div className="min-w-0">
										<p className="text-[8px] md:text-[9px] uppercase font-bold text-neutral-400 tracking-widest truncate">{s.label}</p>
										<p className="text-xs md:text-base font-black text-neutral-900 truncate">{s.val}</p>
									</div>
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				</section>

				{/* 4. PORTFOLIO */}
				<section className="w-full h-screen bg-white flex flex-col items-center justify-center px-6 md:px-24 relative overflow-hidden">
					<motion.div
						initial="initial"
						animate={activeIndex === 3 ? "whileInView" : "initial"}
						className="max-w-[1500px] w-full h-full flex flex-col justify-center py-10"
					>
						<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6">
							<motion.div variants={fadeInRight} className="space-y-4">
								<span className="text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.4em]">Curated Works</span>
								<h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-none">Signature <br /><span className="text-neutral-400 italic font-serif">Masterworks</span>.</h2>
							</motion.div>
							<motion.button variants={fadeInUp} className="group flex items-center gap-4 px-8 md:px-10 py-4 md:py-5 border border-neutral-200 rounded-full font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] hover:bg-black hover:text-white transition-all">
								Archive
								<div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white"><ArrowRight className="w-3 h-3" /></div>
							</motion.button>
						</div>

						<div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 min-h-0 overflow-y-auto md:overflow-hidden pr-2 md:pr-0">
							<motion.div variants={fadeInUp} className="col-span-12 lg:col-span-7 h-[300px] md:h-auto relative rounded-3xl md:rounded-[3rem] overflow-hidden group shadow-xl">
								<Image src={project1} alt="P1" fill className="object-cover" />
								<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
								<div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 text-white md:translate-y-10 md:group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100 transition-all">
									<p className="text-[9px] uppercase font-bold tracking-[0.4em] text-primary mb-1">Residence</p>
									<h4 className="text-2xl md:text-4xl font-bold mb-4">Obsidian Manor</h4>
									<div className="hidden md:flex gap-8 border-t border-white/20 pt-4">
										<div><p className="text-[7px] uppercase tracking-widest opacity-50 mb-1">Year</p><p className="text-[10px] font-bold">2024</p></div>
										<div><p className="text-[7px] uppercase tracking-widest opacity-50 mb-1">Area</p><p className="text-[10px] font-bold">12,500 SQFT</p></div>
									</div>
								</div>
							</motion.div>
							<div className="col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
								<motion.div variants={fadeInUp} className="relative h-[200px] md:h-full rounded-2xl md:rounded-[2.5rem] overflow-hidden group shadow-lg">
									<Image src={project3} alt="P3" fill className="object-cover" />
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<p className="text-white font-bold uppercase tracking-[0.4em] text-[10px]">Aesthetic</p>
									</div>
								</motion.div>
								<div className="grid grid-cols-2 gap-4 md:gap-6">
									<motion.div variants={fadeInUp} className="relative h-[150px] md:h-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-lg">
										<Image src={project4} alt="P4" fill className="object-cover" />
									</motion.div>
									<motion.div variants={fadeInUp} className="relative h-[150px] md:h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-neutral-900 p-4 md:p-8 flex flex-col justify-between text-white">
										<Gem className="w-6 h-6 text-primary" />
										<p className="text-xs md:text-base font-bold uppercase tracking-widest leading-tight">Iconic <br />Design</p>
									</motion.div>
								</div>
							</div>
						</div>
					</motion.div>
				</section>

				{/* 5. PROCESS */}
				<section className="w-full h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 md:px-24 relative overflow-hidden">
					<motion.div
						initial="initial"
						animate={activeIndex === 4 ? "whileInView" : "initial"}
						className="max-w-[1400px] w-full space-y-12 md:space-y-16"
					>
						<div className="text-center space-y-4">
							<motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-black text-[#0f172a] tracking-tight">
								Our Building Process
							</motion.h2>
							<motion.p variants={fadeInUp} className="text-neutral-500 text-sm md:text-lg font-medium">
								Step-by-step to your dream home.
							</motion.p>
						</div>

						<motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
							{[
								{ icon: <Handshake />, title: "Discovery", desc: "Initial design consultation." },
								{ icon: <House />, title: "Visualization", desc: "Detailed 3D architectural renders." },
								{ icon: <TabletSmartphone />, title: "Precision", desc: "Real-time construction tracking." },
								{ icon: <Key />, title: "Handover", desc: "Seamless legacy delivery." }
							].map((item, i) => (
								<motion.div key={i} variants={fadeInUp} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-neutral-100 text-center space-y-4 md:space-y-6">
									<div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-primary mx-auto border border-neutral-50 group-hover:bg-primary group-hover:text-white transition-all">
										{React.cloneElement(item.icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
									</div>
									<div className="space-y-2">
										<h4 className="text-lg md:text-xl font-bold text-[#0f172a]">{item.title}</h4>
										<p className="text-neutral-500 text-[11px] md:text-sm leading-relaxed">{item.desc}</p>
									</div>
								</motion.div>
							))}
						</motion.div>

						<motion.div variants={fadeInUp} className="flex justify-center pt-4">
							<button className="bg-primary text-white px-10 md:px-12 py-4 md:py-5 rounded-2xl font-bold text-[10px] md:text-sm tracking-widest shadow-xl">
								View Details
							</button>
						</motion.div>
					</motion.div>
				</section>

				{/* 7. TESTIMONIALS */}
				<section className="w-full h-screen bg-white flex flex-col items-center justify-center px-6 md:px-24 relative overflow-hidden">
					<motion.div
						initial="initial"
						animate={activeIndex === 5 ? "whileInView" : "initial"}
						className="max-w-[1000px] w-full text-center space-y-12 md:space-y-16"
					>
						<motion.div variants={fadeInUp} className="inline-block px-6 py-2 bg-neutral-50 rounded-full border border-neutral-100">
							<span className="text-primary font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em]">Client Voices</span>
						</motion.div>
						<motion.div variants={fadeInUp} className="relative">
							<span className="absolute -top-16 md:-top-20 left-0 text-[10rem] md:text-[15rem] text-neutral-50 font-serif leading-none select-none opacity-50 md:opacity-100">“</span>
							<h3 className="text-xl sm:text-3xl md:text-5xl font-medium text-neutral-800 leading-tight tracking-tight relative z-10 italic font-serif px-4">
								"Urban Landscape didn't just build a house; they crafted a legacy. Their technical precision and aesthetic vision are truly unmatched."
							</h3>
						</motion.div>
						<motion.div variants={fadeInUp} className="flex flex-col items-center gap-4">
							<div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary p-1">
								<div className="w-full h-full rounded-full bg-neutral-100 relative overflow-hidden">
									<Image src={projectThumb} alt="Client" fill className="object-cover" />
								</div>
							</div>
							<div className="text-center">
								<p className="text-lg md:text-xl font-bold text-neutral-900">Dr. Rajesh Vardhan</p>
								<p className="text-[9px] md:text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Jaipur, Rajasthan</p>
							</div>
						</motion.div>
					</motion.div>
				</section>

				{/* 8. ENGAGEMENT */}
				<section className="w-full h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 md:px-24 py-8 overflow-hidden">
					<motion.div
						initial="initial"
						animate={activeIndex === 6 ? "whileInView" : "initial"}
						className="w-full h-full max-w-[1500px] overflow-y-auto md:overflow-hidden rounded-3xl shadow-xl"
					>
						<BookMeetingPage />
					</motion.div>
				</section>

				{/* 9. FOOTER */}
				<section className="w-full h-screen bg-black flex flex-col items-center justify-center px-6 md:px-24 overflow-hidden">
					<motion.div
						initial="initial"
						animate={activeIndex === 7 ? "whileInView" : "initial"}
						className="w-full h-full flex flex-col justify-center"
					>
						<FooterPage />
					</motion.div>
				</section>
			</motion.div>
		</div>
	);
}
