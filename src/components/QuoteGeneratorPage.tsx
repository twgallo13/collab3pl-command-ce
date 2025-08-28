/**
 * Interactive Quote Generator Page for the Admin Command Center
 * Provides a comprehensive form for creating logistics pricing quotes
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { 
  Calculator, 
  Plus, 
  Trash, 
  CheckCircle, 
  Warning,
  CurrencyDollar,
  ArrowDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { generateQuote } from '@/api/quotes/price'
import { QuoteRequest, QuoteResponse } from '@/lib/quoteService'

interface VasItem {
  service_code: string
  quantity: number
}

interface DiscountItem {
  type: 'flat' | 'percentage'
  amount: number
  description: string
}

export function QuoteGeneratorPage() {
  // Form state
  const [versionId, setVersionId] = useState('v2024.1')
  const [customerId, setCustomerId] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])
  
  // Origin/Destination
  const [originCountry, setOriginCountry] = useState('US')
  const [originState, setOriginState] = useState('')
  const [originZip3, setOriginZip3] = useState('')
  const [destCountry, setDestCountry] = useState('US')
  const [destState, setDestState] = useState('')
  const [destZip3, setDestZip3] = useState('')
  
  // Services
  const [receivingPallets, setReceivingPallets] = useState(0)
  const [receivingCartons, setReceivingCartons] = useState(0)
  const [receivingPieces, setReceivingPieces] = useState(0)
  
  const [fulfillmentOrders, setFulfillmentOrders] = useState(0)
  const [fulfillmentLines, setFulfillmentLines] = useState(0)
  const [fulfillmentPieces, setFulfillmentPieces] = useState(0)
  
  const [storagePallets, setStoragePallets] = useState(0)
  const [storageSqFt, setStorageSqFt] = useState(0)
  
  // VAS and Discounts
  const [vasItems, setVasItems] = useState<VasItem[]>([])
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([])
  
  // Results and state
  const [quoteResult, setQuoteResult] = useState<QuoteResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // VAS management
  const addVasItem = () => {
    setVasItems(current => [...current, { service_code: '', quantity: 0 }])
  }

  const updateVasItem = (index: number, field: keyof VasItem, value: string | number) => {
    setVasItems(current => 
      current.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const removeVasItem = (index: number) => {
    setVasItems(current => current.filter((_, i) => i !== index))
  }

  // Discount management
  const addDiscountItem = () => {
    setDiscountItems(current => [...current, { type: 'flat', amount: 0, description: '' }])
  }

  const updateDiscountItem = (index: number, field: keyof DiscountItem, value: string | number) => {
    setDiscountItems(current => 
      current.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const removeDiscountItem = (index: number) => {
    setDiscountItems(current => current.filter((_, i) => i !== index))
  }

  // Form validation
  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!customerId.trim()) errors.push('Customer ID is required')
    if (!effectiveDate) errors.push('Effective date is required')
    if (!originCountry.trim()) errors.push('Origin country is required')
    if (!destCountry.trim()) errors.push('Destination country is required')
    
    // Check if at least one service is specified
    const hasServices = receivingPallets > 0 || receivingCartons > 0 || receivingPieces > 0 ||
                       fulfillmentOrders > 0 || fulfillmentLines > 0 || fulfillmentPieces > 0 ||
                       storagePallets > 0 || storageSqFt > 0 || vasItems.length > 0
    
    if (!hasServices) errors.push('At least one service must be specified')
    
    // Validate VAS items
    vasItems.forEach((item, index) => {
      if (!item.service_code.trim()) errors.push(`VAS item ${index + 1}: Service code is required`)
      if (item.quantity <= 0) errors.push(`VAS item ${index + 1}: Quantity must be greater than 0`)
    })
    
    // Validate discounts
    discountItems.forEach((item, index) => {
      if (!item.description.trim()) errors.push(`Discount ${index + 1}: Description is required`)
      if (item.amount <= 0) errors.push(`Discount ${index + 1}: Amount must be greater than 0`)
    })
    
    return errors
  }

  // Generate quote
  const handleGenerateQuote = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      toast.error('Please fix form errors before generating quote')
      return
    }
    
    setErrors([])
    setIsGenerating(true)
    
    try {
      const request: QuoteRequest = {
        version_id: versionId,
        customer_id: customerId.trim(),
        effective_date: effectiveDate,
        origin: {
          country: originCountry.trim(),
          ...(originState.trim() && { state: originState.trim() }),
          ...(originZip3.trim() && { zip3: originZip3.trim() })
        },
        destination: {
          country: destCountry.trim(),
          ...(destState.trim() && { state: destState.trim() }),
          ...(destZip3.trim() && { zip3: destZip3.trim() })
        },
        services: {
          ...(receivingPallets > 0 || receivingCartons > 0 || receivingPieces > 0) && {
            receiving: {
              ...(receivingPallets > 0 && { pallets: receivingPallets }),
              ...(receivingCartons > 0 && { cartons: receivingCartons }),
              ...(receivingPieces > 0 && { pieces: receivingPieces })
            }
          },
          ...(fulfillmentOrders > 0 || fulfillmentLines > 0 || fulfillmentPieces > 0) && {
            fulfillment: {
              ...(fulfillmentOrders > 0 && { orders: fulfillmentOrders }),
              ...(fulfillmentLines > 0 && { lines: fulfillmentLines }),
              ...(fulfillmentPieces > 0 && { pieces: fulfillmentPieces })
            }
          },
          ...(storagePallets > 0 || storageSqFt > 0) && {
            storage: {
              ...(storagePallets > 0 && { pallets: storagePallets }),
              ...(storageSqFt > 0 && { sq_ft: storageSqFt })
            }
          },
          ...(vasItems.length > 0 && {
            vas: vasItems.filter(item => item.service_code.trim() && item.quantity > 0)
          })
        },
        ...(discountItems.length > 0 && {
          discounts: discountItems.filter(item => item.description.trim() && item.amount > 0)
        })
      }
      
      const result = await generateQuote(request)
      setQuoteResult(result)
      
      toast.success('Quote generated successfully', {
        description: `Quote ID: ${result.quote_id}`
      })
      
    } catch (error) {
      toast.error('Quote generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Sales Command Center - Quote Generator</h2>
        <p className="text-muted-foreground">Generate comprehensive logistics pricing quotes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Quote Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version-id">Version ID</Label>
                  <Input
                    id="version-id"
                    value={versionId}
                    onChange={(e) => setVersionId(e.target.value)}
                    placeholder="v2024.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-id">Customer ID</Label>
                  <Input
                    id="customer-id"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="CUST_001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effective-date">Effective Date</Label>
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lane Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lane Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Origin</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="origin-country">Country</Label>
                    <Input
                      id="origin-country"
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      placeholder="US"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-state">State</Label>
                    <Input
                      id="origin-state"
                      value={originState}
                      onChange={(e) => setOriginState(e.target.value)}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-zip3">ZIP3</Label>
                    <Input
                      id="origin-zip3"
                      value={originZip3}
                      onChange={(e) => setOriginZip3(e.target.value)}
                      placeholder="902"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Destination</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dest-country">Country</Label>
                    <Input
                      id="dest-country"
                      value={destCountry}
                      onChange={(e) => setDestCountry(e.target.value)}
                      placeholder="US"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-state">State</Label>
                    <Input
                      id="dest-state"
                      value={destState}
                      onChange={(e) => setDestState(e.target.value)}
                      placeholder="TX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-zip3">ZIP3</Label>
                    <Input
                      id="dest-zip3"
                      value={destZip3}
                      onChange={(e) => setDestZip3(e.target.value)}
                      placeholder="750"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Receiving */}
              <div>
                <h4 className="font-medium mb-3">Receiving</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="receiving-pallets">Pallets</Label>
                    <Input
                      id="receiving-pallets"
                      type="number"
                      min="0"
                      value={receivingPallets}
                      onChange={(e) => setReceivingPallets(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiving-cartons">Cartons</Label>
                    <Input
                      id="receiving-cartons"
                      type="number"
                      min="0"
                      value={receivingCartons}
                      onChange={(e) => setReceivingCartons(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiving-pieces">Pieces</Label>
                    <Input
                      id="receiving-pieces"
                      type="number"
                      min="0"
                      value={receivingPieces}
                      onChange={(e) => setReceivingPieces(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Fulfillment */}
              <div>
                <h4 className="font-medium mb-3">Fulfillment</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="fulfillment-orders">Orders</Label>
                    <Input
                      id="fulfillment-orders"
                      type="number"
                      min="0"
                      value={fulfillmentOrders}
                      onChange={(e) => setFulfillmentOrders(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fulfillment-lines">Lines</Label>
                    <Input
                      id="fulfillment-lines"
                      type="number"
                      min="0"
                      value={fulfillmentLines}
                      onChange={(e) => setFulfillmentLines(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fulfillment-pieces">Pieces</Label>
                    <Input
                      id="fulfillment-pieces"
                      type="number"
                      min="0"
                      value={fulfillmentPieces}
                      onChange={(e) => setFulfillmentPieces(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div>
                <h4 className="font-medium mb-3">Storage</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="storage-pallets">Pallets</Label>
                    <Input
                      id="storage-pallets"
                      type="number"
                      min="0"
                      value={storagePallets}
                      onChange={(e) => setStoragePallets(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage-sqft">Square Feet</Label>
                    <Input
                      id="storage-sqft"
                      type="number"
                      min="0"
                      value={storageSqFt}
                      onChange={(e) => setStorageSqFt(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VAS Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Value-Added Services
                <Button size="sm" onClick={addVasItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vasItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No VAS items added</p>
              ) : (
                <div className="space-y-3">
                  {vasItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`vas-code-${index}`}>Service Code</Label>
                        <Input
                          id={`vas-code-${index}`}
                          value={item.service_code}
                          onChange={(e) => updateVasItem(index, 'service_code', e.target.value)}
                          placeholder="LABEL_APPLY"
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label htmlFor={`vas-quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`vas-quantity-${index}`}
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateVasItem(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeVasItem(index)}
                        className="mb-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Discounts
                <Button size="sm" onClick={addDiscountItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {discountItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No discounts added</p>
              ) : (
                <div className="space-y-3">
                  {discountItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="w-32 space-y-2">
                        <Label htmlFor={`discount-type-${index}`}>Type</Label>
                        <select
                          id={`discount-type-${index}`}
                          value={item.type}
                          onChange={(e) => updateDiscountItem(index, 'type', e.target.value as 'flat' | 'percentage')}
                          className="w-full px-3 py-2 border border-input rounded-md text-sm"
                        >
                          <option value="flat">Flat</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>
                      <div className="w-32 space-y-2">
                        <Label htmlFor={`discount-amount-${index}`}>Amount</Label>
                        <Input
                          id={`discount-amount-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => updateDiscountItem(index, 'amount', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`discount-desc-${index}`}>Description</Label>
                        <Input
                          id={`discount-desc-${index}`}
                          value={item.description}
                          onChange={(e) => updateDiscountItem(index, 'description', e.target.value)}
                          placeholder="Volume discount"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDiscountItem(index)}
                        className="mb-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Errors */}
          {errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Warning className="h-5 w-5" />
                  Form Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm text-destructive">
                      • {error}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateQuote} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating Quote...' : 'Generate Quote'}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {!quoteResult ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Quote Generated</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Fill out the form and click "Generate Quote" to see pricing results
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quote Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Quote Generated Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quote ID:</span>
                      <span className="ml-2 font-medium">{quoteResult.quote_id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="ml-2 font-medium">{quoteResult.customer_id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <span className="ml-2 font-medium">{quoteResult.version_id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effective Date:</span>
                      <span className="ml-2 font-medium">{quoteResult.effective_date}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lane:</span>
                    <span className="ml-2 font-medium">{quoteResult.lanes.outbound}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Itemized Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteResult.lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant="outline">{line.category}</Badge>
                          </TableCell>
                          <TableCell>{line.description}</TableCell>
                          <TableCell className="text-right">
                            {line.quantity} {line.unit_type}
                          </TableCell>
                          <TableCell className="text-right">
                            ${line.unit_rate.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${line.extended_cost.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Subtotals */}
              <Card>
                <CardHeader>
                  <CardTitle>Subtotals by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Receiving:</span>
                      <span className="font-medium">${quoteResult.subtotals.receiving.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fulfillment:</span>
                      <span className="font-medium">${quoteResult.subtotals.fulfillment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-medium">${quoteResult.subtotals.storage.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAS:</span>
                      <span className="font-medium">${quoteResult.subtotals.vas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Surcharges:</span>
                      <span className="font-medium">${quoteResult.subtotals.surcharges.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discounts Applied */}
              {quoteResult.discounts_applied.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowDown className="h-5 w-5 text-green-600" />
                      Discounts Applied
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {quoteResult.discounts_applied.map((discount, index) => (
                        <div key={index} className="flex justify-between text-green-600">
                          <span>{discount.description}:</span>
                          <span className="font-medium">-${discount.applied_to_amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final Totals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyDollar className="h-5 w-5" />
                    Final Totals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">${quoteResult.totals.subtotal.toFixed(2)}</span>
                    </div>
                    {quoteResult.totals.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Total Discount:</span>
                        <span className="font-medium">-${quoteResult.totals.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Grand Total:</span>
                      <span>${quoteResult.totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison */}
              {quoteResult.comparison && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <ArrowDown className="h-5 w-5" />
                      Cost Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Benchmark Total:</span>
                        <span className="font-medium">${quoteResult.comparison.benchmark_total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Your Savings:</span>
                        <span className="font-medium">
                          ${quoteResult.comparison.savings_amount.toFixed(2)} 
                          ({quoteResult.comparison.savings_percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}