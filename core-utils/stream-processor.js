export async function* recipeStreamProducer(totalBatches = 3, simulateError = false) {
    console.log("[Producer] Starting the recipe stream...");

    for (let i = 1; i <= totalBatches; i++) {
        // Simulating network delay (e.g., fetching a huge file from a database)
        await new Promise((resolve) => setTimeout(resolve, 10000));

        // We dont eat errors, instead we throw them
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

// This function reads the stream piece by piece without crashing the RAM
export async function processRecipeStream(stream) {
    console.log("[Consumer] Preparing to read the stream...");
    const allProcessedRecipes = [];

    try {
        // Process async iterator
        for await (const chunk of stream) {
            console.log("[Consumer] Received a chunk of " + chunk.length + " items. Processing...");

            // Simulating incremental processing (e.g., saving to local state)
            for (const recipe of chunk) {
                allProcessedRecipes.push(recipe);
            }
        }

        console.log("[Consumer] Successfully processed a total of " + allProcessedRecipes.length + " recipes.");
        return allProcessedRecipes;

    } catch (error) {
        // Again, we dont eat errors, instead we throw them for further processing
        console.error("[Consumer] Stream processing aborted due to upstream error:", error.message);
        throw error;
    }
}