// while(true) is safe — yield pauses execution until the .next() call
export function* recipeGenerator(recipesArray) {
    let index = 0;

    while (true) {
        yield recipesArray[index];
        index = (index + 1) % recipesArray.length; // cycles back to 0 when the end of the array is reached
    }
}

// consumes the iterator every 900ms for durationInSeconds, then returns the last value
export function spinTheCarousel(iterator, durationInSeconds) {
    return new Promise(resolve => {

        let currentValue;
        const startTime = Date.now();
        const durationMs = durationInSeconds * 1000; // seconds → milliseconds

        const intervalId = setInterval(() => {
            if (Date.now() - startTime >= durationMs) {
                clearInterval(intervalId); // must stop manually, otherwise runs forever
                resolve(currentValue); // delayed return — sends result back to await
            } else {
                currentValue = iterator.next().value; // .next() advances the generator by one step
            }
        }, 900);

    });
}