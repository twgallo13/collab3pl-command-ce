/**
 * Handles wave-specific operati
 * Handles wave-specific operations including picklist generation
 */

export async function GET(
  { params }: { params: { waveId: string } }

    
      return NextRespon
  { params }: { params: { waveId: string } }
) {
  try {
    const { waveId } = params
    
    if (!waveId) {
      return NextResponse.json(
        { error: 'waveId is required' },
        { status: 400 }
      )
    }

    // Mock data - in real implementation, fetch from Firestore
    const mockWave: Wave = {
      waveId,
      orderIds: ['ORDER-004', 'ORDER-005'],
      status: 'picking',
      releasedBy: 'manager1',
      releasedAt: '2024-01-15T15:00:00Z',
      createdAt: '2024-01-15T15:00:00Z',
      updatedAt: '2024-01-15T15:00:00Z'
    }

    // Mock orders in this wave
    const mockOrders: Order[] = [
      {
        orderId: 'ORDER-004',
        clientId: 'CLIENT-001',
        status: 'picking',
        items: [
      },
        orderId: 'ORDER-005',
        st
          { sku
        ],
        exceptions: [],
        createdAt: '2024-01-15T14:30:00Z',
      }

    con
        invId: 'INV-001',
        labelId: 'LBL-001',
        poId: 'PO-001',
        status: 
        updatedAt: '2024-01-10T09:00:00Z',
      },
        in
        labelId
        poId: 'PO-001',
        status: 'putaway'
        updatedAt: '2024-01-10T09:15:00Z',
      },
       
     

        status: 'putaway',
        updatedAt: '2024-01-12T10:00:00Z
      }

    const mockBins: Bin
        binId: 'BIN-A1-01',
        capacityUnits: 10,
        status: 'active
        updated
      {
        location: { zone: 'A', aisle: '1', 
        currentUnits: 2,
        createdAt: '2024-01
      },
       
        invId: 'INV-002',
        sku: 'SKU-002',
        labelId: 'LBL-002',
        binId: 'BIN-A1-02',
        poId: 'PO-001',
        qty: 2,
        status: 'putaway',
        receivedAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-10T09:15:00Z',
        receivedBy: 'edgar'
      },
      {
        invId: 'INV-003',
        sku: 'SKU-003',
        labelId: 'LBL-003',
        binId: 'BIN-B2-01',
        poId: 'PO-002',
        qty: 10,
        status: 'putaway',
        receivedAt: '2024-01-12T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z',
        receivedBy: 'edgar'
      }
    ]

    // Mock bin data for location information
    const mockBins: Bin[] = [
      {
        binId: 'BIN-A1-01',
        location: { zone: 'A', aisle: '1', shelf: '01', position: 'A' },
        capacityUnits: 10,
        currentUnits: 5,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z'
      },
      {
        binId: 'BIN-A1-02',
        location: { zone: 'A', aisle: '1', shelf: '02', position: 'A' },
        capacityUnits: 10,
        currentUnits: 2,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T09:15:00Z'
      },
      {
        binId: 'BIN-B2-01',
        location: { zone: 'B', aisle: '2', shelf: '01', position: 'A' },
        capacityUnits: 20,
        currentUnits: 10,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z'
      }
    ]

    // Generate picklist by collecting all required items from all orders
    const picklistItems: PicklistItem[] = []

    for (const order of mockOrders) {
      for (const item of order.items) {
        if (item.status === 'pending') {
          // Find inventory for this SKU
          const inventory = mockInventory.find(inv => 
            inv.sku === item.sku && 
            inv.status === 'putaway' && 
            inv.qty >= item.qty
          )

          if (inventory) {
            const bin = mockBins.find(b => b.binId === inventory.binId)
            
            picklistItems.push({
              invId: inventory.invId,
              sku: item.sku,
              variant: item.variant,
              qty: item.qty,
              binId: inventory.binId,
              location: bin?.location || { zone: '', aisle: '', shelf: '', position: '' },
              orderId: order.orderId,












































