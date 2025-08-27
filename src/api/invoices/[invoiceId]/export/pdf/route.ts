/**
 * PDF Export API Route

imp

  return {
      invoiceId: invoiceId,

      lastModifiedOn: '2024-01-15T10:00:00Z',
    },
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
      billingContact: {
        name: 'John Smith',
        email: 'billing@acme.com',
        phone: '+1 (555) 123-4567'
        
      billingAddress: {
        line1: '123 Business Street',
        line2: 'Suite 100',
    dateRange: {
        state: 'CA',
      issuedOn: '2024-02-
        country: 'United States'
    },
      
    dateRange: {
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      issuedOn: '2024-02-01',
      },
        id: '3'
      
        quantity:
        unitRate: 0.85,
        discountable: true
      {
      
        descript
       
        extended
      }
    discounts: [
        id: 'disc1',
        amount: 5,
        applyTo: 'all',
      }
    tax: {
        discountable: true
      },
      {
    },
      subtotal: 5075.00,
      nonDiscountableSubtotal: 0.
      discountAmount: 253.75,
      discountedSubtot
      taxAmount: 409.81
      grandTotal: 5231.
        {
          appliedToAmount:
      ]
    not
      internal: 
    },
      events: [
          timestamp: '2024-01-15T10:00:00
          userId: 'admi
        }
      inputsSnapshot: {
    exports: {
    }
}
export 
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
    }

    pdf.rect(totalsX - 
    pdf.setTextColor(255, 255, 255)
    addText(formatCurrency(invoice.totals.gra
    pdf.setTextColor(0, 0,

    if (invoice.notes?.
     

    const footerY = pdf.internal.pageSize.getHei
    pdf.rect(0, footerY - 5, pageWidth, 25, 'F')

    const pdfBase64 = p
    // Update exports 
      ..
     


      success: true,
      filename: `${invoice.meta.invoiceId}.pdf`,
    }), {
      
      }

    console.error('PDF generation err
      
    }), {
     








































































































































































