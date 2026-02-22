//IMPORTS
import { db } from './firebase-config.js';
import { doc, getDoc } from "firebase/firestore";


//CONSTANTS
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');

const docRef = doc(db, "recipes", recipeId);

//DOM elements
const titleElement = document.querySelector('.recipe-title');
const descElement = document.querySelector('.recipe-description');
const processElement = document.querySelector('.process');
const ingredientsList = document.querySelector('.ingredients-list');
const template = document.getElementById('ingredient-and-amount-template');


//STATE


//HELPER FUNCTIONS (USED IN MAIN FUNCTIONS)
function renderIngredients(ingredientsArray) {
    if (!ingredientsArray) return;
    
    ingredientsList.innerHTML = '';

    ingredientsArray.forEach(item => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.ingredient').textContent = item.name;
        clone.querySelector('.amount').textContent = item.amount;
        ingredientsList.appendChild(clone);
    });
}


//MAIN FUNCTIONS
async function displayRecipeDetails() {
    try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert("Рецепт не знайдено!");
            return;
        }

        const data = docSnap.data();

        titleElement.textContent = data.title;
        descElement.textContent = data.description;
        processElement.textContent = data.process;

        renderIngredients(data.ingredients);

    } catch (error) {
        console.error("Помилка:", error);
    }
}


//PROGRAM EXECUTION
displayRecipeDetails();