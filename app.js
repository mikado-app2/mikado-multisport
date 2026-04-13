/* ============================
   CONFIG API
============================ */
const API_KEY = "d0fd0e9a4a97976590d9934778e41b63";

const URLS = {
    football:   "https://v3.football.api-sports.io",
    basketball: "https://v1.basketball.api-sports.io",
    hockey:     "https://v1.hockey.api-sports.io"
};

const TENNIS_API_KEY = "9a6aa2d0fad0003ae55811311d1b2fba7cd20b8bdfb93604b7c9a99bdbb33ef1";
const TENNIS_URL = "https://api.api-tennis.com/tennis/";

/* ============================
   LIGUES PRIORITAIRES FOOTBALL
============================ */
const LIGUES_PRIORITAIRES = [
    "UEFA Champions League",
    "UEFA Europa League",
    "Ligue 1",
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga"
];

/* ============================
   FONCTION API GÉNÉRALE
============================ */
async function apiGet(baseUrl, endpoint) {
    const response = await fetch(baseUrl + endpoint, {
        headers: { "x-apisports-key": API_KEY }
    });
    const data = await response.json();
    return data.response;
}

/* ============================
   HELPERS
============================ */
function renderMatchCard(container, teams, center) {
    const div = document.createElement("div");
    div.className = "match-card";
    div.innerHTML = `
        <div class="match-teams-row">
            <div class="team-block">
                <img src="${teams.home.logo}" class="team-logo">
                <div class="team-name">${teams.home.name}</div>
            </div>
            <div class="match-center">${center}</div>
            <div class="team-block" style="justify-content: flex-end;">
                <div class="team-name" style="text-align:right;">${teams.away.name}</div>
                <img src="${teams.away.logo}" class="team-logo">
            </div>
        </div>
    `;
    container.appendChild(div);
    return div;
}

function renderLeagueHeader(container, logo, name, country) {
    const header = document.createElement("div");
    header.className = "league-header";
    header.innerHTML = `
        <img src="${logo}" class="match-league-logo">
        <span>${name}</span>
        ${country ? `<span class="league-country">${country}</span>` : ""}
    `;
    container.appendChild(header);
}

function groupByLeague(items, getLeague) {
    const ligues = {};
    items.forEach(item => {
        const league = getLeague(item);
        const key = league.name;
        if (!ligues[key]) {
            ligues[key] = { logo: league.logo, country: league.country || "", matches: [] };
        }
        ligues[key].matches.push(item);
    });
    return ligues;
}

function centerVs(timeStr) {
    return `<div class="match-vs">vs</div><div class="match-time">${timeStr}</div>`;
}
function centerLive(h, a) {
    return `<div class="match-vs" style="color:var(--live-red)">${h} – ${a}</div>
            <div class="match-time" style="color:var(--live-red)">EN DIRECT</div>`;
}
function centerFT(h, a) {
    return `<div class="match-vs">${h} – ${a}</div>
            <div class="match-time">Terminé</div>`;
}

/* ============================
   1. FOOTBALL
============================ */
async function loadFootballMatches() {
    const container = document.getElementById("match-list");
    container.innerHTML = "Chargement...";
    const today = new Date().toISOString().split("T")[0];
    const matches = await apiGet(URLS.football, `/fixtures?date=${today}`);
    container.innerHTML = "";

    if (!matches || matches.length === 0) {
        container.innerHTML = "<p style='color:var(--muted);text-align:center;padding:30px'>Aucun match aujourd'hui</p>";
        return;
    }

    const ligues = groupByLeague(matches, m => ({
        name: m.league.name, logo: m.league.logo, country: m.league.country
    }));

    const liguesSorted = Object.entries(ligues).sort(([a], [b]) => {
        const ia = LIGUES_PRIORITAIRES.indexOf(a);
        const ib = LIGUES_PRIORITAIRES.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
    });

    liguesSorted.forEach(([ligueName, ligue]) => {
        renderLeagueHeader(container, ligue.logo, ligueName, ligue.country);
        ligue.matches.forEach(match => {
            const date = new Date(match.fixture.date);
            const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            const s = match.fixture.status?.short;
            const gh = match.goals?.home ?? "-";
            const ga = match.goals?.away ?? "-";
            let center;
            if (["1H","2H","HT","ET","P"].includes(s)) center = centerLive(gh, ga);
            else if (["FT","AET","PEN"].includes(s))   center = centerFT(gh, ga);
            else                                        center = centerVs(timeStr);

            const card = renderMatchCard(container, {
                home: { logo: match.teams.home.logo, name: match.teams.home.name },
                away: { logo: match.teams.away.logo, name: match.teams.away.name }
            }, center);
            card.onclick = () => { window.location.href = `match.html?id=${match.fixture.id}`; };
        });
    });
}

/* ============================
   2. BASKETBALL
============================ */
async function loadBasketballMatches() {
    const container = document.getElementById("match-list");
    container.innerHTML = "Chargement...";
    const today = new Date().toISOString().split("T")[0];
    const games = await apiGet(URLS.basketball, `/games?date=${today}`);
    container.innerHTML = "";

    if (!games || games.length === 0) {
        container.innerHTML = "<p style='color:var(--muted);text-align:center;padding:30px'>Aucun match aujourd'hui</p>";
        return;
    }

    const ligues = groupByLeague(games, g => ({
        name: g.league.name, logo: g.league.logo, country: g.country?.name || ""
    }));

    Object.entries(ligues).forEach(([ligueName, ligue]) => {
        renderLeagueHeader(container, ligue.logo, ligueName, ligue.country);
        ligue.matches.forEach(game => {
            const date = new Date(game.date);
            const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            const s = game.status?.short;
            const gh = game.scores?.home?.total ?? "-";
            const ga = game.scores?.away?.total ?? "-";
            let center;
            if (["LIVE","HT","Q1","Q2","Q3","Q4","OT"].includes(s)) center = centerLive(gh, ga);
            else if (["FT","AOT"].includes(s))                       center = centerFT(gh, ga);
            else                                                      center = centerVs(timeStr);

            renderMatchCard(container, {
                home: { logo: game.teams.home.logo, name: game.teams.home.name },
                away: { logo: game.teams.away.logo, name: game.teams.away.name }
            }, center);
        });
    });
}

/* ============================
   3. HOCKEY
============================ */
async function loadHockeyMatches() {
    const container = document.getElementById("match-list");
    container.innerHTML = "Chargement...";
    const today = new Date().toISOString().split("T")[0];
    const games = await apiGet(URLS.hockey, `/games?date=${today}`);
    container.innerHTML = "";

    if (!games || games.length === 0) {
        container.innerHTML = "<p style='color:var(--muted);text-align:center;padding:30px'>Aucun match aujourd'hui</p>";
        return;
    }

    const ligues = groupByLeague(games, g => ({
        name: g.league.name, logo: g.league.logo, country: g.country?.name || ""
    }));

    Object.entries(ligues).forEach(([ligueName, ligue]) => {
        renderLeagueHeader(container, ligue.logo, ligueName, ligue.country);
        ligue.matches.forEach(game => {
            const date = new Date(game.date);
            const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            const s = game.status?.short;
            const gh = game.scores?.home ?? "-";
            const ga = game.scores?.away ?? "-";
            let center;
            if (["LIVE","P1","P2","P3","OT","SO"].includes(s)) center = centerLive(gh, ga);
            else if (["FT","AOT","ASO"].includes(s))            center = centerFT(gh, ga);
            else                                                 center = centerVs(timeStr);

            renderMatchCard(container, {
                home: { logo: game.teams.home.logo, name: game.teams.home.name },
                away: { logo: game.teams.away.logo, name: game.teams.away.name }
            }, center);
        });
    });
}

/* ============================
   4. DÉTAILS MATCH (FOOTBALL)
============================ */
async function loadMatchDetails() {
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get("id");
    const container = document.getElementById("match-details");
    const details = await apiGet(URLS.football, `/fixtures?id=${matchId}`);
    const match = details[0];
    const gh = match.goals?.home ?? "-";
    const ga = match.goals?.away ?? "-";
    const s = match.fixture.status?.short;
    const scored = ["FT","AET","PEN","1H","2H","HT"].includes(s);

    container.innerHTML = `
        <div class="match-details-header">
            <div class="match-details-league">
                <img src="${match.league.logo}">
                <span>${match.league.name}</span>
            </div>
            <div class="match-details-teams">
                <div class="match-details-team">
                    <img src="${match.teams.home.logo}">
                    <div class="match-details-team-name">${match.teams.home.name}</div>
                </div>
                <div class="match-details-vs">${scored ? `${gh} – ${ga}` : "VS"}</div>
                <div class="match-details-team">
                    <img src="${match.teams.away.logo}">
                    <div class="match-details-team-name">${match.teams.away.name}</div>
                </div>
            </div>
            <div class="match-details-info">
                <div>Compétition : ${match.league.name}</div>
                <div>Date : ${new Date(match.fixture.date).toLocaleString("fr-FR")}</div>
                <div>Statut : ${match.fixture.status?.long ?? "-"}</div>
            </div>
        </div>
    `;
        }


/* ============================
   5. TENNIS
============================ */
async function loadTennisMatches() {
    const container = document.getElementById("match-list");
    container.innerHTML = "Chargement...";

    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`${TENNIS_URL}?method=get_fixtures&APIkey=${TENNIS_API_KEY}&date_start=${today}&date_stop=${today}`);
    const data = await response.json();
    const matches = data.result;

    container.innerHTML = "";

    if (!matches || matches.length === 0) {
        container.innerHTML = "<p style='color:var(--muted);text-align:center;padding:30px'>Aucun match aujourd'hui</p>";
        return;
    }

    // Grouper par tournoi
    const tournois = {};
    matches.forEach(match => {
        const key = match.league_name || "Autre";
        if (!tournois[key]) {
            tournois[key] = { type: match.country_name || "", matches: [] };
        }
        tournois[key].matches.push(match);
    });

    Object.entries(tournois).forEach(([tournoisName, tournoi]) => {
        const header = document.createElement("div");
        header.className = "league-header";
        header.innerHTML = `
            <span>🎾</span>
            <span>${tournoisName}</span>
            ${tournoi.type ? `<span class="league-country">${tournoi.type}</span>` : ""}
        `;
        container.appendChild(header);

        tournoi.matches.forEach(match => {
            const div = document.createElement("div");
            div.className = "match-card";

            const isLive = match.event_live === "1";
            const isFinished = match.event_status === "Finished";
            const score = match.event_final_result || "";

            let center;
            if (isLive) {
                center = `<div class="match-vs" style="color:var(--live-red)">${match.event_game_result || "●"}</div>
                          <div class="match-time" style="color:var(--live-red)">EN DIRECT</div>`;
            } else if (isFinished && score) {
                center = `<div class="match-vs">${score}</div>
                          <div class="match-time">Terminé</div>`;
            } else {
                center = `<div class="match-vs">vs</div>
                          <div class="match-time">${match.event_time || ""}</div>`;
            }

            div.innerHTML = `
                <div class="match-teams-row">
                    <div class="team-block" style="flex-direction:column; align-items:flex-start; gap:2px;">
                        <div class="team-name">${match.event_first_player}</div>
                    </div>
                    <div class="match-center">${center}</div>
                    <div class="team-block" style="flex-direction:column; align-items:flex-end; gap:2px; justify-content:flex-end;">
                        <div class="team-name" style="text-align:right;">${match.event_second_player}</div>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    });
}
