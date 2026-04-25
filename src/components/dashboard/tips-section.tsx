"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import NextImage from 'next/image';

const ARTICLES = [
  {
    id: 'propagation',
    title: 'Propagation Tips',
    image: 'https://images.unsplash.com/photo-1585829319212-0a19af8e37d1?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'low-light',
    title: 'Low Light Plants',
    image: 'https://images.unsplash.com/photo-1597055181300-e3633a207519?auto=format&fit=crop&q=80&w=800',
  }
];

/**
 * GrowKeeper Tips & Articles section.
 * Refined for Industrial Hardening (Block 3) - Removed inline styles.
 */
export function TipsSection() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-base font-bold text-slate-800">Tips &amp; Articles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ARTICLES.map((article) => (
          <motion.button
            key={article.id}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative h-48 rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-end p-6 text-left"
          >
            {/* Background Image - Using Next/Image for performance and lint compliance */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
              <NextImage 
                src={article.image} 
                alt={article.title} 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-black text-white tracking-tight">
                {article.title}
              </span>
              <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white group-hover:bg-white group-hover:text-black transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
