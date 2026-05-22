# Culina 🍳

Рецептний застосунок з повним стеком: фронтенд, бекенд та утиліти.

## Структура проекту
culina-app/
├── frontend/     — Parcel + vanilla JS
├── backend/      — Fastify + Prisma + PostgreSQL
└── core-utils/   — Бібліотека утиліт (culina-utils)

## Вимоги

- Node.js 18+
- PostgreSQL (або акаунт на Neon.tech)

## Запуск

### 1. Клонуй репозиторій
```bash
git clone https://github.com/PEKKA367/Culina.git
cd Culina
```

### 2. Налаштуй бекенд
```bash
cd backend
cp .env.example .env
# Відкрий .env і заповни DATABASE_URL та JWT_SECRET
npm install
npx prisma migrate deploy
npm start
```

### 3. Налаштуй фронтенд
```bash
cd frontend
npm install
npm start
```

Фронтенд запуститься на `http://localhost:1234`  
Бекенд працює на `http://localhost:3000`

## Технології

**Frontend:** Vanilla JS, Parcel  
**Backend:** Fastify, Prisma, PostgreSQL (Neon)  
**Utils:** culina-utils (local package)

## Ліцензія

[MIT](./LICENSE) © Ілля Бугай
Створи цей файл в корені репо. Що скажеш?
