import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import sqlite3 from 'sqlite3';
import path from 'path';

// Define the schema as a string for the LLM context
const DB_SCHEMA = `
Tables:
- business_partners (businessPartner, businessPartnerName...)
- sales_order_headers (salesOrder, soldToParty, creationDate, totalNetAmount, transactionCurrency...)
- sales_order_items (salesOrder, salesOrderItem, product, orderQuantity...)
- billing_document_headers (billingDocument, soldToParty, billingDocumentDate, totalNetAmount...)
- outbound_delivery_headers (outboundDelivery, soldToParty, creationDate...)
- products (product, productType, productGroup...)
`;

const dbPath = path.join(process.cwd(), 'o2c_graph.db');

function queryDb(query: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    db.all(query, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// In production this should be set in process.env.GEMINI_API_KEY
// We'll use a placeholder structure. Since this is a test, the user didn't provide a key,
// so we'll mock the response if no key is present or try if it is.
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Guardrails check
    const isRelevantPrompt = `
      You are an intent classifier. Does the following user query relate to analyzing a business dataset containing Sales Orders, Customers, Products, Deliveries, Billing, or Payments?
      Reply only with "YES" or "NO".
      User Query: "${message}"
    `;

    // Initialize checking process
    let responseText = "I could not process the query.";
    let generatedSql = null;
    let dataResults = null;

    if (!process.env.GEMINI_API_KEY) {
      // Mock response if API key is missing to keep the demo functional
      return NextResponse.json({
        response: "Demo Mode (No API Key): I would have converted this to SQL and queried the graph. Please add GEMINI_API_KEY to your environment variables.",
        sql: "SELECT * FROM sales_order_headers LIMIT 5;",
        data: []
      });
    }

    const relevanceResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: isRelevantPrompt,
    });
    
    const isRelevant = relevanceResponse.text?.trim().toUpperCase();
    if (isRelevant !== 'YES' && !isRelevant?.includes('YES')) {
      return NextResponse.json({
        response: "This system is designed to answer questions related to the provided dataset only.",
        sql: null,
        data: null
      });
    }

    // 2. Text to SQL
    const sqlPrompt = `
      You are a SQLite expert analyzing an SAP Order-to-Cash dataset.
      Schema:
      ${DB_SCHEMA}

      Convert the user's question into a valid SQLite query.
      IMPORTANT: Return ONLY the raw SQL query. No markdown, no explanations, no \`\`\`sql wrapping.
      
      Question: "${message}"
    `;

    const sqlGenResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: sqlPrompt,
    });

    // Clean up SQL just in case
    generatedSql = sqlGenResponse.text?.replace(/\`\`\`sql/g, '').replace(/\`\`\`/g, '').trim() || "";

    // 3. Execute SQL
    try {
      dataResults = await queryDb(generatedSql);
      
      // 4. Synthesize final answer based on data
      const synthesizePrompt = `
        The user asked: "${message}"
        Here is the JSON result mapped from the database:
        ${JSON.stringify(dataResults).slice(0, 3000)} // Truncating to avoid massive tokens

        Answer the user's question naturally and professionally based on this data. Do not mention "the database" or "the JSON". Just provide the business insights.
      `;

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: synthesizePrompt,
      });

      responseText = finalResponse.text || "No insights could be generated.";
      
    } catch (sqlError: any) {
      responseText = `I encountered an error trying to query the data: ${sqlError.message}. The generated SQL was likely invalid.`;
    }

    return NextResponse.json({
      response: responseText,
      sql: generatedSql,
      data: dataResults
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
