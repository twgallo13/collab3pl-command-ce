import { NextRequest, NextResponse } from 'next/server'
import { Invoice } from '@/types/invoices'

interface PaymentRequest {
  receiptId: string
  paidOn: string // ISO date
  amount?: number // Optional - defaults to full invoice amount
  paymentMethod?: 'ach' | 'wire' | 'check' | 'credit_card'
}

/**
 * Changes invoice status to 'paid' and records payment information
 * Only allowed if current status is 'issued'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params
    const body: PaymentRequest = await request.json()

    // Validate required fields
    if (!body.receiptId || !body.paidOn) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'receiptId and paidOn are required fields' 
        },
        { status: 400 }
      )
    }

    // In production, this would:
    // 1. Fetch the invoice from Firestore
    // 2. Validate the current status allows payment
    // 3. Update the status to 'paid'
    // 4. Record payment details
    // 5. Create audit log entry
    // 6. Trigger any business processes (notifications, reconciliation, etc.)

    // Mock validation - check if current status allows payment
    const allowedStatuses = ['issued']
    // In production, you'd fetch the current status from the database
    const currentStatus = 'issued' // Mock current status

    if (!allowedStatuses.includes(currentStatus)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot mark invoice as paid with status '${currentStatus}'. Only issued invoices can be marked as paid.` 
        },
        { status: 400 }
      )
    }

    // Validate payment date format
    const paidDate = new Date(body.paidOn)
    if (isNaN(paidDate.getTime())) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid paidOn date format. Use ISO date format (YYYY-MM-DD)' 
        },
        { status: 400 }
      )
    }

    // Mock response - in production this would be the updated invoice
    const response = {
      success: true,
      message: 'Invoice marked as paid successfully',
      invoice: {
        meta: {
          invoiceId,
          status: 'paid',
          lastModifiedOn: new Date().toISOString(),
        },
        payment: {
          receiptId: body.receiptId,
          paidOn: body.paidOn,
          amount: body.amount || 0, // In production, this would be the actual invoice amount
          paymentMethod: body.paymentMethod || 'ach'
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to mark invoice as paid' 
      },
      { status: 500 }
    )
  }
}