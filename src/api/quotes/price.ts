/**
 * API route for Quote Generator service
 * Based on section A.7 of the collab3pl V9.5 Final document
 */

import { priceQuote, validateQuoteRequest, QuoteRequest, QuoteResponse } from '@/lib/quoteService'

/**
 * Service class for handling quote pricing API operations
 */
export class QuotePricingService {
  /**
   * Processes a quote request and returns the pricing calculation
   */
  static async processQuoteRequest(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      // Validate the request structure
      if (!validateQuoteRequest(request)) {
        throw new Error('Invalid quote request structure')
      }

      // Call the quote service to generate the pricing
      const quote = await priceQuote(request)
      
      return quote
    } catch (error) {
      throw new Error(`Quote processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

/**
 * Client-side API function for generating quotes
 * This simulates calling the server-side API endpoint
 */
export async function generateQuote(request: QuoteRequest): Promise<QuoteResponse> {
  try {
    const result = await QuotePricingService.processQuoteRequest(request)
    return result
  } catch (error) {
    throw new Error(`Quote API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Mock API endpoint that simulates the POST /api/quotes/price endpoint
 * This would typically be implemented as an actual API route in a framework like Next.js
 */
export class QuotePriceEndpoint {
  static async POST(requestData: QuoteRequest): Promise<Response> {
    try {
      // Validate required fields
      if (!requestData.version_id) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required field: version_id is required' 
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (!requestData.customer_id) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required field: customer_id is required' 
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (!requestData.effective_date) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required field: effective_date is required' 
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (!requestData.origin || !requestData.destination) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: origin and destination are required' 
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (!requestData.services) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required field: services object is required' 
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Process the quote request
      const result = await generateQuote(requestData)

      // Return successful response with quote
      return new Response(
        JSON.stringify(result),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Quote price API endpoint error:', error)
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error during quote generation',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

/**
 * Function to simulate a POST request to the quote price API
 * This can be used for testing the quote generation functionality
 */
export async function simulateQuotePriceAPI(request: QuoteRequest): Promise<QuoteResponse> {
  const response = await QuotePriceEndpoint.POST(request)
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Quote API request failed')
  }
  
  return await response.json()
}