/**
 * API route for exporting invoices as CSV files
 */

import { Invoice } from '@/types/invoices'

// Mock function to get invoice data - in production, this would fetch from database
function getMockInvoice(invoiceId: string): Invoice | null {
  if (!invoiceId) return null
  
  return {
    meta: {
      invoiceId,
      status: 'issued',
      currency: 'USD',
      version: 1,
      createdOn: '2024-01-15T10:00:00Z',
      lastModifiedOn: '2024-02-01T09:00:00Z'
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
        zipCode: '90210',
        country: 'United States'
      },
      billingContact: {
        name: 'John Smith',
        email: 'billing@acme.com',
        phone: '+1 (555) 123-4567'
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
      quoteId: 'QUO-2024-001',
      rateCardVersionId: 'v2024.1'
    },
    lineItems: [
      {
        id: 'LI_001',
        category: 'Receiving',
        serviceCode: 'REC_PALLET',
        description: 'Pallet receiving service',
        quantity: 100,
        unit: 'pallet',
        unitRate: 25.0000,
        extendedCost: 2500.00,
        discountable: true
      }
    ],
    discounts: [],
    tax: {
      enabled: true,
      rate: 8.75,
      basis: 'discounted_subtotal'
    },
    rounding: {
      mode: 'round',
      precision: 2
    },
    totals: {
      subtotal: 2500.00,
      discountableSubtotal: 2500.00,
      nonDiscountableSubtotal: 0.00,
      discountAmount: 0.00,
      discountedSubtotal: 2500.00,
      taxAmount: 218.75,
      grandTotal: 2718.75
    },
    notes: {
      internal: 'Client has been consistently on time with payments',
      vendorVisible: 'Thank you for your business',
      history: []
    },
    audit: {
      events: [
        {
          action: 'created',
          timestamp: '2024-01-15T10:00:00Z',
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
  
  // Add discounts section if any
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