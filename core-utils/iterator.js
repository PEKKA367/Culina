function* recipeGenerator(recipesArray) {
    let index = 0;

    while (true) {
        yield recipesArray[index];
        index = (index + 1) % recipesArray.length;
    }
}

function spinTheCarousel(iterator, durationInSeconds) {
    const startTime = Date.now();
    const durationMs = durationInSeconds * 1000;

    const intervalId = setInterval(() => {
        if (Date.now() - startTime >= durationMs) {
            clearInterval(intervalId);
            return;
        } else {
        }

    }, 900);
}