"use strict";

// ===== APP INITIALISERING =====
// Start app når DOM er loaded (hele HTML siden er færdig med at indlæse)
document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle spil - tilgængelig for alle funktioner
let allGames = [];

// #1: Initialize the app - sæt event listeners og hent data
function initApp() {
  getGames(); // Henter spil data fra JSON fil

  document.querySelector("#search-input").addEventListener("input", filterGames);
  document.querySelector("#category-select").addEventListener("change", filterGames);
  document.querySelector("#playtime-select").addEventListener("change", filterGames);
  document.querySelector("#players-select").addEventListener("change", filterGames);
  document.querySelector("#difficulty-select").addEventListener("change", filterGames);
  document.querySelector("#clear-filters").addEventListener("click", clearAllFilters);
}

async function getGames() {
  // Henter data fra URL - await venter på svar før vi går videre
  let response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );

  allGames = await response.json();

  populateGenreDropdown(); // Udfylder dropdown med genrer fra data nedenunder
  displayGames(allGames); // Viser alle spil ved start
}

// #4: Render a single game card and add event listeners - lav et spil kort
function displayGame(game) {
  const gameList = document.querySelector("#game-list"); // Find container til spil

  // Byg HTML struktur dynamisk - template literal med ${} til at indsætte data
  const gameHTML = `
  <article class="game-card" tabindex="0">
    <img src="${game.image}"
      alt="Poster of ${game.title}"
      class="game-poster"/>
      <div class="game-info">
      <h3>${game.title}</h3>

      <p class="game-playtime">Ca. ${game.playtime} min.</p>
      <p class="game-players">${game.players.min} - ${game.players.max} spillere</p>
      <p class="game-genre">${game.genre}</p>
      </div>
  </article>`;

  // Tilføjet game card til DOM (HTML) - insertAdjacentHTML sætter HTML ind uden at overskrive
  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Finder det kort vi lige har tilføjet (det sidste element)
  const newCard = gameList.lastElementChild;

  // Tilføjet click event til kortet - når brugeren klikker på kortet
  newCard.addEventListener("click", function () {
    showGameModal(game); //
  });

  // Tilføjet keyboard support (Enter og mellemrum) for tilgængelighed til website brug med PC
  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Forhindre scroll ved mellemrum
      showGameModal(game); 
    }
  });
}

// ===== DROPDOWN OG MODAL FUNKTIONER =====
// #5: Udfyld genre-dropdown med alle unikke genrer fra data

function populateGenreDropdown() {

 // Genre dropdown // Kategori dropdown
  const genreSelect = document.querySelector("#category-select");
  const genres = new Set();
  for (const game of allGames) {
    if (game.genre) genres.add(game.genre);
  }

  genreSelect.innerHTML = '<option value="all">Kategori</option>';
  genres.forEach((genre) => {
    genreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
  });

  // Players dropdown // Antal spillere dropdown
  const playersSelect = document.querySelector("#players-select");
  const playerCounts = new Set();
  for (const game of allGames) {
    if (
      game.players && typeof game.players.min === "number" && typeof game.players.max === "number") {
      for (let i = game.players.min; i <= game.players.max; i++) {
        playerCounts.add(i);
      }
    }
  }

      // Sort player counts numerically
      const sortedPlayers = Array.from(playerCounts).sort((a, b) => a - b);
      playersSelect.innerHTML = '<option value="all">Antal spillere</option>';
      sortedPlayers.forEach((num) => {
        playersSelect.innerHTML += `<option value="${num}">${num} spillere</option>`;
      });

 
  // Playtime dropdown // Varighed dropdown
  const playtimeSelect = document.querySelector("#playtime-select");
  const playtimes = new Set();
  for (const game of allGames) {
    if (game.playtime) playtimes.add(game.playtime);
  }

      // Sort playtimes numerically
      const sortedPlaytimes = Array.from(playtimes).sort();
      playtimeSelect.innerHTML = '<option value="all">Spilletid</option>';
      sortedPlaytimes.forEach((time) => {
        playtimeSelect.innerHTML += `<option value="${time}">${time} min.</option>`;
     });
     
 // Difficulty dropdown // Sværhedsgrad dropdown
  const difficultySelect = document.querySelector("#difficulty-select");
  const difficulties = new Set();
  for (const game of allGames) {
    if (game.difficulty) difficulties.add(game.difficulty);
  }

      // Sort difficulties alphabetically
      const sortedDifficulties = Array.from(difficulties).sort();
      difficultySelect.innerHTML = '<option value="all">Sværhedsgrad</option>';
      sortedDifficulties.forEach((level) => {
        difficultySelect.innerHTML += `<option value="${level}">${level}</option>`;
      });
    } 


// ===== MODAL FUNKTIONER =====

// #6: Vis game i modal dialog - popup vindue med detaljer om spil
function showGameModal(game) {

  // Find modal indhold container og byg HTML struktur dynamisk
  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <img src="${game.image}" alt="Poster af ${game.title}" class="game-poster">
    <div class="dialog-details">
      <h2>${game.title}</h2>
      <p class="game-genre">${Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || ""}</p>
      <p class="game-rating">⭐ ${game.rating}</p>
      <p class="game-description">${game.description}</p>
    </div>
  `;

  // Åbn modalen - showModal() er en built-in browser funktion
  document.querySelector("#game-dialog").showModal();
}

// ===== FILTER FUNKTIONER =====
// #7: Rydder alle filtre - reset alle filter felter til tomme værdier
function clearAllFilters() {

  // Ryd alle input felter - sætter value til tom string eller standard værdi
  document.querySelector("#search-input").value = "";
  document.querySelector("#players-select").value = "all";
  document.querySelector("#playtime-select").value = "all";
  document.querySelector("#category-select").value = "all";
  document.querySelector("#difficulty-select").value = "all";
  // Hvis du har flere filtre, tilføj dem her

  // Kør filtrering igen (vil vise alle spil da alle filtre er ryddet)
  filterGames();
}

// #8: Komplet filtrering med alle funktioner
function filterGames() {
  
  // Hent alle filter værdier fra input felterne
  const searchValue = document.querySelector("#search-input").value.toLowerCase();
  const categoryValue = document.querySelector("#category-select").value;
  const playtimeValue = document.querySelector("#playtime-select").value;
  const playersValue = document.querySelector("#players-select")?.value;
  const difficultyValue = document.querySelector("#difficulty-select").value;

  let filteredGames = allGames;

  // FILTER 1: Søgetekst - filtrer på spil titel
  if (searchValue) {filteredGames = filteredGames.filter((game) => 
    game.title.toLowerCase().includes(searchValue)
    );
  }

  // FILTER 2: Category - filtrer på valgt kategori (string match)
  if (categoryValue !== "all") {filteredGames = filteredGames.filter((game) => 
    game.genre === categoryValue);
  }

  // FILTER 3: Playtime - filtrer på valgt spilletid (playtime in minutes)
  if (playtimeValue !== "all") {filteredGames = filteredGames.filter((game) => 
    String(game.playtime) === playtimeValue
    );
  }

  // FILTER 4: Players - filtrer på antal spillere (min-max range)
  if (playersValue && playersValue !== "all") {
    const num = Number(playersValue);
    filteredGames = filteredGames.filter((game) =>
        game.players && num >= game.players.min && num <= game.players.max
    );
  }

  // Filter 5: Difficulty - filtrer på sværhedsgrad (string match)
  if (difficultyValue !== "all") {filteredGames = filteredGames.filter((game) => 
    game.difficulty === difficultyValue);
  }

  // Vis de filtrerede spil

  displayGames(filteredGames);
}

// RENDER GAME LIST (called after filtering or loading data)
function displayGames(games) {
  const gameList = document.querySelector("#game-list");
  gameList.innerHTML = "";
  if (!games || games.length === 0) {
    gameList.innerHTML =
      '<p class="no-results">Øv! Vi fandt desværre ingen resultater. </p>';
    return;
  }
  for (const game of games) {
    displayGame(game);
  }
}
