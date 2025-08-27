import { NextRequest, NextResponse } from 'next/server'
import { Invoice } from '@/types/invoices'

 */
  request: NextRequest,
) {
   
    // In production, this 
    // 2. Validate the 
    // 4. Create audit log entry

    con
    const currentStatus = 'issue

        { 
          message: `Cannot void invoice wi
        { status: 400 }
    }
    // Mock response - in produc
      success: true,

          invoiceId,
          lastModifiedOn: new Date().toISOStrin
      }


    console.error('Error voiding invoice:', error)
      { 
        me
      { status: 500 }
  }


















    return NextResponse.json(response)

  } catch (error) {
    console.error('Error voiding invoice:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to void invoice' 
      },
      { status: 500 }
    )
  }
}