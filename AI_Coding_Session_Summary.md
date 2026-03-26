# AI Coding Session & Prompt Workflow Summary

## Overview of AI Tools Used
- **Primary Tool:** AI Coding Assistant (Antigravity by Google Deepmind)
- **Role:** Full-stack pair programming, debugging, architecture design, and deployment configuration.
- **Workflow:** Iterative prompt-based development where high-level requirements were translated into code, followed by targeted debugging sessions for React hydration and Next.js deployment issues.

## 1. Key Prompts and Implementation Workflows

### Building the Core SAP Graph Query System
- **Prompt intent:** *Build a Next.js application visualizing SAP Order-to-Cash data with natural language query capabilities.*
- **Workflow:** 
  1. Scaffolded a Next.js App Router application.
  2. Implemented `react-force-graph-2d` for visualizing the Order-to-Cash nodes (Customers, Sales Orders, Deliveries, Billing).
  3. Created an LLM-powered Next.js API route (`/api/query`) using `@google/genai` to classify user intent and generate raw SQLite queries against the provided SAP schema.
  4. Built a dynamic `GraphView` component that filters and maps the SQL response data back into visual node clusters.

## 2. Debugging and Iteration Cycles

### Issue 1: React Hydration and Window Object References
- **Problem:** `react-force-graph-2d` utilizes HTML5 Canvas and accesses `window` on initialization, leading to Next.js Server-Side Rendering (SSR) hydration crashes.
- **Iterative Fix & AI Debugging:**
  - AI analyzed the Next.js runtime logs and identified the SSR Canvas conflict.
  - Recommended and implemented a `next/dynamic` import with `{ ssr: false }` for the `GraphView` component within `app/page.tsx` to force client-side-only rendering.

### Issue 2: Silent Failures via Empty Graph on Production (Vercel)
- **Problem:** After deploying the Next.js app to production, the `GraphView` rendered entirely blank despite the graph legend being visible. No overt 500 errors were surfaced on the UI.
- **Iterative Fix & AI Debugging:**
  - **Investigation:** The AI inspected the Next.js build configurations and network data passing through the `/api/graph` route. 
  - **Root Cause Analysis:** Discovered two critical architectural oversights for serverless environments:
    1. The `o2c_graph.db` SQLite database was being ignored by Git (`*.db` in `.gitignore`), meaning it wasn't being uploaded to the deployment server.
    2. Next.js serverless functions do not automatically bundle `.db` files without explicit static file tracing.
  - **Resolution:** 
    1. Removed `*.db` ignorance and explicitly allowed `!o2c_graph.db` in `.gitignore`.
    2. Created `next.config.mjs` to specify `serverExternalPackages: ['sqlite3']` and utilized Next.js's `outputFileTracingIncludes` to ensure `o2c_graph.db` was packed into the `/api/**/*` serverless functions.
  - **Outcome:** The database successfully attached to the production build, allowing the graph and AI SQL generator to function securely in the cloud.

## Conclusion
The AI assistant fundamentally accelerated the transition from local prototyping to cloud-ready production. By seamlessly moving from writing raw React components to debugging complex Next.js serverless compilation issues, the AI acted as both a co-developer and DevOps engineer.

## Additional Notes (Anything else you'd want us to know?)
- **Full-Stack AI Integration:** This project goes beyond just a basic front-end UI. It demonstrates the ability to orchestrate an LLM inside backend serverless routes (Next.js API) to securely translate natural language into SQL against an enterprise-like schema (SAP Order-to-Cash).
- **Focus on Architecture:** Leveraging AI tools allowed me to shift my focus from boilerplate coding to high-level architectural decisions, such as designing the text-to-SQL flow and ensuring secure, static database interactions within edge scenarios.
- **Overcoming Deployment Bottlenecks:** Resolving the Vercel serverless database issue proved that using AI isn't just about writing logic—it’s also an incredible asset for debugging infrastructure and runtime environments.
