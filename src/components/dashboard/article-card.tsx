"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface ArticleCardProps {
  title: string;
  image_url: string;
}

export function ArticleCard({ title, image_url }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-3xl p-3 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all group cursor-pointer border border-white">
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden">
        <Image 
          src={image_url} 
          alt={title} 
          fill 
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <div className="flex items-center justify-between px-1 pb-1">
        <h4 className="font-bold text-brand-dark group-hover:text-brand-green transition-colors">{title}</h4>
        <ChevronRight className="w-5 h-5 text-brand-dark/20 group-hover:text-brand-green transition-colors" />
      </div>
    </div>
  );
}
