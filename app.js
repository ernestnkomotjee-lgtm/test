const sourceFeeds = [
  { name: "Regulator notices (NERSA, DMRE, DoE)", status: "Connected" },
  { name: "Environmental compliance databases", status: "Connected" },
  { name: "Grid and dispatch market updates", status: "Connected" },
  { name: "Project finance and tariff announcements", status: "Connected" },
  { name: "Corporate IP/news litigation watch", status: "Pilot" },
  { name: "OEM and supply-chain disruption feeds", status: "Connected" },
];

const modules = [
  {
    id: "battery",
    title: "Battery Manufacturing Barometer",
    description: "Tracks manufacturing compliance resilience, permitting quality, and supply-chain legality.",
    indicators: [
      { key: "traceability", label: "Critical mineral traceability and sourcing due diligence" },
      { key: "safety", label: "Plant safety, emissions, and hazardous-material compliance" },
      { key: "certification", label: "Product certification and cross-border standards readiness" },
      { key: "waste", label: "End-of-life battery recycling and waste reporting compliance" },
    ],
  },
  {
    id: "ipp",
    title: "IPP Compliance Barometer",
    description: "Tracks permitting, offtake obligations, market dispatch, and governance hygiene for IPPs.",
    indicators: [
      { key: "licensing", label: "Generation licensing and permit renewal status" },
      { key: "ppa", label: "PPA/offtake contract compliance and obligations delivery" },
      { key: "grid", label: "Grid code adherence, curtailment handling, and dispatch compliance" },
      { key: "reporting", label: "Regulatory reporting, governance, and audit trail maturity" },
    ],
  },
  {
    id: "renewables",
    title: "Wind & Solar Farm Barometer",
    description: "Tracks land, environmental, operational, and community-facing compliance performance.",
    indicators: [
      { key: "land", label: "Land-use rights, zoning, and community consultation compliance" },
      { key: "env", label: "Environmental impact conditions and biodiversity obligations" },
      { key: "operations", label: "Operations/maintenance compliance and incident management" },
      { key: "community", label: "Local content, labour, and socio-economic commitments" },
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
      (feed) => `<div class="source-tile"><strong>${feed.status}</strong><span>${feed.name}</span></div>`,
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
  overallSummary.innerHTML = `<strong>${snapshot.organisation}</strong> in <strong>${snapshot.region}</strong> is currently <strong>${snapshot.overallLevel}</strong> at <strong>${snapshot.overallScore}/5</strong>.`;

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
            .map((item) => `<li><strong>${item.module}:</strong> escalate ${item.label.toLowerCase()} with legal/compliance review.</li>`)
            .join("")}</ol>`
        : "<p>No critical weak points flagged. Continue monitoring with weekly source ingestion.</p>"
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
