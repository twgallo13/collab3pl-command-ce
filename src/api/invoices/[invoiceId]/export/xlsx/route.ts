/**
 * Excel Export API Route
 * Exports invoice data in XLSX format using ExcelJS
 */

import * as ExcelJS from 'exceljs'
import { Invoice } from '@/types/invoices'

// Mock invoice data (matches the structure from other exports)
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

async function generateExcel(invoice: Invoice): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Invoice')

  // Set column widths
  worksheet.columns = [
    { key: 'A', width: 20 },
    { key: 'B', width: 15 },
    { key: 'C', width: 20 },
    { key: 'D', width: 30 },
    { key: 'E', width: 12 },
    { key: 'F', width: 12 },
    { key: 'G', width: 15 },
    { key: 'H', width: 15 },
    { key: 'I', width: 12 }
  ]

  let currentRow = 1

  // Header styling
  const headerStyle = {
    font: { bold: true, size: 14, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1f2937' } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  }

  const subHeaderStyle = {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f3f4f6' } },
    alignment: { horizontal: 'left', vertical: 'middle' }
  }

  const currencyStyle = {
    numFmt: '"$"#,##0.00'
  }

  // Invoice Header
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
  const headerCell = worksheet.getCell(`A${currentRow}`)
  headerCell.value = `INVOICE ${invoice.meta.invoiceId}`
  headerCell.style = headerStyle
  currentRow += 2

  // Invoice Information
  worksheet.getCell(`A${currentRow}`).value = 'Client:'
  worksheet.getCell(`A${currentRow}`).font = { bold: true }
  worksheet.getCell(`B${currentRow}`).value = invoice.client.name
  currentRow++

  worksheet.getCell(`A${currentRow}`).value = 'Status:'
  worksheet.getCell(`A${currentRow}`).font = { bold: true }
  worksheet.getCell(`B${currentRow}`).value = invoice.meta.status.toUpperCase()
  currentRow++

  worksheet.getCell(`A${currentRow}`).value = 'Issued Date:'
  worksheet.getCell(`A${currentRow}`).font = { bold: true }
  worksheet.getCell(`B${currentRow}`).value = invoice.dateRange.issuedOn
  currentRow++

  worksheet.getCell(`A${currentRow}`).value = 'Due Date:'
  worksheet.getCell(`A${currentRow}`).font = { bold: true }
  worksheet.getCell(`B${currentRow}`).value = invoice.dateRange.dueOn
  currentRow++

  worksheet.getCell(`A${currentRow}`).value = 'Currency:'
  worksheet.getCell(`A${currentRow}`).font = { bold: true }
  worksheet.getCell(`B${currentRow}`).value = invoice.meta.currency
  currentRow += 2

  // Line Items Section
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
  const lineItemsHeader = worksheet.getCell(`A${currentRow}`)
  lineItemsHeader.value = 'LINE ITEMS'
  lineItemsHeader.style = subHeaderStyle
  currentRow++

  // Line Items Table Headers
  const headers = ['ID', 'Category', 'Service Code', 'Description', 'Quantity', 'Unit', 'Unit Rate', 'Extended Cost', 'Discountable']
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(currentRow, index + 1)
    cell.value = header
    cell.style = {
      font: { bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e5e7eb' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  })
  currentRow++

  // Line Items Data
  invoice.lineItems.forEach(item => {
    worksheet.getCell(currentRow, 1).value = item.id
    worksheet.getCell(currentRow, 2).value = item.category
    worksheet.getCell(currentRow, 3).value = item.serviceCode
    worksheet.getCell(currentRow, 4).value = item.description
    worksheet.getCell(currentRow, 5).value = item.quantity
    worksheet.getCell(currentRow, 6).value = item.unit
    
    const unitRateCell = worksheet.getCell(currentRow, 7)
    unitRateCell.value = item.unitRate
    unitRateCell.style = currencyStyle
    
    const extendedCostCell = worksheet.getCell(currentRow, 8)
    extendedCostCell.value = item.extendedCost
    extendedCostCell.style = currencyStyle
    
    worksheet.getCell(currentRow, 9).value = item.discountable ? 'Yes' : 'No'

    // Add borders to all cells in this row
    for (let col = 1; col <= 9; col++) {
      worksheet.getCell(currentRow, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
    
    currentRow++
  })

  currentRow++

  // Discounts Section (if any)
  if (invoice.discounts.length > 0) {
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
    const discountsHeader = worksheet.getCell(`A${currentRow}`)
    discountsHeader.value = 'DISCOUNTS'
    discountsHeader.style = subHeaderStyle
    currentRow++

    const discountHeaders = ['ID', 'Type', 'Amount', 'Description', 'Apply To', 'Applied Amount']
    discountHeaders.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1)
      cell.value = header
      cell.style = {
        font: { bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e5e7eb' } },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
    })
    currentRow++

    invoice.discounts.forEach(discount => {
      worksheet.getCell(currentRow, 1).value = discount.id
      worksheet.getCell(currentRow, 2).value = discount.type
      worksheet.getCell(currentRow, 3).value = discount.amount
      worksheet.getCell(currentRow, 4).value = discount.description
      worksheet.getCell(currentRow, 5).value = discount.applyTo
      
      const appliedAmountCell = worksheet.getCell(currentRow, 6)
      appliedAmountCell.value = discount.appliedAmount
      appliedAmountCell.style = currencyStyle

      // Add borders
      for (let col = 1; col <= 6; col++) {
        worksheet.getCell(currentRow, col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      }
      
      currentRow++
    })

    currentRow++
  }

  // Financial Summary Section
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
  const summaryHeader = worksheet.getCell(`A${currentRow}`)
  summaryHeader.value = 'FINANCIAL SUMMARY'
  summaryHeader.style = subHeaderStyle
  currentRow++

  // Summary rows
  const summaryData = [
    ['Subtotal:', invoice.totals.subtotal],
    ['Discount Amount:', invoice.totals.discountAmount],
    ['Discounted Subtotal:', invoice.totals.discountedSubtotal]
  ]

  if (invoice.tax.enabled) {
    summaryData.push([`Tax (${invoice.tax.rate}%):`, invoice.totals.taxAmount])
  }

  summaryData.push(['Grand Total:', invoice.totals.grandTotal])

  summaryData.forEach((row, index) => {
    const isTotal = index === summaryData.length - 1
    
    const labelCell = worksheet.getCell(currentRow, 7)
    labelCell.value = row[0]
    labelCell.style = {
      font: { bold: isTotal },
      alignment: { horizontal: 'right' }
    }
    
    const valueCell = worksheet.getCell(currentRow, 8)
    valueCell.value = row[1]
    valueCell.style = {
      ...currencyStyle,
      font: { bold: isTotal },
      fill: isTotal ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'dcfce7' } } : undefined
    }
    
    if (isTotal) {
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'dcfce7' } }
    }
    
    currentRow++
  })

  currentRow += 2

  // Notes Section
  if (invoice.notes.vendorVisible) {
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`)
    const notesHeader = worksheet.getCell(`A${currentRow}`)
    notesHeader.value = 'NOTES'
    notesHeader.style = subHeaderStyle
    currentRow++

    worksheet.mergeCells(`A${currentRow}:I${currentRow + 1}`)
    const notesCell = worksheet.getCell(`A${currentRow}`)
    notesCell.value = invoice.notes.vendorVisible
    notesCell.style = {
      alignment: { horizontal: 'left', vertical: 'top', wrapText: true }
    }
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
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

    // Generate Excel buffer
    const excelBuffer = await generateExcel(invoice)
    
    // Convert buffer to base64 for transmission
    const base64Data = excelBuffer.toString('base64')
    
    // Update exports timestamp (in real implementation, would update database)
    const now = new Date().toISOString()
    
    return new Response(JSON.stringify({
      success: true,
      filename: `${invoice.meta.invoiceId}.xlsx`,
      excelData: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`,
      exportedOn: now
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Excel generation error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate Excel export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}