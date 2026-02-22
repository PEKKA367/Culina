//IMPORTS
import { db } from './firebase-config.js';
import { collection, addDoc } from "firebase/firestore";


//CONSTANTS
//DOM elements
const recipeForm = document.getElementById('form-recipe');
const titleInput = document.getElementById('title-input');
const descInput = document.getElementById('description-input');
const processInput = document.getElementById('process-input');

const btnAddIngredient = document.getElementById("btn-add");
const ingredientsListContainer = document.getElementById("ingredients-list");
const ingredientTemplate = document.getElementById("ingredient-template");


//HELPER FUNCTIONS (USED IN MAIN FUNCTIONS)
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
            list.push({
                name: name,
                amount: amount || "-"
            });
        }
    });

    return list;
}


//MAIN FUNCTIONS
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
        process: processInput.value.trim(),
        ingredients: ingredients
    };

    try {
        await addDoc(collection(db, "recipes"), newRecipe);
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