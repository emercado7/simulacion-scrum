const API_BASE = "https://pokeapi.co/api/v2";

const detailStatus = document.getElementById("detailStatus");
const pokemonDetail = document.getElementById("pokemonDetail");

const pokeImg = document.getElementById("pokeImg");
const typeBadges = document.getElementById("typeBadges");

const pokeId = document.getElementById("pokeId");
const pokeName = document.getElementById("pokeName");
const pokeGenus = document.getElementById("pokeGenus");
const pokeFlavor = document.getElementById("pokeFlavor");

const pokeHeight = document.getElementById("pokeHeight");
const pokeWeight = document.getElementById("pokeWeight");
const pokeAbilities = document.getElementById("pokeAbilities");

const statsEl = document.getElementById("stats");
const baseExp = document.getElementById("baseExp");
const captureRate = document.getElementById("captureRate");
const baseHappiness = document.getElementById("baseHappiness");
const jsonLink = document.getElementById("jsonLink");

const favBtn = document.getElementById("favBtn");
const FAV_KEY = "pokeblog_favs_v1";

function cap(s) {
    return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

function spriteFrom(poke) {
    return poke?.sprites?.other?.["official-artwork"]?.front_default
    || poke?.sprites?.front_default
    || "";
}

function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return res.json();
}

function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch { return []; }
}
function setFavs(arr) {
    localStorage.setItem(FAV_KEY, JSON.stringify(arr));
}
function isFav(id) {
    return getFavs().some(f => f.id === id);
}
function toggleFav(poke) {
    const favs = getFavs();
    const idx = favs.findIndex(f => f.id === poke.id);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.unshift({ id: poke.id, name: poke.name });
    setFavs(favs);
}

function setFavButton(id) {
    if (isFav(id)) {
    favBtn.textContent = "★ En favoritos";
    favBtn.classList.remove("btn-warning");
    favBtn.classList.add("btn-outline-warning");
    } else {
    favBtn.textContent = "☆ Agregar a favoritos";
    favBtn.classList.remove("btn-outline-warning");
    favBtn.classList.add("btn-warning");
    }
}

function renderStats(stats) {
    const labels = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Atq. Esp.",
    "special-defense": "Def. Esp.",
    speed: "Velocidad"
    };

    statsEl.innerHTML = stats.map(s => {
    const name = labels[s.stat.name] || s.stat.name;
    const value = s.base_stat;
    const pct = Math.min(100, Math.round((value / 200) * 100)); // escala simple
    return `
        <div class="stat-row">
        <div class="stat-name">${name}</div>
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" style="width:${pct}%"></div>
        </div>
        <div class="text-end fw-semibold">${value}</div>
        </div>
    `;
    }).join("");
}

(async function init() {
    const nameOrId = getQueryParam("name");
    if (!nameOrId) {
    detailStatus.textContent = "Falta el parámetro ?name= (ej: pokemon.html?name=pikachu)";
    return;
    }

    try {
    detailStatus.textContent = "Cargando ficha…";

    const poke = await fetchJSON(`${API_BASE}/pokemon/${String(nameOrId).toLowerCase()}`);
    const species = await fetchJSON(`${API_BASE}/pokemon-species/${poke.id}`);

    // Tipos
    typeBadges.innerHTML = poke.types
        .map(t => `<span class="badge bg-light text-dark type-badge">${t.type.name}</span>`)
        .join("");

    // Imagen + títulos
    pokeImg.src = spriteFrom(poke);
    pokeImg.alt = poke.name;

    pokeId.textContent = `#${poke.id}`;
    pokeName.textContent = cap(poke.name);

    const genusES = species.genera?.find(g => g.language?.name === "es")?.genus || "Pokémon";
    pokeGenus.textContent = genusES;

    const flavorES = species.flavor_text_entries
        ?.find(e => e.language?.name === "es")
        ?.flavor_text?.replace(/\f|\n|\r/g, " ")
        || "No hay descripción en español disponible para este Pokémon.";
    pokeFlavor.textContent = flavorES;

    // Datos base
    pokeHeight.textContent = `${(poke.height / 10).toFixed(1)} m`;
    pokeWeight.textContent = `${(poke.weight / 10).toFixed(1)} kg`;
    pokeAbilities.textContent = poke.abilities.map(a => a.ability.name).join(", ");

    renderStats(poke.stats);

    baseExp.textContent = poke.base_experience ?? "—";
    captureRate.textContent = species.capture_rate ?? "—";
    baseHappiness.textContent = species.base_happiness ?? "—";

    jsonLink.href = `${API_BASE}/pokemon/${poke.id}`;

    // Favoritos
    setFavButton(poke.id);
    favBtn.addEventListener("click", () => {
        toggleFav(poke);
        setFavButton(poke.id);
    });

    // Mostrar
    pokemonDetail.classList.remove("d-none");
    detailStatus.textContent = "";
    } catch (e) {
    console.error(e);
    detailStatus.textContent = "No pude cargar ese Pokémon. Revisa el nombre/ID e inténtalo de nuevo.";
    }
})();
