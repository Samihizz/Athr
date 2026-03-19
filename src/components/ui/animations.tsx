"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState, type ReactNode } from "react";

/* ─── FadeIn ───────────────────────────────────────────────────────── */
// Fades in + slides up when the element scrolls into view.

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 24,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : prefersReduced
            ? { opacity: 1 }
            : { opacity: 0, y }
      }
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── StaggerChildren ──────────────────────────────────────────────── */
// Wraps children so each one animates in sequence.

type StaggerChildrenProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
};

const staggerContainer = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const staggerItemReduced = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={{ stagger, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={prefersReduced ? staggerItemReduced : staggerItem}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── ScaleOnHover ─────────────────────────────────────────────────── */
// Subtle scale + shadow lift on hover.

type ScaleOnHoverProps = {
  children: ReactNode;
  className?: string;
  scale?: number;
};

export function ScaleOnHover({
  children,
  className,
  scale = 1.02,
}: ScaleOnHoverProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={
        prefersReduced
          ? {}
          : { scale, y: -2, transition: { duration: 0.2, ease: "easeOut" } }
      }
      whileTap={prefersReduced ? {} : { scale: 0.98 }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── SlideIn ──────────────────────────────────────────────────────── */
// Slides in from left or right on scroll.

type SlideInProps = {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
  delay?: number;
  duration?: number;
};

export function SlideIn({
  children,
  className,
  direction = "left",
  delay = 0,
  duration = 0.5,
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();
  const x = direction === "left" ? -40 : 40;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x }}
      animate={
        isInView
          ? { opacity: 1, x: 0 }
          : prefersReduced
            ? { opacity: 1 }
            : { opacity: 0, x }
      }
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── CountUp ──────────────────────────────────────────────────────── */
// Animates a number from 0 to the target value when in view.

type CountUpProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

export function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(prefersReduced ? value : 0);

  useEffect(() => {
    if (!isInView || prefersReduced) {
      if (prefersReduced) setDisplay(value);
      return;
    }

    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, prefersReduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ─── PageFadeIn ───────────────────────────────────────────────────── */
// Simple whole-page fade in for page transitions.

export function PageFadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
