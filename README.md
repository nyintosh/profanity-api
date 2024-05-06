# Profanity (API)

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
- [Environment Variables](#environment-variables)
- [Starting the Development Server](#starting-the-development-server)
- [Contributing](#contributing)
- [Live Preview](#live-preview)

## Tech Stack

- TypeScript
- Hono
- Zod
- Upstash Redis
- Upstash Rate Limit
- Upstash Vector

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

To run this locally, make sure you've set up Redis and Vector on [Upstash](https://upstash.com) and obtained API keys. Alternatively, you can utilize similar technologies and update the configuration accordingly.

## Environment Variables

This project requires the following environment variables:

- `VECTOR_URL`
- `VECTOR_TOKEN`

Ensure environment variables are set and `wrangler.toml` is configured according to the provided example file for seamless development.

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
  	"text": "string"
  }
  ```
