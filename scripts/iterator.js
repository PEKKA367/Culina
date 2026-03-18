function* CarouselGenerator() {
    const words = ["a", "b", "c", "d", "e"];
    let index = 0;

    while (true) {

        yield words[index];
        index++;
        if (words.length === index) {
            index = 0;
        }
    }
}

function spinTheCarousel(iterator, durationInSeconds) {
    const wordElement = document.getElementById('dynamic-word');
    const button = document.getElementById('spin-btn');

    button.disabled = true;

    const startTime = Date.now();
    const durationMs = durationInSeconds * 1000;

    const intervalId = setInterval(() => {
        if (Date.now() - startTime >= durationMs) {
            clearInterval(intervalId);
            button.disabled = false;
            return;
        } else {
            wordElement.innerText = iterator.next().value;
        }

    }, 900);
}

document.getElementById('spin-btn').addEventListener('click', () => {
    const controller = CarouselGenerator();
    spinTheCarousel(controller, 5);
});