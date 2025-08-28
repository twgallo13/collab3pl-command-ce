import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertTriangle, Package, CheckCircle, Play, ChevronDown, ChevronRight } from '@phosphor-icons/react'
import { Order } from '@/types/wms'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderCounts {
  open: number
  readyToPick: number
  exceptions: number
  total: number
}

interface ExceptionDetails {
  id: string
  sku: string
  code: string
  actor: string
  timestamp: string
  resolved: boolean
}

interface ExceptionResolutionModalProps {
  exception: ExceptionDetails
  orderId: string
  onResolve: () => void
}

function ExceptionResolutionModal({ exception, orderId, onResolve }: ExceptionResolutionModalProps) {
  const [notes, setNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleResolve = async () => {
    setIsResolving(true)
    
    try {
      const response = await fetch(`/api/wms/orders/${orderId}/exceptions/${exception.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'close',
          notes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to resolve exception')
      }

      const result = await response.json()
      
      toast.success('Exception resolved successfully', {
        description: `Order ${orderId} has been updated`
      })

      setIsOpen(false)
      setNotes('')
      onResolve()
      
    } catch (error) {
      toast.error('Failed to resolve exception', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Resolve
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Exception</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Order:</strong> {orderId}
            </div>
            <div className="text-sm">
              <strong>SKU:</strong> {exception.sku}
            </div>
            <div className="text-sm">
              <strong>Issue:</strong> {exception.code.replace('_', ' ')}
            </div>
            <div className="text-sm">
              <strong>Reported by:</strong> {exception.actor}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resolution-notes">Resolution Notes</Label>
            <Textarea
              id="resolution-notes"
              placeholder="Enter notes about how this exception was resolved..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolve} 
              disabled={isResolving || !notes.trim()}
            >
              {isResolving ? 'Resolving...' : 'Resolve Exception'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function WmsManagerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isReleasingWave, setIsReleasingWave] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleExceptionResolved = () => {
    // Refresh the orders data after an exception is resolved
    fetchOrders()
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
                    <React.Fragment key={order.orderId}>
                      <TableRow>
                        <TableCell>
                          {order.status === 'ready_to_pick' ? (
                            <Checkbox
                              checked={selectedOrders.includes(order.orderId)}
                              onCheckedChange={(checked) => 
                                handleOrderSelection(order.orderId, checked as boolean)
                              }
                              aria-label={`Select order ${order.orderId}`}
                            />
                          ) : order.status === 'exception' && order.exceptions.length > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOrderExpansion(order.orderId)}
                              className="p-0 h-6 w-6"
                            >
                              {expandedOrders.includes(order.orderId) ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </Button>
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
                            <Badge variant="destructive" className="text-xs">
                              {order.exceptions.length} exception{order.exceptions.length !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                      
                      {/* Exception Details Row */}
                      {order.status === 'exception' && expandedOrders.includes(order.orderId) && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                <AlertTriangle size={16} className="text-red-600" />
                                Exception Details
                              </h4>
                              <div className="space-y-2">
                                {order.exceptions.map((exception, index) => {
                                  // Mock exception details - in real app, this would come from the API
                                  const exceptionDetails: ExceptionDetails = {
                                    id: `exc_${order.orderId}_${index}`,
                                    sku: exception.sku || 'SKU123',
                                    code: exception.type,
                                    actor: 'picker_edgar',
                                    timestamp: new Date().toISOString(),
                                    resolved: false
                                  }
                                  
                                  return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
                                      <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                          SKU: {exceptionDetails.sku}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Issue: {exceptionDetails.code.replace('_', ' ')} • 
                                          Reported by: {exceptionDetails.actor} • 
                                          {formatDate(exceptionDetails.timestamp)}
                                        </div>
                                      </div>
                                      <ExceptionResolutionModal
                                        exception={exceptionDetails}
                                        orderId={order.orderId}
                                        onResolve={handleExceptionResolved}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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