//IMPORTS
import {recipeGenerator, spinTheCarousel, Emitter} from "culina-utils";


//CONSTANTS
let currentAbortController = null;
let currentRequestId = null;
const emitter = new Emitter();

//CONSTANTS (DOM ELEMENTS)
const recipesContainer = document.getElementById('recipes');
const recipeTemplate = document.getElementById('recipe-template');
const btnSurprise = document.getElementById('btn-surprise');

const btnSearch = document.getElementById('btn-search');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');

const btnBulkDelete = document.getElementById('btn-bulk-delete');
const btnCancelBulk = document.getElementById('btn-cancel-bulk');
const btnToggleBulk = document.getElementById('btn-toggle-bulk-mode');

const recipeCounterElement = document.getElementById("recipe-counter");

const DOM = {
    card: '.card',
    title: '.recipe-title',
    desc: '.recipe-description',
    count: '.ingredients-count',
    btnDelete: '.btn-delete',
    link: '.btn-open',
    checkbox: '.recipe-checkbox'
};


//HELPER FUNCTIONS
function handleSearchToggle() {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) {
        searchBar.removeAttribute('inert');
        searchInput.focus();
    } else {
        searchBar.setAttribute('inert', '');
    }
}

// Delays function execution until the user stops typing
function debounce(callback, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            callback.apply(this, args); // Executes the callback and preserves the correct "this" context
        }, delay);
    };
}

// Fetches matching recipes from the db. Error (not 2XX) = empty array to prevent UI crashes
async function fetchSearch(searchText) {
    const response = await fetch(`http://localhost:3000/recipes/search?searchText=${searchText}`);

    if (!response.ok) {
        console.error("Помилка пошуку");
        return [];
    }

    return await response.json();
}

async function fetchRecipes() {
    const response = await fetch('http://localhost:3000/recipes');
    return response.json();
}

async function deleteRecipe(id, deleteButtonElement) {
    try {
        await fetch(`http://localhost:3000/recipes/${id}`, {
            method: 'DELETE'
        });

        const card = deleteButtonElement.closest(DOM.card);

        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';

            setTimeout(() => card.remove(), 300);
        }

    } catch (error) {
        console.error("Помилка видалення:", error);
        alert("Не вдалося видалити рецепт.");
    }
}

function createRecipeCard(recipe) {
    const clone = recipeTemplate.content.cloneNode(true);

    const ui = {
        title: clone.querySelector(DOM.title),
        desc: clone.querySelector(DOM.desc),
        count: clone.querySelector(DOM.count),
        btnDelete: clone.querySelector(DOM.btnDelete),
        link: clone.querySelector(DOM.link),
        checkbox: clone.querySelector(DOM.checkbox)
    };

    ui.title.textContent = recipe.title;
    ui.desc.textContent = recipe.description;

    if (ui.checkbox) {
        ui.checkbox.value = recipe.id;
    }

    //? determines if object is null or undefined. If yes, then set it to 0 instead of throwing error
    const count = recipe.ingredients?.length || 0;
    ui.count.textContent = `Інгредієнтів: ${count}`;

    ui.link.href = `pages/recipe.html?id=${recipe.id}`;

    ui.btnDelete.addEventListener("click", async () => {
        if (confirm(`Видалити рецепт "${recipe.title}"?`)) {
            ui.btnDelete.textContent = "Видалення...";
            ui.btnDelete.disabled = true;

            await deleteRecipe(recipe.id, ui.btnDelete);
        }
    });

    return clone;
}

// EVENT LISTENERS (Reactive Communication)

// Updates UI counter
emitter.on("recipesChanged", (totalCount) => {
    if (recipeCounterElement) {
        recipeCounterElement.textContent = `Всього рецептів: ${totalCount}`;
    }
});

// Broken listener
emitter.on("recipesChanged", () => {
    throw new Error("This listener is broken intentionally to test the Emitter's error handling!");
});

// Logger, shows that execution continues
emitter.on("recipesChanged", (totalCount) => {
    console.log(`[Frontend] The UI was successfully updated. Total recipes: ${totalCount}`);
});

//MAIN FUNCTIONS
async function handleSurpriseMe() {
    btnSurprise.disabled = true;
    btnSurprise.textContent = 'Пошук...';

    const recipes = await fetchRecipes();
    recipes.sort(() => Math.random() - 0.5);
    const gen = recipeGenerator(recipes);
    const recipe = await spinTheCarousel(gen, 3);
    window.location.href = `pages/recipe.html?id=${recipe.id}`;
}

// Fetches and displays recipes as the user types, or restores all recipes if input is cleared
const handleLiveSearch = debounce(async (event) => {
    const searchText = event.target.value.trim();

    if (searchText === "") {
        await loadRecipes();
        return;
    }

    const recipes = await fetchSearch(searchText);
    recipesContainer.innerHTML = "";

    if (recipes.length === 0) {
        recipesContainer.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>Нічого не знайдено за цим запитом.</p>";
        return;
    }

    recipes.forEach(recipe => {
        const cardElement = createRecipeCard(recipe);
        recipesContainer.appendChild(cardElement);
    });
}, 500);

async function loadRecipes() {
    try {
        recipesContainer.innerHTML = '';

        const recipes = await fetchRecipes();

        if (recipes.length === 0) {
            recipesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center;">
                    <p class="card-desc">Рецептів поки немає. Додайте перший!</p>
                </div>
            `;

            emitter.emit("recipesChanged", 0);

            return;
        }

        recipes.forEach(recipe => {
            const cardElement = createRecipeCard(recipe);
            recipesContainer.appendChild(cardElement);
        });

        emitter.emit("recipesChanged", recipes.length);

    } catch (error) {
        console.error("Помилка завантаження:", error);
        recipesContainer.innerHTML = '<p style="color: red; text-align: center;">Сталася помилка при завантаженні.</p>';
    }
}

function toggleBulkMode() {
    const checkboxWrappers = document.querySelectorAll('.card-checkbox-wrapper');
    const isHidden = checkboxWrappers.length > 0 && checkboxWrappers[0].style.display === 'none';

    if (isHidden) {
        checkboxWrappers.forEach(w => w.style.display = 'block');
        btnToggleBulk.textContent = 'Скасувати';
        btnBulkDelete.style.display = 'inline-block';
    } else {
        checkboxWrappers.forEach(w => w.style.display = 'none');
        btnToggleBulk.textContent = 'Вибрати';
        btnBulkDelete.style.display = 'none';
        document.querySelectorAll(DOM.checkbox).forEach(cb => cb.checked = false);
    }
}

// Sends a bulk delete request with a unique requestId to allow server-side cancellation
async function handleBulkDelete() {
    const checkedBoxes = document.querySelectorAll(`${DOM.checkbox}:checked`);
    const selectedIds = Array.from(checkedBoxes).map(checkbox => Number(checkbox.value));

    if (selectedIds.length === 0) {
        alert("Please select at least one recipe to delete.");
        return;
    }

    if (!confirm(`Delete ${selectedIds.length} recipes?`)) return;

    // генеруємо унікальний id для цієї операції
    currentAbortController = new AbortController();
    const requestId = `bulk-${Date.now()}`;
    currentRequestId = requestId;

    btnBulkDelete.disabled = true;
    btnCancelBulk.style.display = 'inline-block';
    btnToggleBulk.style.display = 'none';
    console.log("Starting bulk deletion...");

    try {
        const response = await fetch('http://localhost:3000/recipes/bulk', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ids: selectedIds, requestId}), // ДОДАНО requestId
            signal: currentAbortController.signal
        });

        if (response.status === 200) {
            const data = await response.json();
            console.log("Successfully deleted IDs:", data.deletedIds);
            await loadRecipes();
        } else if (response.status === 499) {
            console.log("Deletion was stopped by the user.");
            alert("Deletion process cancelled.");
            await loadRecipes();
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request aborted by the browser');
            await loadRecipes();
        } else {
            console.error('Network error:', error);
            alert("An error occurred during deletion.");
        }
    } finally {
        currentAbortController = null;
        btnBulkDelete.disabled = false;
        btnCancelBulk.style.display = 'none';
        btnToggleBulk.style.display = 'inline-block';
        toggleBulkMode();
    }
}

// Aborts the in-progress fetch and notifies the server to stop processing
async function cancelBulkDeletion() {
    if (currentAbortController) {
        console.log("Triggering the abort signal");
        currentAbortController.abort();

        if (currentRequestId) {
            await fetch('http://localhost:3000/recipes/bulk/cancel', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({requestId: currentRequestId})
            });
            currentRequestId = null;
        }
    }
}


// 5. PROGRAM EXECUTION
loadRecipes();

btnSurprise.addEventListener('click', handleSurpriseMe);

btnSearch.addEventListener('click', handleSearchToggle);
searchInput.addEventListener('input', handleLiveSearch);

btnBulkDelete.addEventListener('click', handleBulkDelete);
btnCancelBulk.addEventListener('click', cancelBulkDeletion);
btnToggleBulk.addEventListener('click', toggleBulkMode);

document.addEventListener('click', (event) => {
    if (!searchBar.contains(event.target) && !btnSearch.contains(event.target)) {
        searchBar.classList.remove('open');
    }
});