const fastify = require('fastify')({logger: true});

fastify.register(require('@fastify/cors'), {origin: '*'});
fastify.listen({port: 3000}, (err, address) => {
    if (err) {
        throw err;
    } else {
        console.log("Працює");
    }
})