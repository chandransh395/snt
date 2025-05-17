
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

// Base animation classes that can be composed
export const fadeIn = "animate-fade-in";
export const fadeOut = "animate-fade-out";
export const slideUp = "animate-slide-up";
export const scaleIn = "scale-in";
export const scaleOut = "scale-out";

// Animation variants for consistent use across components
export const animationVariants = {
  fadeIn: {
    initial: "opacity-0",
    animate: "opacity-100 transition-opacity duration-300 ease-in-out",
  },
  slideUp: {
    initial: "opacity-0 translate-y-4",
    animate: "opacity-100 translate-y-0 transition-all duration-300 ease-out",
  },
  scale: {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100 transition-all duration-200 ease-out",
  },
};

// Hover animation classes
export const hoverAnimations = {
  scale: "transition-transform duration-200 hover:scale-105",
  lift: "transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
  glow: "transition-all duration-200 hover:shadow-md hover:shadow-primary/25",
  pulse: "hover:animate-pulse",
};

// Helper function to apply animation classes with other classes
export function withAnimation(
  baseClasses: ClassValue,
  animation: keyof typeof hoverAnimations | string
): string {
  const animationClass = typeof animation === "string" && animation in hoverAnimations 
    ? hoverAnimations[animation as keyof typeof hoverAnimations]
    : animation;
    
  return cn(baseClasses, animationClass);
}
