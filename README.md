# Reflection Agent with Mastra and OpenAI

A reflection agent that analyzes its own responses, identifies issues, and iteratively improves its output using the Mastra framework and OpenAI API.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-key-here
MAX_ITERATIONS=3
QUALITY_THRESHOLD=0.8
MODEL_NAME=gpt-4o-mini
```

### 3. Run the project

```bash
# Development mode
npm run dev

# Compile TypeScript
npm run build

# Run compiled version
npm start
```

## Project Structure

```text
reflection-agent/
├── src/
│   ├── agents/          # Agents (generator, reflector, refiner)
│   ├── config.ts        # Project configuration
│   └── index.ts         # Entry point
├── prompts/              # Prompt templates
├── tests/               # Tests
├── .env.example         # Environment variables example
└── package.json
```
