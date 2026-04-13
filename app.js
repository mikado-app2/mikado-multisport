/* ============================
   CONFIG API
============================ */
const API_KEY = "d0fd0e9a4a97976590d9934778e41b63";
const BASE_URL = "https://v3.football.api-sports.io";

/* ============================
   LIGUES PRIORITAIRES
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
async function apiGet(endpoint) {
    const response = await fetch(BASE_URL + endpoint, {
        headers: {
            "x-apisports-key": API_KEY
        }
    });
    const data = await response.json();
    return data.response;
}

/* ============================
   1. MATCHS DU JOUR (FOOTBALL)
============================ */
async function loadFootballMatches() {
    const container = document.getElementById("match-list");

    const today = new Date().toISOString().split("T")[0];
    const matches = await apiGet(`/fixtures?date=${today}`);

    container.innerHTML = "";

    // Grouper par ligue
    const ligues = {};
    matches.forEach(match => {
        const ligueName = match.league.name;
        if (!ligues[ligueName]) {
            ligues[ligueName] = {
                logo: match.league.logo,
                country: match.league.country,
                matches: []
            };
        }
        ligues[ligueName].matches.push(match);
    });

    // Trier : prioritaires d'abord, puis le reste
    const liguesSorted = Object.entries(ligues).sort(([a], [b]) => {
        const ia = LIGUES_PRIORITAIRES.indexOf(a);
        const ib = LIGUES_PRIORITAIRES.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
    });

    // Afficher par ligue
    liguesSorted.forEach(([ligueName, ligue]) => {

        const header = document.createElement("div");
        header.className = "league-header";
        header.innerHTML = `
            <img src="${ligue.logo}" class="match-league-logo">
            <span>${ligueName}</span>
            <span class="league-country">${ligue.country}</span>
        `;
        container.appendChild(header);

        ligue.matches.forEach(match => {
            const div = document.createElement("div");
            div.className = "match-card";

            const date = new Date(match.fixture.date);
            const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

            div.innerHTML = `
                <div class="match-teams-row">
                    <div class="team-block">
                        <img src="${match.teams.home.logo}" class="team-logo">
                        <div class="team-name">${match.teams.home.name}</div>
                    </div>
                    <div class="match-center">
                        <div class="match-vs">vs</div>
                        <div class="match-time">${timeStr}</div>
                    </div>
                    <div class="team-block" style="justify-content: flex-end;">
                        <div class="team-name" style="text-align:right;">${match.teams.away.name}</div>
                        <img src="${match.teams.away.logo}" class="team-logo">
                    </div>
                </div>
            `;

            div.onclick = () => {
                window.location.href = `match.html?id=${match.fixture.id}`;
            };

            container.appendChild(div);
        });
    });
}

/* ============================
   2. DÉTAILS D'UN MATCH
============================ */
async function loadMatchDetails() {
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get("id");

    const container = document.getElementById("match-details");

    const details = await apiGet(`/fixtures?id=${matchId}`);
    const match = details[0];

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
                <div class="match-details-vs">VS</div>
                <div class="match-details-team">
                    <img src="${match.teams.away.logo}">
                    <div class="match-details-team-name">${match.teams.away.name}</div>
                </div>
            </div>
            <div class="match-details-info">
                <div>Compétition : ${match.league.name}</div>
                <div>Date : ${match.fixture.date}</div>
            </div>
        </div>
    `;
}
