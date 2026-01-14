import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { ComparisonRow } from '@/types';

/**
 * Request payload for AI Insights API
 */
interface InsightsRequest {
  rows: ComparisonRow[];
  priorPeriod: string;
  currentPeriod: string;
}

/**
 * Response payload for AI Insights API
 */
interface InsightsResponse {
  insights?: string;
  error?: string;
}

/**
 * Supported AI providers
 */
type AIProvider = 'gemini' | 'openai';

/**
 * Format comparison data as a structured table for the AI prompt
 */
function formatComparisonTable(rows: ComparisonRow[]): string {
  const header =
    'Employee Name | Prior Amount | Current Amount | Delta | Delta % | YTD';
  const separator = '---|---|---|---|---|---';

  const dataRows = rows.map((row) => {
    const priorFormatted = `$${row.priorAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const currentFormatted = `$${row.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const deltaFormatted = `$${row.delta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const deltaPercentFormatted = `${row.deltaPercent.toFixed(1)}%`;
    const ytdFormatted = `$${row.yearToDate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return `${row.employeeName} | ${priorFormatted} | ${currentFormatted} | ${deltaFormatted} | ${deltaPercentFormatted} | ${ytdFormatted}`;
  });

  return [header, separator, ...dataRows].join('\n');
}

/**
 * Determine which AI provider to use based on environment configuration
 */
function getProvider(): { provider: AIProvider; apiKey: string } | null {
  const configuredProvider = process.env.AI_PROVIDER?.toLowerCase() as AIProvider;

  // If provider is explicitly set, use that
  if (configuredProvider === 'gemini' && process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY };
  }
  if (configuredProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  }

  // Default: prefer Gemini for speed, fallback to OpenAI
  if (process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  }

  return null;
}

/**
 * Call OpenAI API for insights
 */
async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const insights = completion.choices[0]?.message?.content;
  if (!insights) {
    throw new Error('No insights generated');
  }
  return insights;
}

/**
 * Call Gemini API for insights
 */
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
    },
  });

  const insights = response.text;
  if (!insights) {
    throw new Error('No insights generated');
  }
  return insights;
}

/**
 * POST /api/insights
 * Analyzes comparison data using AI and returns insights
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<InsightsResponse>> {
  // Check for API provider configuration
  const providerConfig = getProvider();
  if (!providerConfig) {
    return NextResponse.json(
      { error: 'AI Insights not configured. Contact administrator.' },
      { status: 503 }
    );
  }

  const { provider, apiKey } = providerConfig;

  // Parse request body
  let body: InsightsRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  // Validate request
  const { rows, priorPeriod, currentPeriod } = body;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: 'No comparison data provided' },
      { status: 400 }
    );
  }

  if (!priorPeriod || !currentPeriod) {
    return NextResponse.json(
      { error: 'Missing period information' },
      { status: 400 }
    );
  }

  // Build the prompts
  const systemPrompt = `You are a senior payroll auditor analyzing pay period comparison data for a school district.
Your job is to identify anomalies, significant changes, and items that require attention.
Be specific with employee names and dollar amounts.
Flag any patterns that could indicate errors, fraud, or items needing review.
Keep your response to 1-2 concise paragraphs.
Focus on the most important findings that would matter to a CFO or payroll manager.`;

  const comparisonTable = formatComparisonTable(rows);

  const userPrompt = `Analyze this payroll comparison between pay period "${priorPeriod}" (prior) and "${currentPeriod}" (current).

${comparisonTable}

Summary:
- Total employees: ${rows.length}
- Employees with changes: ${rows.filter((r) => r.delta !== 0).length}
- Total prior period: $${rows.reduce((sum, r) => sum + r.priorAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Total current period: $${rows.reduce((sum, r) => sum + r.currentAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}

Identify anomalies, significant changes, and items needing review. Be specific with names and amounts.`;

  try {
    // Call the appropriate provider
    const insights =
      provider === 'gemini'
        ? await callGemini(apiKey, systemPrompt, userPrompt)
        : await callOpenAI(apiKey, systemPrompt, userPrompt);

    return NextResponse.json({ insights });
  } catch (error) {
    // Handle OpenAI-specific errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Service busy. Please try again in a moment.' },
          { status: 429 }
        );
      }
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'AI service authentication failed. Contact administrator.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: `AI service error: ${error.message}` },
        { status: 500 }
      );
    }

    // Generic error (covers both providers)
    console.error('AI Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights. Please try again.' },
      { status: 500 }
    );
  }
}
