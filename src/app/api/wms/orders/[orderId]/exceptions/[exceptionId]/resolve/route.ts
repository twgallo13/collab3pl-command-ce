export async function POST(
  request: Request,
  { params }: { params: { orderId: string; exceptionId: string } }
) {
  try {
    const { orderId, exceptionId } = params
    const body = await request.json()
    const { action, notes } = body

    // Simulate finding the exception record
    const exceptionRecord = {
      id: exceptionId,
      orderId,
      sku: 'SKU123',
      code: 'NOT_FOUND',
      actor: 'picker_edgar',
      timestamp: new Date().toISOString(),
      resolved: false
    }

    if (!exceptionRecord) {
      return Response.json(
        { error: 'Exception not found' },
        { status: 404 }
      )
    }

    // Mark exception as resolved
    const resolvedException = {
      ...exceptionRecord,
      resolved: true,
      resolvedBy: 'manager_alice',
      resolvedAt: new Date().toISOString(),
      resolution: {
        action,
        notes
      }
    }

    // Simulate checking if this was the last exception for the order
    const remainingExceptions = [] // Would query for other unresolved exceptions

    // Update order status based on remaining exceptions
    let newOrderStatus = 'pending_adjustment'
    if (remainingExceptions.length === 0) {
      newOrderStatus = 'picking' // Back to picking if no more exceptions
    }

    // Simulate updating the order status
    const updatedOrder = {
      orderId,
      status: newOrderStatus,
      lastUpdated: new Date().toISOString()
    }

    // Log audit event
    const auditEvent = {
      eventType: 'exception_resolved',
      orderId,
      exceptionId,
      actor: 'manager_alice',
      timestamp: new Date().toISOString(),
      details: {
        action,
        notes,
        previousStatus: 'exception',
        newStatus: newOrderStatus
      }
    }

    return Response.json({
      success: true,
      exception: resolvedException,
      order: updatedOrder,
      audit: auditEvent
    }, { status: 200 })

  } catch (error) {
    console.error('Error resolving exception:', error)
    return Response.json(
      { error: 'Failed to resolve exception' },
      { status: 500 }
    )
  }
}