const fastify = require("fastify")({logger: true});
const cors = require("@fastify/cors");
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");
const {memoize} = require("culina-utils");
const {BiPriorityQueue} = require("culina-utils");
const {asyncFilter} = require("culina-utils");

const prisma = new PrismaClient();
const dbQueue = new BiPriorityQueue();

// Back worker: processes priority queue to prevent DB overload
// Enable non-blocking API responses
setInterval(async () => {
    if (dbQueue.size > 0) {
        const task = dbQueue.dequeue("highest");
        console.log(`[Worker] Assigned the task:`, task);

        try {
            if (task.type === 'DELETE_RECIPE') {
                await prisma.recipe.delete({
                    where: {id: task.id}
                });
                console.log(`[Worker] Recipe ${task.id} has deleted from db.`);
            }
        } catch (error) {
            console.error(`[Worker] Task processing error ${task.id}:`, error);
        }
    }
}, 2000);

const searchRecipesInDB = async (searchText) => {
    return await prisma.recipe.findMany({
        where: {
            OR: [
                {title: {contains: searchText, mode: "insensitive"}},
                {description: {contains: searchText, mode: "insensitive"}}
            ]
        }
    });
};

const cachedSearch = memoize(searchRecipesInDB, {strategy: 'TTL', ttlMs: 60000});

fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
});

fastify.register(require("@fastify/jwt"), {secret: process.env.JWT_SECRET})

fastify.get("/", async (request, reply) => {
    return {message: "Мій бекенд для рецептів працює!"};
});

fastify.get("/recipes", async (request, reply) => {
    const recipes = await prisma.recipe.findMany();
    return recipes;
});

fastify.post("/recipes", async (request, reply) => {
    try {
        const {title, description, ingredients, steps} = request.body;

        const recipe = await prisma.recipe.create({
            data: {
                title,
                description,
                ingredients,
                steps,
            }
        });

        return reply.code(201).send(recipe);
    } catch (error) {
        console.error("ПОМИЛКА:", error); // ← додали
        return reply.code(500).send({error: error.message});
    }
});

fastify.get("/recipes/search", async (request, reply) => {
    try {
        const {searchText} = request.query;

        if (!searchText) {
            return [];
        }

        const recipes = await cachedSearch(searchText);
        return recipes;

    } catch (error) {
        console.error("Backend error:", error);
        reply.status(500).send({error: "server eror"});
    }
});

fastify.get("/recipes/:id", async (request, reply) => {
    const {id} = request.params;

    const recipe = await prisma.recipe.findUnique({
        where: {id: Number(id)}
    });

    if (!recipe) {
        return reply.code(404).send({error: "Рецепт не знайдено"});
    }

    return recipe;
});

fastify.put("/recipes/:id", async (request, reply) => {
    const {id} = request.params;
    const {title, description, ingredients, steps} = request.body;

    const recipe = await prisma.recipe.update({
        where: {id: Number(id)},
        data: {title, description, ingredients, steps}
    });

    return recipe;
});

// Bulk deletion route with AbortController support
// Allows the client to safely cancel the ongoing deletion process to save DB resources
fastify.delete('/recipes/bulk', async (request, reply) => {
    const {ids} = request.body;

    // Initialize the abort controller for this specific HTTP request
    // Has aborted: false by default and abort() that changes aborted: true and calls event "abort"
    const controller = new AbortController();

    // Listen for raw TCP socket closures (e.g., user closes tab or cancels request on frontend)
    request.raw.on("aborted", () => {
        console.log("Client disconnected the call");
        controller.abort(); // Broadcast the abort signal to our async operation
    });

    try {
        const successfullyDeleted = await asyncFilter(
            ids,
            async (id) => {
                // Artificial delay to simulate heavy I/O tasks
                await new Promise(resolve => setTimeout(resolve, 3000));

                if (controller.signal.aborted) {
                    console.log(`[Backend] Врятовано рецепт ID: ${id} (видалення перервано)`);
                    throw new DOMException("Aborted", "AbortError");
                }

                await prisma.recipe.delete({ where: { id: Number(id) } });

                return true;
            },
            {signal: controller.signal} // Give us the listening "contoller" to our array method
        );

        reply.status(200).send({
            message: "Deleted successfully",
            deletedIds: successfullyDeleted
        });

    } catch (error) {
        // Failsafe: gracefully handle the intentional abort without crashing
        if (error.name === "AbortError") {
            console.log("[Backend] The bulk deletion was canceled by the user");
            // 499 Client Closed Request: standard status code for client-aborted operations
            return reply.status(499).send({message: "Process cancelled"});
        }

        console.error("[Backend] Error:", error);
        reply.status(500).send({error: "Internal server error"});
    }
});

fastify.delete('/recipes/:id', async (request, reply) => {
    const {id} = request.params;

    if (isNaN(Number(id))) {
        return reply.status(400).send({message: "Incorrect recipe ID"});
    }

    dbQueue.enqueue({type: 'DELETE_RECIPE', id: Number(id)}, 10);

    reply.status(202).send({message: "The recipe deletion has been added to the queue"});
});

fastify.post("/users", async (request, reply) => {
    const {email, password, name} = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            email: email,
            password: hashedPassword,
            name: name
        }
    });

    return {message: "Користувач успішно створений"};
});

fastify.post("/login", async (request, reply) => {
    const {email, password} = request.body;
    const user = await prisma.user.findUnique({where: {email: email}});

    if (user === null) {
        return reply.code(401).send({error: "Користувача не знайдено"})
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
        return reply.code(401).send({error: "Неправильний пароль"});
    }

    const token = fastify.jwt.sign({id: user.id, email: user.email});

    return {token: token};

});

const start = async () => {
    try {
        await fastify.listen({port: 3000});
        console.log("Сервер успішно запущено на http://localhost:3000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();