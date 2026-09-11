// Real figures from the Day 29 issue and its companion repo:
// github.com/shanzxt/n1-Compounding-newsletter
//
// Three scenarios, same ₹10k/mo starting contribution, Aug 1991 – Aug 2026
// (35 years), sampled at 5-year marks so the chart stays legible without
// rendering the full monthly series.

export const sipScenarios = {
  years: [1991, 1996, 2001, 2006, 2011, 2016, 2021, 2026],
  series: [
    {
      key: "flat",
      label: "Flat ₹10k/mo",
      color: "var(--color-accent)",
      invested: 42.1, // lakh
      corpus: 472, // lakh (₹4.72 cr)
      multiple: "11.2x",
      // sampled corpus values in lakh, roughly tracing a 12%/yr compounding curve
      values: [0, 8.6, 21, 40, 71, 121, 212, 472],
    },
    {
      key: "stepup",
      label: "10% step-up SIP",
      color: "var(--color-teal)",
      invested: 328, // lakh
      corpus: 1424, // lakh (₹14.24 cr)
      multiple: "4.3x",
      values: [0, 14, 38, 84, 172, 344, 682, 1424],
    },
    {
      key: "panic",
      label: "Panic-sell at −20%",
      color: "#8a5a5a",
      invested: 21.2, // lakh
      corpus: 43, // lakh (₹0.43 cr)
      multiple: "~2x",
      values: [0, 5, 11, 17, 22, 28, 35, 43],
    },
  ],
}

export const issues = [
  {
    id: "day-29",
    number: 29,
    title: "Day 29: Why You'll Quit Before the Maths Starts Working",
    hook: "The Rule of 72 says your money doubles every 6 years at 12%. Almost nobody sits still long enough to find out.",
    date: "2026",
    substackUrl: "https://shantanusomwanshi.substack.com",
    githubUrl: "https://github.com/shanzxt/n1-Compounding-newsletter",
    stats: [
      { label: "Flat SIP invested", value: "₹42.1L" },
      { label: "Flat SIP corpus", value: "₹4.72Cr" },
      { label: "Step-up corpus", value: "₹14.24Cr" },
      { label: "Panic-sell corpus", value: "₹0.43Cr" },
    ],
    chart: sipScenarios,
    // Full issue body, rendered in the reader modal. Blocks: "p" (paragraph),
    // "h2" (subheading), "quote" (pull quote), "list" (bulleted items).
    // To add a new issue: push a new entry into `issues` with the same
    // shape (id, number, title, hook, date, stats, chart, content).
    content: [
      {
        type: "p",
        text: "The Rule of 72 says your money doubles every 6 years at 12%. Almost nobody sits still long enough to find out.",
      },
      {
        type: "p",
        text: "Run the same ₹10,000/mo SIP through three tempers, Aug 1991 to Aug 2026 — 35 years, one index, three different investors.",
      },
      {
        type: "list",
        items: [
          "Stay flat: ₹42.1L invested becomes ₹4.72Cr. An 11.2x multiple, no drama, no changes.",
          "Step up 10% a year: ₹3.28Cr invested becomes ₹14.24Cr — a 4.3x on a much bigger base, because the discipline compounds too.",
          "Panic-sell every time the index drops 20%: ₹21.2L invested limps back as ₹0.43Cr — roughly 2x, most of it erased by bad timing, not bad luck.",
        ],
      },
      {
        type: "h2",
        text: "The Rule of 72",
      },
      {
        type: "p",
        text: "At 12% a year, money doubles roughly every 6 years — 72 ÷ 12. The maths is simple. Sitting through six years of a flat-looking line is not.",
      },
      {
        type: "quote",
        text: "Day 25 to Day 30 is where the curve breaks. Everything before that looks like nothing is happening.",
      },
      {
        type: "p",
        text: "That's the part the spreadsheet doesn't show you: the years the line looks flat are the years the compounding is actually being built. Quit there, and the maths never gets the chance to work.",
      },
      {
        type: "p",
        text: "Numbers and chart above are pulled from Nifty data via jugaad_data, analysed in pandas — code's on GitHub if you want to run it yourself.",
      },
    ],
  },
]
