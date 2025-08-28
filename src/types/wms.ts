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
  status: 'received' | 'waved' | 'picking' | 'picked' | 'shipped' | 'cancelled'
  items: OrderItem[]
  waveId?: string
  exceptions: string[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
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

// Picking workflow types
export interface PicklistItem {
  invId: string
  sku: string
  variant?: string
  qty: number
  binId: string
  location: {
    zone: string
    aisle: string
    shelf: string
    position: string
  }
  orderId: string
  status: 'pending' | 'picked' | 'not_found'
}

export interface Picklist {
  waveId: string
  items: PicklistItem[]
  totalItems: number
  pickedItems: number
  status: 'in_progress' | 'completed'
}

export interface PickItemRequest {
  invId: string
}

export interface PickItemResponse {
  invId: string
  status: 'success'
  message: string
}