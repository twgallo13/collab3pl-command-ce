/**
 * Handles GET requests to retriev

imp

 */
  try {

   
          invoiceId: "INV-2024-001",
   
          lastModifiedOn: "20
       
          accountId: "ACME001",
    // For now, return mock data for demonstration
    const mockInvoices: Invoice[] = [
      {
        meta: {
          invoiceId: "INV-2024-001",
          status: "sent",
          currency: "USD",
          createdOn: "2024-01-15T08:00:00Z",
          lastModifiedOn: "2024-01-15T08:00:00Z",
          version: 1
        },
        client: {
          accountId: "ACME001",
          name: "Acme Corporation",
          periodStart: "202
            name: "John Smith",
            email: "billing@acme.com",
            phone: "(555) 123-4567"
          },
          billingAddress: {
            line1: "123 Business Ave",
            city: "New York",
          {
            zipCode: "10001",
            serviceCode: 
          }
          
        dateRange: {
            discountable: true
          periodEnd: "2024-01-31",
            id: "li2",
          dueOn: "2024-02-31",
            descrip
          
        references: {
          rateCardVersionId: "v2024.1",
          quoteId: "QUO-2024-001",
          poNumber: "PO-ACME-2024-001"
        ],
        lineItems: [
          {
            id: "li1",
              event: "created",
              details: "Invoice create
            {
              event: "sent
              details: "Inv
          ],
        },
          pdfGeneratedOn: "202
        }
      {
          invoiceId: "
          currency: "USD",
          lastModifiedOn: "2024-02-15
        },
          accountId: "TECH
          billingContact: 
            email: "account
          billingAddress: {
            line2: "Suite 200"
           
          
        },
          p
          issuedOn: "202
          terms: 30
        references: {
          quoteId: "QUO-2024-002"
        lineItems: [
            id: "li3",
           
          
            un
            discountable
        ],
        tax: {
          rate: 7.25,
          
        rounding: {
          precision: 2
        totals: {
          
          taxAmou
        },
          vendorVisible: "Payment
        },
          events: [
              timestamp: "202
          
            },
              timestamp: "2024-02-01T09:00:00Z",
              userId: "admin001",
          
              ti
              userI
            }
          inputsSnapshot: {}
              event: "created",
              userId: "admin001",
              details: "Invoice created for January 2024 services"
            },
            {
              timestamp: "2024-02-01T09:00:00Z",
              event: "sent",
              userId: "admin001",
              details: "Invoice sent to client via email"
            }
          ],
          inputsSnapshot: {}
        },
            zipCod
          }
        dateRange: {
         
        
       
          rateC
        },
          {
            category: "vas
            description: "Value Added - Labe
            unit: "item",
            extended
          
            id: "
            serviceCode: "SUR_F
            quantity: 1,
            unitRate: 125.0
            discountable: false
        ],
        tax:
          rate: 0,
        },
          mode: "standard",
        },
          subtotal: 875.
          discountedSubtotal:
          grandTotal: 875
        not
          
        audit: {
            {
              event: "created",
              details: "Invoice c
            {
              event
          
          ],
        },
          pdfGeneratedOn: "2024-0
        }
    ]
    return 
    console.error('Err
      { error: 'Failed to fetch 
    )
}










































































































































































