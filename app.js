const sourceFeeds = [
  {
    source: "NERSA licensing notices",
    domain: "Regulation",
    coverage: "Generation licences, amendments, exemptions",
    cadence: "Daily",
    status: "Live",
  },
  {
    source: "DMRE + IPP Office procurement updates",
    domain: "Market",
    coverage: "REIPPPP rounds, bid windows, preferred bidder updates",
    cadence: "Daily",
    status: "Live",
  },
  {
    source: "South African Gazette & environmental authorisations",
    domain: "Compliance",
    coverage: "EIA approvals, water-use licences, permit conditions",
    cadence: "Daily",
    status: "Live",
  },
  {
    source: "Eskom grid and transmission bulletins",
    domain: "Operations",
    coverage: "Grid constraints, curtailment risk, connection backlogs",
    cadence: "Weekly",
    status: "Live",
  },
  {
    source: "WIPO + CIPC IP disputes and filings",
    domain: "IP",
    coverage: "Battery chemistry patents, manufacturing process disputes",
    cadence: "Weekly",
    status: "Pilot",
  },
  {
    source: "IEA / IRENA / BNEF market trackers",
    domain: "Intelligence",
    coverage: "Cell pricing, project pipeline, supply-chain pressure signals",
    cadence: "Monthly",
    status: "Live",
  },
];

const modules = [
  {
    id: "battery",
    title: "Battery Manufacturing Barometer",
    description: "Compliance and market-risk tracking for battery plants, importers, and recyclers.",
    indicators: [
      { key: "traceability", label: "Critical mineral traceability (OECD due diligence + sanctions screening)" },
      { key: "safety", label: "Plant safety and hazardous material controls (OHS + emissions permits)" },
      { key: "certification", label: "Product conformity readiness (IEC/UL transport + storage standards)" },
      { key: "waste", label: "Battery take-back and end-of-life recycling reporting" },
    ],
  },
  {
    id: "ipp",
    title: "IPP Compliance Barometer",
    description: "Regulatory performance tracking for utility-scale and C&I IPP portfolios.",
    indicators: [
      { key: "licensing", label: "Generation licensing and permit validity (NERSA + municipal)" },
      { key: "ppa", label: "PPA and offtake compliance (availability, dispatch, settlement)" },
      { key: "grid", label: "Grid-code performance and curtailment compliance" },
      { key: "reporting", label: "Regulatory reporting and audit trail completeness" },
    ],
  },
  {
    id: "renewables",
    title: "Wind & Solar Farm Barometer",
    description: "Project-level compliance health for wind and solar assets through construction and operation.",
    indicators: [
      { key: "land", label: "Land rights, servitudes, and community consultation obligations" },
      { key: "env", label: "EIA condition compliance (biodiversity, noise, avifauna, water)" },
      { key: "operations", label: "Operational compliance (HSE incidents, outage reporting, maintenance)" },
      { key: "community", label: "Local content, jobs, and socio-economic development commitments" },
    ],
  },
];

const form = document.getElementById("monitor-form");
const sourceList = document.getElementById("source-list");
const moduleList = document.getElementById("module-list");
const results = document.getElementById("results");
const overallSummary = document.getElementById("overall-summary");
const barometerCards = document.getElementById("barometer-cards");
const priorityActions = document.getElementById("priority-actions");
const downloadBtn = document.getElementById("downloadBtn");

buildSourceFeedTiles();
buildModuleInputs();
setDefaultDate();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const snapshot = buildSnapshot();
  renderSnapshot(snapshot);
});

downloadBtn.addEventListener("click", () => {
  const snapshot = buildSnapshot();
  downloadFile(JSON.stringify(snapshot, null, 2), `enr-barometer-${safeFileName(snapshot.organisation || "snapshot")}.json`, "application/json");
});

function buildSourceFeedTiles() {
  sourceList.innerHTML = sourceFeeds
    .map(
      (feed) => `
        <div class="source-tile">
          <div class="source-head">
            <strong>${feed.status}</strong>
            <span>${feed.domain}</span>
          </div>
          <h4>${feed.source}</h4>
          <p>${feed.coverage}</p>
          <small>Cadence: ${feed.cadence}</small>
        </div>
      `,
    )
    .join("");
}

function buildModuleInputs() {
  const options = [1, 2, 3, 4, 5].map((value) => `<option value="${value}">${value}</option>`).join("");

  moduleList.innerHTML = modules
    .map((module) => {
      const questions = module.indicators
        .map(
          (indicator) => `
            <label class="question">
              <span>${indicator.label}</span>
              <select id="${module.id}-${indicator.key}" required>
                <option value="" disabled selected>Select score</option>
                ${options}
              </select>
            </label>
          `,
        )
        .join("");

      return `
        <section class="module-card">
          <h4>${module.title}</h4>
          <p class="hint">${module.description}</p>
          <div class="grid one">${questions}</div>
        </section>
      `;
    })
    .join("");
}

function setDefaultDate() {
  document.getElementById("reportDate").value = new Date().toISOString().split("T")[0];
}

function buildSnapshot() {
  const moduleScores = modules.map((module) => {
    const indicators = module.indicators.map((indicator) => {
      const score = Number(document.getElementById(`${module.id}-${indicator.key}`).value || 0);
      return { label: indicator.label, score };
    });

    const average = indicators.reduce((sum, item) => sum + item.score, 0) / indicators.length;
    return {
      id: module.id,
      title: module.title,
      average: Number(average.toFixed(2)),
      level: getLevel(average),
      indicators,
    };
  });

  const overall = moduleScores.reduce((sum, item) => sum + item.average, 0) / moduleScores.length;

  return {
    organisation: document.getElementById("organisation").value.trim(),
    region: document.getElementById("region").value.trim(),
    analyst: document.getElementById("analyst").value.trim(),
    reportDate: document.getElementById("reportDate").value,
    sourceFeeds,
    moduleScores,
    overallScore: Number(overall.toFixed(2)),
    overallLevel: getLevel(overall),
    generatedAt: new Date().toISOString(),
  };
}

function getLevel(score) {
  if (score < 2.8) return "At risk";
  if (score < 4) return "Watchlist";
  return "Stable";
}

function renderSnapshot(snapshot) {
  overallSummary.innerHTML = `<strong>${snapshot.organisation}</strong> (${snapshot.region}) is <strong>${snapshot.overallLevel}</strong> at <strong>${snapshot.overallScore}/5</strong>.`; 

  barometerCards.innerHTML = snapshot.moduleScores
    .map(
      (module) => `
        <article class="chart-card">
          <h3>${module.title}</h3>
          <p><strong>${module.average}/5</strong> • ${module.level}</p>
          <ul>${module.indicators.map((item) => `<li>${item.label}: ${item.score}/5</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");

  const lowItems = snapshot.moduleScores
    .flatMap((module) => module.indicators.map((indicator) => ({ module: module.title, ...indicator })))
    .filter((item) => item.score <= 2);

  priorityActions.innerHTML = `
    <h3>Priority intelligence actions</h3>
    ${
      lowItems.length
        ? `<ol>${lowItems
            .map((item) => `<li><strong>${item.module}:</strong> investigate ${item.label.toLowerCase()} and trigger legal/compliance escalation this week.</li>`)
            .join("")}</ol>`
        : "<p>No critical weak points flagged. Keep ingestion cadence and monitor regulatory change notices.</p>"
    }
  `;

  results.classList.remove("hidden");
}

function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: `${contentType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function safeFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
