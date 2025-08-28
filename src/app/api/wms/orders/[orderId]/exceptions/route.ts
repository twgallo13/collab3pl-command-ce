import { NextRequest, NextResponse } from 'next/server'

  request: NextRequest,
) {
    const { ord

}

    
    const actor = "pi
    // Create exc
      excepti
      sku,
      actor,
      message: `Ite
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
    )
      sku,

      actor,
      timestamp,
      details
    c
    
    // In a real implementation, this would:
    // 1. Save the exception record to the database























































