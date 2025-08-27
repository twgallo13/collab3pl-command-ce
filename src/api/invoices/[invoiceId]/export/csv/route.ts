/**
 * CSV Export API Route
 * Exports invoice data in CSV format
 */

import { Invoice } from '@/types/invoices'

// Mock invoice data (matches the structure from PDF export)
function getMockInvoice(invoiceId: string): Invoice | null {
  if (!invoiceId) return null
  
  return {
    meta: {
      invoiceId: invoiceId,
      status: 'issued',
      currency: 'USD',
      createdOn: '2024-01-15T10:00:00Z',
      lastModifiedOn: '2024-01-15T10:00:00Z',
      version: 1
    },
    client: {
      accountId: 'ACCT_001',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      address: {
        line1: '123 Business Street',
        line2: 'Suite 100',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'United States'
      },
      billingContact: {
        name: 'John Smith',
        email: 'billing@acme.com',
        phone: '+1 (555) 123-4567'
      },
      billingAddress: {
        line1: '123 Business Street',
        line2: 'Suite 100',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      }
    },
    dateRange: {
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      issuedOn: '2024-02-01',
      dueOn: '2024-02-16',
      terms: 15
    },
    references: {
      quoteId: 'QTE-2024-001',
      rateCardVersionId: 'v2024.1'
    },
    lineItems: [
      {
        id: '1',
        category: 'receiving',
        serviceCode: 'REC_PALLET',
        description: 'Pallet Receiving',
        quantity: 100,
        unit: 'pallets',
        unitRate: 15.00,
        extendedCost: 1500.00,
        discountable: true
      },
      {
        id: '2',
        category: 'fulfillment',
        serviceCode: 'FUL_ORDER',
        description: 'Order Fulfillment',
        quantity: 500,
        unit: 'orders',
        unitRate: 3.50,
        extendedCost: 1750.00,
        discountable: true
      },
      {
        id: '3',
        category: 'storage',
        serviceCode: 'STO_SQFT',
        description: 'Storage per Sq Ft',
        quantity: 2500,
        unit: 'sq_ft',
        unitRate: 0.85,
        extendedCost: 2125.00,
        discountable: true
      },
      {
        id: '4',
        category: 'vas',
        serviceCode: 'VAS_LABEL',
        description: 'Label Application',
        quantity: 250,
        unit: 'labels',
        unitRate: 0.50,
        extendedCost: 125.00,
        discountable: true
      }
    ],
    discounts: [
      {
        id: 'disc1',
        type: 'percentage',
        amount: 5,
        description: 'Volume Discount (5%)',
        applyTo: 'all',
        appliedAmount: 253.75
      }
    ],
    tax: {
      enabled: true,
      rate: 8.5,
      basis: 'discounted_subtotal'
    },
    rounding: {
      mode: 'standard',
      precision: 2
    },
    totals: {
      subtotal: 5075.00,
      nonDiscountableSubtotal: 0.00,
      discountAmount: 253.75,
      discountedSubtotal: 4821.25,
      taxAmount: 409.81,
      grandTotal: 5231.06
    },
    notes: {
      vendorVisible: 'Thank you for your business. Payment terms are Net 15.',
      internal: 'Client has been consistently paying on time.',
      history: ['Invoice created', 'Invoice issued']
    },
    audit: {
      events: [
        {
          timestamp: '2024-01-15T10:00:00Z',
          event: 'created',
          userId: 'admin',
          details: 'Invoice created for January services'
        }
      ],
      inputsSnapshot: {}
    },
    exports: {
      pdfGeneratedOn: '2024-02-01T09:00:00Z'
    }
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function escapeCSVField(field: string | number): string {
  const str = String(field)
  // If field contains comma, quotes, or newlines, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(invoice: Invoice): string {
  const lines: string[] = []
  
  // Add header information
  lines.push('Invoice Export')
  lines.push('')
  lines.push(`Invoice ID,${escapeCSVField(invoice.meta.invoiceId)}`)
  lines.push(`Client,${escapeCSVField(invoice.client.name)}`)
  lines.push(`Status,${escapeCSVField(invoice.meta.status)}`)
  lines.push(`Issued Date,${escapeCSVField(invoice.dateRange.issuedOn)}`)
  lines.push(`Due Date,${escapeCSVField(invoice.dateRange.dueOn)}`)
  lines.push(`Currency,${escapeCSVField(invoice.meta.currency)}`)
  lines.push('')
  
  // Add line items section
  lines.push('Line Items')
  lines.push('ID,Category,Service Code,Description,Quantity,Unit,Unit Rate,Extended Cost,Discountable')
  
  for (const item of invoice.lineItems) {
    lines.push([
      escapeCSVField(item.id),
      escapeCSVField(item.category),
      escapeCSVField(item.serviceCode),
      escapeCSVField(item.description),
      escapeCSVField(item.quantity),
      escapeCSVField(item.unit),
      escapeCSVField(item.unitRate.toFixed(4)),
      escapeCSVField(item.extendedCost.toFixed(2)),
      escapeCSVField(item.discountable ? 'Yes' : 'No')
    ].join(','))
  }
  
  lines.push('')
  
  // Add discounts section
  if (invoice.discounts.length > 0) {
    lines.push('Discounts')
    lines.push('ID,Type,Amount,Description,Apply To,Applied Amount')
    
    for (const discount of invoice.discounts) {
      lines.push([
        escapeCSVField(discount.id),
        escapeCSVField(discount.type),
        escapeCSVField(discount.amount),
        escapeCSVField(discount.description),
        escapeCSVField(discount.applyTo),
        escapeCSVField(discount.appliedAmount.toFixed(2))
      ].join(','))
    }
    
    lines.push('')
  }
  
  // Add totals section
  lines.push('Financial Summary')
  lines.push('Description,Amount')
  lines.push(`Subtotal,${escapeCSVField(formatCurrency(invoice.totals.subtotal))}`)
  lines.push(`Discount Amount,${escapeCSVField(formatCurrency(invoice.totals.discountAmount))}`)
  lines.push(`Discounted Subtotal,${escapeCSVField(formatCurrency(invoice.totals.discountedSubtotal))}`)
  
  if (invoice.tax.enabled) {
    lines.push(`Tax (${invoice.tax.rate}%),${escapeCSVField(formatCurrency(invoice.totals.taxAmount))}`)
  }
  
  lines.push(`Grand Total,${escapeCSVField(formatCurrency(invoice.totals.grandTotal))}`)
  
  lines.push('')
  
  // Add notes section
  if (invoice.notes.vendorVisible) {
    lines.push('Notes')
    lines.push(`Vendor Visible,${escapeCSVField(invoice.notes.vendorVisible)}`)
  }
  
  return lines.join('\n')
}

export async function POST(request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const { invoiceId } = params
    
    // Fetch invoice data from database (mocked for now)
    const invoice = getMockInvoice(invoiceId)
    
    if (!invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Generate CSV content
    const csvContent = generateCSV(invoice)
    
    // Update exports timestamp (in real implementation, would update database)
    const now = new Date().toISOString()
    
    return new Response(JSON.stringify({
      success: true,
      filename: `${invoice.meta.invoiceId}.csv`,
      csvData: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
      exportedOn: now
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('CSV generation error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate CSV export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}