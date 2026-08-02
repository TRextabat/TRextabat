import { mkdir, unlink, writeFile } from "node:fs/promises";

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const login = process.env.GITHUB_REPOSITORY_OWNER || "TRextabat";
if (!token) throw new Error("GITHUB_TOKEN or GH_TOKEN is required");

const now = new Date();
const from = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate()));

const query = `query($login:String!,$from:DateTime!,$to:DateTime!){
  user(login:$login){
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

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-analytics" },
  body: JSON.stringify({ query, variables: { login, from: from.toISOString(), to: now.toISOString() } }),
});
if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
const payload = await response.json();
if (payload.errors) throw new Error(payload.errors.map((error) => error.message).join("; "));

const user = payload.data.user;
if (!user) throw new Error(`GitHub user ${login} was not found`);
const cc = user.contributionsCollection;
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

const repos = user.repositories.nodes.filter((repo) => !repo.isFork);
const languages = new Map();
for (const repo of repos) {
  const language = repo.primaryLanguage;
  if (!language) continue;
  const current = languages.get(language.name) || { count: 0, color: language.color || palette.teal };
  current.count += 1;
  languages.set(language.name, current);
}
const languageRows = [...languages.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
const languageMax = Math.max(...languageRows.map(([, info]) => info.count), 1);
const languageBody = languageRows.map(([name, info], index) => {
  const y = 106 + index * 34;
  const width = Math.max(4, Math.round((info.count / languageMax) * 650));
  return `<circle cx="62" cy="${y + 10}" r="6" fill="${info.color}"/><text x="80" y="${y + 15}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="14">${esc(name)}</text><rect x="260" y="${y}" width="700" height="20" rx="5" fill="${palette.panel}"/><rect x="260" y="${y}" width="${width}" height="20" rx="5" fill="${info.color}"/><text x="985" y="${y + 15}" fill="${palette.ink}" font-family="Arial,sans-serif" font-size="13">${info.count} repos</text>`;
}).join("");
await save("repository-languages.svg", base("Public repository languages", "Primary language by repository count—not proficiency or private-work usage", languageBody, 410));

const totals = repos.reduce((acc, repo) => ({ stars: acc.stars + repo.stargazerCount, forks: acc.forks + repo.forkCount }), { stars: 0, forks: 0 });
const cards = [["PUBLIC REPOSITORIES", repos.length], ["STARS RECEIVED", totals.stars], ["FORKS RECEIVED", totals.forks], ["YEAR CONTRIBUTIONS", cc.contributionCalendar.totalContributions]];
const cardBody = cards.map(([label, value], index) => {
  const x = 52 + index * 280;
  return `<rect x="${x}" y="112" width="248" height="132" rx="14" fill="${palette.panel}" stroke="${index === 3 ? palette.gold : palette.teal}"/><text x="${x + 124}" y="170" text-anchor="middle" fill="${index === 3 ? palette.gold : palette.teal}" font-family="Georgia,serif" font-size="34">${value}</text><text x="${x + 124}" y="208" text-anchor="middle" fill="${palette.muted}" font-family="Arial,sans-serif" font-size="12">${label}</text>`;
}).join("");
await save("portfolio-summary.svg", base("Public GitHub snapshot", `Generated ${now.toISOString().slice(0, 10)} from GitHub's API`, cardBody, 290));

// Keep the generated asset set aligned with the two analytics selected for the profile.
for (const name of ["portfolio-summary.svg", "contribution-trend.svg", "weekday-rhythm.svg", "project-contributions.svg"]) {
  await unlink(new URL(name, outDir)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
