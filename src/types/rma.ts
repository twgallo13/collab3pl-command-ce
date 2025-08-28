/**
 * Data contracts for Returns / RMA Flow (Phase 4)
 * Based on section D.2 of the collab3pl V9.5 Final document
 */

export interface RMA {
  // Meta information
  meta: {
    rmaId: string
    status: 'pending_authorization' | 'authorized' | 'received' | 'processing' | 'complete' | 'rejected'
    priority: 'normal' | 'high' | 'urgent'
    createdOn: string // ISO timestamp
    updatedOn: string // ISO timestamp
    authorizedOn?: string // ISO timestamp
    completedOn?: string // ISO timestamp
    rejectedOn?: string // ISO timestamp
  }

  // Client information
  client: {
    accountId: string
    name: string
    contactEmail: string
    contactPhone?: string
  }

  // Reference information
  references: {
    originalOrderId?: string
    originalInvoiceId?: string
    returnTrackingNumber?: string
    customerReferenceNumber?: string
  }

  // RMA line items
  lines: RMALineItem[]

  // Notes and communication
  notes: {
    customerReason: string // Customer's reason for return
    internalNotes: string // Internal processing notes
    customerVisible: string // Notes visible to customer
    history: RMAHistoryEntry[]
  }

  // Audit trail
  audit: {
    createdBy: string // User ID
    authorizedBy?: string // User ID
    processedBy?: string // User ID
    events: RMAAuditEvent[]
  }
}

export interface RMALineItem {
  lineId: string
  sku: string
  variant?: string
  description: string
  quantityRequested: number
  quantityReceived?: number
  quantityApproved?: number
  
  // Return reasoning
  reasonCode: 'defective' | 'wrong_item' | 'damaged_shipping' | 'not_as_described' | 'customer_error' | 'other'
  reasonDetails?: string
  
  // Disposition instructions
  disposition: 'return_to_stock' | 'refurbish' | 'dispose' | 'return_to_vendor' | 'hold_for_inspection'
  dispositionNotes?: string
  
  // Pricing information
  pricing: {
    originalUnitPrice: number
    refundAmount: number
    restockingFee?: number
    processingFee?: number
  }

  // Condition assessment (filled during processing)
  condition?: {
    assessed: boolean
    assessedBy?: string
    assessedOn?: string // ISO timestamp
    conditionNotes?: string
    photosUrls?: string[]
  }
}

export interface RMAHistoryEntry {
  timestamp: string // ISO timestamp
  actor: string // User ID or system
  action: string
  details: string
  customerVisible: boolean
}

export interface RMAAuditEvent {
  timestamp: string // ISO timestamp
  actor: string // User ID
  action: 'created' | 'authorized' | 'received' | 'processed' | 'completed' | 'rejected' | 'updated'
  details: Record<string, any>
  ipAddress?: string
}

/**
 * RMA Invoice represents credit memos or fee invoices generated from an RMA
 * This can be either a credit memo (refund) or an invoice (for fees)
 */
export interface RmaInvoice {
  // Meta information
  meta: {
    invoiceId: string
    type: 'credit_memo' | 'fee_invoice'
    status: 'draft' | 'issued' | 'paid' | 'void'
    currency: 'USD' | 'CAD' | 'EUR' | 'GBP'
    createdOn: string // ISO timestamp
    issuedOn?: string // ISO timestamp
    dueOn?: string // ISO timestamp
    paidOn?: string // ISO timestamp
  }

  // Client information
  client: {
    accountId: string
    name: string
    billingAddress: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
  }

  // Reference back to source RMA
  references: {
    rmaId: string
    originalOrderId?: string
    originalInvoiceId?: string
    customerPO?: string
  }

  // Line items (refunds or fees)
  lineItems: RmaInvoiceLineItem[]

  // Financial totals
  totals: {
    subtotal: number
    discounts: number
    taxes: number
    grandTotal: number
  }

  // Tax information
  tax: {
    enabled: boolean
    rate: number
    basis: 'subtotal' | 'after_discounts'
    taxId?: string
  }

  // Notes
  notes: {
    internal: string
    customerVisible: string
  }

  // Audit trail
  audit: {
    createdBy: string
    issuedBy?: string
    events: RmaInvoiceAuditEvent[]
  }
}

export interface RmaInvoiceLineItem {
  lineId: string
  rmaLineId: string // Reference to the RMA line item
  description: string
  type: 'refund' | 'restocking_fee' | 'processing_fee' | 'inspection_fee'
  quantity: number
  unitAmount: number // Positive for fees, negative for refunds
  extendedAmount: number
  taxable: boolean
}

export interface RmaInvoiceAuditEvent {
  timestamp: string // ISO timestamp
  actor: string // User ID
  action: 'created' | 'issued' | 'paid' | 'voided' | 'updated'
  details: Record<string, any>
  ipAddress?: string
}

/**
 * Type guards for RMA entities
 */
export function isRMA(obj: any): obj is RMA {
  return obj && 
    typeof obj.meta === 'object' && 
    typeof obj.meta.rmaId === 'string' &&
    Array.isArray(obj.lines)
}

export function isRmaInvoice(obj: any): obj is RmaInvoice {
  return obj && 
    typeof obj.meta === 'object' && 
    typeof obj.meta.invoiceId === 'string' &&
    (obj.meta.type === 'credit_memo' || obj.meta.type === 'fee_invoice') &&
    Array.isArray(obj.lineItems)
}

/**
 * Utility types for RMA processing
 */
export type RMAStatus = RMA['meta']['status']
export type RMAReasonCode = RMALineItem['reasonCode']
export type RMADisposition = RMALineItem['disposition']
export type RmaInvoiceType = RmaInvoice['meta']['type']
export type RmaInvoiceStatus = RmaInvoice['meta']['status']