const API_BASE = "https://pokeapi.co/api/v2";
const container = document.getElementById("pokemon-container");
const statusEl = document.getElementById("status");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

let offset = 0;
const limit = 12;

function cap(s) {
    return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function spriteFrom(poke) {
    return poke?.sprites?.other?.["official-artwork"]?.front_default
    || poke?.sprites?.front_default
    || "";
}

function cardHTML(poke) {
    const types = poke.types.map(t => t.type.name);

    return `
    <div class="col-12 col-md-6 col-lg-4">
        <article class="card pokemon-card h-100">
        <div class="card-body">
            <div class="d-flex gap-3 align-items-center">
            <img class="pokemon-img" src="${spriteFrom(poke)}" alt="${poke.name}">
            <div class="flex-grow-1">
                <div class="text-secondary small">#${poke.id}</div>
                <h3 class="h5 mb-1">${cap(poke.name)}</h3>
                <div class="d-flex flex-wrap gap-1">
                ${types.map(t => `<span class="badge bg-light text-dark type-badge">${t}</span>`).join("")}
                </div>
            </div>
            </div>

            <p class="text-secondary mt-3 mb-3">
                Haz click para ver su ficha completa (stats, habilidades, más info).
            </p>

            <div class="d-grid">
                <button class="btn btn-primary" data-open="${poke.name}">Ver ficha</button>
            </div>
            </div>
        </article>
    </div>
    `;
}

function attachEvents() {
    document.querySelectorAll("[data-open]").forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.getAttribute("data-open");
            window.location.href = `pokemon.html?name=${encodeURIComponent(name)}`;
        });
    });
}

async function loadMore() {
    statusEl.textContent = "Cargando…";
    try {
        const list = await fetchJSON(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
        offset += limit;

    const items = [];
    for (const p of list.results) {
        const poke = await fetchJSON(p.url);
        items.push(poke);
    }

    container.insertAdjacentHTML("beforeend", items.map(cardHTML).join(""));
    attachEvents();
    statusEl.textContent = `Mostrando ${container.children.length} Pokémon.`;
    } catch (e) {
    console.error(e);
    statusEl.textContent = "Error cargando Pokémon. Revisa tu conexión.";
    }
}

loadMoreBtn.addEventListener("click", loadMore);

// Buscador: manda directo a pokemon.html
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;

    window.location.href = `pokemon.html?name=${encodeURIComponent(q.toLowerCase())}`;
});

// Init
loadMore();
