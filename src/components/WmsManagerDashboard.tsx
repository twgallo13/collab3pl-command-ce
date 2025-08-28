import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Package, CheckCircle, Play } from '@phosphor-icons/react'
import { Order } from '@/types/wms'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderCounts {
  open: number
  readyToPick: number
  exceptions: number
  total: number
}

export function WmsManagerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isReleasingWave, setIsReleasingWave] = useState(false)
  const [orderCounts, setOrderCounts] = useState<OrderCounts>({
    open: 0,
    readyToPick: 0,
    exceptions: 0,
    total: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    // Calculate order counts
    const counts = orders.reduce((acc, order) => {
      acc.total++
      switch (order.status) {
        case 'open':
          acc.open++
          break
        case 'ready_to_pick':
          acc.readyToPick++
          break
        case 'exception':
          acc.exceptions++
          break
      }
      return acc
    }, { open: 0, readyToPick: 0, exceptions: 0, total: 0 })

    setOrderCounts(counts)

    // Apply filter
    if (activeFilter === 'all') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeFilter))
    }
  }, [orders, activeFilter])

  const fetchOrders = async (status?: string) => {
    try {
      setLoading(true)
      const url = status 
        ? `/api/wms/dashboard/orders?status=${status}`
        : '/api/wms/dashboard/orders'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch orders')
      
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    setSelectedOrders([]) // Clear selection when changing filter
  }

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select orders that are ready_to_pick
      const readyToPickOrders = filteredOrders
        .filter(order => order.status === 'ready_to_pick')
        .map(order => order.orderId)
      setSelectedOrders(readyToPickOrders)
    } else {
      setSelectedOrders([])
    }
  }

  const releaseWave = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order to release')
      return
    }

    setIsReleasingWave(true)
    
    try {
      const response = await fetch('/api/wms/waves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrders
        })
      })

      if (!response.ok) {
        throw new Error('Failed to release wave')
      }

      const result = await response.json()
      
      toast.success('Wave released successfully', {
        description: `${result.data.waveId} created with ${result.data.orderCount} orders`
      })

      // Refresh orders and clear selection
      await fetchOrders()
      setSelectedOrders([])
      
    } catch (error) {
      toast.error('Failed to release wave', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsReleasingWave(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Open</Badge>
      case 'ready_to_pick':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Ready to Pick</Badge>
      case 'exception':
        return <Badge variant="destructive">Exception</Badge>
      case 'picked':
        return <Badge variant="outline">Picked</Badge>
      case 'shipped':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Shipped</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filterButtons = [
    { id: 'all', label: 'All Orders', count: orderCounts.total },
    { id: 'open', label: 'Open', count: orderCounts.open },
    { id: 'ready_to_pick', label: 'Ready to Pick', count: orderCounts.readyToPick },
    { id: 'exception', label: 'Exceptions', count: orderCounts.exceptions }
  ]

  // Check if we can release a wave (have selected ready_to_pick orders)
  const canReleaseWave = selectedOrders.length > 0 && 
    selectedOrders.every(orderId => {
      const order = orders.find(o => o.orderId === orderId)
      return order?.status === 'ready_to_pick'
    })

  // Check if all ready_to_pick orders are selected
  const readyToPickOrders = filteredOrders.filter(order => order.status === 'ready_to_pick')
  const allReadyToPickSelected = readyToPickOrders.length > 0 && 
    readyToPickOrders.every(order => selectedOrders.includes(order.orderId))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">WMS Manager Dashboard</h2>
        <p className="text-muted-foreground">Monitor warehouse order statuses and exceptions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Open</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCounts.open}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting wave assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Pick</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCounts.readyToPick}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to waves
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exceptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCounts.exceptions}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(filter.id)}
            className={cn(
              "flex items-center gap-2",
              activeFilter === filter.id && "bg-primary text-primary-foreground"
            )}
          >
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {activeFilter === 'all' ? 'All Orders' : filterButtons.find(f => f.id === activeFilter)?.label}
          </CardTitle>
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedOrders.length} selected
              </span>
              <Button
                onClick={releaseWave}
                disabled={!canReleaseWave || isReleasingWave}
                size="sm"
                className="flex items-center gap-2"
              >
                <Play size={16} />
                {isReleasingWave ? 'Releasing...' : 'Release Selected as Wave'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading orders...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    {readyToPickOrders.length > 0 && (
                      <Checkbox
                        checked={allReadyToPickSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all ready to pick orders"
                      />
                    )}
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Wave ID</TableHead>
                  <TableHead>Exceptions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found for the selected filter
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell>
                        {order.status === 'ready_to_pick' ? (
                          <Checkbox
                            checked={selectedOrders.includes(order.orderId)}
                            onCheckedChange={(checked) => 
                              handleOrderSelection(order.orderId, checked as boolean)
                            }
                            aria-label={`Select order ${order.orderId}`}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>{order.clientId}</TableCell>
                      <TableCell>{formatDate(order.dueDate)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.waveId ? (
                          <Badge variant="outline">{order.waveId}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.exceptions.length > 0 ? (
                          <div className="space-y-1">
                            {order.exceptions.map((exception, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {exception.type.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}