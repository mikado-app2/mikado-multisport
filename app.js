/* ============================
   CONFIG API
============================ */
const API_KEY = "d0fd0e9a4a97976590d9934778e41b63";  // ← Mets ta clé ici
const BASE_URL = "https://v3.football.api-sports.io";

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

    matches.forEach(match => {
        const div = document.createElement("div");
        div.className = "match-card";

        const date = new Date(match.fixture.date);
        const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

        div.innerHTML = `
            <div class="match-league-row">
                <div class="match-league">
                    <img src="${match.league.logo}" class="match-league-logo">
                    <span>${match.league.name}</span>
                </div>
            </div>

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
}

/* ============================
   2. DÉTAILS D’UN MATCH
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
