/**
 * Invoice data contracts for the Collab3PL billing system
 * Based on the Firestore Document Shape from section B.2.1
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
      postalCode: string
      country: string
    }
    paymentTerms: string
    taxId?: string
  }

  dateRange: {
    periodStart: string // ISO date
    periodEnd: string // ISO date
    issuedOn: string // ISO date
    dueOn: string // ISO date
    terms: string
  }

  references: {
    quoteId?: string
    rateCardVersionId: string
    contractId?: string
    previousInvoiceId?: string
  }

  lineItems: InvoiceLineItem[]

  discounts: InvoiceDiscount[]

  tax: {
    enabled: boolean
    rate: number
    basis: 'subtotal' | 'total_before_tax'
    amount?: number
    description?: string
  }

  rounding: {
    mode: 'round' | 'floor' | 'ceil'
    precision: number
  }

  totals: {
    subtotal: number
    discountAmount: number
    subtotalAfterDiscounts: number
    taxAmount: number
    totalBeforeRounding: number
    roundingAdjustment: number
    grandTotal: number
    amountDue: number
    amountPaid: number
  }

  notes: {
    internal?: string
    vendorVisible?: string
    history: InvoiceNote[]
  }

  audit: {
    events: InvoiceAuditEvent[]
    inputsSnapshot: {
      quoteData?: any
      rateCardData?: any
      clientSettings?: any
      taxSettings?: any
    }
  }

  exports: {
    pdfGeneratedOn?: string // ISO timestamp
    csvGeneratedOn?: string // ISO timestamp
    xmlGeneratedOn?: string // ISO timestamp
    lastExportedOn?: string // ISO timestamp
  }
}

export interface InvoiceLineItem {
  lineId: string
  category: 'receiving' | 'fulfillment' | 'storage' | 'vas' | 'surcharges' | 'freight'
  serviceCode: string
  description: string
  quantity: number
  unitOfMeasure: string
  unitRate: number
  extendedCost: number
  discountable: boolean
  period: {
    start: string // ISO date
    end: string // ISO date
  }
  references: {
    quoteLineId?: string
    rateCardItemId?: string
    sourceDocument?: string
  }
  metadata?: {
    [key: string]: any
  }
}

export interface InvoiceDiscount {
  discountId: string
  type: 'flat' | 'percentage'
  amount: number
  description: string
  applyTo: {
    scope: 'all' | 'category' | 'specific_lines'
    categories?: string[]
    lineIds?: string[]
  }
  appliedAmount: number
  order: number
}

export interface InvoiceNote {
  timestamp: string // ISO timestamp
  author: string
  content: string
  type: 'system' | 'user' | 'client'
  visibility: 'internal' | 'client' | 'all'
}

export interface InvoiceAuditEvent {
  timestamp: string // ISO timestamp
  userId: string
  action: 'created' | 'updated' | 'sent' | 'paid' | 'cancelled' | 'exported' | 'viewed'
  details: {
    changes?: {
      field: string
      oldValue: any
      newValue: any
    }[]
    metadata?: {
      [key: string]: any
    }
  }
  ipAddress?: string
  userAgent?: string
}

// Supporting types for invoice creation and updates
export interface CreateInvoiceRequest {
  clientId: string
  periodStart: string
  periodEnd: string
  quoteId?: string
  rateCardVersionId: string
  includeVas?: boolean
  includeSurcharges?: boolean
  customLineItems?: Partial<InvoiceLineItem>[]
  discounts?: Partial<InvoiceDiscount>[]
  notes?: string
}

export interface UpdateInvoiceRequest {
  invoiceId: string
  updates: Partial<Pick<Invoice, 'lineItems' | 'discounts' | 'notes' | 'dateRange'>>
  reason?: string
}

export interface InvoiceFilters {
  clientId?: string
  status?: Invoice['meta']['status']
  periodStart?: string
  periodEnd?: string
  issuedAfter?: string
  issuedBefore?: string
  dueAfter?: string
  dueBefore?: string
  amountMin?: number
  amountMax?: number
  currency?: string
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  totalCount: number
  hasMore: boolean
  nextCursor?: string
}

// Payment tracking types
export interface InvoicePayment {
  paymentId: string
  invoiceId: string
  amount: number
  currency: string
  method: 'check' | 'ach' | 'wire' | 'credit_card' | 'other'
  receivedOn: string // ISO timestamp
  reference?: string
  notes?: string
  processedBy: string
  status: 'pending' | 'cleared' | 'failed' | 'reversed'
}

export interface PaymentAllocation {
  paymentId: string
  invoiceId: string
  allocatedAmount: number
  allocatedOn: string // ISO timestamp
  allocatedBy: string
}