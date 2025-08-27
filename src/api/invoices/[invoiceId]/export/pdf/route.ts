/**
 * PDF Export API Route
 * Generates a professional PDF document from invoice data
 */

import jsPDF from 'jspdf'
import { Invoice } from '@/types/invoices'

// Mock invoice data for demonstration - in production this would fetch from database
const getMockInvoice = (invoiceId: string): Invoice => {
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
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
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
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States'
      }
    },
    dateRange: {
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      issuedOn: '2024-02-01',
      dueOn: '2024-02-15',
      terms: 15
    },
    references: {
      quoteId: 'QTE-2024-001',
      contractId: 'CONTRACT-2024-001',
      rateCardVersionId: 'v2024.1',
      poNumber: 'PO-12345'
    },
    lineItems: [
      {
        id: '1',
        category: 'receiving',
        serviceCode: 'RCV_PALLET',
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
        serviceCode: 'STR_SQFT',
        description: 'Storage per Sq Ft',
        quantity: 2000,
        unit: 'sq_ft',
        unitRate: 0.85,
        extendedCost: 1700.00,
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
      discountableSubtotal: 5075.00,
      nonDiscountableSubtotal: 0.00,
      beforeDiscounts: 5075.00,
      discountAmount: 253.75,
      totalDiscounts: 253.75,
      discountedSubtotal: 4821.25,
      afterDiscounts: 4821.25,
      taxAmount: 409.81,
      taxes: 409.81,
      grandTotal: 5231.06,
      discountsApplied: [
        {
          description: 'Volume Discount (5%)',
          appliedToAmount: 253.75
        }
      ]
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

    // Generate PDF
    const pdf = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let currentY = margin

    // Helper functions
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const fontSize = options.fontSize || 10
      const fontStyle = options.fontStyle || 'normal'
      const align = options.align || 'left'
      
      pdf.setFontSize(fontSize)
      pdf.setFont('helvetica', fontStyle)
      pdf.text(text, x, y, { align })
      
      return y + (fontSize * 0.35) + (options.lineSpacing || 2)
    }

    // Header
    pdf.setFillColor(37, 99, 235) // Blue background
    pdf.rect(0, 0, pageWidth, 25, 'F')
    
    pdf.setTextColor(255, 255, 255)
    currentY = addText('INVOICE', margin, 15, { fontSize: 18, fontStyle: 'bold' })
    
    pdf.setTextColor(0, 0, 0)
    currentY = 35

    // Company & Invoice Info
    currentY = addText('Collab3PL Command Center', margin, currentY, { fontSize: 14, fontStyle: 'bold' })
    currentY = addText('Logistics & Fulfillment Services', margin, currentY, { fontSize: 10 })
    currentY += 5

    // Invoice details in right column
    const rightColX = pageWidth - margin - 60
    let rightY = 40
    rightY = addText(`Invoice #: ${invoice.meta.invoiceId}`, rightColX, rightY, { fontSize: 12, fontStyle: 'bold' })
    rightY = addText(`Issue Date: ${formatDate(invoice.dateRange.issuedOn)}`, rightColX, rightY)
    rightY = addText(`Due Date: ${formatDate(invoice.dateRange.dueOn)}`, rightColX, rightY)
    rightY = addText(`Terms: Net ${invoice.dateRange.terms} days`, rightColX, rightY)

    currentY = Math.max(currentY, rightY) + 10

    // Client Information
    currentY = addText('Bill To:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    currentY = addText(invoice.client.name, margin, currentY, { fontSize: 11, fontStyle: 'bold' })
    currentY = addText(invoice.client.billingContact.name, margin, currentY)
    currentY = addText(invoice.client.billingAddress.line1, margin, currentY)
    if (invoice.client.billingAddress.line2) {
      currentY = addText(invoice.client.billingAddress.line2, margin, currentY)
    }
    currentY = addText(`${invoice.client.billingAddress.city}, ${invoice.client.billingAddress.state} ${invoice.client.billingAddress.zipCode}`, margin, currentY)
    currentY = addText(invoice.client.billingAddress.country, margin, currentY)
    currentY += 10

    // Service Period
    currentY = addText(`Service Period: ${formatDate(invoice.dateRange.periodStart)} - ${formatDate(invoice.dateRange.periodEnd)}`, margin, currentY, { fontSize: 11, fontStyle: 'bold' })
    currentY += 10

    // Line Items Table
    currentY = addText('DESCRIPTION OF SERVICES', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
    currentY += 5

    // Table headers
    pdf.setFillColor(245, 245, 245)
    pdf.rect(margin, currentY - 3, pageWidth - (margin * 2), 8, 'F')
    
    const colWidths = {
      description: 80,
      qty: 25,
      rate: 30,
      amount: 35
    }
    
    let colX = margin
    currentY = addText('Description', colX, currentY, { fontSize: 9, fontStyle: 'bold' })
    colX += colWidths.description
    addText('Quantity', colX, currentY - 4, { fontSize: 9, fontStyle: 'bold' })
    colX += colWidths.qty
    addText('Rate', colX, currentY - 4, { fontSize: 9, fontStyle: 'bold' })
    colX += colWidths.rate
    addText('Amount', colX, currentY - 4, { fontSize: 9, fontStyle: 'bold' })

    // Table rows
    invoice.lineItems.forEach((item, index) => {
      if (currentY > 250) { // Check if we need a new page
        pdf.addPage()
        currentY = margin
      }

      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(margin, currentY - 3, pageWidth - (margin * 2), 8, 'F')
      }

      colX = margin
      currentY = addText(`${item.description} (${item.serviceCode})`, colX, currentY, { fontSize: 9 })
      colX += colWidths.description
      addText(item.quantity.toLocaleString(), colX, currentY - 4, { fontSize: 9 })
      colX += colWidths.qty
      addText(formatCurrency(item.unitRate), colX, currentY - 4, { fontSize: 9 })
      colX += colWidths.rate
      addText(formatCurrency(item.extendedCost), colX, currentY - 4, { fontSize: 9 })
    })

    currentY += 10

    // Totals section
    const totalsX = pageWidth - margin - 80
    currentY = addText('Subtotal:', totalsX, currentY, { fontSize: 10 })
    addText(formatCurrency(invoice.totals.subtotal), totalsX + 40, currentY - 4, { fontSize: 10, align: 'right' })

    // Discounts
    if (invoice.discounts.length > 0) {
      invoice.discounts.forEach(discount => {
        currentY = addText(`${discount.description}:`, totalsX, currentY, { fontSize: 10 })
        addText(`-${formatCurrency(discount.appliedAmount)}`, totalsX + 40, currentY - 4, { fontSize: 10, align: 'right' })
      })
    }

    currentY = addText('After Discounts:', totalsX, currentY, { fontSize: 10 })
    addText(formatCurrency(invoice.totals.discountedSubtotal), totalsX + 40, currentY - 4, { fontSize: 10, align: 'right' })

    if (invoice.tax.enabled) {
      currentY = addText(`Tax (${invoice.tax.rate}%):`, totalsX, currentY, { fontSize: 10 })
      addText(formatCurrency(invoice.totals.taxAmount), totalsX + 40, currentY - 4, { fontSize: 10, align: 'right' })
    }

    // Grand total with background
    pdf.setFillColor(37, 99, 235)
    pdf.rect(totalsX - 5, currentY - 2, 85, 8, 'F')
    
    pdf.setTextColor(255, 255, 255)
    currentY = addText('TOTAL:', totalsX, currentY, { fontSize: 12, fontStyle: 'bold' })
    addText(formatCurrency(invoice.totals.grandTotal), totalsX + 40, currentY - 4, { fontSize: 12, fontStyle: 'bold', align: 'right' })
    
    pdf.setTextColor(0, 0, 0)
    currentY += 15

    // Notes
    if (invoice.notes?.vendorVisible) {
      currentY = addText('Notes:', margin, currentY, { fontSize: 12, fontStyle: 'bold' })
      currentY = addText(invoice.notes.vendorVisible, margin, currentY, { fontSize: 10, lineSpacing: 3 })
    }

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20
    pdf.setFillColor(245, 245, 245)
    pdf.rect(0, footerY - 5, pageWidth, 25, 'F')
    addText('Thank you for your business!', pageWidth / 2, footerY, { fontSize: 10, align: 'center' })

    // Generate PDF as base64
    const pdfBase64 = pdf.output('datauristring')
    
    // Update exports timestamp (in production, this would update the database)
    const updatedInvoice = {
      ...invoice,
      exports: {
        ...invoice.exports,
        pdfGeneratedOn: new Date().toISOString()
      }
    }

    return new Response(JSON.stringify({
      success: true,
      pdfData: pdfBase64,
      filename: `${invoice.meta.invoiceId}.pdf`,
      generatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}