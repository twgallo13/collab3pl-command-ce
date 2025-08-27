import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Download, 
  Edit,
  Calendar,
  DollarSign,
  User,
  FileText,
  Building,
  PaperPlaneTilt,
  X,
  CheckCircle,
  CaretDown,
  FilePdf,
  FileCsv,
  FileXls
} from '@phosphor-icons/react'
import { Invoice } from '@/types/invoices'
import { toast } from 'sonner'

interface InvoiceDetailPageProps {
  invoiceId: string
  onNavigateBack: () => void
}

export function InvoiceDetailPage({ invoiceId, onNavigateBack }: InvoiceDetailPageProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [vendorNotes, setVendorNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${invoiceId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice')
      }
      
      const data = await response.json()
      setInvoice(data)
      setVendorNotes(data.notes?.vendorVisible || '')
      setInternalNotes(data.notes?.internal || '')
      
    } catch (error) {
      toast.error('Failed to load invoice', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'issued':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Issued</Badge>
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
      case 'void':
        return <Badge variant="destructive">Void</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSaveNotes = async () => {
    try {
      // In production, this would make an API call to update the invoice
      toast.success('Notes updated successfully')
      setEditingNotes(false)
    } catch (error) {
      toast.error('Failed to update notes')
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setExportLoading(true)
      
      const response = await fetch(`/api/invoices/${invoiceId}/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate PDF')
      }

      // Convert base64 data URI to blob and trigger download
      const base64Data = result.pdfData.split(',')[1] // Remove data:application/pdf;base64, prefix
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF downloaded successfully', {
        description: `File: ${result.filename}`
      })
      
    } catch (error) {
      toast.error('Failed to export PDF', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleDownloadCSV = async () => {
    try {
      setExportLoading(true)
      
      const response = await fetch(`/api/invoices/${invoiceId}/export/csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate CSV')
      }

      // Create download link using data URI
      const link = document.createElement('a')
      link.href = result.csvData
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      
      toast.success('CSV downloaded successfully', {
        description: `File: ${result.filename}`
      })
      
    } catch (error) {
      toast.error('Failed to export CSV', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleDownloadExcel = async () => {
    try {
      setExportLoading(true)
      
      const response = await fetch(`/api/invoices/${invoiceId}/export/xlsx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate Excel file')
      }

      // Convert base64 data URI to blob and trigger download
      const base64Data = result.excelData.split(',')[1] // Remove data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64, prefix
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Excel file downloaded successfully', {
        description: `File: ${result.filename}`
      })
      
    } catch (error) {
      toast.error('Failed to export Excel', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleIssueInvoice = async () => {
    try {
      setActionLoading('issue')
      const response = await fetch(`/api/invoices/${invoiceId}/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to issue invoice')
      }

      toast.success('Invoice issued successfully')
      // Refresh the invoice data
      await fetchInvoice()
      
    } catch (error) {
      toast.error('Failed to issue invoice', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleVoidInvoice = async () => {
    try {
      setActionLoading('void')
      const response = await fetch(`/api/invoices/${invoiceId}/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to void invoice')
      }

      toast.success('Invoice voided successfully')
      // Refresh the invoice data
      await fetchInvoice()
      
    } catch (error) {
      toast.error('Failed to void invoice', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      setActionLoading('pay')
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId: `RCP-${Date.now()}`, // Generate a simple receipt ID
          paidOn: new Date().toISOString().split('T')[0], // Today's date
          paymentMethod: 'ach'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to mark invoice as paid')
      }

      toast.success('Invoice marked as paid successfully')
      // Refresh the invoice data
      await fetchInvoice()
      
    } catch (error) {
      toast.error('Failed to mark invoice as paid', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const renderActionButtons = () => {
    if (!invoice) return null

    const status = invoice.meta.status.toLowerCase()
    const buttons = []

    switch (status) {
      case 'draft':
        buttons.push(
          <Button 
            key="issue"
            onClick={handleIssueInvoice}
            disabled={actionLoading !== null}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {actionLoading === 'issue' ? (
              'Issuing...'
            ) : (
              <>
                <PaperPlaneTilt size={16} className="mr-2" />
                Issue Invoice
              </>
            )}
          </Button>
        )
        break

      case 'issued':
        buttons.push(
          <Button 
            key="pay"
            onClick={handleMarkAsPaid}
            disabled={actionLoading !== null}
            className="bg-green-600 hover:bg-green-700"
          >
            {actionLoading === 'pay' ? (
              'Processing...'
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Mark as Paid
              </>
            )}
          </Button>
        )
        buttons.push(
          <Button 
            key="void"
            variant="destructive"
            onClick={handleVoidInvoice}
            disabled={actionLoading !== null}
          >
            {actionLoading === 'void' ? (
              'Voiding...'
            ) : (
              <>
                <X size={16} className="mr-2" />
                Void Invoice
              </>
            )}
          </Button>
        )
        break

      case 'paid':
      case 'void':
        // No action buttons for paid or void invoices
        break
    }

    return buttons
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Invoice not found</h3>
          <p className="text-muted-foreground mb-4">The requested invoice could not be loaded.</p>
          <Button onClick={onNavigateBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onNavigateBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{invoice.meta.invoiceId}</h1>
            <p className="text-muted-foreground">
              Invoice Details for {invoice.client.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(invoice.meta.status)}
          {renderActionButtons()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exportLoading}>
                <Download size={16} className="mr-2" />
                {exportLoading ? 'Exporting...' : 'Export'}
                <CaretDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadPDF} disabled={exportLoading}>
                <FilePdf size={16} className="mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadCSV} disabled={exportLoading}>
                <FileCsv size={16} className="mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadExcel} disabled={exportLoading}>
                <FileXls size={16} className="mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Grand Total</p>
                <p className="text-xl font-bold">{formatCurrency(invoice.totals.grandTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(invoice.dateRange.dueOn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User size={20} className="text-secondary-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{invoice.client.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Terms</p>
                <p className="font-medium">{invoice.dateRange.terms}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Category</th>
                      <th className="text-left py-2 px-3">Description</th>
                      <th className="text-right py-2 px-3">Qty</th>
                      <th className="text-right py-2 px-3">Rate</th>
                      <th className="text-right py-2 px-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index} className="border-b border-muted">
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.unit} • {item.serviceCode}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {formatCurrency(item.unitRate)}
                        </td>
                        <td className="py-3 px-3 text-right font-medium">
                          {formatCurrency(item.extendedCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subtotals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Discountable Subtotal:</span>
                  <span>{formatCurrency(invoice.totals.discountableSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Non-Discountable Subtotal:</span>
                  <span>{formatCurrency(invoice.totals.nonDiscountableSubtotal)}</span>
                </div>
                <div className="flex justify-between font-medium border-b pb-2">
                  <span>Before Discounts:</span>
                  <span>{formatCurrency(invoice.totals.beforeDiscounts)}</span>
                </div>
              </div>

              {/* Discounts */}
              {invoice.totals.discountsApplied && invoice.totals.discountsApplied.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Discounts Applied:</h4>
                  {invoice.totals.discountsApplied.map((discount, index) => (
                    <div key={index} className="flex justify-between text-sm text-green-600">
                      <span>{discount.description}:</span>
                      <span>-{formatCurrency(discount.appliedToAmount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-b pb-2">
                    <span>Total Discounts:</span>
                    <span className="text-green-600">-{formatCurrency(invoice.totals.totalDiscounts)}</span>
                  </div>
                </div>
              )}

              {/* After Discounts & Tax */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>After Discounts:</span>
                  <span>{formatCurrency(invoice.totals.afterDiscounts)}</span>
                </div>
                {invoice.tax.enabled && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.tax.rate}%):</span>
                    <span>{formatCurrency(invoice.totals.taxes)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(invoice.totals.grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client & Reference Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{invoice.client.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
            </div>
            <div className="text-sm">
              <p>{invoice.client.address.line1}</p>
              <p>
                {invoice.client.address.city}, {invoice.client.address.state} {invoice.client.address.zip}
              </p>
              <p>{invoice.client.address.country}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>References & Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Quote ID:</p>
                <p className="font-medium">{invoice.references.quoteId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contract ID:</p>
                <p className="font-medium">{invoice.references.contractId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Period Start:</p>
                <p className="font-medium">{formatDate(invoice.dateRange.periodStart)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Period End:</p>
                <p className="font-medium">{formatDate(invoice.dateRange.periodEnd)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issued On:</p>
                <p className="font-medium">{formatDate(invoice.dateRange.issuedOn)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rate Card:</p>
                <p className="font-medium">{invoice.references.rateCardVersionId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notes</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditingNotes(!editingNotes)}
            >
              <Edit size={16} className="mr-2" />
              {editingNotes ? 'Cancel' : 'Edit Notes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vendor" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vendor">Vendor-Visible</TabsTrigger>
              <TabsTrigger value="internal">Internal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vendor" className="space-y-3">
              {editingNotes ? (
                <div className="space-y-3">
                  <Textarea
                    value={vendorNotes}
                    onChange={(e) => setVendorNotes(e.target.value)}
                    placeholder="Enter vendor-visible notes..."
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNotes}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setEditingNotes(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-16 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {invoice.notes?.vendorVisible || 'No vendor-visible notes'}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="internal" className="space-y-3">
              {editingNotes ? (
                <div className="space-y-3">
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Enter internal notes..."
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNotes}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setEditingNotes(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-16 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {invoice.notes?.internal || 'No internal notes'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}