import { NextRequest, NextResponse } from 'next/server'
import { ExceptionRequest, ExceptionResponse, OrderException } from '@/types/wms'

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
    const exceptionRecord: OrderException = {
      exceptionId,
      type: "PICKING_EXCEPTION",
      sku,
      code,
      actor,
      createdAt: timestamp,
      message: `Item ${sku} could not be found during picking`,
      details
    }
    
    // In a real implementation, this would:
    // 1. Save the exception record to the database
    // 2. Update the order status to "exception"
    // 3. Potentially trigger notifications to managers
    
    // Mock database operations
    console.log('Creating exception record:', exceptionRecord)
    console.log(`Updating order ${orderId} status to "exception"`)
    
    // Simulate database write delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const response: ExceptionResponse = {
      success: true,
      exceptionId,
      message: `Exception logged for SKU ${sku} in order ${orderId}`
    }
    
    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error('Error creating exception:', error)
    return NextResponse.json(
      { error: 'Failed to log exception' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    
    // In a real implementation, this would fetch exceptions from the database
    // Mock response for now
    const mockExceptions: OrderException[] = [
      {
        exceptionId: 'EXC-123456789',
        type: 'PICKING_EXCEPTION',
        sku: 'SKU001',
        code: 'NOT_FOUND',
        actor: 'picker_001',
        createdAt: new Date().toISOString(),
        message: 'Item SKU001 could not be found during picking',
        details: 'Item not found in assigned bin location'
      }
    ]
    
    return NextResponse.json({ exceptions: mockExceptions })
    
  } catch (error) {
    console.error('Error fetching exceptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exceptions' },
      { status: 500 }
    )
  }
}