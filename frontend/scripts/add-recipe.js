//IMPORTS

//CONSTANTS
const recipeForm = document.getElementById('form-recipe');
const titleInput = document.getElementById('title-input');
const descInput = document.getElementById('description-input');

const btnAddStep = document.getElementById("btn-add-step");
const stepsListContainer = document.getElementById("steps-list");
const stepTemplate = document.getElementById("step-template");

const btnAddIngredient = document.getElementById("btn-add");
const ingredientsListContainer = document.getElementById("ingredients-list");
const ingredientTemplate = document.getElementById("ingredient-template");


//HELPER FUNCTIONS
function createStepRow(number) {
    const clone = stepTemplate.content.cloneNode(true);
    clone.querySelector(".step-number").textContent = number;
    return clone;
}

function updateStepNumbers() {
    const rows = stepsListContainer.querySelectorAll('.step-row');
    rows.forEach((row, index) => {
        row.querySelector('.step-number').textContent = index + 1;
    });
}

function collectStepsFromDOM() {
    const inputs = stepsListContainer.querySelectorAll('.step-input');
    const steps = [];
    inputs.forEach(input => {
        const value = input.value.trim();
        if (value) steps.push(value); // порожні кроки ігноруємо
    });
    return steps;
}

function createNewIngredientRow() {
    return ingredientTemplate.content.cloneNode(true);
}

function collectIngredientsFromDOM() {
    const rows = document.querySelectorAll('.ingredient-row');
    const list = [];
    rows.forEach(row => {
        const name = row.querySelector('.ingredient-name').value.trim();
        const amount = row.querySelector('.ingredient-amount').value.trim();
        if (name) {
            list.push({ name: name, amount: amount || "-" });
        }
    });
    return list;
}


//MAIN FUNCTIONS
function handleAddStep() {
    const currentCount = stepsListContainer.querySelectorAll('.step-row').length;
    const newRow = createStepRow(currentCount + 1);
    stepsListContainer.appendChild(newRow);
}

function handleAddIngredient() {
    const newRow = createNewIngredientRow();
    ingredientsListContainer.appendChild(newRow);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const ingredients = collectIngredientsFromDOM();
    const newRecipe = {
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        steps: collectStepsFromDOM(),
        ingredients: ingredients
    };
    try {
        await fetch("http://localhost:3000/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRecipe)
        });
        alert("Рецепт успішно збережено!");
        window.location.href = "../index.html";
    } catch (error) {
        console.error("Помилка збереження:", error);
        alert("Сталася помилка при збереженні");
    }
}


//PROGRAM EXECUTION
btnAddIngredient.addEventListener("click", handleAddIngredient);
recipeForm.addEventListener("submit", handleFormSubmit);

stepsListContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('step-delete')) {
        event.target.closest('.step-row').remove();
        updateStepNumbers();
    }
});

btnAddStep.addEventListener("click", handleAddStep);

handleAddStep();