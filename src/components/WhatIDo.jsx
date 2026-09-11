import { motion, useReducedMotion } from "framer-motion"
import { links } from "../data/links"

const blocks = [
  {
    tag: "01",
    title: "Instrumentation & Control",
    body: "B.Tech at COEP Technological University, plus an internship at Seiton Technologies building out an industrial control panel — P&IDs, SLDs, PLC/HMI selection, FAT. The same instincts that read a signal off a sensor are the ones I use to read a chart: flat until it isn't, then you look for why.",
    href: links.linkedin,
    linkLabel: "linkedin.com/in/shantanu-somwanshi",
  },
  {
    tag: "02",
    title: "The compounding newsletter",
    body: "A running record of what actually happens when you let money sit for decades — SIPs, step-ups, panic-selling, the maths of Rule of 72. Every issue ships with the Python behind it, in the open. I'm also a CFA Level I candidate.",
    href: links.newsletter,
    linkLabel: "shantanusomwanshi.substack.com",
  },
  {
    tag: "03",
    title: "Building software",
    body: "QueLessly is a live QR-ordering and digital payments platform I built and deployed — real UPI transactions, webhook-verified Razorpay integration, reconciliation-ready schema. Financial data integrity isn't theoretical when real money moves through it.",
    href: links.quelessly,
    linkLabel: "quelessly.com",
  },
]

export default function WhatIDo() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="what-i-do" className="border-t hr-line px-6 py-24 sm:px-10 lg:px-16">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-12 font-mono text-sm text-teal"
      >
        what I do
      </motion.p>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {blocks.map((b, i) => (
          <motion.div
            key={b.tag}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : i * 0.08, ease: "easeOut" }}
            className="border-t hr-line pt-6"
          >
            <span className="font-mono text-xs text-paper/40">{b.tag}</span>
            <h3 className="mt-2 font-display text-2xl font-medium text-paper">{b.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-paper/70">{b.body}</p>
            <a
              href={b.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block font-mono text-xs text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {b.linkLabel}
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
