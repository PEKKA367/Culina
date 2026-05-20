//IMPORTS
import {recipeGenerator, spinTheCarousel} from "culina-utils";


//CONSTANTS & DOM ELEMENTS
const recipesContainer = document.getElementById('recipes');
const recipeTemplate = document.getElementById('recipe-template');
const btnSurprise = document.getElementById('btn-surprise');

const btnSearch = document.getElementById('btn-search');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');

const DOM = {
    card: '.card',
    title: '.recipe-title',
    desc: '.recipe-description',
    count: '.ingredients-count',
    btnDelete: '.btn-delete',
    link: '.btn-open'
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
    const response = await fetch(`/recipes/search?searchText=${searchText}`);

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
        link: clone.querySelector(DOM.link)
    };

    ui.title.textContent = recipe.title;
    ui.desc.textContent = recipe.description;

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
            return;
        }

        recipes.forEach(recipe => {
            const cardElement = createRecipeCard(recipe);
            recipesContainer.appendChild(cardElement);
        });

    } catch (error) {
        console.error("Помилка завантаження:", error);
        recipesContainer.innerHTML = '<p style="color: red; text-align: center;">Сталася помилка при завантаженні.</p>';
    }
}


// 5. PROGRAM EXECUTION
loadRecipes();

btnSurprise.addEventListener('click', handleSurpriseMe);

btnSearch.addEventListener('click', handleSearchToggle);

document.addEventListener('click', (event) => {
    if (!searchBar.contains(event.target) && !btnSearch.contains(event.target)) {
        searchBar.classList.remove('open');
    }
});