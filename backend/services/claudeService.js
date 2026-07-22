'use strict';

const Groq = require('groq-sdk');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Typed error for itinerary shape validation failures.
 */
class ItineraryValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ItineraryValidationError';
    this.statusCode = 502;
    this.code = 'ITINERARY_GENERATION_FAILED';
  }
}

/**
 * Validates that the parsed JSON object matches the required itinerary contract.
 * Returns { valid: boolean, errors: string[] }
 */
const validateItineraryShape = (data) => {
  const errors = [];

  // ── itinerary array ──────────────────────────────────────────────────────────
  if (!data.itinerary || !Array.isArray(data.itinerary) || data.itinerary.length === 0) {
    errors.push('itinerary must be a non-empty array');
  } else {
    data.itinerary.forEach((day, dayIdx) => {
      if (typeof day.day !== 'number') {
        errors.push(`itinerary[${dayIdx}].day must be a number`);
      }
      if (typeof day.title !== 'string' || day.title.trim() === '') {
        errors.push(`itinerary[${dayIdx}].title must be a non-empty string`);
      }
      if (!Array.isArray(day.activities) || day.activities.length === 0) {
        errors.push(`itinerary[${dayIdx}].activities must be a non-empty array`);
      } else {
        day.activities.forEach((act, actIdx) => {
          if (typeof act.time !== 'string' || act.time.trim() === '') {
            errors.push(`itinerary[${dayIdx}].activities[${actIdx}].time must be a non-empty string`);
          }
          if (typeof act.title !== 'string' || act.title.trim() === '') {
            errors.push(`itinerary[${dayIdx}].activities[${actIdx}].title must be a non-empty string`);
          }
          if (typeof act.description !== 'string' || act.description.trim() === '') {
            errors.push(`itinerary[${dayIdx}].activities[${actIdx}].description must be a non-empty string`);
          }
          if (typeof act.estimatedCost !== 'number' || act.estimatedCost < 0) {
            errors.push(`itinerary[${dayIdx}].activities[${actIdx}].estimatedCost must be a non-negative number`);
          }
        });
      }
    });
  }

  // ── estimatedBudget ──────────────────────────────────────────────────────────
  if (!data.estimatedBudget || typeof data.estimatedBudget !== 'object') {
    errors.push('estimatedBudget must be an object');
  } else {
    if (typeof data.estimatedBudget.total !== 'number' || data.estimatedBudget.total < 0) {
      errors.push('estimatedBudget.total must be a non-negative number');
    }
    const breakdown = data.estimatedBudget.breakdown;
    if (!breakdown || typeof breakdown !== 'object') {
      errors.push('estimatedBudget.breakdown must be an object');
    } else {
      ['accommodation', 'food', 'activities', 'transport', 'misc'].forEach((field) => {
        if (typeof breakdown[field] !== 'number' || breakdown[field] < 0) {
          errors.push(`estimatedBudget.breakdown.${field} must be a non-negative number`);
        }
      });
    }
  }

  // ── suggestedHotels ──────────────────────────────────────────────────────────
  if (!Array.isArray(data.suggestedHotels) || data.suggestedHotels.length === 0) {
    errors.push('suggestedHotels must be a non-empty array');
  } else {
    data.suggestedHotels.forEach((hotel, idx) => {
      if (typeof hotel.name !== 'string' || hotel.name.trim() === '') {
        errors.push(`suggestedHotels[${idx}].name must be a non-empty string`);
      }
      if (typeof hotel.priceRange !== 'string' || hotel.priceRange.trim() === '') {
        errors.push(`suggestedHotels[${idx}].priceRange must be a non-empty string`);
      }
      if (typeof hotel.rating !== 'number' || hotel.rating < 1 || hotel.rating > 5) {
        errors.push(`suggestedHotels[${idx}].rating must be a number between 1 and 5`);
      }
      if (typeof hotel.description !== 'string' || hotel.description.trim() === '') {
        errors.push(`suggestedHotels[${idx}].description must be a non-empty string`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Extracts JSON from a Claude response that may include markdown code fences.
 */
const extractJSON = (text) => {
  // Remove markdown code fences if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const rawText = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    return JSON.parse(rawText);
  } catch {
    // Try to find a JSON object within the response
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
    }
    throw new Error('No valid JSON found in response');
  }
};

/**
 * Builds the system prompt for Claude itinerary generation.
 */
const buildSystemPrompt = () => `You are an expert travel planner AI. Your task is to generate detailed, practical travel itineraries.

You MUST respond with ONLY a valid JSON object — no markdown, no prose, no code fences, no explanation.
The JSON must match this exact structure:

{
  "itinerary": [
    {
      "day": 1,
      "title": "string",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "string",
          "description": "string (2-4 sentences)",
          "estimatedCost": 0
        }
      ]
    }
  ],
  "estimatedBudget": {
    "total": 0,
    "breakdown": {
      "accommodation": 0,
      "food": 0,
      "activities": 0,
      "transport": 0,
      "misc": 0
    }
  },
  "suggestedHotels": [
    {
      "name": "string",
      "priceRange": "$120-$180/night",
      "rating": 4.5,
      "description": "string"
    }
  ]
}

Rules:
- All costs are in USD as numbers (not strings)
- Include 4-6 activities per day with realistic times
- Suggest 3-4 hotels that match the budget level
- Budget breakdown must sum approximately to the total
- All fields are required; no null values`;

/**
 * Builds the user prompt for the initial generation request.
 */
const buildUserPrompt = ({ destination, numberOfDays, budget, interests }) => {
  const interestsList = interests.join(', ');
  return `Generate a ${numberOfDays}-day travel itinerary for ${destination}.

Travel preferences:
- Budget level: ${budget} (budget = under $100/day, moderate = $100-$250/day, luxury = $250+/day)
- Interests: ${interestsList}
- Duration: ${numberOfDays} day${numberOfDays > 1 ? 's' : ''}

Create a practical, day-by-day itinerary with activities matching the ${budget} budget and ${interestsList} interests. Include accurate cost estimates for ${destination}. Suggest 3-4 hotels appropriate for a ${budget} traveler.

Respond with ONLY the JSON object described in the system prompt.`;
};

/**
 * Builds a corrective follow-up prompt after a validation failure.
 */
const buildRetryPrompt = (validationErrors) => `Your previous response had the following issues:
${validationErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Please provide the corrected JSON response. Remember:
- Respond with ONLY the JSON object
- No markdown code fences
- All numeric cost fields must be numbers (not strings)
- All required fields must be present
- suggestedHotels must have at least 1 entry
- Each day must have at least 1 activity`;

/**
 * Calls Claude to generate a travel itinerary.
 * Validates the response against the required contract.
 * Retries once with a corrective prompt if validation fails.
 *
 * @param {object} tripData - { destination, numberOfDays, budget, interests }
 * @returns {Promise<object>} - Validated itinerary contract object
 * @throws {ItineraryValidationError} - If generation fails after retry
 */
const generateItinerary = async (tripData) => {
  // Build prompts
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(tripData);

  // Helper to extract raw text from either Groq or Anthropic response
  const extractResponseText = (resp) => {
    // Groq response format
    if (resp?.choices?.[0]?.message?.content) return resp.choices[0].message.content;
    // Anthropic response format
    if (resp?.content?.[0]?.text) return resp.content[0].text;
    return '';
  };

  // ── First Attempt ────────────────────────────────────────────────────────
  let response;
  try {
    // Try Anthropic first
    response = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20240620', // adjust if needed
      max_tokens: 1024,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
  } catch (apiError) {
    // If Anthropic fails due to rate limiting, fall back to Groq
    const isRateLimit = apiError?.statusCode === 429 || /rate limit/i.test(apiError.message);
    if (isRateLimit) {
      try {
        response = await client.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        });
      } catch (groqError) {
        const err = new Error(`Groq API request failed: ${groqError.message}`);
        err.statusCode = 502;
        err.code = 'AI_API_ERROR';
        throw err;
      }
    } else {
      const err = new Error(`Anthropic API request failed: ${apiError.message}`);
      err.statusCode = 502;
      err.code = 'AI_API_ERROR';
      throw err;
    }
  }

  const firstResponseText = extractResponseText(response);
  let parsedData;
  try {
    parsedData = extractJSON(firstResponseText);
  } catch {
    parsedData = null;
  }

  // ── Validation & Possible Retry ───────────────────────────────────────
  if (parsedData) {
    const { valid, errors } = validateItineraryShape(parsedData);
    if (valid) return parsedData;

    console.warn('[AI Service] First response failed validation. Errors:', errors);
    // Prepare corrective messages
    const correctiveMessages = [
      { role: 'assistant', content: firstResponseText },
      { role: 'user', content: buildRetryPrompt(errors) },
    ];

    // Second attempt (use Groq for consistency)
    try {
      const retryResp = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...correctiveMessages,
        ],
        response_format: { type: 'json_object' },
      });
      const retryText = extractResponseText(retryResp);
      const retryParsed = extractJSON(retryText);
      const { valid: rValid, errors: rErrors } = validateItineraryShape(retryParsed);
      if (rValid) return retryParsed;
      throw new ItineraryValidationError(`AI itinerary generation failed validation after retry: ${rErrors.join('; ')}`);
    } catch (retryErr) {
      throw new ItineraryValidationError(`AI retry failed: ${retryErr.message}`);
    }
  } else {
    // If JSON could not be parsed at all, fallback to a Groq retry with a generic correction prompt
    try {
      const retryResp = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: firstResponseText },
          { role: 'user', content: 'Your previous response could not be parsed as JSON. Please respond with ONLY the raw JSON object.' },
        ],
        response_format: { type: 'json_object' },
      });
      const retryText = extractResponseText(retryResp);
      const retryParsed = extractJSON(retryText);
      const { valid: rValid, errors: rErrors } = validateItineraryShape(retryParsed);
      if (rValid) return retryParsed;
      throw new ItineraryValidationError(`AI itinerary generation failed validation after retry: ${rErrors.join('; ')}`);
    } catch (finalErr) {
      throw new ItineraryValidationError(`AI final attempt failed: ${finalErr.message}`);
    }
  }
};

module.exports = { generateItinerary };
