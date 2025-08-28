/**
 * API route for exporting invoices as PDF files
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
      },
      {
        id: 'LI_002',
        category: 'Fulfillment',
        serviceCode: 'FUL_ORDER',
        description: 'Order fulfillment service',
        quantity: 200,
        unit: 'order',
        unitRate: 15.0000,
        extendedCost: 3000.00,
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
      subtotal: 5500.00,
      discountableSubtotal: 5500.00,
      nonDiscountableSubtotal: 0.00,
      discountAmount: 0.00,
      discountedSubtotal: 5500.00,
      taxAmount: 481.25,
      grandTotal: 5981.25
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

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function generatePDFContent(invoice: Invoice): string {
  // In a real implementation, this would use a PDF generation library
  // For now, we'll simulate the PDF generation process
  
  const content = {
    invoice: invoice.meta.invoiceId,
    client: invoice.client.name,
    issuedDate: formatDate(invoice.dateRange.issuedOn),
    dueDate: formatDate(invoice.dateRange.dueOn),
    lineItems: invoice.lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: formatCurrency(item.unitRate),
      amount: formatCurrency(item.extendedCost)
    })),
    subtotal: formatCurrency(invoice.totals.subtotal),
    tax: formatCurrency(invoice.totals.taxAmount),
    total: formatCurrency(invoice.totals.grandTotal),
    notes: invoice.notes.vendorVisible
  }
  
  return JSON.stringify(content, null, 2)
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

    // Generate PDF content (simulated)
    const pdfContent = generatePDFContent(invoice)
    
    // In a real implementation, this would:
    // 1. Use a PDF library like pdf-lib or Puppeteer
    // 2. Generate an actual PDF document
    // 3. Store it or return a download URL
    
    // For demo purposes, we'll return a base64 encoded "PDF"
    const mockPdfData = `data:application/pdf;base64,${btoa(pdfContent)}`

    // Update exports timestamp (in real implementation, would update database)
    const now = new Date().toISOString()
    
    return new Response(JSON.stringify({
      success: true,
      filename: `${invoice.meta.invoiceId}.pdf`,
      pdfData: mockPdfData,
      exportedOn: now,
      message: 'PDF generated successfully (simulated)'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate PDF export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}