import { NextRequest, NextResponse } from 'next/server'


// Mock database - in production this would be Firestore
const mockInvoices: Record<string, Invoice> = {
  'INV-2025-000123': {
      curre
      invoiceId: 'INV-2025-000123',
      updated: '2025-01
      currency: 'USD',
      accountId: 
      created: '2025-01-01T10:00:00Z',
      }
    da
      periodE
      dueOn: '2025-01-31',
    },
      quoteId: 'QTE-2024-000456'
      contractId
    lineItems: [
        category: 'Receiving',
        quantity: 15
        rate: 12.50,
        discountable:
      }
      
        quantity
        rate: 3.75,
        discountable: true,
      },
        category: 'Storage
        quantity: 200
      
        discounta
      },
        category: 'VAS',
        quantity: 500,
      
        discount
      }
        category: 'Surcharges'
        quantity: 1,
        rate: 150.00,
        discountable: 
      }
    discounts: [
        code: 'VOLUME_TIER'
        type: 'percentage
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
    audit: {
        applyTo: 'all'
       
    ],
          
      enabled: true,
          timesta
      basis: 'after_discounts',
          details: '
    },
      inputsSna
      mode: 'nearest_cent',
        taxRate: 8
    },
    totals: {
      discountableSubtotal: 8487.50,
      nonDiscountableSubtotal: 150.00,
      beforeDiscounts: 8637.50,
    meta: {
        {
      currency: 'USD',
          description: 'Contract Negotiated Discount',
          type: 'flat',
          appliedToAmount: 200.00,
      accountId: 'ACCT
        },
      add
          code: 'VOLUME_TIER', 
          description: 'Volume Tier Discount',
          type: 'percentage',
          appliedToAmount: 414.38,
          scope: 'non_surcharges'
      per
      ],
      totalDiscounts: 614.38,
      afterDiscounts: 8023.12,
      taxes: 649.14,
      grandTotal: 8672.26
    },
    notes: {
      internal: 'Customer has requested expedited processing for Q1 orders',
      vendorVisible: 'Thank you for your business. Payment terms are Net 30.',
        uom: 'ca
        {
          timestamp: '2025-01-01T10:00:00Z',
          user: 'admin@collab3pl.com',
          action: 'created',
          note: 'Invoice generated from contract CTR-2024-ACME-001'
        q
      ]
      
    audit: {
      }
        {
          timestamp: '2025-01-01T10:00:00Z',
          user: 'admin@collab3pl.com',
          action: 'created',
          details: 'Invoice created from billing run'
    roundi
        {
          timestamp: '2025-01-01T10:15:00Z',
          user: 'admin@collab3pl.com', 
          action: 'issued',
          details: 'Invoice issued to client'
      tot
      ],
      inputsSnapshot: {
        rateCardVersion: 'v2024.4',
        discountRules: ['VOLUME_TIER', 'CONTRACT_FLAT'],
        taxRate: 8.25
    },
    },
        {
      pdf: '2025-01-01T10:20:00Z',
      csv: '2025-01-01T10:25:00Z'
    }
    
  'INV-2025-000124': {
        dis
      invoiceId: 'INV-2025-000124',
      status: 'draft',
      currency: 'USD',
}
      created: '2025-01-02T09:00:00Z',
  request: NextRequest,
    },
  try {
      accountId: 'ACCT_002',
      name: 'TechStart Inc.',
      email: 'finance@techstart.com',
    if (!invoice
        line1: '456 Innovation Blvd',
        city: 'Silicon Valley',
        state: 'CA',
        zip: '94305',
        country: 'US'
  } cat
    },
      { error: '
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      issuedOn: '',

      terms: 'Net 30'

    references: {
      quoteId: 'QTE-2024-000789',
      rateCardVersionId: 'v2024.4'

    lineItems: [

        category: 'Receiving',
        description: 'Carton Receiving - Electronics',
        quantity: 75,
        uom: 'carton',
        rate: 8.50,

        discountable: true,
        period: '2024-12'
      },
      {
        category: 'Fulfillment', 
        description: 'Order Processing - Express',
        quantity: 425,

        rate: 5.25,
        amount: 2231.25,
        discountable: true,
        period: '2024-12'
      }

    discounts: [],

      enabled: true,

      basis: 'after_discounts',

    },

      mode: 'nearest_cent',
      precision: 2
    },

      discountableSubtotal: 2868.75,

      beforeDiscounts: 2868.75,
      discountsApplied: [],
      totalDiscounts: 0,

      taxes: 236.64,
      grandTotal: 3105.39

    notes: {
      internal: 'New client - monitor service levels closely',
      vendorVisible: '',
      history: []
    },
    audit: {

        {
          timestamp: '2025-01-02T09:00:00Z',
          user: 'admin@collab3pl.com',

          details: 'Draft invoice created'

      ],
      inputsSnapshot: {
        rateCardVersion: 'v2024.4',
        discountRules: [],
        taxRate: 8.25

    },

  }


export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {

    const { invoiceId } = params

    // In production, this would fetch from Firestore

    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }

    }

    return NextResponse.json(invoice)

  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }

  }
