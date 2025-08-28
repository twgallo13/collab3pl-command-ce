import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, Scan, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ReceivingScanRequest, ReceivingScanResponse } from '@/types/wms'
import { processScan } from '@/app/api/wms/receiving/[poId]/scan/route'

/**
 * WMS Receiving Station Page
 * Based on section C.6 of the collab3pl V9.5 Final document
 * For warehouse associate Edgar to scan incoming inventory
 */
export function WmsReceivingPage() {
  const [poId, setPoId] = useState('')
  const [sku, setSku] = useState('')
  const [variant, setVariant] = useState('')
  const [quantity, setQuantity] = useState('')
  const [trackingId, setTrackingId] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<ReceivingScanResponse[]>([])

  const handleScanItem = async () => {
    // Validate required fields
    if (!poId.trim() || !sku.trim() || !quantity.trim()) {
      toast.error('Missing required fields', {
        description: 'Please provide PO ID, SKU, and quantity'
      })
      return
    }

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      toast.error('Invalid quantity', {
        description: 'Quantity must be a positive number'
      })
      return
    }

    setIsScanning(true)

    try {
      const scanData: ReceivingScanRequest = {
        sku: sku.trim(),
        variant: variant.trim() || undefined,
        qty,
        trackingId: trackingId.trim() || undefined
      }

      const result = await processScan(poId.trim(), scanData)
      
      // Add to scan results
      setScanResults(prev => [result, ...prev])
      
      // Clear form for next scan
      setSku('')
      setVariant('')
      setQuantity('')
      setTrackingId('')
      
      toast.success('Item scanned successfully', {
        description: `${result.invId} - ${result.message}`
      })
      
    } catch (error) {
      toast.error('Scan failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleScanItem()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">WMS - Receiving Station</h2>
          <p className="text-muted-foreground">Scan incoming inventory items for processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Item Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poId">Purchase Order ID *</Label>
              <Input
                id="poId"
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                placeholder="e.g., PO123"
                onKeyPress={handleKeyPress}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g., WIDGET-001"
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Variant</Label>
              <Input
                id="variant"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                placeholder="e.g., RED, SIZE-L"
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 12"
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingId">Package Tracking ID</Label>
              <Input
                id="trackingId"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g., 1Z999AA1234567890"
                onKeyPress={handleKeyPress}
              />
            </div>

            <Button
              onClick={handleScanItem}
              disabled={isScanning || !poId.trim() || !sku.trim() || !quantity.trim()}
              className="w-full"
              size="lg"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan Item
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Tip: Press Enter in any field to scan the item
            </p>
          </CardContent>
        </Card>

        {/* Scan Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recent Scans
              </span>
              {scanResults.length > 0 && (
                <Badge variant="secondary">
                  {scanResults.length} items scanned
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items scanned yet</p>
                <p className="text-sm">Scanned items will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scanResults.map((result, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">Scan Successful</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {result.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div><strong>Inventory ID:</strong> {result.invId}</div>
                      <div><strong>Label ID:</strong> {result.labelId}</div>
                      <div><strong>Bin Location:</strong> {result.binId}</div>
                      <div className="text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning className="h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Enter PO Information</h4>
              <p className="text-muted-foreground">
                Start by entering the Purchase Order ID that you're receiving items for.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Scan or Enter Item Details</h4>
              <p className="text-muted-foreground">
                Use a barcode scanner or manually enter the SKU, variant, and quantity of the incoming item.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Process the Scan</h4>
              <p className="text-muted-foreground">
                Click "Scan Item" or press Enter to create an inventory record and assign a label.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}