/**
 * WMS Individual Wave API Route
 * Handles wave-specific operations including picklist generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { Wave, Inventory, Order, Picklist, PicklistItem, Bin } from '@/types/wms'

export async function GET(
  request: NextRequest,
  { params }: { params: { waveId: string } }
) {
  try {
    const { waveId } = params
    
    if (!waveId) {
      return NextResponse.json(
        { error: 'waveId is required' },
        { status: 400 }
      )
    }

    // Mock data - in real implementation, fetch from Firestore
    const mockWave: Wave = {
      waveId,
      orderIds: ['ORDER-004', 'ORDER-005'],
      status: 'picking',
      releasedBy: 'manager1',
      releasedAt: '2024-01-15T15:00:00Z',
      createdAt: '2024-01-15T15:00:00Z',
      updatedAt: '2024-01-15T15:00:00Z'
    }

    // Mock orders in this wave
    const mockOrders: Order[] = [
      {
        orderId: 'ORDER-004',
        clientId: 'CLIENT-001',
        status: 'picking',
        items: [
          { sku: 'SKU-001', qty: 2, status: 'pending' },
          { sku: 'SKU-002', qty: 1, status: 'pending' }
        ],
        waveId,
        exceptions: [],
        priority: 'normal',
        createdAt: '2024-01-15T14:00:00Z',
        updatedAt: '2024-01-15T15:00:00Z'
      },
      {
        orderId: 'ORDER-005',
        clientId: 'CLIENT-002',
        status: 'picking',
        items: [
          { sku: 'SKU-001', qty: 1, status: 'pending' },
          { sku: 'SKU-003', qty: 3, status: 'pending' }
        ],
        waveId,
        exceptions: [],
        priority: 'high',
        createdAt: '2024-01-15T14:30:00Z',
        updatedAt: '2024-01-15T15:00:00Z'
      }
    ]

    // Mock inventory data
    const mockInventory: Inventory[] = [
      {
        invId: 'INV-001',
        sku: 'SKU-001',
        labelId: 'LBL-001',
        binId: 'BIN-A1-01',
        poId: 'PO-001',
        qty: 5,
        status: 'putaway',
        receivedAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z',
        receivedBy: 'edgar'
      },
      {
        invId: 'INV-002',
        sku: 'SKU-002',
        labelId: 'LBL-002',
        binId: 'BIN-A1-02',
        poId: 'PO-001',
        qty: 2,
        status: 'putaway',
        receivedAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-10T09:15:00Z',
        receivedBy: 'edgar'
      },
      {
        invId: 'INV-003',
        sku: 'SKU-003',
        labelId: 'LBL-003',
        binId: 'BIN-B2-01',
        poId: 'PO-002',
        qty: 10,
        status: 'putaway',
        receivedAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z',
        receivedBy: 'edgar'
      }
    ]

    // Mock bin data for location information
    const mockBins: Bin[] = [
      {
        binId: 'BIN-A1-01',
        location: { zone: 'A', aisle: '1', shelf: '01', position: 'A' },
        capacityUnits: 10,
        currentUnits: 5,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z'
      },
      {
        binId: 'BIN-A1-02',
        location: { zone: 'A', aisle: '1', shelf: '02', position: 'A' },
        capacityUnits: 10,
        currentUnits: 2,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T09:15:00Z'
      },
      {
        binId: 'BIN-B2-01',
        location: { zone: 'B', aisle: '2', shelf: '01', position: 'A' },
        capacityUnits: 20,
        currentUnits: 10,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z'
      }
    ]

    // Generate picklist by collecting all required items from all orders
    const picklistItems: PicklistItem[] = []

    for (const order of mockOrders) {
      for (const item of order.items) {
        if (item.status === 'pending') {
          // Find inventory for this SKU
          const inventory = mockInventory.find(inv => 
            inv.sku === item.sku && 
            inv.status === 'putaway' && 
            inv.qty >= item.qty
          )

          if (inventory) {
            const bin = mockBins.find(b => b.binId === inventory.binId)
            
            picklistItems.push({
              invId: inventory.invId,
              sku: item.sku,
              variant: item.variant,
              qty: item.qty,
              binId: inventory.binId,
              location: bin?.location || { zone: '', aisle: '', shelf: '', position: '' },
              orderId: order.orderId,
              status: 'pending'
            })
          }
        }
      }
    }

    // Sort by location to optimize picking path (zone -> aisle -> shelf -> position)
    picklistItems.sort((a, b) => {
      if (a.location.zone !== b.location.zone) {
        return a.location.zone.localeCompare(b.location.zone)
      }
      if (a.location.aisle !== b.location.aisle) {
        return a.location.aisle.localeCompare(b.location.aisle)
      }
      if (a.location.shelf !== b.location.shelf) {
        return a.location.shelf.localeCompare(b.location.shelf)
      }
      return a.location.position.localeCompare(b.location.position)
    })

    const picklist: Picklist = {
      waveId,
      items: picklistItems,
      totalItems: picklistItems.length,
      pickedItems: picklistItems.filter(item => item.status === 'picked').length,
      status: 'in_progress'
    }

    return NextResponse.json({
      success: true,
      data: picklist
    })

  } catch (error) {
    console.error('Error generating picklist:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate picklist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}