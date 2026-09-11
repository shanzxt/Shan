export const projects = [
  {
    title: "QueLessly",
    role: "QR-based food ordering & digital payments platform",
    body: "A production platform processing live UPI payments for college canteens — no app download required. Razorpay integration with dual confirmation (frontend + webhook) and idempotency guards, HMAC signature verification, JWT auth, and a reconciliation-ready transaction schema.",
    href: "https://quelessly.com",
    repoHref: null,
    tags: ["Next.js", "Node.js", "PostgreSQL", "Socket.io", "Razorpay"],
  },
  {
    title: "Finance Newsletter",
    role: "Writer & data engineer",
    body: "Personal finance and investing newsletter — SIPs, compounding, market behaviour. Every issue's analysis — pandas, matplotlib/plotly, jugaad_data for Nifty pulls — ships publicly.",
    href: "https://shantanusomwanshi.substack.com",
    repoHref: "https://github.com/shanzxt/n1-Compounding-newsletter",
    tags: ["Python", "pandas", "jugaad_data"],
  },
  {
    title: "PID Line Follower Robot",
    role: "Control systems, from scratch",
    body: "A full PID control loop written in C for an autonomous line-following robot — tuned gains through Proteus simulation and hardware testing, with integral anti-windup to stop the accumulated-error spiral.",
    href: null,
    repoHref: null,
    tags: ["C", "Arduino UNO", "Proteus", "L298N"],
  },
  {
    title: "Eshani Somwanshi — Portfolio",
    role: "Built for my sister",
    body: "A portfolio site for Eshani, a product designer — warm, minimal, built to her register rather than mine.",
    href: "https://eshanisomwanshi.com",
    repoHref: "https://github.com/shanzxt/EshaniWebsite",
    tags: ["Vite", "React", "Framer Motion"],
  },
]
