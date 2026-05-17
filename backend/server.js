const fastify = require("fastify")({logger: true});
const cors = require("@fastify/cors");
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

fastify.register(cors, {
    origin: "*"
});

fastify.register(require("@fastify/jwt"), {secret: process.env.JWT_SECRET})

fastify.get("/", async (request, reply) => {
    return {message: "Мій бекенд для рецептів працює!"};
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