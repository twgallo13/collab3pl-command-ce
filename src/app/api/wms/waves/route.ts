/**
 * WMS Waves API Route
 * Handles creation of new waves and management of wave operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { Wave, Order } from '@/types/wms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderIds } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'orderIds array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Generate unique wave ID
    const waveId = `WAVE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Create new wave record
    const newWave: Wave = {
      waveId,
      orderIds: orderIds,
      status: 'released',
      releasedBy: 'current-user', // In real app, get from auth context
      releasedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Simulate database operations
    // In real implementation, this would:
    // 1. Create the wave document in Firestore
    // 2. Update all associated orders to "picking" status
    // 3. Handle any transaction rollback on failure

    // Mock database write to waves collection
    console.log('Creating wave:', newWave)
    
    // Mock update of order statuses
    for (const orderId of orderIds) {
      console.log(`Updating order ${orderId} status to "picking"`)
      // await updateOrderStatus(orderId, 'picking', waveId)
    }

    return NextResponse.json({
      success: true,
      waveId: newWave.waveId,
      message: `Wave ${newWave.waveId} created successfully with ${orderIds.length} orders`,
      data: {
        waveId: newWave.waveId,
        orderCount: orderIds.length,
        status: newWave.status,
        releasedAt: newWave.releasedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating wave:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create wave',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Mock waves data
    const waves: Wave[] = [
      {
        waveId: 'WAVE-001',
        orderIds: ['ORDER-001', 'ORDER-002', 'ORDER-003'],
        status: 'completed',
        releasedBy: 'manager1',
        releasedAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T14:45:00Z',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:45:00Z'
      },
      {
        waveId: 'WAVE-002',
        orderIds: ['ORDER-004', 'ORDER-005'],
        status: 'picking',
        releasedBy: 'manager1',
        releasedAt: '2024-01-15T15:00:00Z',
        createdAt: '2024-01-15T15:00:00Z',
        updatedAt: '2024-01-15T15:00:00Z'
      }
    ]

    const filteredWaves = status ? waves.filter(wave => wave.status === status) : waves

    return NextResponse.json({
      success: true,
      data: filteredWaves,
      count: filteredWaves.length
    })

  } catch (error) {
    console.error('Error fetching waves:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch waves',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}