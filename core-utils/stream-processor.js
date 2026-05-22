export async function* recipeStreamProducer(totalBatches = 3, simulateError = false) {
    console.log("[Producer] Starting the recipe stream...");

    for (let i = 1; i <= totalBatches; i++) {
        // Simulating network delay (e.g., fetching a huge file from a database)
        await new Promise((resolve) => setTimeout(resolve, 10000));

        // We dont eat errors, insted we throw them
        if (simulateError && i === 2) {
            console.error("[Producer] Critical fault: Network connection lost");
            throw new Error("Stream connection lost at batch 2");
        }

        // Generating a fake chunk of data (representing a part of a huge file)
        const chunk = [
            { id: i * 10 + 1, title: "Streamed Recipe A from batch " + i },
            { id: i * 10 + 2, title: "Streamed Recipe B from batch " + i }
        ];

        console.log("[Producer] Yielding batch " + i);

        yield chunk; // Sends the chunk to the consumer and waits for the next
    }

    console.log("[Producer] Stream finished successfully.");
}