import { NextRequest, NextResponse } from 'next/server'
import { Order } from '@/types/wms'

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    orderId: 'ORD-001',
    clientId: 'CLIENT-ABC',
    status: 'open',
    items: [
      { sku: 'WIDGET-001', variant: 'Red', qty: 5 },
      { sku: 'GADGET-002', variant: 'Blue', qty: 3 }
    ],
    waveId: null,
    exceptions: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    dueDate: '2024-01-20T23:59:59Z'
  },
  {
    orderId: 'ORD-002',
    clientId: 'CLIENT-XYZ',
    status: 'ready_to_pick',
    items: [
      { sku: 'TOOL-003', variant: 'Standard', qty: 10 }
    ],
    waveId: 'WAVE-001',
    exceptions: [],
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    dueDate: '2024-01-18T23:59:59Z'
  },
  {
    orderId: 'ORD-003',
    clientId: 'CLIENT-DEF',
    status: 'exception',
    items: [
      { sku: 'PART-004', variant: 'Large', qty: 2 }
    ],
    waveId: null,
    exceptions: [
      {
        type: 'insufficient_inventory',
        message: 'Not enough inventory for SKU PART-004',
        createdAt: '2024-01-15T08:30:00Z'
      }
    ],
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    dueDate: '2024-01-17T23:59:59Z'
  },
  {
    orderId: 'ORD-004',
    clientId: 'CLIENT-GHI',
    status: 'open',
    items: [
      { sku: 'ITEM-005', variant: 'Medium', qty: 8 },
      { sku: 'ITEM-006', variant: 'Small', qty: 12 }
    ],
    waveId: null,
    exceptions: [],
    createdAt: '2024-01-15T11:20:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    dueDate: '2024-01-22T23:59:59Z'
  },
  {
    orderId: 'ORD-005',
    clientId: 'CLIENT-JKL',
    status: 'ready_to_pick',
    items: [
      { sku: 'PRODUCT-007', variant: 'Premium', qty: 6 }
    ],
    waveId: 'WAVE-002',
    exceptions: [],
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-15T07:45:00Z',
    dueDate: '2024-01-19T23:59:59Z'
  },
  {
    orderId: 'ORD-006',
    clientId: 'CLIENT-MNO',
    status: 'exception',
    items: [
      { sku: 'COMPONENT-008', variant: 'Special', qty: 4 }
    ],
    waveId: null,
    exceptions: [
      {
        type: 'damaged_inventory',
        message: 'Inventory damaged during receiving',
        createdAt: '2024-01-14T15:20:00Z'
      }
    ],
    createdAt: '2024-01-12T13:15:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
    dueDate: '2024-01-16T23:59:59Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Filter orders by status if provided
    let filteredOrders = mockOrders
    if (status) {
      filteredOrders = mockOrders.filter(order => order.status === status)
    }

    return NextResponse.json(filteredOrders, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}