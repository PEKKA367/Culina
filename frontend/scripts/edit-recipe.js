//IMPORTS

//CONSTANTS
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');

//DOM elements
const recipeTitle = document.querySelector(".recipe-title");
const recipeDescription = document.querySelector(".recipe-description");

const btnEdit = document.querySelector(".btn-primary");

//HELPER FUNCTIONS (USED IN MAIN FUNCTIONS)
function cleanStyle(event) {
    event.preventDefault();
    const insertedText = event.clipboardData.getData('text/plain');
    document.execCommand("insertText", false, insertedText);
}

function collectIngredientsFromDOM() {
    const ingredients = [];
    document.querySelectorAll(".ingredient-and-amount").forEach(row => {
        const ingredient = row.querySelector('.ingredient').textContent.trim();
        const amount = row.querySelector('.amount').textContent.trim();
        if (ingredient) {
            ingredients.push({ name: ingredient, amount: amount || "-" });
        }
    });
    return ingredients;
}

function collectStepsFromDOM() {
    const steps = [];
    document.querySelectorAll(".step-text").forEach(step => {
        const value = step.textContent.trim();
        if (value) steps.push(value);
    });
    return steps;
}

//MAIN FUNCTIONS
async function editRecipe() {
    const recipeProportions = document.querySelectorAll(".ingredient, .amount");
    const recipeSteps = document.querySelectorAll(".step-text");

    if (btnEdit.dataset.state === "view") {
        recipeTitle.contentEditable = "true";
        recipeDescription.contentEditable = "true";

        recipeProportions.forEach(proportion => {
            proportion.contentEditable = "true";
        });
        recipeSteps.forEach(step => {
            step.contentEditable = "true";
        });

        btnEdit.textContent = "Зберегти";
        btnEdit.dataset.state = "edit";
    } else {
        const newTitle = recipeTitle.textContent.trim();
        const newDescription = recipeDescription.textContent.trim();
        const newProportions = collectIngredientsFromDOM();
        const newSteps = collectStepsFromDOM();

        const updatedRecipe = {
            title: newTitle,
            description: newDescription,
            ingredients: newProportions,
            steps: newSteps
        };

        try {
            await fetch(`http://localhost:3000/recipes/${recipeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRecipe)
            });

            recipeTitle.contentEditable = "false";
            recipeDescription.contentEditable = "false";

            recipeProportions.forEach(proportion => {
                proportion.contentEditable = "false";
            });
            recipeSteps.forEach(step => {
                step.contentEditable = "false";
            });

            btnEdit.textContent = "Редагувати";
            btnEdit.dataset.state = "view";
        } catch (error) {
            console.log("Помилка:", error);
        }
    }
}

//PROGRAM EXECUTION
btnEdit.addEventListener("click", editRecipe);
recipeTitle.addEventListener("paste", cleanStyle);
recipeDescription.addEventListener("paste", cleanStyle);