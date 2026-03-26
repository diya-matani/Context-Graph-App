# Context Graph System

A graph-based data modeling and LLM-powered query interface for SAP Order-to-Cash (O2C) datasets.

## Live Demo
> **Note to Reviewer / Developer:** Please deploy this folder to Vercel/Netlify for the live demo link and replace this section.

## Features
- **Graph Ingestion:** Dynamically converts relational JSONL data into a functional unified SQLite database using Python (`ingest.py`).
- **Graph Visualization:** Stunning Next.js UI mapping customers, sales orders, deliveries, and billing documents using a node-link visualizer (`react-force-graph-2d`).
- **LLM-Powered Query Interface:** Conversational AI uses a structured Prompt -> SQL -> Execution -> Natural Language workflow to explore constraints.
- **Guardrails:** An orchestrator LLM validates user prompts to ensure out-of-domain/generative tasks are politely rejected.

## Architecture & Tech Stack

### 1. Database Choice: Local SQLite (`sqlite3`)
**Why SQLite?**
- **Zero Configuration:** Perfect for demonstrating a complete offline data-modeled platform without requiring the evaluator to spin up Neo4j/Postgres Docker containers.
- **Relational Graphing:** The dataset consists of rigid nodes (headers, items) and edges (Foreign Keys like `soldToParty`, `salesOrder`). SQLite gracefully maps these via standard SQL JOINs.
- **Generative AI Match:** Modern LLMs excel at parsing relational DB schemas to output precise SQL context.

### 2. Frontend & Backend: Next.js (App Router) + Tailwind CSS
**Why Next.js?**
- Allows seamless full-stack architecture. The API routes (`/api/graph`, `/api/query`) run securely on the server with direct filesystem access to `o2c_graph.db`.
- **Styling:** Tailwind CSS was leveraged to craft a dynamic, glassmorphic UI matching high aesthetic expectations.

### 3. LLM Provider: Google Gemini (`@google/genai`)
- Speed and huge context windows ideal for mapping schemas.
- Cost-effective (free tier).

## LLM Prompting Strategy
The system uses a **Two-Pass Pipeline**:
1. **Classifier & Guardrail Pass:** Checks user query against domain contexts ("Does this relate to Sales Orders, Customers, Products, etc?"). 
   - *Example Rejection:* "Write a poem" -> "This system is designed to answer questions related to the provided dataset only."
2. **Execution Pass:**
   - Text-to-SQL logic fed with the structural schema of the DB.
   - SQl generated, executed server-side.
   - Contextual synthesis of the final rows into a natural language response.

## Setup Instructions

1. **Clone the repo**
   ```bash
   git clone <REPO_URL>
   cd context-graph-app
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup**
   Create a `.env.local` file containing:
   ```
   GEMINI_API_KEY=your_free_gemini_api_key
   ```
4. **Data Ingestion (Optional)**
   The `o2c_graph.db` is already pre-generated. To re-generate it from JSONL:
   ```bash
   python ingest.py
   ```
5. **Run the Server**
   ```bash
   npm run dev
   ```
Open [https://context-graph-app.vercel.app/](https://context-graph-app.vercel.app/).
