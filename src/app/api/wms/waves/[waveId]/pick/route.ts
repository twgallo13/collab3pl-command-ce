/**
 * WMS Picking API Route
 * Handles individual item picking operations within a wave
 */

import { NextRequest, NextResponse } from 'next/server'
import { PickItemRequest, PickItemResponse } from '@/types/wms'

export async function POST(
  request: NextRequest,
  { params }: { params: { waveId: string } }
) {
  try {
    const { waveId } = params
    const body: PickItemRequest = await request.json()
    const { invId } = body

    if (!waveId) {
      return NextResponse.json(
        { error: 'waveId is required' },
        { status: 400 }
      )
    }

    if (!invId) {
      return NextResponse.json(
        { error: 'invId is required' },
        { status: 400 }
      )
    }

    // In real implementation, this would:
    // 1. Validate that the inventory item exists and is in the correct wave
    // 2. Update the inventory status from 'putaway' to 'picked'
    // 3. Update the order item status if this was the last quantity needed
    // 4. Log the picking action with timestamp and picker ID
    
    console.log(`Picking item ${invId} in wave ${waveId}`)
    
    // Mock database operations
    // await updateInventoryStatus(invId, 'picked')
    // await logPickingAction(waveId, invId, pickerId, timestamp)
    
    const response: PickItemResponse = {
      invId,
      status: 'success',
      message: `Item ${invId} successfully picked in wave ${waveId}`
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error picking item:', error)
    return NextResponse.json(
      { 
        error: 'Failed to pick item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}