/**
 * Invoice Management Page Component
 * Displays a table of all invoices with filtering and management capabilities
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  CreditCard, 
  MagnifyingGlass, 
  Funnel,
  Eye,
  Download,
  Envelope
} from '@phosphor-icons/react'
import { Invoice } from '@/types/invoices'
import { toast } from 'sonner'

interface InvoiceManagementPageProps {
  onNavigateToDetail?: (invoiceId: string) => void
}

const getStatusBadge = (status: Invoice['meta']['status']) => {
  const variants = {
    draft: { variant: 'outline' as const, color: 'text-gray-600', bg: 'bg-gray-100' },
    pending: { variant: 'secondary' as const, color: 'text-blue-600', bg: 'bg-blue-100' },
    sent: { variant: 'default' as const, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    paid: { variant: 'default' as const, color: 'text-green-600', bg: 'bg-green-100' },
    overdue: { variant: 'destructive' as const, color: 'text-red-600', bg: 'bg-red-100' },
    cancelled: { variant: 'outline' as const, color: 'text-gray-600', bg: 'bg-gray-100' }
  }
  
  const config = variants[status]
  return (
    <Badge 
      variant={config.variant}
      className={`${config.color} ${config.bg} border-current`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function InvoiceManagementPage({ onNavigateToDetail }: InvoiceManagementPageProps = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/invoices')
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }
      
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      toast.error('Failed to load invoices', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.meta.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.meta.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleRowClick = (invoiceId: string) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(invoiceId)
    } else {
      toast.info(`Opening invoice ${invoiceId}`, {
        description: 'Invoice detail navigation not configured'
      })
    }
  }

  const handleDownloadPDF = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toast.info(`Downloading PDF for ${invoiceId}`, {
      description: 'PDF generation feature will be implemented'
    })
  }

  const handleSendEmail = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toast.info(`Sending email for ${invoiceId}`, {
      description: 'Email sending feature will be implemented'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading invoices...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all client invoices
          </p>
        </div>
        <Button className="gap-2">
          <CreditCard size={20} />
          New Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices
                  .filter(inv => ['sent', 'overdue'].includes(inv.meta.status))
                  .reduce((sum, inv) => sum + inv.totals.grandTotal, 0)
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {invoices.filter(inv => inv.meta.status === 'overdue').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                invoices
                  .filter(inv => inv.meta.status === 'paid')
                  .reduce((sum, inv) => sum + inv.totals.grandTotal, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Funnel className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issued On</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No invoices match your filters' 
                        : 'No invoices found'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow 
                      key={invoice.meta.invoiceId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(invoice.meta.invoiceId)}
                    >
                      <TableCell className="font-medium">
                        {invoice.meta.invoiceId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(invoice.dateRange.issuedOn)}
                      </TableCell>
                      <TableCell>
                        <div className={
                          invoice.meta.status === 'overdue' 
                            ? 'text-red-600 font-medium' 
                            : ''
                        }>
                          {formatDate(invoice.dateRange.dueOn)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.totals.grandTotal, invoice.meta.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.meta.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleRowClick(invoice.meta.invoiceId)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownloadPDF(invoice.meta.invoiceId, e)}
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleSendEmail(invoice.meta.invoiceId, e)}
                          >
                            <Envelope size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}