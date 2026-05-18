//IMPORTS
import {db} from "./firebase-config.js";
import {doc, getDoc} from "firebase/firestore";


//CONSTANTS
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get("id");

const docRef = doc(db, "recipes", recipeId);

//DOM elements
const titleElement = document.querySelector(".recipe-title");
const descElement = document.querySelector(".recipe-description");
const stepsProcessList = document.querySelector(".steps-list");
const ingredientsList = document.querySelector(".ingredients-list");
const ingredientTemplate = document.getElementById("ingredient-and-amount-template");
const stepTemplate = document.getElementById("step-process-template");



//STATE


//HELPER FUNCTIONS (USED IN MAIN FUNCTIONS)
function renderIngredients(ingredientsArray) {
    if (!ingredientsArray) return;

    ingredientsList.innerHTML = "";

    ingredientsArray.forEach(item => {
        const clone = ingredientTemplate.content.cloneNode(true);
        clone.querySelector(".ingredient").textContent = item.name;
        clone.querySelector(".amount").textContent = item.amount;
        ingredientsList.appendChild(clone);
    });
}

function renderSteps(stepsArray) {
    if (!stepsArray) return;

    stepsProcessList.innerHTML = "";

    stepsArray.forEach((item, index) => {
        const clone = stepTemplate.content.cloneNode(true);
        clone.querySelector(".step-number").textContent = "Крок " + (index + 1);
        clone.querySelector(".step-text").textContent = item;
        stepsProcessList.appendChild(clone);
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

        renderIngredients(data.ingredients);
        renderSteps(data.steps);

    } catch (error) {
        console.error("Помилка:", error);
    }
}


//PROGRAM EXECUTION
displayRecipeDetails();