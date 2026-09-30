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
    number: 1,
    title: "Day 29: Why You'll Quit Before the Maths Starts Working",
    hook: "Everyone quits on Day 28. This is a newsletter for Day 29 people.",
    date: "Sep 6, 2026",
    readingTime: "8 min read",
    coverImage: "/newsletter/day29-reveal-chart.png",
    substackUrl: "https://shantanusomwanshi.substack.com",
    githubUrl: "https://github.com/shanzxt/n1-Compounding-newsletter",
    stats: [
      { label: "Flat SIP invested", value: "₹42.1L" },
      { label: "Flat SIP corpus", value: "₹4.72Cr" },
      { label: "Step-up corpus", value: "₹14.24Cr" },
      { label: "Panic-sell corpus", value: "₹0.43Cr" },
    ],
    chart: sipScenarios,
    // Full issue body, rendered in the reader modal, matching the Substack
    // post word-for-word. Blocks: "p" (paragraph, supports **bold** and
    // *italic*), "h2" (subheading), "quote" (pull quote), "list" (bulleted
    // items, same inline formatting as "p"), "image" (src/alt/caption,
    // images live in /public/newsletter).
    // To add a new issue: push a new entry into `issues` with the same
    // shape (id, number, title, hook, date, stats, chart, content).
    content: [
      { type: "p", text: "A lotus grows in a pond. It doubles in size every single day. On Day 30, it covers the pond completely." },
      { type: "p", text: "Question for you: on which day was the pond half covered?" },
      { type: "p", text: "Day 29. You knew that one - it's the famous version of the riddle." },
      { type: "p", text: "So here's the better question. On which day was the pond **3% covered**?" },
      { type: "p", text: "Day 25." },
      {
        type: "p",
        text: "Think about that for a minute. For five-sixths of the lotus's life, a man standing at the edge of that pond would have told you nothing was happening. Twenty-five days of a nearly empty pond. Then, in the last five days, the entire growth took place.",
      },
      {
        type: "p",
        text: "Nobody quits on Day 29. They quit on Day 14, when the pond is 0.0015% covered and they've been staring at it for a fortnight.",
      },
      {
        type: "p",
        text: "Our human intuition is linear, whereas wealth creation is exponential, and the gap between those two is where almost everyone loses their money.",
      },

      { type: "h2", text: "The maths, in one line" },
      {
        type: "p",
        text: "Here's the shortcut: at 12% a year, money roughly doubles every 6 years — that's the Rule of 72 (72 ÷ 12 = 6). So a lump sum left alone for 30 years isn't \"30 years of growth.\" It's **five doublings**. And here's the part nobody tells you: the fifth doubling is worth more than the first four put together.",
      },
      { type: "p", text: "That's the riddle in the abstract. Here's what it looks like in real money." },
      {
        type: "p",
        text: "I ran a ₹10,000-a-month SIP against the actual Nifty 50, every month from August 1991 to August 2026. Thirty-five years. It finished at ₹4.72 crore.",
      },
      {
        type: "p",
        text: "Now the part that should stop you. Twenty-seven years in — 2018 — that portfolio was worth ₹2.19 crore. Less than half of what it would eventually be. By then you'd already made three-quarters of every payment you were ever going to make.",
      },
      {
        type: "p",
        text: "That last quarter of the payments overlapped with 53% of the final value arriving. And 31% of the entire final value arrived in just the last five years.",
      },
      {
        type: "p",
        text: "A SIP isn't quite the pond, because you keep feeding it. But the shape is the same: the money goes in evenly, and the value shows up at the end.",
      },
      {
        type: "p",
        text: "And stepping up your contributions doesn't rescue you from the wait. The 10% step-up version put in eight times more money and landed in exactly the same shape — 37% of its final value arrived in the last five years alone. Feeding the machine more doesn't make the quiet years shorter. It just makes the reveal bigger.",
      },
      {
        type: "image",
        src: "/newsletter/day29-reveal-chart.png",
        width: 1800,
        height: 1800,
        alt: "Two line charts showing a flat SIP and a 10% step-up SIP both staying near zero for years before growing sharply at the end.",
        caption:
          "Flat SIP vs 10% step-up, Nifty 50, Aug 1991–Aug 2026. Both cross 3% of their final value early — 8 years in and 12 years in — then spend the remaining decades doing almost all of the work. 31% and 37% of the final value arrives in the last five years.",
      },

      { type: "h2", text: "So why doesn't everyone just wait?" },
      { type: "p", text: "Because waiting is the hard part. Not the investing. Not the maths. The waiting." },
      {
        type: "p",
        text: "Here's the data. Every year, AMFI publishes a breakdown of how long the money sitting in SIPs has actually been sitting there. Not how long it could stay. How long it has.",
      },
      {
        type: "p",
        text: "As of March 2026, only 34% of the money in regular-plan SIPs had been invested for more than five years. For direct plans — the ones investors manage themselves — it was 20%. Meanwhile, 29% of all direct-plan SIP money was less than a year old.",
      },
      { type: "p", text: "The pond doesn't quit. The gardener does." },
      {
        type: "image",
        src: "/newsletter/day29-sip-holding-period.png",
        width: 2400,
        height: 1440,
        alt: "Stacked bar chart comparing how long direct-plan and regular-plan SIP money has been invested.",
        caption:
          "Source: AMFI Annual Report, Fiscal 2026 — holding period of SIP AUM as of March 2026. Each column sums to 100%.",
      },
      {
        type: "p",
        text: "Now look at the gap between those two columns, because it points at something most people get backwards.",
      },
      {
        type: "p",
        text: "Direct plans exist so you don't pay a distributor a commission. No middleman, no advisory fee, more of your return stays yours. On paper, the direct investor should end up richer.",
      },
      {
        type: "p",
        text: "But direct-plan money is consistently younger. Some of that is simply because direct plans are newer — they've only existed since 2013, and India's count of contributing SIP accounts grew by a net 1.6 crore last year alone, so a lot of that \"less than a year old\" money is genuinely new rather than about to be pulled out. I don't want to overclaim here. Worth one more caveat: this is a share of assets, not of investors. Money invested six years ago has grown since, which inflates the \"5+ years\" bucket on its own.",
      },
      {
        type: "p",
        text: "What the data does say plainly is this: the plan that costs you less is not, on the evidence, the plan people hold longer. **The cheapest plan is worthless if you don't stay in it.**",
      },
      {
        type: "p",
        text: "That's the part nobody tells you when they sell you on \"direct is better.\" Direct is better — for someone who was staying anyway. For everyone else, it's a small, real saving that funds a much larger, invisible loss.",
      },

      { type: "h2", text: "What quitting actually costs" },
      { type: "p", text: "So I ran two more versions of the same SIP." },
      { type: "p", text: "One increased the monthly amount by 10% every year — the step-up. It finished at ₹14.24 crore." },
      {
        type: "p",
        text: "The other panicked. Every time the Nifty fell 20% from its high, it sold everything and sat in cash, waiting to feel safe again, only buying back in when the index hit a new all-time high. It finished at ₹0.43 crore.",
      },
      {
        type: "image",
        src: "/newsletter/day29-sip-portfolio.png",
        width: 2400,
        height: 1520,
        alt: "Line chart comparing step-up SIP, flat SIP, and a panic-selling SIP over 35 years.",
        caption:
          "Three versions of the same SIP. Step-up ₹14.24 crore on ₹3.28 crore invested; flat ₹4.72 crore on ₹42.1 lakh; panic-seller ₹0.43 crore on ₹21.2 lakh. Selling at every −20% drawdown cost ₹4.29 crore against simply staying in.",
      },
      { type: "p", text: "Two honest caveats, because I'd rather you trust the numbers than be impressed by them." },
      {
        type: "p",
        text: "First, the panic investor didn't just sell — they also stopped contributing while they were out. They put in ₹21.2 lakh against the flat SIP's ₹42.1 lakh. So the gap between those lines isn't purely the cost of panicking; a chunk of it is simply investing less. The honest comparison: **the flat SIP turned ₹42 lakh into ₹4.72 crore, an 11x multiple. The panicker turned ₹21 lakh into ₹43 lakh — barely 2x, across thirty-five years. After inflation, that's close to standing still.**",
      },
      {
        type: "p",
        text: "Second, nobody actually follows a written rule to sell at −20%. They just quietly stop the SIP and never restart it. This model isn't a strategy. It's a model of an emotion.",
      },
      {
        type: "p",
        text: "One more thing on the step-up, since the headline number is misleading. Yes, ₹14.24 crore beats ₹4.72 crore — but it invested ₹3.28 crore to get there, a 4.3x multiple, versus the flat SIP's 11.2x. The flat SIP earned *more per rupee* because its rupees arrived earlier and got more doublings. The step-up won on absolute rupees because it fed the machine more.",
      },
      { type: "p", text: "Both of them destroyed the one that quit. That's the only comparison that really matters." },

      { type: "h2", text: "Why you're not going to be that person" },
      { type: "p", text: "Look at that chart one more time." },
      {
        type: "p",
        text: "Notice what the two winning lines didn't require. No stock picking. No timing. No opinion on rates, elections, or the rupee. Neither of them did anything clever. They did exactly one thing the third line didn't:",
      },
      { type: "p", text: "They were still there." },
      {
        type: "p",
        text: "That's the whole edge. Not information — every person reading this can look up a NAV. Not intelligence — the maths is a Rule of 72 you learned four paragraphs ago. The edge is *staying*.",
      },
      { type: "p", text: "Which is oddly good news. Because \"stay\" isn't a talent. It's a design problem. And design problems have solutions." },
      {
        type: "list",
        items: [
          "**Invert the order.** Salary → invest → spend what's left. Not salary → spend → invest what's left. Same income, same person, completely different outcome — because the second version makes your future self bid against your present self, every single month, forever. Fix this with an auto-debit dated the day after your salary lands. Remove the decision, and there's nothing left to talk yourself out of.",
          "**Automate the step-up too.** A 10% annual increase, set once, tracks your raises without asking you to decide anything, ever again. Every decision point is a chance to quit. This one just removes the point.",
          "**Reduce the number of times you look.** The crash isn't what makes people sell. *Watching* the crash is. Check quarterly. Not daily. The market doesn't reward attention — it charges for it.",
        ],
      },
      { type: "p", text: "You are not going to out-think the market. You're going to out-wait it." },
      { type: "p", text: "Twenty-five boring days. And then the pond." },
      {
        type: "quote",
        text: "If this was useful, forward it to the person in your life who stopped their SIP in March 2020. They're the one who needs it.",
      },

      { type: "h2", text: "How I built this" },
      { type: "p", text: "Every chart in this issue runs on real data, and the code is public — check my work, break it, or build on it." },
      {
        type: "p",
        text: "**Market data:** NSE Nifty 50 monthly closing levels, August 1991 – August 2026, pulled via jugaad_data (index_df). Portfolio simulations (flat SIP, 10% step-up SIP, and the panic-sell scenario) are built month-by-month from those closes in Python (pandas + matplotlib/plotly).",
      },
      {
        type: "p",
        text: "**What's excluded, on purpose:** this is a *price* index, not a total-returns index — dividends aren't reinvested — and no expense ratio or exit load is modeled. Those cut in opposite directions: leaving dividends out understates the result, leaving costs out overstates it. Dividends are much the larger of the two over thirty-five years, so on net every number in this issue is a conservative estimate of what a real SIP would have earned, not an inflated one.",
      },
      {
        type: "p",
        text: "The Nifty series before 1996 is a back-computed one, and no investable Nifty index fund existed in India until around 1999. Treat the early years as a maths exercise, not a trade you could have placed.",
      },
      {
        type: "p",
        text: "In the panic scenario, cash sits at 0% while out of the market. A real panicker would have earned something in a savings account, so that line is a floor, not a forecast.",
      },
      {
        type: "p",
        text: "**SIP holding-period data:** AMFI's Fiscal 2026 Annual Report, \"Investors embrace long-term approach with SIPs\" — the holding-period breakdown of SIP AUM as of March 2026.",
      },
      { type: "p", text: "*This newsletter is for educational purposes and is not investment advice. Past returns are not indicative of future results.*" },
      {
        type: "p",
        text: "**Code:** github.com/shanzxt/n1-Compounding-newsletter — data pull, portfolio simulation, and every chart script for this issue.",
      },
      { type: "p", text: "If you spot a bug in the maths, that's the whole point of shipping the code — tell me." },
    ],
  },
  {
    id: "44-funds-2-bets",
    number: 2,
    title: "44 funds, 2 bets",
    hook: "Why you might be putting all your eggs in one basket (unknowingly)",
    date: "Sep 30, 2026",
    readingTime: "6 min read",
    coverImage: "/newsletters/44-funds-2-bets/1_correlation_heatmap.png",
    substackUrl: "https://shantanusomwanshi.substack.com/p/44-funds-2-bets",
    githubUrl: "https://github.com/shanzxt/n2-Diversification",
    tool: "fund-picker",
    // No time-series chart for this issue (unlike Day 29's line chart) — the
    // card/reader fall back to `coverImage` when `chart` is absent.
    stats: [
      { label: "Funds analyzed", value: "44" },
      { label: "Fund categories", value: "13" },
      { label: "Driven by one factor", value: "85%" },
      { label: "Effective bets", value: "~2" },
    ],
    content: [
      {
        type: "p",
        text: "I, like many others, like to use AI to assess my financial investments from time to time. Recently, when I was doing exactly that, the response had a surprising ending. It basically said that I was investing in the same companies at the end of the day under different mutual fund names.",
      },
      {
        type: "p",
        text: "After reading that, I went down a rabbit hole and started figuring out how **diversified** I actually was, and to my surprise, the funds moved as if they held the **same few companies.**",
      },
      {
        type: "image",
        src: "/newsletters/44-funds-2-bets/1_correlation_heatmap.png",
        width: 1456,
        height: 1320,
        alt: "Correlation heatmap of monthly returns between 44 mutual funds in 13 categories, mostly dark blue, meaning most funds move together",
      },
      {
        type: "p",
        text: "This is a **correlation heatmap** I made for some well-known mutual funds, 44 to be exact. A shade of dark blue indicates that a fund moves similarly to the fund in comparison, while a shade of light blue means that they have a lower correlation and do not move in a trend together, while the lightest shade would indicate that the funds move in opposite directions.",
      },
      {
        type: "p",
        text: "Notice how a lot of the heatmap is relatively a shade of dark blue, and that is exactly why you may be **under the illusion that you are diversified**.",
      },
      {
        type: "p",
        text: "On the other hand, some funds like the Debt or International funds seem to have a lighter shade, and in my analysis I clubbed 3, 5, 7 and 10 equity funds to see how much diversification was provided with each addition of an equity fund, as it may be evident by now – not much.",
      },
      {
        type: "p",
        text: "When we simply add 1 debt fund to an existing equity portfolio, the effective number of bets we take, i.e. diversification, increases significantly – way more than adding an equity fund would result in.",
      },
      {
        type: "image",
        src: "/newsletters/44-funds-2-bets/4_debt_fund_effect.png",
        width: 1456,
        height: 860,
        alt: "Bar chart: median effective bets over 1,500 random equity portfolios before and after adding one more equity fund versus one liquid debt fund. Adding a debt fund lifts effective bets to about 1.95–1.97 in every case, while adding an equity fund barely moves them",
      },
      {
        type: "p",
        text: "This chart shows exactly that: our effective number of bets went from 1.32 to 1.39 when we added 1 equity fund to an existing 3-fund portfolio, a difference of 0.07, but simply adding one liquid debt fund took the effective number of bets to 1.97, a difference of 0.65, about a 9-fold increase in the difference of effective number of bets.",
      },
      {
        type: "image",
        src: "/newsletters/44-funds-2-bets/5_risk_vs_correlation.png",
        width: 1456,
        height: 860,
        alt: "Line chart: portfolio risk of a 50/50 two-fund portfolio versus correlation between the funds. At correlation 0 risk falls about 29 percent; the typical pair in the data, at 0.89, cuts risk by only 3 percent",
      },
      {
        type: "p",
        text: "A correlation of 0 would provide a 29% reduction in risk according to the formula, while a typical pair in the data had a positive correlation of 0.89, moving almost identically and giving only a 3% reduction in risk as compared to holding the same fund instead of diversifying.",
      },
      {
        type: "p",
        text: "Without getting into the mathematics behind it, if we use Principal Component Analysis (PCA), we can find a pattern of sorts. This pattern is just a row of numbers, like a mood: when the numbers go up, the funds also tend to go up. The factor we found has a positive correlation of 0.95 with the Nifty 50, so we can assume for now that the factor closely follows the Nifty 50.",
      },
      {
        type: "image",
        src: "/newsletters/44-funds-2-bets/2_one_factor.png",
        width: 1456,
        height: 860,
        alt: "Bar chart of the share of total variation in fund returns explained by each hidden factor. The first factor explains 85 percent, the rest 4.6 percent or less",
      },
      {
        type: "p",
        text: "This one factor alone drives 85% of the funds' movement. If all 44 funds were completely independent, each factor would explain an equal share of the drive, i.e. 100/44 ≈ 2.3%.",
      },
      { type: "p", text: "Basically, most of the equity funds move in a highly similar fashion to the Nifty 50." },
      {
        type: "image",
        src: "/newsletters/44-funds-2-bets/7_window_robustness.png",
        width: 1456,
        height: 860,
        alt: "Bar chart: effective independent bets stay between 2.04 and 2.55 across history windows from 22 to 128 months",
      },
      {
        type: "p",
        text: "When the same analysis was done for longer durations – up to 128 months – the result was almost the same.",
      },

      { type: "h2", text: "How I Built This" },
      {
        type: "p",
        text: "An interesting thing I noticed while collecting the data is how most of it was mainly available from 2013. It turns out SEBI had made it mandatory for every fund house to offer a separate direct plan for every mutual fund they offered, from 1 January 2013.",
      },
      { type: "p", text: "Every chart in this issue is built on real data, and the code is public." },
      {
        type: "p",
        text: "**Fund data:** Daily NAV histories for 44 mutual funds across 13 categories, pulled from mfapi.in. I used only Direct plans, Growth option, and converted month-end NAVs into monthly returns.",
      },
      {
        type: "p",
        text: "**Method:** Correlations between every pair of funds, then Principal Component Analysis to find the shared movement (the \"one factor\"), then the effective number of bets, a measure of how evenly that movement is spread across factors. Portfolio charts use random combinations of funds: 600 per size for the funds-vs-bets chart and 1,500 for the debt-fund chart. Everything is in Python.",
      },
      {
        type: "p",
        text: "**The window:** The main results use the 22 months (Nov 2024 – Aug 2026) that all 44 funds have in common. I repeated the analysis on longer histories, up to 128 months, in the robustness chart.",
      },
      { type: "p", text: "**What's excluded, on purpose:**" },
      {
        type: "list",
        items: [
          "**Holdings.** I measured how funds move, not what they own, so I haven't measured overlap between portfolios.",
          "**Short window.** Longer histories gave slightly more bets (2.3–2.6 vs 2.04), so the headline \"about 2\" is if anything on the low side, and may slightly exaggerate the problem.",
          "**Equal weighting.** Every fund counts the same. Real portfolios have unequal weights, which changes the numbers.",
          "**The liquid fund.** Its correlations are noisy because its returns barely move, so treat the debt-fund result as a direction, not a precise figure.",
          "**Data fixes.** HDFC Liquid Fund's return for Aug 2015 was distorted by a face-value change, so it was dropped and that month was filled with the average of the months either side. This doesn't affect any result in this issue, and it's documented in the repo.",
          "**The Nifty check.** It uses the UTI Nifty 50 Index Fund (Direct plan) as a stand-in for the Nifty 50. That fund is one of the 44, but rebuilding the factor from the other 43 gives almost the same result (0.94).",
        ],
      },
      { type: "p", text: "Fund names appear as examples of data, not recommendations." },
      {
        type: "p",
        text: "*This newsletter is for educational purposes and is not investment advice. Past returns are not indicative of future results.*",
      },
      {
        type: "p",
        text: "Code: [github.com/shanzxt/n2-Diversification](https://github.com/shanzxt/n2-Diversification), covering the data pull, cleaning and the maths.",
      },
      {
        type: "p",
        text: "**Try it yourself:** the fund-picker tool on my website lets you enter your own funds and see your real bets.",
      },
      { type: "tool", name: "fund-picker" },
      { type: "p", text: "*If you spot a bug in the maths, tell me. That's the whole point of shipping the code.*" },
    ],
  },
]

// Issues are authored in `issues` in whatever order they were added, not
// necessarily publish order — this is the one list every newsletter page
// reads from, newest first.
export const issuesByDate = [...issues].sort((a, b) => new Date(b.date) - new Date(a.date))
