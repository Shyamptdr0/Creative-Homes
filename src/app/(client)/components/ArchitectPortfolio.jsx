"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ArchitectPortfolio({ projects = [] }) {
  const [activeArchitect, setActiveArchitect] = useState("");
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Group projects by architect
  const architectsData = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      const name = p.architectName?.trim() || "Creative Studio";
      if (!map[name]) map[name] = [];
      map[name].push(p);
    });

    // Sort architects by number of projects descending, keep top 5
    const sorted = Object.entries(map)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([name, projs]) => ({ name, projects: projs }));

    return sorted;
  }, [projects]);

  // Set initial active architect
  useEffect(() => {
    if (architectsData.length > 0 && !activeArchitect) {
      setActiveArchitect(architectsData[0].name);
    }
  }, [architectsData, activeArchitect]);

  // Update draggable constraints
  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.scrollWidth - sliderRef.current.offsetWidth);
    }
  }, [activeArchitect, architectsData]);

  const activeProjects = useMemo(() => {
    const found = architectsData.find((a) => a.name === activeArchitect);
    return found ? found.projects : [];
  }, [activeArchitect, architectsData]);

  if (architectsData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-400">
        <p className="text-[10px] uppercase font-bold tracking-widest">No signature projects found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-center py-12 md:py-20 overflow-hidden bg-white">
      
      {/* MASSIVE BACKGROUND WATERMARK */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeArchitect}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0"
        >
          <h2 className="text-[10vw] md:text-[12vw] font-black tracking-tighter text-neutral-50 whitespace-nowrap opacity-60 uppercase select-none">
            {activeArchitect}
          </h2>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col h-full">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <span className="text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.4em]">Curated Works</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-none text-neutral-900">
              Signature <br />
              <span className="text-neutral-400 italic font-serif">Masterworks</span>.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 p-2 bg-neutral-100 rounded-[2rem] border border-neutral-200">
            {architectsData.map((arch) => {
              const isActive = arch.name === activeArchitect;
              return (
                <button
                  key={arch.name}
                  onClick={(e) => { e.stopPropagation(); setActiveArchitect(arch.name); }}
                  className={`relative px-6 py-3 rounded-full text-xs md:text-sm font-bold tracking-wide transition-colors duration-300 ${
                    isActive ? "text-white" : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeArchitectPill"
                      className="absolute inset-0 bg-neutral-900 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{arch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PROJECTS DRAG SLIDER */}
        <div className="relative flex-1 min-h-0 overflow-hidden" ref={sliderRef}>
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -sliderWidth }}
            className="flex gap-6 md:gap-10 h-full items-center cursor-grab active:cursor-grabbing px-4"
          >
            <AnimatePresence mode="popLayout">
              {activeProjects.map((project, idx) => (
                <motion.div
                  key={`${activeArchitect}-${project.id || idx}`}
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                  className="relative min-w-[300px] w-[80vw] sm:w-[400px] md:min-w-[500px] h-[350px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] group flex-shrink-0"
                >
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    draggable="false"
                  />
                  
                  {/* Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" pointerEvents="none" />
                  
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-primary mb-2">
                        {project.work || "Project"}
                      </p>
                      <h4 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">
                        {project.name}
                      </h4>
                      <p className="text-xs text-white/70 tracking-widest uppercase">
                        {project.city || "Location"}
                      </p>
                    </div>

                    <Link
                      href="/projects"
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-primary transition-colors shrink-0"
                    >
                      <ArrowRight className="w-5 h-5 -rotate-45" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* DRAG INSTRUCTION */}
        <div className="flex justify-center items-center gap-4 mt-8 opacity-50 pointer-events-none">
          <ArrowLeft className="w-4 h-4" />
          <p className="text-[10px] uppercase font-bold tracking-widest">Drag to explore</p>
          <ArrowRight className="w-4 h-4" />
        </div>

      </div>
    </div>
  );
}
