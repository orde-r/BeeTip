# Setup

Requirements:

- Docker (recommended)
- pnpm (or npm)
- Node 22

If you don't have and don't want to use docker:

- PostgreSQL installed and running

## Backend

```sh
cd beetip-api
```

### Docker

We recommend that you use docker-compose to run the backend. This Docker setup is self-contained and already defines the backend environment variables, including the container database URL.

The compose file is in `beetip-api/compose.yml`. The api container build is defined in `beetip-api/Containerfile`.

#### Starting (in detached mode):

```sh
docker compose up -d
```

What this does:

1. Starts postgres container, exposed to host at port 5433 (avoid conflict with your local postgres if you have one)
2. Starts migrate container, which runs the migrations
3. Starts the backend container, exposed to host at port 3000


#### Stopping:

```sh
docker compose down
```

You can add the `-v` flag if you want to reset the database:

```sh
docker compose down -v
```


### No Docker

First, copy the default development environment file:

```sh
cp .env.example .env
```

We don't have API keys and this is just default dev env vars so this is safe.

Make sure the `.env` file's `DATABASE_URL` is pointing to the correct Postgres database. PostgreSQL must already be installed, running, and reachable.

```sh
pnpm i
pnpm db:migrate
pnpm build
pnpm dev
```

## Frontend

In a new terminal:

```sh
cd beetip-frontend
```

### Default Envs

```sh
cp .env.example .env
```

### Running the frontend (pnpm)

Since the frontend is just React+Vite, we don't need any containers (in real deployment you would just deploy the built files on cloudflare pages or something).


```sh
pnpm i
pnpm dev
```

> [!NOTE]
> In this project we use `pnpm` because it's more secure (explicit postinstall permission) and saves storage by symlinking node_modules.

### Running the frontend (npm)

We recommend you to use pnpm as our lockfiles are generated with it. If you don't want to use pnpm, you can still use npm.

npm equivalent:

```sh
npm i
npm run dev
```