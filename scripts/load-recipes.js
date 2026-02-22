//IMPORTS
import { db } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";


//CONSTANTS & DOM ELEMENTS
const recipesContainer = document.getElementById('recipes');
const recipeTemplate = document.getElementById('recipe-template');

const DOM = {
    card: '.card',          // Головний контейнер картки
    title: '.recipe-title',        // Заголовок
    desc: '.recipe-description',   // Опис
    count: '.ingredients-count',   // Лічильник інгредієнтів
    btnDelete: '.btn-delete',      // Кнопка видалення
    link: '.btn-open'              // Кнопка відкриття
};


//HELPER FUNCTIONS
async function deleteRecipe(id, deleteButtonElement) {
    try {
        await deleteDoc(doc(db, "recipes", id));

        // Шукаємо батьківську картку, використовуючи наш словник
        const card = deleteButtonElement.closest(DOM.card);
        
        // Гарна анімація зникнення перед видаленням (Опціонально)
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            
            // Чекаємо 300мс (поки пройде анімація CSS), потім видаляємо
            setTimeout(() => card.remove(), 300);
        }
        
    } catch (error) {
        console.error("Помилка видалення:", error);
        alert("Не вдалося видалити рецепт.");
    }
}

function createRecipeCard(firebaseDoc) {
    const data = firebaseDoc.data();
    const recipeId = firebaseDoc.id;

    const clone = recipeTemplate.content.cloneNode(true);

    const ui = {
        title: clone.querySelector(DOM.title),
        desc: clone.querySelector(DOM.desc),
        count: clone.querySelector(DOM.count),
        btnDelete: clone.querySelector(DOM.btnDelete),
        link: clone.querySelector(DOM.link)
    };

    // Заповнюємо даними
    ui.title.textContent = data.title;
    ui.desc.textContent = data.description;
    
    // Optional Chaining (?.) - безпечно беремо довжину
    const count = data.ingredients?.length || 0;
    ui.count.textContent = `Інгредієнтів: ${count}`;

    // Формуємо посилання
    ui.link.href = `pages/recipe.html?id=${recipeId}`;

    // Вішаємо подію видалення
    ui.btnDelete.addEventListener("click", async () => {
        if (confirm(`Видалити рецепт "${data.title}"?`)) {
            // Кнопка переходить у стан "Завантаження" (UX покращення)
            ui.btnDelete.textContent = "Видалення...";
            ui.btnDelete.disabled = true;
            
            await deleteRecipe(recipeId, ui.btnDelete);
        }
    });

    return clone;
}


// ==========================================
// 4. MAIN FUNCTIONS
// ==========================================
async function loadRecipes() {
    try {
        // Очищаємо контейнер
        recipesContainer.innerHTML = '';

        const querySnapshot = await getDocs(collection(db, "recipes"));

        // Перевірка на порожню базу
        if (querySnapshot.empty) {
            // Використовуємо OOCSS класи для тексту
            recipesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center;">
                    <p class="card-desc">Рецептів поки немає. Додайте перший!</p>
                </div>
            `;
            return;
        }

        // Рендеримо картки
        querySnapshot.forEach((doc) => {
            const cardElement = createRecipeCard(doc);
            recipesContainer.appendChild(cardElement);
        });

    } catch (error) {
        console.error("Помилка завантаження:", error);
        recipesContainer.innerHTML = '<p style="color: red; text-align: center;">Сталася помилка при завантаженні.</p>';
    }
}


// 5. PROGRAM EXECUTION
loadRecipes();