/**
 * WMS Picking Page Component
 * UI for warehouse associates to view waves and pick items
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  Package, 
  CheckCircle, 
  Warning,
  ArrowLeft,
  MapPin,
  Clock
} from '@phosphor-icons/react'
import { Wave, Picklist, PicklistItem } from '@/types/wms'

interface WmsPickingPageProps {}

export function WmsPickingPage({}: WmsPickingPageProps) {
  const [waves, setWaves] = useState<Wave[]>([])
  const [selectedWave, setSelectedWave] = useState<Wave | null>(null)
  const [picklist, setPicklist] = useState<Picklist | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pickingItems, setPickingItems] = useState<Set<string>>(new Set())

  // Fetch available waves on component mount
  useEffect(() => {
    fetchWaves()
  }, [])

  const fetchWaves = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/app/api/wms/waves?status=picking')
      const data = await response.json()
      
      if (data.success) {
        setWaves(data.data)
      } else {
        toast.error('Failed to fetch waves')
      }
    } catch (error) {
      console.error('Error fetching waves:', error)
      toast.error('Error fetching waves')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPicklist = async (waveId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/app/api/wms/waves/${waveId}`)
      const data = await response.json()
      
      if (data.success) {
        setPicklist(data.data)
      } else {
        toast.error('Failed to fetch picklist')
      }
    } catch (error) {
      console.error('Error fetching picklist:', error)
      toast.error('Error fetching picklist')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectWave = (wave: Wave) => {
    setSelectedWave(wave)
    fetchPicklist(wave.waveId)
  }

  const handleBackToWaves = () => {
    setSelectedWave(null)
    setPicklist(null)
    fetchWaves() // Refresh waves list
  }

  const handleMarkAsPicked = async (item: PicklistItem) => {
    if (!selectedWave) return

    try {
      setPickingItems(prev => new Set(prev).add(item.invId))
      
      const response = await fetch(`/app/api/wms/waves/${selectedWave.waveId}/pick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invId: item.invId }),
      })

      const data = await response.json()
      
      if (response.ok && data.status === 'success') {
        toast.success(`Item ${item.sku} marked as picked`)
        
        // Update the picklist locally
        if (picklist) {
          const updatedItems = picklist.items.map(pickItem =>
            pickItem.invId === item.invId 
              ? { ...pickItem, status: 'picked' as const }
              : pickItem
          )
          
          setPicklist({
            ...picklist,
            items: updatedItems,
            pickedItems: updatedItems.filter(i => i.status === 'picked').length
          })
        }
      } else {
        toast.error('Failed to mark item as picked')
      }
    } catch (error) {
      console.error('Error picking item:', error)
      toast.error('Error picking item')
    } finally {
      setPickingItems(prev => {
        const updated = new Set(prev)
        updated.delete(item.invId)
        return updated
      })
    }
  }

  const handleMarkNotFound = async (item: PicklistItem) => {
    if (!selectedWave) return

    try {
      setPickingItems(prev => new Set(prev).add(item.invId))
      
      const response = await fetch(`/app/api/wms/orders/${item.orderId}/exceptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sku: item.sku,
          code: 'NOT_FOUND',
          details: `Item not found in bin ${item.binId} during picking`
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success(`Exception logged for ${item.sku} - flagged for manager review`)
        
        // Update local state to show as not found
        if (picklist) {
          const updatedItems = picklist.items.map(pickItem =>
            pickItem.invId === item.invId 
              ? { ...pickItem, status: 'not_found' as const }
              : pickItem
          )
          
          setPicklist({
            ...picklist,
            items: updatedItems
          })
        }
      } else {
        toast.error('Failed to log exception')
      }
    } catch (error) {
      console.error('Error logging exception:', error)
      toast.error('Error logging exception')
    } finally {
      setPickingItems(prev => {
        const updated = new Set(prev)
        updated.delete(item.invId)
        return updated
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'picked':
        return <Badge className="bg-green-100 text-green-800">Picked</Badge>
      case 'not_found':
        return <Badge variant="destructive">Missing - Flagged</Badge>
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const formatLocation = (location: PicklistItem['location']) => {
    return `${location.zone}${location.aisle}-${location.shelf}-${location.position}`
  }

  if (selectedWave && picklist) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToWaves}>
              <ArrowLeft size={20} />
              Back to Waves
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Picking: {selectedWave.waveId}</h2>
              <p className="text-muted-foreground">
                {picklist.pickedItems} of {picklist.totalItems} items picked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Orders: {selectedWave.orderIds.length}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Picklist - Sorted by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {picklist.items.map((item) => (
                  <TableRow key={item.invId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-muted-foreground" />
                        {formatLocation(item.location)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.sku}</div>
                        {item.variant && (
                          <div className="text-sm text-muted-foreground">{item.variant}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.orderId}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPicked(item)}
                              disabled={pickingItems.has(item.invId)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {pickingItems.has(item.invId) ? (
                                <>
                                  <Clock size={16} className="mr-1" />
                                  Picking...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={16} className="mr-1" />
                                  Mark as Picked
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkNotFound(item)}
                              disabled={pickingItems.has(item.invId)}
                            >
                              {pickingItems.has(item.invId) ? (
                                <>
                                  <Clock size={16} className="mr-1" />
                                  Logging...
                                </>
                              ) : (
                                <>
                                  <Warning size={16} className="mr-1" />
                                  Not Found
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {item.status === 'not_found' && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Warning size={14} />
                            Flagged as Missing
                          </Badge>
                        )}
                        {item.status === 'picked' && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle size={14} />
                            Picked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {picklist.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items to pick in this wave
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">WMS - Picking Station</h2>
        <p className="text-muted-foreground">Select a wave to start picking</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading waves...</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {waves.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No waves available for picking
                </div>
              </CardContent>
            </Card>
          ) : (
            waves.map((wave) => (
              <Card key={wave.waveId} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-6" onClick={() => handleSelectWave(wave)}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{wave.waveId}</h3>
                        <Badge 
                          variant={wave.status === 'picking' ? 'default' : 'secondary'}
                        >
                          {wave.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {wave.orderIds.length} orders • Released by {wave.releasedBy}
                      </p>
                      {wave.releasedAt && (
                        <p className="text-xs text-muted-foreground">
                          Released: {new Date(wave.releasedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Package size={24} className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}