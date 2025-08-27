/**
 * API route for managing invoices
 * Handles GET requests to retrieve all invoices
 */

import { NextResponse } from 'next/server'
import { Invoice } from '@/types/invoices'

/**
 * GET /api/invoices - Retrieve all invoices
 */
export async function GET() {
  try {
    // In a real application, this would fetch from Firestore
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
          billingContact: {
            name: "John Smith",
            email: "billing@acme.com",
            phone: "(555) 123-4567"
          },
          billingAddress: {
            line1: "123 Business Ave",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "US"
          }
        },
        dateRange: {
          periodStart: "2024-01-01",
          periodEnd: "2024-01-31",
          issuedOn: "2024-02-01",
          dueOn: "2024-02-31",
          terms: 30
        },
        references: {
          rateCardVersionId: "v2024.1",
          quoteId: "QUO-2024-001",
          poNumber: "PO-ACME-2024-001"
        },
        lineItems: [
          {
            id: "li1",
            category: "receiving",
            serviceCode: "REC_PALLET",
            description: "Receiving - Pallets",
            quantity: 100,
            unit: "pallet",
            unitRate: 15.00,
            extendedCost: 1500.00,
            discountable: true
          },
          {
            id: "li2",
            category: "fulfillment",
            serviceCode: "FUL_ORDER",
            description: "Fulfillment - Orders",
            quantity: 500,
            unit: "order",
            unitRate: 3.50,
            extendedCost: 1750.00,
            discountable: true
          }
        ],
        discounts: [
          {
            id: "disc1",
            type: "percentage",
            amount: 10,
            description: "Volume discount",
            applyTo: "all",
            appliedAmount: 325.00
          }
        ],
        tax: {
          enabled: true,
          rate: 8.5,
          basis: "discounted_subtotal",
          amount: 245.88
        },
        rounding: {
          mode: "standard",
          precision: 2
        },
        totals: {
          subtotal: 3250.00,
          discountAmount: 325.00,
          discountedSubtotal: 2925.00,
          taxAmount: 245.88,
          grandTotal: 3170.88
        },
        notes: {
          vendorVisible: "Thank you for your business!",
          history: ["Invoice created", "Invoice sent to client"]
        },
        audit: {
          events: [
            {
              timestamp: "2024-01-15T08:00:00Z",
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
        exports: {
          pdfGeneratedOn: "2024-02-01T09:00:00Z",
          lastEmailedOn: "2024-02-01T09:00:00Z"
        }
      },
      {
        meta: {
          invoiceId: "INV-2024-002",
          status: "paid",
          currency: "USD",
          createdOn: "2024-01-20T10:30:00Z",
          lastModifiedOn: "2024-02-15T14:20:00Z",
          version: 2
        },
        client: {
          accountId: "TECH002",
          name: "TechStart Inc.",
          billingContact: {
            name: "Sarah Johnson",
            email: "accounts@techstart.com"
          },
          billingAddress: {
            line1: "456 Innovation Dr",
            line2: "Suite 200",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105",
            country: "US"
          }
        },
        dateRange: {
          periodStart: "2024-01-01",
          periodEnd: "2024-01-31",
          issuedOn: "2024-02-01",
          dueOn: "2024-03-02",
          terms: 30
        },
        references: {
          rateCardVersionId: "v2024.1",
          quoteId: "QUO-2024-002"
        },
        lineItems: [
          {
            id: "li3",
            category: "storage",
            serviceCode: "STO_SQFT",
            description: "Storage - Square Feet",
            quantity: 2500,
            unit: "sq_ft",
            unitRate: 2.50,
            extendedCost: 6250.00,
            discountable: true
          }
        ],
        discounts: [],
        tax: {
          enabled: true,
          rate: 7.25,
          basis: "subtotal",
          amount: 453.13
        },
        rounding: {
          mode: "standard",
          precision: 2
        },
        totals: {
          subtotal: 6250.00,
          discountAmount: 0,
          discountedSubtotal: 6250.00,
          taxAmount: 453.13,
          grandTotal: 6703.13
        },
        notes: {
          vendorVisible: "Payment received - thank you!",
          history: ["Invoice created", "Invoice sent to client", "Payment received"]
        },
        audit: {
          events: [
            {
              timestamp: "2024-01-20T10:30:00Z",
              event: "created",
              userId: "admin001",
              details: "Invoice created for January 2024 storage services"
            },
            {
              timestamp: "2024-02-01T09:00:00Z",
              event: "sent",
              userId: "admin001",
              details: "Invoice sent to client via email"
            },
            {
              timestamp: "2024-02-15T14:20:00Z",
              event: "paid",
              userId: "admin001",
              details: "Payment received via ACH"
            }
          ],
          inputsSnapshot: {}
        },
        exports: {
          pdfGeneratedOn: "2024-02-01T09:00:00Z",
          lastEmailedOn: "2024-02-01T09:00:00Z"
        }
      },
      {
        meta: {
          invoiceId: "INV-2024-003",
          status: "overdue",
          currency: "USD",
          createdOn: "2024-01-10T15:45:00Z",
          lastModifiedOn: "2024-01-10T15:45:00Z",
          version: 1
        },
        client: {
          accountId: "GLOBAL003",
          name: "Global Logistics Ltd.",
          billingContact: {
            name: "Michael Chen",
            email: "finance@globallog.com",
            phone: "(555) 987-6543"
          },
          billingAddress: {
            line1: "789 Warehouse Blvd",
            city: "Chicago",
            state: "IL",
            zipCode: "60601",
            country: "US"
          }
        },
        dateRange: {
          periodStart: "2023-12-01",
          periodEnd: "2023-12-31",
          issuedOn: "2024-01-10",
          dueOn: "2024-02-09",
          terms: 30
        },
        references: {
          rateCardVersionId: "v2023.4",
          poNumber: "PO-GL-2023-045"
        },
        lineItems: [
          {
            id: "li4",
            category: "vas",
            serviceCode: "VAS_LABEL",
            description: "Value Added - Labeling",
            quantity: 1000,
            unit: "item",
            unitRate: 0.75,
            extendedCost: 750.00,
            discountable: false
          },
          {
            id: "li5",
            category: "surcharges",
            serviceCode: "SUR_FUEL",
            description: "Fuel Surcharge",
            quantity: 1,
            unit: "flat",
            unitRate: 125.00,
            extendedCost: 125.00,
            discountable: false
          }
        ],
        discounts: [],
        tax: {
          enabled: false,
          rate: 0,
          basis: "subtotal"
        },
        rounding: {
          mode: "standard",
          precision: 2
        },
        totals: {
          subtotal: 875.00,
          discountAmount: 0,
          discountedSubtotal: 875.00,
          taxAmount: 0,
          grandTotal: 875.00
        },
        notes: {
          vendorVisible: "Payment overdue - please remit immediately",
          history: ["Invoice created", "Invoice sent to client", "First reminder sent", "Second reminder sent"]
        },
        audit: {
          events: [
            {
              timestamp: "2024-01-10T15:45:00Z",
              event: "created",
              userId: "admin001",
              details: "Invoice created for December 2023 VAS services"
            },
            {
              timestamp: "2024-01-10T16:00:00Z",
              event: "sent",
              userId: "admin001",
              details: "Invoice sent to client via email"
            }
          ],
          inputsSnapshot: {}
        },
        exports: {
          pdfGeneratedOn: "2024-01-10T16:00:00Z",
          lastEmailedOn: "2024-01-10T16:00:00Z"
        }
      }
    ]

    return NextResponse.json(mockInvoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}