import { BenchmarkValidationAPI, ValidationRequest, ValidationResponse } from '@/lib/benchmarkValidationAPI'

/**
 * API route handler for validating benchmark imports
 * This simulates the server-side API endpoint functionality
 */
export async function validateImports(request: ValidationRequest): Promise<ValidationResponse> {
  try {
    // Use the existing BenchmarkValidationAPI to process the request
    const result = await BenchmarkValidationAPI.validateImport(request)
    return result
  } catch (error) {
    throw new Error(`Validation API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Mock API endpoint that simulates the POST /api/benchmarks/imports/validate endpoint
 * This would typically be implemented as an actual API route in a framework like Next.js
 */
export class BenchmarkImportValidationEndpoint {
  static async POST(requestData: ValidationRequest): Promise<Response> {
    try {
      // Validate the request payload
      if (!requestData.version_id || !requestData.files) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: version_id and files are required' 
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Process the validation
      const result = await validateImports(requestData)

      // Return successful response with validation results
      return new Response(
        JSON.stringify(result),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('API endpoint error:', error)
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error during validation',
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