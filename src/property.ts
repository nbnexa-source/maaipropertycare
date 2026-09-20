import { initializeParticleBackground } from "./particle-background";

initializeParticleBackground(document.querySelector<HTMLCanvasElement>("#particle-scene"));

type PropertyPage = {
  category: string;
  title: string;
  summary: string;
  briefTitle: string;
  insights: Array<{ number: string; title: string; copy: string }>;
  marketTitle: string;
  marketCopy: string;
  checklist: string[];
  sources: Array<{ label: string; url: string }>;
};

const pages: Record<string, PropertyPage> = {
  affordable: {
    category: "Affordable homes · Gurugram",
    title: "A practical first home starts with the right checks.",
    summary: "Affordable housing in Gurugram can include policy-linked, draw-based and developer-led projects. Eligibility, pricing method, transfer conditions and delivery timelines differ—so every project needs its own document review.",
    briefTitle: "Understand the route before the rate.",
    insights: [
      { number: "01", title: "Policy & allotment", copy: "Confirm whether the home is offered under a government policy, public draw, predetermined rate or normal developer sale. The category name alone does not establish the terms." },
      { number: "02", title: "Registry timing", copy: "Do not assume registry happens exactly one year after allotment. Check the allotment letter, agreement, approvals, possession stage and project-specific conveyance process." },
      { number: "03", title: "Real cost", copy: "Compare carpet area, payment schedule, statutory charges, maintenance and finance eligibility—not only the headline price." },
    ],
    marketTitle: "Active, but project-specific.",
    marketCopy: "HRERA records continue to show affordable group-housing activity across Gurugram and Farrukhnagar. Some projects use public-draw or policy-linked pricing, while others can follow different approved structures. Availability must be checked project by project.",
    checklist: ["Search the current project and promoter on HRERA Gurugram.", "Review the registration certificate, Form A–H, approvals and target completion.", "Read allotment, cancellation, transfer, possession and conveyance clauses.", "Match financing and total outlay to your household budget."],
    sources: [
      { label: "HRERA Gurugram — public project search", url: "https://www.haryanarera.gov.in/assistancecontrol/project_search_public/1" },
      { label: "HRERA record — The Valley affordable housing, Sector 78", url: "https://haryanarera.gov.in/view_project/searchprojectDetail/3424" },
    ],
  },
  luxury: {
    category: "Luxury residences · Gurugram",
    title: "Luxury is more than a launch price.",
    summary: "The right luxury home balances location, usable space, delivery credibility, long-term upkeep and exit liquidity. Compare the complete ownership experience—not only amenities or brochure positioning.",
    briefTitle: "Look beyond the specification sheet.",
    insights: [
      { number: "01", title: "Micro-market first", copy: "Golf Course Road, Golf Course Extension, Dwarka Expressway and newer corridors have different maturity, access and supply profiles." },
      { number: "02", title: "Comparable pricing", copy: "Ask whether a quoted rate uses carpet, built-up or saleable area. Add parking, club, maintenance, floor premiums and statutory charges before comparing." },
      { number: "03", title: "Delivery & upkeep", copy: "Review promoter history, construction status, planned handover, maintenance model and resident experience in completed projects." },
    ],
    marketTitle: "Strong demand, selective value.",
    marketCopy: "Research covering 2025 described Gurugram as NCR’s leading residential micro-market, with much of its new supply concentrated in premium and luxury housing. Rapid headline growth makes project-level comparison and exit-price discipline especially important.",
    checklist: ["Verify HRERA status, declared completion and quarterly progress.", "Compare effective price on the same area basis.", "Visit the site and nearby completed developments at different times of day.", "Stress-test maintenance, financing and resale assumptions."],
    sources: [
      { label: "Knight Frank — India office & residential market H1 2025", url: "https://content.knightfrank.com/research/3013/documents/en/india-real-estate-office-and-residential-market-h1-2025-12239.pdf" },
      { label: "CRE Matrix — Gurugram high-end luxury housing CY 2025", url: "https://www.crematrix.com/research/report-details/289/high-end-luxury-housing-report-gurugram-cy25" },
      { label: "HRERA Gurugram — public project search", url: "https://www.haryanarera.gov.in/assistancecontrol/project_search_public/1" },
    ],
  },
  commercial: {
    category: "Commercial spaces · Gurugram",
    title: "Choose the space around the business case.",
    summary: "An office, retail unit or commercial investment should be assessed through access, occupier demand, floor efficiency, lease structure and operating cost. The right address must also work on ordinary weekdays.",
    briefTitle: "Start with use, demand and cash flow.",
    insights: [
      { number: "01", title: "Use case", copy: "Separate self-use requirements from investment goals. Office, retail and mixed-use assets have different demand drivers and fit-out costs." },
      { number: "02", title: "Lease reality", copy: "Review actual occupancy, tenant profile, rent-free periods, escalation, CAM, lock-in and fit-out obligations—not projected yield alone." },
      { number: "03", title: "Access & compliance", copy: "Check sanctioned use, parking, fire and occupancy approvals, public access and last-mile connectivity." },
    ],
    marketTitle: "Gurugram remains NCR’s office engine.",
    marketCopy: "Knight Frank reported that Gurugram accounted for 61% of Delhi NCR office transactions in 2025. That depth supports demand, but asset quality and exact micro-location still determine leasing performance.",
    checklist: ["Confirm permitted use and project approvals.", "Request current occupancy and executed lease evidence.", "Model acquisition, fit-out, CAM, vacancy and exit costs.", "Inspect access, parking and the surrounding business ecosystem."],
    sources: [
      { label: "Knight Frank — India office & residential market H2 2025", url: "https://content.knightfrank.com/research/3070/documents/en/india-real-estate-office-and-residential-market-h2-2025-12597.pdf" },
      { label: "HRERA Gurugram — public project search", url: "https://www.haryanarera.gov.in/assistancecontrol/project_search_public/1" },
    ],
  },
  plots: {
    category: "Residential plots · Gurugram",
    title: "Land rewards careful verification.",
    summary: "A plot purchase starts with title, licence, approved layout and access—not a location pin. Establish exactly what is being sold, who owns it and what can legally be built before discussing appreciation.",
    briefTitle: "The document trail is the real foundation.",
    insights: [
      { number: "01", title: "Title & ownership", copy: "Review the title chain, sale deed, encumbrances, mutations and the seller’s authority. Joint or inherited ownership needs additional care." },
      { number: "02", title: "Planning status", copy: "Confirm colony licence, approved layout, plot demarcation, land use, road access and applicable building controls." },
      { number: "03", title: "Physical verification", copy: "Match site dimensions and boundaries to documents through appropriate professional verification before payment." },
    ],
    marketTitle: "Appreciation has raised the diligence bar.",
    marketCopy: "A 2025 NCR market review reported continued upward movement in Gurugram plot values. Rising prices make title quality, infrastructure timing and realistic resale depth more—not less—important.",
    checklist: ["Verify title chain, encumbrances, mutation and seller identity.", "Check DTCP/HRERA records, licence and approved layout where applicable.", "Confirm access, services, dimensions and permissible construction.", "Use independent legal and technical professionals before committing funds."],
    sources: [
      { label: "Delhi NCR Residential Market Watch — year-end 2025", url: "https://assets.credai.app/public/knowledge_center_document/1769765432286_delhi-ncr-residential-market-watch-year-year-end-2025.pdf" },
      { label: "HRERA Gurugram — public project search", url: "https://www.haryanarera.gov.in/assistancecontrol/project_search_public/1" },
    ],
  },
};

const key = new URLSearchParams(location.search).get("type") ?? "affordable";
const page = pages[key] ?? pages.affordable;
const setText = (id: string, value: string) => { document.getElementById(id)!.textContent = value; };
setText("category", page.category); setText("title", page.title); setText("summary", page.summary);
setText("brief-title", page.briefTitle); setText("market-title", page.marketTitle); setText("market-copy", page.marketCopy); setText("form-category", page.category);
document.title = `${page.category} | MAAI Property Care`;
document.getElementById("insights")!.innerHTML = page.insights.map((item) => `<article><span>${item.number}</span><h3>${item.title}</h3><p>${item.copy}</p></article>`).join("");
document.getElementById("checklist")!.innerHTML = page.checklist.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${item}</p></li>`).join("");
document.getElementById("sources")!.innerHTML = page.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label} ↗</a>`).join("");

const form = document.querySelector<HTMLFormElement>("#visit-request")!;
const result = form.querySelector<HTMLElement>(".visit-result")!;
const pre = result.querySelector("pre")!;
const statusElement = result.querySelector("small")!;
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const lines = ["MAAI — Visit & consultation brief", `Category: ${page.category}`, ""];
  for (const [name, raw] of data.entries()) {
    const value = String(raw).trim();
    if (value) lines.push(`${name.replace(/^./, (letter) => letter.toUpperCase())}: ${value}`);
  }
  pre.textContent = lines.join("\n"); result.hidden = false; statusElement.textContent = ""; result.scrollIntoView({ block: "nearest" });
});
document.querySelector<HTMLButtonElement>("#copy-visit")!.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(pre.textContent ?? ""); statusElement.textContent = "Copied."; }
  catch { statusElement.textContent = "Select and copy the brief above."; }
});
