import { mkdir, unlink, writeFile } from "node:fs/promises";

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const login = process.env.GITHUB_REPOSITORY_OWNER || "TRextabat";
if (!token) throw new Error("GITHUB_TOKEN or GH_TOKEN is required");

const now = new Date();
const from = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate()));
const refreshedAt = `${now.toISOString().slice(0, 19).replace("T", " ")} UTC`;

async function githubQuery(document, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-analytics" },
    body: JSON.stringify({ query: document, variables }),
  });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors) throw new Error(payload.errors.map((error) => error.message).join("; "));
  return payload.data;
}

async function githubRest(path) {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "profile-analytics" },
  });
  if (!response.ok) throw new Error(`GitHub REST ${path} returned ${response.status}`);
  return response.json();
}

const query = `query($login:String!,$from:DateTime!,$to:DateTime!){
  user(login:$login){
    createdAt
    contributionsCollection(from:$from,to:$to){
      totalCommitContributions totalIssueContributions totalPullRequestContributions
      totalPullRequestReviewContributions totalRepositoryContributions
      contributionCalendar{totalContributions weeks{contributionDays{date contributionCount weekday}}}
      commitContributionsByRepository(maxRepositories:30){repository{nameWithOwner isPrivate} contributions{totalCount}}
    }
    repositories(first:100,ownerAffiliations:OWNER,privacy:PUBLIC,orderBy:{field:UPDATED_AT,direction:DESC}){
      nodes{name isFork primaryLanguage{name color} stargazerCount forkCount}
    }
  }
}`;

const data = await githubQuery(query, { login, from: from.toISOString(), to: now.toISOString() });
const user = data.user;
if (!user) throw new Error(`GitHub user ${login} was not found`);
const cc = user.contributionsCollection;
const yearlyQuery = `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){totalCommitContributions totalIssueContributions totalPullRequestContributions totalPullRequestReviewContributions totalRepositoryContributions contributionCalendar{totalContributions} commitContributionsByRepository(maxRepositories:100){repository{nameWithOwner}}}}}`;
const allTime = { contributions: 0, commits: 0, issues: 0, pullRequests: 0, reviews: 0, repositories: 0 };
const contributedRepositoryNames = new Set();
const createdAt = new Date(user.createdAt);
for (let year = createdAt.getUTCFullYear(); year <= now.getUTCFullYear(); year += 1) {
  const periodStart = new Date(Math.max(createdAt.getTime(), Date.UTC(year, 0, 1)));
  const periodEnd = new Date(Math.min(now.getTime(), Date.UTC(year, 11, 31, 23, 59, 59)));
  const period = (await githubQuery(yearlyQuery, { login, from: periodStart.toISOString(), to: periodEnd.toISOString() })).user.contributionsCollection;
  allTime.contributions += period.contributionCalendar.totalContributions;
  allTime.commits += period.totalCommitContributions;
  allTime.issues += period.totalIssueContributions;
  allTime.pullRequests += period.totalPullRequestContributions;
  allTime.reviews += period.totalPullRequestReviewContributions;
  allTime.repositories += period.totalRepositoryContributions;
  for (const item of period.commitContributionsByRepository) contributedRepositoryNames.add(item.repository.nameWithOwner);
}

const selectedRepositories = new Map();
const contributionOnlyOrganizations = new Set(["BMGLab"]);
const addRepository = (repo) => selectedRepositories.set(repo.full_name, {
  fullName: repo.full_name,
  isFork: repo.fork,
  stars: repo.stargazers_count,
  forks: repo.forks_count,
});
const personalRepositories = await githubRest("user/repos?visibility=all&affiliation=owner,collaborator&per_page=100");
for (const repo of personalRepositories) addRepository(repo);
const memberships = await githubRest("user/memberships/orgs?state=active&per_page=100");
for (const membership of memberships.filter((item) => item.role === "admin" && !contributionOnlyOrganizations.has(item.organization.login))) {
  const organizationRepositories = await githubRest(`orgs/${encodeURIComponent(membership.organization.login)}/repos?type=all&per_page=100`);
  for (const repo of organizationRepositories) addRepository(repo);
}
for (const fullName of contributedRepositoryNames) {
  if (!selectedRepositories.has(fullName)) addRepository(await githubRest(`repos/${fullName.split("/").map(encodeURIComponent).join("/")}`));
}
const days = cc.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
const outDir = new URL("../assets/analytics/", import.meta.url);
await mkdir(outDir, { recursive: true });

const palette = { bg: "#071D33", panel: "#0B2940", ink: "#F2E6CF", muted: "#A9B8C4", teal: "#2A9D9F", gold: "#D3A652", iris: "#8D80DD", red: "#B85C5C" };
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const base = (title, subtitle, body, height = 360) => `<svg width="1200" height="${height}" viewBox="0 0 1200 ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(subtitle)}</desc>
<rect width="1200" height="${height}" rx="20" fill="${palette.bg}"/>
<text x="52" y="52" fill="${palette.ink}" font-family="Georgia,serif" font-size="27">${esc(title)}</text>
<text x="52" y="78" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="14">${esc(subtitle)}</text>${body}</svg>`;
const save = (name, svg) => writeFile(new URL(name, outDir), `${svg}\n`);

const monthKeys = [];
for (let index = 11; index >= 0; index -= 1) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
  monthKeys.push({ key: date.toISOString().slice(0, 7), label: date.toLocaleString("en", { month: "short", timeZone: "UTC" }) });
}
const monthly = new Map(monthKeys.map(({ key }) => [key, 0]));
const weekdays = Array(7).fill(0);
for (const day of days) {
  const key = day.date.slice(0, 7);
  if (monthly.has(key)) monthly.set(key, monthly.get(key) + day.contributionCount);
  weekdays[day.weekday] += day.contributionCount;
}

const monthValues = monthKeys.map(({ key }) => monthly.get(key));
const monthMax = Math.max(...monthValues, 1);
const monthBars = monthKeys.map(({ label }, index) => {
  const value = monthValues[index];
  const height = Math.max(3, Math.round((value / monthMax) * 190));
  const x = 62 + index * 92;
  return `<rect x="${x}" y="${292 - height}" width="54" height="${height}" rx="5" fill="${index === 11 ? palette.gold : palette.teal}"/><text x="${x + 27}" y="316" text-anchor="middle" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="13">${label}</text><text x="${x + 27}" y="${282 - height}" text-anchor="middle" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="12">${value}</text>`;
}).join("");
await save("contribution-trend.svg", base("Contribution trend", `${cc.contributionCalendar.totalContributions} contributions across the rolling 12-month window`, monthBars, 350));

const recentCutoff = new Date(now);
recentCutoff.setUTCDate(recentCutoff.getUTCDate() - 364);
const recentDays = days.filter((day) => new Date(`${day.date}T00:00:00Z`) >= recentCutoff).slice(-365);
const recentMax = Math.max(...recentDays.map((day) => day.contributionCount), 1);
const plot = { left: 52, right: 1148, top: 110, bottom: 310 };
const recentPoints = recentDays.map((day, index) => {
  const x = plot.left + (index / Math.max(recentDays.length - 1, 1)) * (plot.right - plot.left);
  const y = plot.bottom - (day.contributionCount / recentMax) * (plot.bottom - plot.top);
  return { x, y, ...day };
});
const pointString = recentPoints.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const areaString = `${plot.left},${plot.bottom} ${pointString} ${plot.right},${plot.bottom}`;
const grid = [0, .25, .5, .75, 1].map((ratio) => {
  const y = plot.bottom - ratio * (plot.bottom - plot.top);
  return `<path d="M${plot.left} ${y}H${plot.right}" stroke="#28445A" stroke-width="1"/><text x="40" y="${y + 4}" text-anchor="end" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="11">${Math.round(recentMax * ratio)}</text>`;
}).join("");
const dateLabels = recentPoints.filter(({ date }, index) => index === 0 || index === recentPoints.length - 1 || date.endsWith("-01")).map(({ x, date }) => {
  const label = new Date(`${date}T00:00:00Z`).toLocaleString("en", { month: "short", day: "numeric", timeZone: "UTC" });
  return `<text x="${x}" y="338" text-anchor="middle" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="11">${label}</text>`;
}).join("");
const recentTotal = recentDays.reduce((sum, day) => sum + day.contributionCount, 0);
const recentBody = `${grid}<polygon points="${areaString}" fill="${palette.teal}" fill-opacity=".16"/><polyline points="${pointString}" fill="none" stroke="${palette.teal}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dateLabels}`;
await save("recent-contributions.svg", base("Contribution graph · 365 days", `${recentTotal} contributions from ${recentDays[0]?.date || "—"} to ${recentDays.at(-1)?.date || "—"}`, recentBody, 365));

const mix = [
  ["Commits", cc.totalCommitContributions, palette.teal],
  ["Pull requests", cc.totalPullRequestContributions, palette.gold],
  ["Reviews", cc.totalPullRequestReviewContributions, palette.iris],
  ["Issues", cc.totalIssueContributions, palette.red],
  ["Repositories", cc.totalRepositoryContributions, "#58A6FF"],
];
const mixMax = Math.max(...mix.map(([, value]) => value), 1);
const mixRows = mix.map(([label, value, color], index) => {
  const y = 112 + index * 48;
  const width = Math.max(4, Math.round((value / mixMax) * 790));
  return `<text x="52" y="${y + 17}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="15">${label}</text><rect x="190" y="${y}" width="850" height="24" rx="6" fill="${palette.panel}"/><rect x="190" y="${y}" width="${width}" height="24" rx="6" fill="${color}"/><text x="1065" y="${y + 17}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="14">${value}</text>`;
}).join("");
await save("activity-mix.svg", base("How I contributed", "GitHub contribution types in the rolling 12-month window", mixRows, 380));

const classifiedTotal = mix.reduce((sum, [, value]) => sum + value, 0);
const contributionTotal = cc.contributionCalendar.totalContributions;
const density = [
  ["Commits", cc.totalCommitContributions, palette.teal],
  ["Pull requests", cc.totalPullRequestContributions, palette.gold],
  ["Reviews", cc.totalPullRequestReviewContributions, palette.iris],
  ["Issues", cc.totalIssueContributions, palette.red],
  ["Repositories", cc.totalRepositoryContributions, "#58A6FF"],
  ["Other / restricted", Math.max(0, contributionTotal - classifiedTotal), "#52697B"],
];
let densityX = 52;
const densityBar = density.map(([label, value, color]) => {
  const width = contributionTotal ? (value / contributionTotal) * 1096 : 0;
  const segment = `<rect x="${densityX.toFixed(1)}" y="382" width="${Math.max(0, width).toFixed(1)}" height="34" fill="${color}"><title>${esc(label)}: ${value}</title></rect>`;
  densityX += width;
  return segment;
}).join("");
const densityLegend = density.map(([label, value, color], index) => {
  const column = index % 3;
  const row = Math.floor(index / 3);
  const x = 52 + column * 365;
  const y = 452 + row * 31;
  const percent = contributionTotal ? Math.round((value / contributionTotal) * 100) : 0;
  return `<rect x="${x}" y="${y - 12}" width="12" height="12" rx="2" fill="${color}"/><text x="${x + 20}" y="${y}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="13">${esc(label)} · ${value} (${percent}%)</text>`;
}).join("");
const overviewBody = `${grid}<polygon points="${areaString}" fill="${palette.teal}" fill-opacity=".16"/><polyline points="${pointString}" fill="none" stroke="${palette.teal}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dateLabels}<text x="52" y="365" fill="${palette.ink}" font-family="Georgia,serif" font-size="20">Contribution density</text><clipPath id="densityClip"><rect x="52" y="382" width="1096" height="34" rx="8"/></clipPath><g clip-path="url(#densityClip)">${densityBar}</g>${densityLegend}`;
await save("contribution-overview.svg", base("Contribution overview · 365 days", `${contributionTotal} total contributions; daily activity and GitHub-exposed contribution types`, overviewBody, 530));

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekdayMax = Math.max(...weekdays, 1);
const weekdayBars = weekdays.map((value, index) => {
  const height = Math.max(3, Math.round((value / weekdayMax) * 180));
  const x = 105 + index * 150;
  return `<rect x="${x}" y="${285 - height}" width="72" height="${height}" rx="7" fill="${index === 6 ? palette.gold : palette.iris}"/><text x="${x + 36}" y="314" text-anchor="middle" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="14">${weekdayLabels[index]}</text><text x="${x + 36}" y="${275 - height}" text-anchor="middle" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="12">${value}</text>`;
}).join("");
await save("weekday-rhythm.svg", base("Weekly rhythm", "Contributions grouped by weekday over the rolling 12-month window", weekdayBars, 350));

const repoRows = cc.commitContributionsByRepository
  .filter((item) => !item.repository.isPrivate)
  .sort((a, b) => b.contributions.totalCount - a.contributions.totalCount)
  .slice(0, 8);
const repoMax = Math.max(...repoRows.map((item) => item.contributions.totalCount), 1);
const repoBody = repoRows.map((item, index) => {
  const y = 106 + index * 34;
  const label = item.repository.nameWithOwner.length > 32 ? `…${item.repository.nameWithOwner.slice(-31)}` : item.repository.nameWithOwner;
  const width = Math.max(4, Math.round((item.contributions.totalCount / repoMax) * 590));
  return `<text x="52" y="${y + 15}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="13">${esc(label)}</text><rect x="350" y="${y}" width="650" height="20" rx="5" fill="${palette.panel}"/><rect x="350" y="${y}" width="${width}" height="20" rx="5" fill="${index === 0 ? palette.gold : palette.teal}"/><text x="1024" y="${y + 15}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="13">${item.contributions.totalCount}</text>`;
}).join("");
await save("project-contributions.svg", base("Projects receiving my commits", "Top public repositories by authored commits in the rolling 12-month window", repoBody, 410));

const repos = [...selectedRepositories.values()].filter((repo) => !repo.isFork);
const languages = new Map();
const hiddenSupportingLanguages = new Set(["HTML", "CSS", "Mako", "Dockerfile", "Makefile", "Jupyter Notebook"]);
for (const repo of repos) {
  const repoLanguages = await githubRest(`repos/${repo.fullName.split("/").map(encodeURIComponent).join("/")}/languages`);
  for (const name of Object.keys(repoLanguages)) {
    if (hiddenSupportingLanguages.has(name)) continue;
    const current = languages.get(name) || { count: 0, color: null };
    current.count += 1;
    languages.set(name, current);
  }
}
const languageColors = { Python: "#3572A5", Java: "#B07219", JavaScript: "#F1E05A", TypeScript: "#3178C6", "Jupyter Notebook": "#DA5B0B", R: "#198CE7", C: "#555555", "C++": "#F34B7D", HCL: "#844FBA", Shell: "#89E051", HTML: "#E34C26", CSS: "#563D7C", Dart: "#00B4AB", Nextflow: "#3AC486", PLpgSQL: "#336790" };
for (const [name, info] of languages) info.color = languageColors[name] || palette.teal;
const languageRows = [...languages.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
const languageMax = Math.max(...languageRows.map(([, info]) => info.count), 1);
const languageBody = languageRows.map(([name, info], index) => {
  const y = 106 + index * 34;
  const width = Math.max(4, Math.round((info.count / languageMax) * 650));
  return `<circle cx="62" cy="${y + 10}" r="6" fill="${info.color}"/><text x="80" y="${y + 15}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="14">${esc(name)}</text><rect x="260" y="${y}" width="700" height="20" rx="5" fill="${palette.panel}"/><rect x="260" y="${y}" width="${width}" height="20" rx="5" fill="${info.color}"/><text x="985" y="${y + 15}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="13">${info.count} repos</text>`;
}).join("");
await save("repository-languages.svg", base("Repository language footprint", `Owned, administered, and contributed repositories · private names hidden · refreshed ${refreshedAt}`, languageBody, 410));

const totals = repos.reduce((acc, repo) => ({ stars: acc.stars + repo.stars, forks: acc.forks + repo.forks }), { stars: 0, forks: 0 });
const cards = [["PUBLIC REPOSITORIES", repos.length], ["STARS RECEIVED", totals.stars], ["FORKS RECEIVED", totals.forks], ["YEAR CONTRIBUTIONS", cc.contributionCalendar.totalContributions]];
const cardBody = cards.map(([label, value], index) => {
  const x = 52 + index * 280;
  return `<rect x="${x}" y="112" width="248" height="132" rx="14" fill="${palette.panel}" stroke="${index === 3 ? palette.gold : palette.teal}"/><text x="${x + 124}" y="170" text-anchor="middle" fill="${index === 3 ? palette.gold : palette.teal}" font-family="Georgia,serif" font-size="34">${value}</text><text x="${x + 124}" y="208" text-anchor="middle" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="12">${label}</text>`;
}).join("");
await save("portfolio-summary.svg", base("Public GitHub snapshot", `Generated ${now.toISOString().slice(0, 10)} from GitHub's API`, cardBody, 290));

const activityTotals = [
  ["CONTRIBUTIONS", allTime.contributions, palette.gold],
  ["COMMITS", allTime.commits, palette.teal],
  ["PULL REQUESTS", allTime.pullRequests, "#58A6FF"],
  ["REVIEWS", allTime.reviews, palette.iris],
  ["ISSUES", allTime.issues, palette.red],
  ["REPOSITORIES", repos.length, "#4DB4AE"],
  ["STARS RECEIVED", totals.stars, "#E3B341"],
  ["FORKS RECEIVED", totals.forks, "#B5A7E8"],
];
const circles = activityTotals.map(([label, value, color], index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);
  const x = 165 + column * 290;
  const y = 180 + row * 210;
  return `<circle cx="${x}" cy="${y}" r="76" fill="${palette.panel}" stroke="${color}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="66" fill="none" stroke="${color}" stroke-opacity=".22"/><text x="${x}" y="${y + 9}" text-anchor="middle" fill="${color}" font-family="Georgia,serif" font-size="34">${value.toLocaleString("en")}</text><text x="${x}" y="${y + 105}" text-anchor="middle" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="12" letter-spacing="1">${label}</text>`;
}).join("");
await save("activity-totals.svg", base("GitHub activity · all time", `Public and private counts since ${user.createdAt.slice(0, 10)} · refreshed ${refreshedAt}`, circles, 520));

// Keep the generated asset set aligned with the two analytics selected for the profile.
for (const name of ["portfolio-summary.svg", "contribution-trend.svg", "weekday-rhythm.svg", "project-contributions.svg", "recent-contributions.svg", "activity-mix.svg", "contribution-overview.svg"]) {
  await unlink(new URL(name, outDir)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
