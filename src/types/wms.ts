/**
 * WMS Core Data Contracts
 * 
 * TypeScript interfaces for warehouse management system components
 * based on the Firestore Document Shape from section C.2
 */

export interface Bin {
  binId: string
  location: {
    zone: string
    row: string
    section: string
    shelf: string
    position: string
  }
  capacityUnits: number
  currentUnits: number
  status: 'available' | 'occupied' | 'full' | 'reserved' | 'maintenance'
  timestamps: {
    created: string // ISO timestamp
    lastModified: string // ISO timestamp
    lastActivity: string // ISO timestamp
  }
}

export interface Inventory {
  invId: string
  sku: string
  variant: {
    size?: string
    color?: string
    material?: string
    [key: string]: any // Allow additional variant properties
  }
  labelId: string
  binId: string
  poId: string
  status: 'received' | 'available' | 'reserved' | 'picked' | 'damaged' | 'expired'
  timestamps: {
    received: string // ISO timestamp
    lastModified: string // ISO timestamp
    expiration?: string // ISO timestamp, optional
  }
  quantities: {
    received: number
    available: number
    reserved: number
    picked: number
  }
  metadata: {
    lotNumber?: string
    serialNumber?: string
    condition: 'new' | 'used' | 'refurbished' | 'damaged'
    notes?: string
  }
}

export interface OrderItem {
  sku: string
  variant: {
    size?: string
    color?: string
    material?: string
    [key: string]: any
  }
  qty: number
  status: 'pending' | 'allocated' | 'picked' | 'packed' | 'shipped'
  allocatedInventory?: {
    invId: string
    binId: string
    qty: number
  }[]
}

export interface OrderException {
  type: 'shortage' | 'damage' | 'mislocation' | 'quality_issue' | 'other'
  description: string
  sku?: string
  reportedBy: string
  reportedAt: string // ISO timestamp
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string // ISO timestamp
  resolution?: string
}

export interface Order {
  orderId: string
  clientId: string
  status: 'pending' | 'wave_assigned' | 'picking' | 'picked' | 'packed' | 'shipped' | 'cancelled' | 'exception'
  items: OrderItem[]
  waveId?: string
  exceptions: OrderException[]
  metadata: {
    priority: 'low' | 'normal' | 'high' | 'urgent'
    customerOrderNumber?: string
    shipToAddress: {
      name: string
      address1: string
      address2?: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    carrierService?: string
    trackingNumber?: string
  }
  timestamps: {
    created: string // ISO timestamp
    lastModified: string // ISO timestamp
    expectedShipDate?: string // ISO timestamp
    actualShipDate?: string // ISO timestamp
  }
}

export interface Wave {
  waveId: string
  orderIds: string[]
  status: 'created' | 'released' | 'picking' | 'completed' | 'cancelled'
  releasedBy: string
  releasedAt: string // ISO timestamp
  metadata: {
    zone?: string
    picker?: string
    priority: 'low' | 'normal' | 'high'
    estimatedCompletionTime?: string // ISO timestamp
    actualCompletionTime?: string // ISO timestamp
  }
  statistics: {
    totalOrders: number
    totalItems: number
    totalUnits: number
    completedOrders: number
    remainingOrders: number
  }
  timestamps: {
    created: string // ISO timestamp
    lastModified: string // ISO timestamp
  }
}

// Additional supporting types for WMS operations

export interface Location {
  zone: string
  row: string
  section: string
  shelf: string
  position: string
}

export interface BinCapacity {
  units: number
  weight?: number
  volume?: number
}

export interface AllocationRequest {
  orderId: string
  items: {
    sku: string
    variant: Record<string, any>
    requestedQty: number
  }[]
}

export interface AllocationResult {
  orderId: string
  allocations: {
    sku: string
    variant: Record<string, any>
    allocatedQty: number
    shortQty: number
    inventory: {
      invId: string
      binId: string
      qty: number
    }[]
  }[]
  status: 'fully_allocated' | 'partially_allocated' | 'unable_to_allocate'
}

export interface PickTask {
  taskId: string
  waveId: string
  orderId: string
  sku: string
  variant: Record<string, any>
  qtyToPick: number
  fromBinId: string
  fromInvId: string
  status: 'pending' | 'in_progress' | 'completed' | 'exception'
  assignedTo?: string
  timestamps: {
    created: string
    started?: string
    completed?: string
  }
}