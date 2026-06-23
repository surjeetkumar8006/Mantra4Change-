# PBL Program Intelligence & Grant Reporting Assistant

This is an end-to-end MERN (MongoDB, Express, React, Node.js) application built for the Mantra4Change Lead Full-Stack Product Developer Assessment.

## Architecture Overview
The application consists of two main parts:
- **Backend (`/server`)**: A Node.js and Express REST API. It connects to a MongoDB database (via Mongoose) and exposes analytical endpoints using MongoDB Aggregation pipelines.
- **Frontend (`/client`)**: A React Single Page Application built with Vite. It features a modern, premium UI with glassmorphism, dynamic animations, and responsive layout. State is managed via standard React hooks, and data is fetched via Axios.

## Data Model
- **SchoolResponse**: Contains synthetic survey data from schools (enrollment, attendance, PBL conducted, etc.).
- **GrantFinance**: Contains grant budget, utilized units, and finance notes.
- **GrantPerformance**: Contains pre-calculated risk statuses, milestones, and baseline completion/attendance rates for the grant reporting narrative.
- **MediaEvidence**: Contains image records and captions linked to specific grants and geographies.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI (or local MongoDB)

### Backend Setup
1. `cd server`
2. Run `npm install` to install dependencies.
3. Start the server using `npm run start` or `node index.js`. (By default runs on port 5000).

*Note: The server has a built-in `seed.js` script that has already ingested the provided CSV data into MongoDB.*

### Frontend Setup
1. `cd client`
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the Vite development server.

## Assumptions & Risk Logic
- **Risk Logic**: Implemented purely via deterministic code thresholds without AI. 
  - On Track >= 75%
  - Behind: 60% to 74.9%
  - At Risk: 35% to 59.9%
  - Critical: < 35%
- **Month-over-Month calculations**: Calculated by fetching and comparing the exact data from the currently selected month and the immediate prior month.
- **AI Workflow / Mock Approach**: The narrative generation is implemented as a deterministic string templating mock to guarantee perfect traceability, avoid hallucination, and run reliably even if an LLM is offline. It simply interpolates facts computed in the dashboard directly into the narrative structure.

## Production Readiness & Future Improvements
- **Security**: Current setup lacks Authentication/Authorization. In production, we'd add JWT-based auth via tools like Clerk or NextAuth.
- **Scalability**: MongoDB aggregations are fast for this dataset size, but if the dataset grows to millions of rows, pre-aggregating data via materialized views or using a caching layer (Redis) would be necessary.
- **AI Integration**: The mock narrative generator could be replaced by a structured call to OpenAI's API using function-calling to strictly limit it to using the provided facts without hallucinating external locations or outcomes.
