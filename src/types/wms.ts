/**
 * WMS Core Data Contracts
 * Based on section C.2 of the collab3pl V9.5 Final document
 */

export interface Bin {
  binId: string
  location: {
    zone: string
    aisle: string
    shelf: string
    position: string
  }
  capacityUnits: number
  currentUnits: number
  status: 'active' | 'inactive' | 'maintenance'
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  invId: string
  sku: string
  variant?: string
  labelId: string
  binId: string
  poId: string
  qty: number
  status: 'received' | 'putaway' | 'picked' | 'damaged' | 'lost'
  trackingId?: string
  receivedAt: string
  updatedAt: string
  receivedBy: string
}

export interface OrderItem {
  sku: string
  variant?: string
  qty: number
  qtyPicked?: number
  status: 'pending' | 'picking' | 'picked' | 'exception'
}

export interface Order {
  orderId: string
  clientId: string
  status: 'open' | 'ready_to_pick' | 'picking' | 'picked' | 'shipped' | 'cancelled' | 'exception'
  items: OrderItem[]
  waveId?: string
  exceptions: Array<{
    type: string
    message: string
    createdAt: string
  }>
  priority: 'low' | 'normal' | 'high' | 'urgent'
  dueDate: string
  createdAt: string
  updatedAt: string
  shipBy?: string
}

export interface Wave {
  waveId: string
  orderIds: string[]
  status: 'draft' | 'released' | 'picking' | 'completed' | 'cancelled'
  releasedBy?: string
  releasedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// API Request/Response types for receiving station
export interface ReceivingScanRequest {
  sku: string
  variant?: string
  qty: number
  trackingId?: string
  binId?: string
}

export interface ReceivingScanResponse {
  invId: string
  labelId: string
  binId: string
  status: 'success'
  message: string
}