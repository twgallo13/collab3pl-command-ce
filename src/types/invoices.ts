/**
 * Invoice data contracts for the Collab3PL billing system

  m

    createdOn: string // I
    versi

    accountId: string
    billingContact: 
    createdOn: string // ISO timestamp
    lastModifiedOn: string // ISO timestamp
    version: number
  }

  client: {
    accountId: string
    name: string
    billingContact: {
      name: string
    terms: string

    q
    contractId?: stri
  }
  lineItems: Invoice
  discounts: Invoi
  tax: {
    rate: number
    amount?: number
  }
  rounding: {
    precision: num


    subtotalAf
    totalBeforeRounding: number
    grandTotal: number
    amountPaid: number

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
    lineIds?: string[]
      taxSettings?: any
  ord
  a

  exports: {
    pdfGeneratedOn?: string // ISO timestamp
    csvGeneratedOn?: string // ISO timestamp
    xmlGeneratedOn?: string // ISO timestamp
    lastExportedOn?: string // ISO timestamp
  }
}

export interface InvoiceLineItem {
      oldValue: 
  category: 'receiving' | 'fulfillment' | 'storage' | 'vas' | 'surcharges' | 'freight'
  serviceCode: string
  description: string
  quantity: number
  unitOfMeasure: string
}
  extendedCost: number
  discountable: boolean
  period: {
  periodEnd: string
    end: string // ISO date
  i
  references: {
  discounts?: Partial<In
    rateCardItemId?: string
    sourceDocument?: string
  u
  metadata?: {
    [key: string]: any
  }
}

export interface InvoiceDiscount {
  issuedAfter?: stri
  type: 'flat' | 'percentage'
  amount: number
  description: string
  applyTo: {
    scope: 'all' | 'category' | 'specific_lines'
    categories?: string[]
    lineIds?: string[]
  h
  appliedAmount: number

}

export interface InvoiceNote {
  timestamp: string // ISO timestamp
  author: string
  reference?: str
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

    metadata?: {
      [key: string]: any
    }

  ipAddress?: string

}

// Supporting types for invoice creation and updates
export interface CreateInvoiceRequest {
  clientId: string
  periodStart: string
  periodEnd: string

  rateCardVersionId: string
  includeVas?: boolean
  includeSurcharges?: boolean
  customLineItems?: Partial<InvoiceLineItem>[]
  discounts?: Partial<InvoiceDiscount>[]

}

export interface UpdateInvoiceRequest {

  updates: Partial<Pick<Invoice, 'lineItems' | 'discounts' | 'notes' | 'dateRange'>>
  reason?: string
}

export interface InvoiceFilters {
  clientId?: string
  status?: Invoice['meta']['status']
  periodStart?: string
  periodEnd?: string

  issuedBefore?: string

  dueBefore?: string

  amountMax?: number



export interface InvoiceListResponse {
  invoices: Invoice[]
  totalCount: number
  hasMore: boolean
  nextCursor?: string
}

// Payment tracking types
export interface InvoicePayment {

  invoiceId: string

  currency: string
  method: 'check' | 'ach' | 'wire' | 'credit_card' | 'other'
  receivedOn: string // ISO timestamp
  reference?: string
  notes?: string

  status: 'pending' | 'cleared' | 'failed' | 'reversed'


export interface PaymentAllocation {
  paymentId: string

  allocatedAmount: number
  allocatedOn: string // ISO timestamp
  allocatedBy: string
