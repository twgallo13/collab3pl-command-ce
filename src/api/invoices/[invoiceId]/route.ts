import { NextRequest, NextResponse } from 'next/server'
import { Invoice } from '@/types/invoices'

// Mock database - in production this would be Firestore
const mockInvoices: Record<string, Invoice> = {
  'INV-2025-000123': {
    meta: {
      invoiceId: 'INV-2025-000123',
      status: 'issued',
      currency: 'USD',
      version: 1,
      created: '2025-01-01T10:00:00Z',
      updated: '2025-01-01T10:00:00Z'
    },
    client: {
      accountId: 'ACCT_001',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      address: {
        line1: '123 Business St',
        city: 'Commerce City',
        state: 'CA',
        zip: '90210',
        country: 'US'
      }
    },
    dateRange: {
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      issuedOn: '2025-01-01',
      dueOn: '2025-01-31',
      terms: 'Net 30'
    },
    references: {
      quoteId: 'QTE-2024-000456',
      rateCardVersionId: 'v2024.4',
      contractId: 'CTR-2024-ACME-001'
    },
    lineItems: [
      {
        category: 'Receiving',
        description: 'Pallet Receiving - Standard',
        quantity: 150,
        uom: 'pallet',
        rate: 12.50,
        amount: 1875.00,
        discountable: true,
        period: '2024-12'
      },
      {
        category: 'Fulfillment',
        description: 'Order Processing - Standard',
        quantity: 850,
        uom: 'order',
        rate: 3.75,
        amount: 3187.50,
        discountable: true,
        period: '2024-12'
      },
      {
        category: 'Storage',
        description: 'Pallet Storage - Month',
        quantity: 200,
        uom: 'pallet-month',
        rate: 15.00,
        amount: 3000.00,
        discountable: true,
        period: '2024-12'
      },
      {
        category: 'VAS',
        description: 'Custom Labeling',
        quantity: 500,
        uom: 'piece',
        rate: 0.85,
        amount: 425.00,
        discountable: true,
        period: '2024-12'
      },
      {
        category: 'Surcharges',
        description: 'Fuel Surcharge',
        quantity: 1,
        uom: 'flat',
        rate: 150.00,
        amount: 150.00,
        discountable: false,
        period: '2024-12'
      }
    ],
    discounts: [
      {
        code: 'VOLUME_TIER',
        description: 'Volume Tier Discount',
        type: 'percentage',
        value: 5.0,
        applyTo: 'non_surcharges'
      },
      {
        code: 'CONTRACT_FLAT',
        description: 'Contract Negotiated Discount',
        type: 'flat',
        value: 200.00,
        applyTo: 'all'
      }
    ],
    tax: {
      enabled: true,
      rate: 8.25,
      basis: 'after_discounts',
      amount: 649.14
    },
    rounding: {
      mode: 'nearest_cent',
      precision: 2
    },
    totals: {
      discountableSubtotal: 8487.50,
      nonDiscountableSubtotal: 150.00,
      beforeDiscounts: 8637.50,
      discountsApplied: [
        {
          code: 'CONTRACT_FLAT',
          description: 'Contract Negotiated Discount',
          type: 'flat',
          appliedToAmount: 200.00,
          scope: 'all'
        },
        {
          code: 'VOLUME_TIER', 
          description: 'Volume Tier Discount',
          type: 'percentage',
          appliedToAmount: 414.38,
          scope: 'non_surcharges'
        }
      ],
      totalDiscounts: 614.38,
      afterDiscounts: 8023.12,
      taxes: 649.14,
      grandTotal: 8672.26
    },
    notes: {
      internal: 'Customer has requested expedited processing for Q1 orders',
      vendorVisible: 'Thank you for your business. Payment terms are Net 30.',
      history: [
        {
          timestamp: '2025-01-01T10:00:00Z',
          user: 'admin@collab3pl.com',
          action: 'created',
          note: 'Invoice generated from contract CTR-2024-ACME-001'
        }
      ]
    },
    audit: {
      events: [
        {
          timestamp: '2025-01-01T10:00:00Z',
          user: 'admin@collab3pl.com',
          action: 'created',
          details: 'Invoice created from billing run'
        },
        {
          timestamp: '2025-01-01T10:15:00Z',
          user: 'admin@collab3pl.com', 
          action: 'issued',
          details: 'Invoice issued to client'
        }
      ],
      inputsSnapshot: {
        rateCardVersion: 'v2024.4',
        discountRules: ['VOLUME_TIER', 'CONTRACT_FLAT'],
        taxRate: 8.25
      }
    },
    exports: {
      pdf: '2025-01-01T10:20:00Z',
      csv: '2025-01-01T10:25:00Z'
    }
  },
  'INV-2025-000124': {
    meta: {
      invoiceId: 'INV-2025-000124',
      status: 'draft',
      currency: 'USD',
      version: 1,
      created: '2025-01-02T09:00:00Z',
      updated: '2025-01-02T09:00:00Z'
    },
    client: {
      accountId: 'ACCT_002',
      name: 'TechStart Inc.',
      email: 'finance@techstart.com',
      address: {
        line1: '456 Innovation Blvd',
        city: 'Silicon Valley',
        state: 'CA',
        zip: '94305',
        country: 'US'
      }
    },
    dateRange: {
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      issuedOn: '',
      dueOn: '',
      terms: 'Net 30'
    },
    references: {
      quoteId: 'QTE-2024-000789',
      rateCardVersionId: 'v2024.4'
    },
    lineItems: [
      {
        category: 'Receiving',
        description: 'Carton Receiving - Electronics',
        quantity: 75,
        uom: 'carton',
        rate: 8.50,
        amount: 637.50,
        discountable: true,
        period: '2024-12'
      },
      {
        category: 'Fulfillment', 
        description: 'Order Processing - Express',
        quantity: 425,
        uom: 'order',
        rate: 5.25,
        amount: 2231.25,
        discountable: true,
        period: '2024-12'
      }
    ],
    discounts: [],
    tax: {
      enabled: true,
      rate: 8.25,
      basis: 'after_discounts',
      amount: 236.64
    },
    rounding: {
      mode: 'nearest_cent',
      precision: 2
    },
    totals: {
      discountableSubtotal: 2868.75,
      nonDiscountableSubtotal: 0,
      beforeDiscounts: 2868.75,
      discountsApplied: [],
      totalDiscounts: 0,
      afterDiscounts: 2868.75,
      taxes: 236.64,
      grandTotal: 3105.39
    },
    notes: {
      internal: 'New client - monitor service levels closely',
      vendorVisible: '',
      history: []
    },
    audit: {
      events: [
        {
          timestamp: '2025-01-02T09:00:00Z',
          user: 'admin@collab3pl.com',
          action: 'created',
          details: 'Draft invoice created'
        }
      ],
      inputsSnapshot: {
        rateCardVersion: 'v2024.4',
        discountRules: [],
        taxRate: 8.25
      }
    },
    exports: {}
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params
    
    // In production, this would fetch from Firestore
    const invoice = mockInvoices[invoiceId]
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(invoice)
    
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}