const BasicClient = require("./BasicClient")
const AuthProxy = require("./AuthProxy")
const ApiService = require("./ApiService")
const fastify = require("fastify")({logger: true});

fastify.register(require("@fastify/cors"), {origin: "*"});
const basicClient = new BasicClient();
const authProxy = new AuthProxy(basicClient);
const apiService = new ApiService(authProxy);
fastify.listen({port: 3000}, (err, address) => {
    if (err) {
        throw err;
    } else {
        console.log("Працює");
    }
})
fastify.get("/test-auth", async (request, reply) => {
    const result = await apiService.getUserData();
    return await result.json();
});
