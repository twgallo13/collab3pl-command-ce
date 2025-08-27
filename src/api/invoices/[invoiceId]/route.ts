import { NextRequest, NextResponse } from 'next/server'
import { Invoice } from '@/types/invoices'

// Mock database - in production this would be Firestore
const mockInvoices: Record<string, Invoice> = {
  'INV-2025-000123': {
    meta: {
      invoiceId: 'INV-2025-000123',
      status: 'issued',
      currency: 'USD',
      createdOn: '2025-01-01T10:00:00Z',
      lastModifiedOn: '2025-01-01T10:15:00Z',
      version: 2
    },
    client: {
      accountId: 'ACCT_001',
      name: 'Acme Corporation',
      billingContact: {
        name: 'John Smith',
        email: 'billing@acme.com',
        phone: '+1-555-0123'
      },
      billingAddress: {
        line1: '123 Business Ave',
        line2: '',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US'
      }
    },
    dateRange: {
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      issuedOn: '2025-01-01',
      dueOn: '2025-01-31',
      terms: 30
    },
    references: {
      quoteId: 'QTE-2024-000456',
      rateCardVersionId: 'v2024.4',
      poNumber: 'PO-2024-ACME-001'
    },
    lineItems: [
      {
        id: 'LI_001',
        category: 'receiving',
        serviceCode: 'RCV_CARTON',
        description: 'Carton Receiving - Standard',
        quantity: 150,
        unit: 'carton',
        unitRate: 12.50,
        extendedCost: 1875.00,
        discountable: true,
        metadata: { period: '2024-12' }
      },
      {
        id: 'LI_002',
        category: 'fulfillment',
        serviceCode: 'FUL_ORDER',
        description: 'Order Processing - Standard',
        quantity: 850,
        unit: 'order',
        unitRate: 3.75,
        extendedCost: 3187.50,
        discountable: true,
        metadata: { period: '2024-12' }
      },
      {
        id: 'LI_003',
        category: 'storage',
        serviceCode: 'STO_PALLET',
        description: 'Pallet Storage - Monthly',
        quantity: 200,
        unit: 'pallet-month',
        unitRate: 15.00,
        extendedCost: 3000.00,
        discountable: true,
        metadata: { period: '2024-12' }
      },
      {
        id: 'LI_004',
        category: 'vas',
        serviceCode: 'VAS_LABEL',
        description: 'Custom Labeling',
        quantity: 500,
        unit: 'piece',
        unitRate: 0.85,
        extendedCost: 425.00,
        discountable: true,
        metadata: { period: '2024-12' }
      },
      {
        id: 'LI_005',
        category: 'surcharges',
        serviceCode: 'SUR_FUEL',
        description: 'Fuel Surcharge',
        quantity: 1,
        unit: 'flat',
        unitRate: 150.00,
        extendedCost: 150.00,
        discountable: false,
        metadata: { period: '2024-12' }
      }
    ],
    discounts: [
      {
        id: 'DISC_001',
        type: 'percentage',
        amount: 5.0,
        description: 'Volume Tier Discount',
        applyTo: 'fulfillment',
        appliedAmount: 159.38
      },
      {
        id: 'DISC_002',
        type: 'flat',
        amount: 200.00,
        description: 'Contract Negotiated Discount',
        applyTo: 'all',
        appliedAmount: 200.00
      }
    ],
    tax: {
      enabled: true,
      rate: 8.25,
      basis: 'discounted_subtotal',
      amount: 649.14
    },
    rounding: {
      mode: 'standard',
      precision: 2
    },
    totals: {
      subtotal: 8637.50,
      discountAmount: 359.38,
      discountedSubtotal: 8278.12,
      taxAmount: 682.95,
      grandTotal: 8961.07
    },
    notes: {
      internal: 'Customer has requested expedited processing for Q1 orders',
      vendorVisible: 'Thank you for your business. Payment terms are Net 30.',
      history: [
        'Invoice generated from contract CTR-2024-ACME-001',
        'Applied volume tier discount per contract terms'
      ]
    },
    audit: {
      events: [
        {
          timestamp: '2025-01-01T10:00:00Z',
          event: 'created',
          userId: 'admin@collab3pl.com',
          details: 'Invoice created from billing run',
          metadata: { sourceContract: 'CTR-2024-ACME-001' }
        },
        {
          timestamp: '2025-01-01T10:15:00Z',
          event: 'sent',
          userId: 'admin@collab3pl.com',
          details: 'Invoice issued to client',
          metadata: { method: 'email' }
        }
      ],
      inputsSnapshot: {
        rateCardVersion: 'v2024.4',
        discountRules: ['VOLUME_TIER', 'CONTRACT_FLAT'],
        taxRate: 8.25
      }
    },
    exports: {
      pdfGeneratedOn: '2025-01-01T10:20:00Z',
      csvGeneratedOn: '2025-01-01T10:25:00Z',
      lastEmailedOn: '2025-01-01T10:30:00Z'
    }
  },
  'INV-2025-000124': {
    meta: {
      invoiceId: 'INV-2025-000124',
      status: 'draft',
      currency: 'USD',
      createdOn: '2025-01-02T09:00:00Z',
      lastModifiedOn: '2025-01-02T09:00:00Z',
      version: 1
    },
    client: {
      accountId: 'ACCT_002',
      name: 'TechStart Inc.',
      billingContact: {
        name: 'Sarah Johnson',
        email: 'finance@techstart.com',
        phone: '+1-555-0456'
      },
      billingAddress: {
        line1: '456 Innovation Blvd',
        line2: 'Suite 200',
        city: 'Silicon Valley',
        state: 'CA',
        zipCode: '94305',
        country: 'US'
      }
    },
    dateRange: {
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      issuedOn: '',
      dueOn: '2025-02-01',
      terms: 30
    },
    references: {
      quoteId: 'QTE-2024-000789',
      rateCardVersionId: 'v2024.4'
    },
    lineItems: [
      {
        id: 'LI_006',
        category: 'receiving',
        serviceCode: 'RCV_CARTON',
        description: 'Carton Receiving - Electronics',
        quantity: 75,
        unit: 'carton',
        unitRate: 8.50,
        extendedCost: 637.50,
        discountable: true,
        metadata: { period: '2024-12' }
      },
      {
        id: 'LI_007',
        category: 'fulfillment',
        serviceCode: 'FUL_ORDER',
        description: 'Order Processing - Express',
        quantity: 425,
        unit: 'order',
        unitRate: 5.25,
        extendedCost: 2231.25,
        discountable: true,
        metadata: { period: '2024-12' }
      }
    ],
    discounts: [],
    tax: {
      enabled: true,
      rate: 8.25,
      basis: 'discounted_subtotal',
      amount: 236.64
    },
    rounding: {
      mode: 'standard',
      precision: 2
    },
    totals: {
      subtotal: 2868.75,
      discountAmount: 0,
      discountedSubtotal: 2868.75,
      taxAmount: 236.64,
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
          event: 'created',
          userId: 'admin@collab3pl.com',
          details: 'Draft invoice created',
          metadata: {}
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