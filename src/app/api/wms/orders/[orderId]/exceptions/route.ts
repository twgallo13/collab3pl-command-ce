import { NextRequest, NextResponse } from 'next/server'

interface ExceptionRequest {
  sku: string
  code?: string
  details?: string
}

interface ExceptionRecord {
  exceptionId: string
  orderId: string
  sku: string
  code: string
  actor: string
  timestamp: string
  details?: string
  resolved: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const { sku, code = "NOT_FOUND", details }: ExceptionRequest = await request.json()

    // Generate a unique exception ID
    const exceptionId = `EXC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Get current timestamp
    const timestamp = new Date().toISOString()
    
    // In a real implementation, this would get the authenticated user
    const actor = "picker_001" // Mock picker ID
    
    // Create exception record
    const exceptionRecord: ExceptionRecord = {
      exceptionId,
      orderId,
      sku,
      code,
      actor,
      timestamp,
      details,
      resolved: false
    }
    
    // In a real implementation, this would:
    // 1. Save the exception record to the database
    // 2. Update the order status to "exception"
    // 3. Send notifications to warehouse managers
    // 4. Log the event for audit purposes

    return NextResponse.json({
      success: true,
      message: `Exception logged for SKU ${sku}`,
      exception: exceptionRecord
    })

  } catch (error) {
    console.error('Error logging exception:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log exception',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}