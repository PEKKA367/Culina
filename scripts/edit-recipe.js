//IMPORTS
import {db} from "./firebase-config.js";
import {doc, updateDoc} from "firebase/firestore"

//CONSTANTS
//DOM elements
const recipeTitle = document.querySelector(".recipe-title");
const recipeDescription = document.querySelector(".recipe-description");
const recipeProcess = document.querySelector(".process");

const btnEdit = document.querySelector(".btn-primary");
//HELPER FUNCTIONS (USED IN MAIN FUNCTIONS)

//MAIN FUNCTIONS
async function editRecipe() {
    const recipeProportions = document.querySelectorAll(".ingredient, .amount");

    if (btnEdit.dataset.state === "view") {
        recipeTitle.contentEditable = "true";
        recipeDescription.contentEditable = "true";
        recipeProcess.contentEditable = "true";

        recipeProportions.forEach(proportion => {
            proportion.contentEditable = "true";
        });

        btnEdit.textContent = "Зберегти";
        btnEdit.dataset.state = "edit";
    } else {
        const newTitle = recipeTitle.textContent.trim();
        const newDescription = recipeDescription.textContent.trim();
        const newProcess = recipeProcess.textContent.trim();

        const newProportions = [];
        const randomShit = document.querySelectorAll(".ingredient-and-amount")

        randomShit.forEach(row => {
            const ingredient = row.querySelector('.ingredient').textContent.trim();
            const amount = row.querySelector('.amount').textContent.trim();

            if (ingredient) {
                newProportions.push({
                    name: ingredient,
                    amount: amount || "-"
                });
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');

        const docRef = doc(db, "recipes", recipeId);

        const temporaryObject = {
            title: newTitle,
            description: newDescription,
            process: newProcess,
            ingredients: newProportions
        };

        try {
            await updateDoc(docRef, temporaryObject)

            recipeTitle.contentEditable = "false";
            recipeDescription.contentEditable = "false";
            recipeProcess.contentEditable = "false";

            recipeProportions.forEach(proportion => {
                proportion.contentEditable = "false";
            });

            btnEdit.textContent = "Редагувати";
            btnEdit.dataset.state = "view";
        } catch (error) {
            console.log("Винна ось ця хуйня, не я:", error);
        }
    }
}

//PROGRAM EXECUTION
btnEdit.addEventListener("click", editRecipe);