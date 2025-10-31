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
# Development mode (CLI)
npm run dev

# Web interface (start server)
npm run server

# Then open http://localhost:3000 in your browser
```

## Project Structure

```text
reflection-agent/
├── src/
│   ├── agents/          # Agents (generator, reflector, refiner)
│   ├── config.ts        # Project configuration
│   ├── orchestrator.ts  # Reflection orchestrator
│   ├── index.ts         # CLI entry point
│   └── server.ts        # Web server
├── public/              # Web interface
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env.example         # Environment variables example
└── package.json
```

## Features

- 🤖 **Generator Agent**: Creates initial motivational phrases
- 🔍 **Reflector Agent**: Critically analyzes and provides feedback
- ✨ **Refiner Agent**: Improves phrases based on feedback
- 📊 **Quality Scoring**: Automatic quality assessment
- 🌐 **Web Interface**: Visual workflow display
- 🔄 **Iterative Improvement**: Multi-iteration refinement cycle

## Usage

### CLI Mode

```bash
npm run dev
```

### Web Interface

1. Start the server: `npm run server`
2. Open `http://localhost:3000` in your browser
3. Enter a theme (e.g., "perseverance", "success", "dreams")
4. Watch the reflection cycle unfold step by step
