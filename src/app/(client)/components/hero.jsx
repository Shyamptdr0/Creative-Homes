"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Background & Hero images
import bgHome from "../../../../public/Images/img4.jpg";
import bgHero from "../../../../public/Images/imagebg-urban.jpeg";
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
	ChevronLeft,
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
	DraftingCompass,
	Building2,
	Users
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import BookMeetingPage from "@/app/(client)/components/BookaMeeting";
import HeaderPage from "./header";
import FooterPage from "./footer";
import HeroCarousel from "./HeroCarousel";
import ArchitectPortfolio from "./ArchitectPortfolio";

const SECTIONS_COUNT = 7;

export default function HeroPage() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [showNav, setShowNav] = useState(false);
	const [showRolePopup, setShowRolePopup] = useState(false);
	const [featuredProjects, setFeaturedProjects] = useState([]);
	const [allProjects, setAllProjects] = useState([]);
	const [sliderIndex, setSliderIndex] = useState(0);
	const navTimerRef = useRef(null);
	const touchStartRef = useRef(0);

	useEffect(() => {
		fetch("/api/portfolio/featured")
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) setFeaturedProjects(data);
			})
			.catch(err => console.error("Error fetching featured projects:", err));

		fetch("/api/portfolio")
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) setAllProjects(data);
			})
			.catch(err => console.error("Error fetching all projects:", err));
	}, []);

	useEffect(() => {
		if (featuredProjects.length > 1) {
			const timer = setInterval(() => {
				setSliderIndex(prev => (prev + 1) % featuredProjects.length);
			}, 4000);
			return () => clearInterval(timer);
		}
	}, [featuredProjects.length]);

	// Show onboarding role selection popup once per session
	useEffect(() => {
		const hasPopupShown = sessionStorage.getItem("role_popup_shown");
		if (!hasPopupShown) {
			const timer = setTimeout(() => {
				setShowRolePopup(true);
			}, 1200);
			return () => clearTimeout(timer);
		}
	}, []);

	const closePopup = () => {
		sessionStorage.setItem("role_popup_shown", "true");
		setShowRolePopup(false);
	};

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
			{/* WELCOME ONBOARDING POPUP */}
			<AnimatePresence>
				{showRolePopup && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
					>
						<motion.div
							initial={{ scale: 0.95, y: 20, opacity: 0 }}
							animate={{ scale: 1, y: 0, opacity: 1 }}
							exit={{ scale: 0.95, y: 20, opacity: 0 }}
							transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
							className="relative w-full max-w-[1000px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row"
						>
							{/* Skip Button */}
							<button
								onClick={closePopup}
								className="absolute top-4 right-4 md:top-6 md:right-6 z-50 text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full transition-all flex items-center gap-2"
							>
								Skip <ArrowRight className="w-3 h-3" />
							</button>

							{/* Left Side: Brand & Image */}
							<div className="relative w-full md:w-5/12 p-8 md:p-12 flex flex-col justify-between min-h-[250px] md:min-h-full overflow-hidden">
								<Image src={project1} alt="Architecture" fill className="object-cover opacity-80" />
								<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
								<div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />

								<div className="relative z-10">
									<span className="inline-block px-3 py-1 mb-6 border border-white/30 bg-white/10 rounded-full text-white text-[9px] uppercase font-bold tracking-[0.3em] backdrop-blur-md">
										Urban Landscape
									</span>
								</div>

								<div className="relative z-10 mt-auto">
									<h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
										Shape the <br /> <span className="font-serif italic font-light text-neutral-300">future</span> of living.
									</h2>
									<p className="text-neutral-400 text-xs leading-relaxed max-w-[250px]">
										Select your path and discover a tailored experience crafted for your unique journey in construction.
									</p>
								</div>
							</div>

							{/* Right Side: Options */}
							<div className="w-full md:w-7/12 p-8 md:p-12 bg-[#0a0a0a]/90 flex flex-col justify-center relative">
								{/* Glowing Orbs */}
								<div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
								<div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

								<div className="relative z-10 space-y-8 mt-4 md:mt-0">
									<div>
										<h3 className="text-2xl font-bold text-white mb-2">Who Are You?</h3>
										<p className="text-neutral-400 text-xs md:text-sm">Join our ecosystem of builders, creators, and visionaries.</p>
									</div>

									<div className="space-y-4">
										{/* Option 1: Client */}
										<Link href="/join/client" onClick={closePopup} className="group block relative p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
											<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
											<div className="relative flex items-center justify-between z-10">
												<div className="flex items-center gap-4 md:gap-5">
													<div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shrink-0">
														<Users className="w-4 h-4 md:w-5 md:h-5" />
													</div>
													<div>
														<h4 className="text-white font-bold text-sm md:text-base mb-1 group-hover:text-primary transition-colors">Continue as a Client</h4>
														<p className="text-neutral-500 text-[10px] md:text-xs max-w-[280px] leading-relaxed group-hover:text-neutral-300 transition-colors">
															Discover professionals, get estimates, and build your dream project.
														</p>
													</div>
												</div>
												<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0 ml-4">
													<ArrowRight className="w-3 h-3 md:w-4 md:h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
												</div>
											</div>
										</Link>

										{/* Option 2: Professional */}
										<Link href="/join/contractor" onClick={closePopup} className="group block relative p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
											<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
											<div className="relative flex items-center justify-between z-10">
												<div className="flex items-center gap-4 md:gap-5">
													<div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500 shrink-0">
														<Building2 className="w-4 h-4 md:w-5 md:h-5" />
													</div>
													<div>
														<h4 className="text-white font-bold text-sm md:text-base mb-1 group-hover:text-blue-400 transition-colors">Join as a Professional</h4>
														<p className="text-neutral-500 text-[10px] md:text-xs max-w-[280px] leading-relaxed group-hover:text-neutral-300 transition-colors">
															Grow your business, find quality leads, and showcase your portfolio.
														</p>
													</div>
												</div>
												<div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shrink-0 ml-4">
													<ArrowRight className="w-3 h-3 md:w-4 md:h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
												</div>
											</div>
										</Link>
									</div>

									<div className="text-center pt-2">
										<p className="text-[9px] md:text-[10px] text-neutral-600 uppercase tracking-widest font-medium">Building connections. Creating possibilities.</p>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			{/* PREMIUM SIDE NAVIGATION */}
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: showNav ? 1 : 0, x: showNav ? 0 : 20 }}
				transition={{ duration: 0.8, ease: "circOut" }}
				onMouseEnter={() => setShowNav(true)}
				onMouseLeave={triggerNav}
				className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100]"
			>
				{/* Glass Pill Container */}
				<div className="relative py-6 px-2.5 md:px-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-center gap-4 md:gap-5 mix-blend-difference">

					{/* Background Line */}
					<div className="absolute top-6 bottom-6 w-[2px] bg-white/20 rounded-full" />

					{/* Active Progress Line */}
					<motion.div
						className="absolute top-6 w-[2px] bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] z-0 origin-top"
						initial={{ height: 0 }}
						animate={{ height: `${(activeIndex / SECTIONS_COUNT) * 100}%` }}
						transition={{ duration: 0.6, ease: "easeInOut" }}
					/>

					{[...Array(SECTIONS_COUNT + 1)].map((_, i) => (
						<button
							key={i}
							onClick={() => scrollToSection(i)}
							className="group relative flex items-center justify-center w-8 h-8 rounded-full z-10 focus:outline-none"
						>
							{/* Outer Ring for Active */}
							{activeIndex === i && (
								<motion.div
									layoutId="activeNavRing"
									className="absolute inset-0 rounded-full border border-white/50"
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
									transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
								/>
							)}

							{/* Dot Indicator */}
							<motion.div
								animate={{
									scale: activeIndex === i ? 1 : 0.5,
									backgroundColor: activeIndex === i ? "#ffffff" : "#a3a3a3",
								}}
								className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${activeIndex === i
									? "shadow-[0_0_10px_rgba(255,255,255,1)]"
									: "opacity-50 group-hover:opacity-100 group-hover:scale-75"
									}`}
							/>

							{/* Label Tooltip */}
							<div className="absolute right-12 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none hidden md:flex items-center gap-3">
								<span className="px-4 py-2 bg-white/90 backdrop-blur-md text-black text-[10px] uppercase tracking-[0.3em] font-black rounded-lg shadow-xl whitespace-nowrap">
									{["Introduction", "Discovery", "Excellence", "Portfolio", "Process", "Testimonials", "Engagement", "Finish"][i]}
								</span>
								<div className="h-[2px] w-4 bg-white/50 rounded-full" />
							</div>
						</button>
					))}
				</div>
			</motion.div>

			<div onMouseMove={triggerNav} className="fixed right-0 top-0 bottom-0 w-24 z-[99] pointer-events-auto hidden md:block" />

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
						<div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.4)] to-[rgba(0,0,0,0.55)]" />
					</motion.div>

					<div className="relative z-10 text-center space-y-8 max-w-4xl w-full flex flex-col items-center mt-12 px-4">
						<div className="space-y-6">
							<motion.h1
								initial={{ y: 30, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 1, ease: "easeOut" }}
								className="text-6xl sm:text-8xl lg:text-[7vw] font-bold text-white uppercase tracking-tighter leading-none drop-shadow-2xl"
							>
								URBAN <span className="font-serif italic capitalize drop-shadow-2xl font-light">Landscape</span>
							</motion.h1>
						</div>

						<motion.div
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
							className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6"
						>
							<Link href="/join/client" className="w-full sm:w-auto px-8 py-3.5 bg-white text-black rounded-full hover:bg-neutral-200 transition-all shadow-xl hover:shadow-2xl flex items-center justify-between sm:justify-center gap-6 group">
								<div className="flex flex-col items-start text-left">
									<span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5">Client Portal</span>
									<span className="font-bold uppercase tracking-widest text-xs">Continue as a Client</span>
								</div>
								<div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
									<ArrowRight className="w-4 h-4" />
								</div>
							</Link>
							<Link href="/join/contractor" className="w-full sm:w-auto px-8 py-3.5 bg-black/30 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-between sm:justify-center gap-6 group">
								<div className="flex flex-col items-start text-left">
									<span className="text-[9px] uppercase tracking-widest text-white/70 group-hover:text-neutral-500 font-bold mb-0.5">Professional Portal</span>
									<span className="font-bold uppercase tracking-widest text-xs">Join as a Professional</span>
								</div>
								<div className="w-8 h-8 rounded-full bg-white text-black group-hover:bg-black group-hover:text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
									<ArrowRight className="w-4 h-4" />
								</div>
							</Link>
						</motion.div>
					</div>

					<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
						<span className="text-white/40 text-[9px] uppercase tracking-widest">Scroll to explore</span>
						<motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
							<ChevronDown className="text-white w-5 h-5 opacity-70" />
						</motion.div>
					</div>
				</section>

				{/* 2. PROPERTY SEARCH */}
				<section className="w-full h-screen relative overflow-hidden bg-black">
					{featuredProjects.length > 0 ? (
						<HeroCarousel 
							data={featuredProjects.map((p) => ({
								title: p.name,
								subtitle: p.city || "Location",
								description: p.work || "Signature Project",
								image: p.image || project2.src,
								link: "/projects"
							}))} 
						/>
					) : (
						<div className="w-full h-full flex flex-col items-center justify-center text-white/50">
							<p className="text-xs uppercase tracking-widest font-bold">Loading Projects...</p>
						</div>
					)}
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
				<section className="w-full h-screen bg-white relative overflow-hidden">
					<motion.div
						initial="initial"
						animate={activeIndex === 3 ? "whileInView" : "initial"}
						className="w-full h-full"
					>
						<ArchitectPortfolio projects={allProjects} />
					</motion.div>
				</section>

				{/* 5. PROCESS */}
				<section className="w-full h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 md:px-24 relative overflow-hidden text-white">
					{/* Dark sleek background */}
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-black to-black z-0" />
					
					<motion.div
						initial="initial"
						animate={activeIndex === 4 ? "whileInView" : "initial"}
						className="max-w-[1600px] w-full relative z-10 space-y-16"
					>
						<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/10 pb-8">
							<div className="space-y-4">
								<motion.div variants={fadeInRight} className="flex items-center gap-3">
									<div className="w-8 h-[1px] bg-primary" />
									<span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em]">Methodology</span>
								</motion.div>
								<motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none">
									The Building <br /><span className="text-neutral-500 italic font-serif">Process</span>.
								</motion.h2>
							</div>
							<motion.p variants={fadeInUp} className="text-neutral-400 text-sm md:text-base max-w-sm font-medium leading-relaxed">
								A seamless, transparent journey from your first sketch to the final legacy handover.
							</motion.p>
						</div>

						<motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 relative">
							{/* Connecting Line */}
							<div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent hidden md:block -translate-y-1/2" />

							{[
								{ icon: <Handshake />, title: "Discovery", desc: "Initial design consultation & requirements gathering.", num: "01" },
								{ icon: <House />, title: "Visualization", desc: "Detailed 3D architectural renders & blueprints.", num: "02" },
								{ icon: <TabletSmartphone />, title: "Precision", desc: "Real-time construction tracking & updates.", num: "03" },
								{ icon: <Key />, title: "Handover", desc: "Seamless delivery of your dream legacy.", num: "04" }
							].map((item, i) => (
								<motion.div key={i} variants={fadeInUp} className={`relative group ${i % 2 === 0 ? "md:-translate-y-8" : "md:translate-y-8"}`}>
									<div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-primary/50 transition-colors duration-500 hover:bg-white/10 relative overflow-hidden min-h-[280px] flex flex-col justify-end shadow-2xl">
										
										{/* Giant Background Number */}
										<span className="absolute top-4 right-6 text-[8rem] font-black text-white/[0.02] select-none tracking-tighter group-hover:text-white/[0.05] transition-colors duration-500">
											{item.num}
										</span>

										<div className="relative z-10 space-y-6">
											<div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-primary backdrop-blur-md border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl">
												{React.cloneElement(item.icon, { className: "w-6 h-6" })}
											</div>
											<div>
												<h4 className="text-2xl font-bold tracking-tight mb-2 text-white">{item.title}</h4>
												<p className="text-neutral-400 text-xs md:text-sm leading-relaxed">{item.desc}</p>
											</div>
										</div>
									</div>

									{/* Node Point on the connecting line */}
									<div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(200,160,100,0.8)] hidden md:block ${i % 2 === 0 ? "-bottom-10 translate-y-[5px]" : "-top-10 -translate-y-[5px]"}`} />
								</motion.div>
							))}
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
