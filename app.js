"use strict";

// ===== APP INITIALISERING =====
// Start app når DOM er loaded (hele HTML siden er færdig med at indlæse)
document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle spil - tilgængelig for alle funktioner
let allGames = [];

// Initialize the app - sæt event listeners og hent data
function initApp() {
  getGames(); // Henter spil data fra JSON fil

  document.querySelector("#search-input").addEventListener("input", filterGames);
  document.querySelector("#category-select").addEventListener("change", filterGames);
  document.querySelector("#playtime-select").addEventListener("change", filterGames);
  document.querySelector("#players-select").addEventListener("change", filterGames);
  document.querySelector("#difficulty-select").addEventListener("change", filterGames);
  document.querySelector("#more-select").addEventListener("change", filterGames);
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

// Laver game card
function displayGame(game) {
  const gameList = document.querySelector("#game-list"); 

  // Bygger HTML struktur dynamisk - template literal med ${} til at indsætte data
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



// FILTER DROPDOWNS


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
      }}}

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
      

// Age dropdown // Alder dropdown fra "Flere filtre"
const moreSelect = document.getElementById("more-select");
const ages = new Set();
for (const game of allGames) {
  if (game.age) ages.add(game.age);
}
const sortedAges = Array.from(ages).sort((a, b) => a - b);

        // fungerer for alle dropdowns under "Flere filtre"
        const originalOptions = [...moreSelect.options].map((opt) => ({
          value: opt.value,
          text: opt.text,
        }));
        // store original options on the element so other functions (clearAllFilters) can restore them
        moreSelect._originalOptions = originalOptions;


    moreSelect.addEventListener("change", function () {
      if (this.value === "age") {
        let ageOptionsHTML = '<option value="">Vælg alder</option>';
        sortedAges.forEach(age => {
          ageOptionsHTML += `<option value="${age}">${age}+</option>`;
        });
        ageOptionsHTML += '<option value="back">← Tilbage</option>';
        moreSelect.innerHTML = ageOptionsHTML;
        moreSelect.dataset.mode = 'age';
      } else if (this.value === "back") {
    
    // Tilbage til original "Flere filtre" option fungerer for alle dropdowns under "Flere filtre"
    moreSelect.innerHTML = originalOptions
      .map(opt => `<option value="${opt.value}">${opt.text}</option>`)
      .join("");
    moreSelect.dataset.mode = '';
}});


// Language dropdown // Sprog dropdown fra "Flere filtre"
const languages = new Set();
for (const game of allGames) {
  if (game.language) languages.add(game.language);
}
const sortedLanguages = Array.from(languages).sort();

    moreSelect.addEventListener("change", function () {
      if (this.value === "language") {
        let languageOptionsHTML = '<option value="">Vælg sprog</option>';
        sortedLanguages.forEach(language => {
          languageOptionsHTML += `<option value="${language}">${language}</option>`;
        });
        languageOptionsHTML += '<option value="back">← Tilbage</option>';
        moreSelect.innerHTML = languageOptionsHTML;
        moreSelect.dataset.mode = 'language';
      }});

  
// Location dropdown // Lokation dropdown fra "Flere filtre"
const locations = new Set();
for (const game of allGames) {
  if (game.location) locations.add(game.location);
} 
const sortedLocations = Array.from(locations).sort();

    moreSelect.addEventListener("change", function () {
      if (this.value === "location") {
        let locationOptionsHTML = '<option value="">Vælg lokation</option>';
        sortedLocations.forEach(location => {
          locationOptionsHTML += `<option value="${location}">${location}</option>`;
        });
        locationOptionsHTML += '<option value="back">← Tilbage</option>';
        moreSelect.innerHTML = locationOptionsHTML;
        moreSelect.dataset.mode = 'location';
      }});


// Rating dropdown // Rating dropdown fra "Flere filtre"
const ratings = new Set();
for (const game of allGames) {
  if (game.rating) ratings.add(game.rating);
} 
const sortedRatings = Array.from(ratings).sort((a, b) => a - b);

    moreSelect.addEventListener("change", function () {
      if (this.value === "rating") {
        let ratingOptionsHTML = '<option value="">Vælg rating</option>';
        sortedRatings.forEach(rating => {
          ratingOptionsHTML += `<option value="${rating}">${rating}</option>`;
        });
        ratingOptionsHTML += '<option value="back">← Tilbage</option>';
        moreSelect.innerHTML = ratingOptionsHTML;
        moreSelect.dataset.mode = 'rating';
      }});

}

// ===== MODAL FUNKTIONER =====

// Vis game i modal dialog - popup vindue med detaljer om spil
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


// FILTER FUNKTIONER 

// Rydder alle filtre - reset alle filter felter til tomme værdier
function clearAllFilters() {

  // Rydder alle input felter - sætter value til tom string eller standard værdi
  document.querySelector("#search-input").value = "";
  document.querySelector("#players-select").value = "all";
  document.querySelector("#playtime-select").value = "all";
  document.querySelector("#category-select").value = "all";
  document.querySelector("#difficulty-select").value = "all";

  // Tilbage til den oprindelige "Flere filtre" og fjerner aktiv tilstand
  const moreSelect = document.querySelector("#more-select");
  if (moreSelect) {
    if (moreSelect._originalOptions) {
      moreSelect.innerHTML = moreSelect._originalOptions
        .map((opt) => `<option value="${opt.value}">${opt.text}</option>`)
        .join("");
    }
    moreSelect.dataset.mode = ""; 
    moreSelect.value = "all"; 
  }

  // Kør filtrering igen (vil vise alle spil da alle filtre er ryddet)
  filterGames();
}

// Komplet filtrering med alle funktioner
function filterGames() {
  
  // Henter alle filter værdier fra input felterne
  const searchValue = document.querySelector("#search-input").value.toLowerCase();
  const categoryValue = document.querySelector("#category-select").value;
  const playtimeValue = document.querySelector("#playtime-select").value;
  const playersValue = document.querySelector("#players-select")?.value;
  const difficultyValue = document.querySelector("#difficulty-select").value;
  const moreValue = document.querySelector("#more-select").value;
  const moreMode = document.querySelector("#more-select").dataset.mode || "";

  let filteredGames = allGames;

  // FILTER 1: Søgetekst - filtrer på spil titel
  if (searchValue) {
    filteredGames = filteredGames.filter((game) => 
    game.title.toLowerCase().includes(searchValue)
    );
  }

  // FILTER 2: Category - filtrer på valgt kategori (string match)
  if (categoryValue !== "all") {
    filteredGames = filteredGames.filter((game) => 
    game.genre === categoryValue);
  }

  // FILTER 3: Playtime - filtrer på valgt spilletid (playtime in minutes)
  if (playtimeValue !== "all") {
    filteredGames = filteredGames.filter((game) => 
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

  // FILTER 5: Difficulty - filtrer på sværhedsgrad (string match)
  if (difficultyValue !== "all") {
    filteredGames = filteredGames.filter((game) => 
    game.difficulty === difficultyValue);
  }

  // FILTER 6/7/8/9: Handle the active "more" filter based on mode
  if (moreMode === "age") {
    const numAge = Number(moreValue);
    if (numAge > 0) {
      filteredGames = filteredGames.filter((game) => game.age && game.age <= numAge);
    }
  } else if (moreMode === "language") {
    if (moreValue && moreValue !== "all") {
      filteredGames = filteredGames.filter((game) => game.language === moreValue);
    }
  } else if (moreMode === "location") {
    if (moreValue && moreValue !== "all") {
      filteredGames = filteredGames.filter((game) => game.location === moreValue);
    }
  }
  else if (moreMode === "rating") {
    if (moreValue && moreValue !== "all") {
      filteredGames = filteredGames.filter((game) => String(game.rating) === moreValue);
    }
  }  
  

  // Viser de filtrerede spil

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
};