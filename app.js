const API_KEY = "d0fd0e9a4a97976590d9934778e41b63";
const BASE_URL = "https://v3.football.api-sports.io";

async function apiGet(endpoint) {
    const response = await fetch(BASE_URL + endpoint, {
        headers: {
            "x-apisports-key": API_KEY
        }
    });
    const data = await response.json();
    return data.response;
}

// ---------------------------
// 1. Charger les matchs du jour
// ---------------------------
async function loadFootballMatches() {
    const container = document.getElementById("match-list");

    const today = new Date().toISOString().split("T")[0];

    const matches = await apiGet(`/fixtures?date=${today}`);

    container.innerHTML = "";

    matches.forEach(match => {
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>${match.teams.home.name}</strong> vs 
            <strong>${match.teams.away.name}</strong><br>
            ${match.league.name}
        `;

        div.onclick = () => {
            window.location.href = `match.html?id=${match.fixture.id}`;
        };

        container.appendChild(div);
    });
}

// ---------------------------
// 2. Charger les détails d’un match
// ---------------------------
async function loadMatchDetails() {
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get("id");

    const container = document.getElementById("match-details");

    const details = await apiGet(`/fixtures?id=${matchId}`);

    const match = details[0];

    container.innerHTML = `
        <h2>${match.teams.home.name} vs ${match.teams.away.name}</h2>
        <p>Compétition : ${match.league.name}</p>
        <p>Date : ${match.fixture.date}</p>
    `;
}
