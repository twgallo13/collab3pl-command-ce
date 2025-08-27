/**
 * Invoice data contracts for the Collab3PL billing system
 * Based on section B.2.1 of the collab3pl V9.5 Final document
 */

export interface Invoice {
  meta: {
    invoiceId: string
    status: 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    currency: string
    createdOn: string // ISO timestamp
    lastModifiedOn: string // ISO timestamp
    version: number
  }

  client: {
    accountId: string
    name: string
    billingContact: {
      name: string
      email: string
      phone?: string
    }
    billingAddress: {
      line1: string
      line2?: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }

  dateRange: {
    periodStart: string // ISO date
    periodEnd: string // ISO date
    issuedOn: string // ISO date
    dueOn: string // ISO date
    terms: number // days
  }

  references: {
    quoteId?: string
    rateCardVersionId: string
    poNumber?: string
  }

  lineItems: LineItem[]

  discounts: Discount[]

  tax: {
    enabled: boolean
    rate: number // percentage
    basis: 'subtotal' | 'discounted_subtotal'
    amount?: number
  }

  rounding: {
    mode: 'standard' | 'up' | 'down'
    precision: number // decimal places
  }

  totals: {
    subtotal: number
    discountAmount: number
    discountedSubtotal: number
    taxAmount: number
    grandTotal: number
  }

  notes: {
    internal?: string
    vendorVisible?: string
    history: string[]
  }

  audit: {
    events: AuditEvent[]
    inputsSnapshot: Record<string, any>
  }

  exports: {
    pdfGeneratedOn?: string // ISO timestamp
    csvGeneratedOn?: string // ISO timestamp
    lastEmailedOn?: string // ISO timestamp
  }
}

export interface LineItem {
  id: string
  category: 'receiving' | 'fulfillment' | 'storage' | 'vas' | 'surcharges'
  serviceCode: string
  description: string
  quantity: number
  unit: string
  unitRate: number
  extendedCost: number
  discountable: boolean
  metadata?: Record<string, any>
}

export interface Discount {
  id: string
  type: 'flat' | 'percentage'
  amount: number
  description: string
  applyTo: 'all' | 'receiving' | 'fulfillment' | 'storage' | 'vas'
  appliedAmount: number
}

export interface AuditEvent {
  timestamp: string // ISO timestamp
  event: 'created' | 'modified' | 'sent' | 'paid' | 'cancelled'
  userId: string
  details: string
  metadata?: Record<string, any>
}

export interface PaymentRecord {
  paymentId: string
  amount: number
  method: 'ach' | 'wire' | 'check' | 'credit_card'
  receivedOn: string // ISO timestamp
  reference?: string
  status: 'pending' | 'cleared' | 'failed' | 'reversed'
}

export interface PaymentAllocation {
  paymentId: string
  allocatedAmount: number
  allocatedOn: string // ISO timestamp
  allocatedBy: string
}