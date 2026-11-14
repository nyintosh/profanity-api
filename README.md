# Profanity (API)

<img width="1408" alt="SCR-20240703-krqd" src="https://github.com/nyintosh/profanity-api/assets/56629705/ba9d2efc-306f-4032-b25b-40807fd07b84">

## Description

An experimental API for detecting hate speech and profanity, incorporating rate limiting and request validation functionality, and deploying it on Cloudflare Workers.

## Feature

- Check Profanity
- Request Validation
- Rate Limiting Api

## Table of Contents

- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Important](#important)
- [Starting the Development Server](#starting-the-development-server)
- [Contributing](#contributing)
- [Live Preview](#live-preview)

## Tech Stack

- TypeScript
- Hono
- Zod
- Cloudflare Workers AI (`bge-small-en-v1.5` embeddings)
- Cloudflare Vectorize
- Cloudflare Workers Rate Limiting

## Installation

Make sure you have Node.js installed on your machine.

Clone the repository:

```bash
git clone https://github.com/nyintosh/profanity-api
```

Navigate to the project directory:

```bash
cd profanity-api
```

Install dependencies:
Run one of the following commands based on your preferred package manager:

- Using npm:

```bash
npm install
```

- Using yarn:

```bash
yarn install
```

- Using pnpm:

```bash
pnpm install
```

## Important

Everything runs on Cloudflare's free Workers plan and needs no API keys. The bindings are declared in `wrangler.toml`.

Single words are matched against the term list in `dataset.csv`. Short phrases are embedded with Workers AI and compared against the same terms in a Vectorize index. To set it up in your own account:

```bash
npx wrangler login
npx wrangler vectorize create profanity-api --dimensions=384 --metric=cosine
cf auth login   # the Cloudflare CLI: npm install --global cf
npm run db:seed
```

## Starting the Development Server

To start the development server:
Run one of the following commands based on your preferred package manager:

- Using npm:

```bash
npm run dev
```

- Using yarn:

```bash
yarn dev
```

- Using pnpm:

```bash
pnpm dev
```

## Contributing

If you want to add additional features and improvements, we welcome contributions! Please follow these guidelines:

- Fork the repository
- Create a new branch
- Make your changes
- Submit a pull request

## Live Preview

You can test the API of the project at [https://profanity-api.nyintosh.workers.dev](https://profanity-api.nyintosh.workers.dev). Below are the documentation details for the API endpoint:

- **Endpoint:** /
- **Method:** POST
- **Content Type:** application/json
- **Request Body:**
  ```json
  {
  	"text": "string (2 to 500 characters)"
  }
  ```
- **Response:**
  ```json
  {
  	"isVulgar": true,
  	"flags": ["matched term"],
  	"avgScore": 0.93
  }
  ```

Each IP can make 10 requests per minute. `GET /` returns a short usage summary.
