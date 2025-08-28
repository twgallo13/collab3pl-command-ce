import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, Scales, Ruler, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface OrderItem {
  sku: string
  variant: string
  quantity: number
  picked: boolean
}

interface Order {
  orderId: string
  clientId: string
  status: string
  items: OrderItem[]
  pickedAt?: string
}

interface CartonDetails {
  weightLbs: number
  length: number
  width: number
  height: number
}

export function WmsPackoutPage() {
  const [orderId, setOrderId] = useState('')
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [cartonDetails, setCartonDetails] = useState<CartonDetails>({
    weightLbs: 0,
    length: 0,
    width: 0,
    height: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Simulate fetching order details
  const fetchOrderDetails = async (orderIdToFetch: string) => {
    setIsLoading(true)
    try {
      // Simulate API call - in real app, would fetch from /api/wms/orders/{orderId}
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock order data
      const mockOrder: Order = {
        orderId: orderIdToFetch,
        clientId: 'CLIENT_001',
        status: 'picked',
        pickedAt: new Date().toISOString(),
        items: [
          { sku: 'SKU_001', variant: 'Red-L', quantity: 2, picked: true },
          { sku: 'SKU_002', variant: 'Blue-M', quantity: 1, picked: true },
          { sku: 'SKU_003', variant: 'Green-S', quantity: 3, picked: true }
        ]
      }
      
      setCurrentOrder(mockOrder)
      toast.success('Order loaded successfully')
    } catch (error) {
      toast.error('Failed to load order details')
      console.error('Error fetching order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadOrder = () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID')
      return
    }
    fetchOrderDetails(orderId.trim())
  }

  const handlePackAndShip = async () => {
    if (!currentOrder) {
      toast.error('No order loaded')
      return
    }

    if (!cartonDetails.weightLbs || cartonDetails.weightLbs <= 0) {
      toast.error('Please enter a valid carton weight')
      return
    }

    if (!cartonDetails.length || !cartonDetails.width || !cartonDetails.height) {
      toast.error('Please enter valid carton dimensions')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/wms/packout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentOrder.orderId,
          carton: cartonDetails
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Order packed and shipped successfully', {
          description: `Shipment ID: ${result.shipmentId}`
        })
        
        // Update local order status
        setCurrentOrder(prev => prev ? { ...prev, status: 'shipped' } : null)
        
        // Reset form
        setCartonDetails({ weightLbs: 0, length: 0, width: 0, height: 0 })
      } else {
        toast.error('Pack and ship failed', {
          description: result.message
        })
      }
    } catch (error) {
      toast.error('Pack and ship failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'picked':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ready to Pack</Badge>
      case 'packed':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Packed</Badge>
      case 'shipped':
        return <Badge variant="default" className="bg-green-100 text-green-800">Shipped</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Packout & Shipping Station</h2>
        <p className="text-muted-foreground">Final step in the fulfillment workflow</p>
      </div>

      {/* Order Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="Enter order ID (e.g., ORD_12345)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLoadOrder()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleLoadOrder}
                disabled={isLoading || !orderId.trim()}
              >
                {isLoading ? 'Loading...' : 'Load Order'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      {currentOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Order ID:</span>
                  <span className="text-sm">{currentOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Client:</span>
                  <span className="text-sm">{currentOrder.clientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(currentOrder.status)}
                </div>
                {currentOrder.pickedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Picked At:</span>
                    <span className="text-sm">{new Date(currentOrder.pickedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Items to Pack</h4>
                <div className="space-y-2">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.picked ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Warning className="h-4 w-4 text-yellow-600" />
                        )}
                        <div>
                          <div className="font-medium">{item.sku}</div>
                          <div className="text-sm text-muted-foreground">{item.variant}</div>
                        </div>
                      </div>
                      <Badge variant="outline">Qty: {item.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scales className="h-5 w-5" />
                Carton Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={cartonDetails.weightLbs || ''}
                  onChange={(e) => setCartonDetails(prev => ({
                    ...prev,
                    weightLbs: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4" />
                  Dimensions (inches)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="length" className="text-xs">Length</Label>
                    <Input
                      id="length"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={cartonDetails.length || ''}
                      onChange={(e) => setCartonDetails(prev => ({
                        ...prev,
                        length: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={cartonDetails.width || ''}
                      onChange={(e) => setCartonDetails(prev => ({
                        ...prev,
                        width: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={cartonDetails.height || ''}
                      onChange={(e) => setCartonDetails(prev => ({
                        ...prev,
                        height: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePackAndShip}
                  disabled={
                    isProcessing || 
                    currentOrder.status === 'shipped' ||
                    !cartonDetails.weightLbs ||
                    !cartonDetails.length ||
                    !cartonDetails.width ||
                    !cartonDetails.height
                  }
                >
                  {isProcessing ? 'Processing...' : 'Confirm Pack & Ship'}
                </Button>
                
                {currentOrder.status === 'shipped' && (
                  <p className="text-sm text-green-600 text-center mt-2">
                    ✓ Order has been shipped
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {!currentOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Enter the Order ID for an order that has been picked</p>
              <p>2. Verify all items are present and ready to pack</p>
              <p>3. Pack items into carton and weigh the final package</p>
              <p>4. Measure carton dimensions (length × width × height)</p>
              <p>5. Enter carton details and confirm pack & ship</p>
              <p>6. The system will generate a shipping label and update the order status</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}