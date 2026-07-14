"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroCarousel({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play logic
  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % data.length);
  const handlePrev = () => setActiveIndex((prev) => (prev === 0 ? data.length - 1 : prev - 1));

  if (!data || data.length === 0) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      
      {/* BACKGROUND LAYER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* We use img here for absolute reliability with external URLs */}
          <img 
            src={data[activeIndex]?.image} 
            alt={data[activeIndex]?.title} 
            className="w-full h-full object-cover" 
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* LEFT SIDE: TEXT DETAILS */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 pt-20 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              {data[activeIndex]?.subtitle && (
                <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                  <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
                    {data[activeIndex].subtitle}
                  </span>
                </div>
              )}
              
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl">
                {data[activeIndex]?.title}
              </h1>
              
              <p className="text-lg md:text-xl text-neutral-300 max-w-xl font-medium leading-relaxed drop-shadow-md">
                {data[activeIndex]?.description}
              </p>

              {data[activeIndex]?.link && (
                <div className="pt-4">
                  <Link 
                    href={data[activeIndex].link} 
                    className="inline-flex items-center gap-4 px-8 py-4 bg-white text-black rounded-full font-bold uppercase text-xs tracking-widest hover:bg-neutral-200 transition-colors shadow-xl group"
                  >
                    Explore Project
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE: PREVIEW CARDS */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-center items-end h-full relative z-20">
          <div className="flex items-center gap-4 h-[400px]">
            {data.slice(0, 4).map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <motion.div
                  key={idx}
                  layout
                  onClick={() => setActiveIndex(idx)}
                  className={`relative cursor-pointer rounded-[1.25rem] overflow-hidden shadow-2xl border border-white/20 transition-all duration-500 group ${
                    isActive ? "w-[240px] h-full" : "w-[120px] h-[70%] opacity-60 hover:opacity-100"
                  }`}
                  whileHover={!isActive ? { scale: 1.05 } : {}}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  
                  {/* Glassmorphism gradient over cards */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                  
                  {/* Small play/arrow icon top right */}
                  {!isActive && (
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-white -rotate-45" />
                    </div>
                  )}

                  {/* Active Card Text */}
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute bottom-6 left-6 right-6 text-white"
                    >
                      <h4 className="text-xl font-bold tracking-tight mb-1">{item.title}</h4>
                      {item.subtitle && <p className="text-[9px] uppercase tracking-widest text-white/70">{item.subtitle}</p>}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* CONTROLS */}
          <div className="absolute bottom-20 right-0 flex items-center gap-6">
            <div className="flex gap-2">
              {data.slice(0, 4).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl hover:-translate-x-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl hover:translate-x-1"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
