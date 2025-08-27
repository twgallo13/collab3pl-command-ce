import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { 
  House, 
  Package, 
  CreditCard, 
  Users, 
  Gear,
  List,
  X,
  Upload,
  CheckCircle,
  Warning,
  XCircle,
  Calculator
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { BenchmarkValidationAPI, ValidationRequest, ValidationResponse } from '@/lib/benchmarkValidationAPI'
import { BenchmarkImportPage } from '@/components/BenchmarkImportPage'
import { QuoteGeneratorPage } from '@/components/QuoteGeneratorPage'
import { commitImports, CommitRequest, CommitResponse } from '@/api/benchmarks/imports/commit'
import { generateQuote, QuotePriceEndpoint } from '@/api/quotes/price'
import { QuoteRequest, QuoteResponse } from '@/lib/quoteService'
import { toast } from 'sonner'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useKV('sidebar-active', 'dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House },
    { id: 'wms', label: 'WMS', icon: Package },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'quote-generator', label: 'Quote Generator', icon: Calculator },
    { id: 'import', label: 'Import Benchmarks', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Gear },
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Collab3PL</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X size={20} />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeItem === item.id ? "default" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => {
                  setActiveItem(item.id)
                  onClose()
                }}
              >
                <Icon size={20} />
                {item.label}
              </Button>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Version: {import.meta.env.VITE_APP_VERSION || '1.5.0'}
          </p>
        </div>
      </aside>
    </>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [user] = useKV('current-user', { name: 'Admin User', email: 'admin@collab3pl.com' })

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <List size={20} />
      </Button>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Welcome back,</span>
        <span className="font-medium text-foreground">{user.name}</span>
        <Button variant="outline" size="sm">
          Log Out
        </Button>
      </div>
    </header>
  )
}

function DashboardContent() {
  const [validationResults, setValidationResults] = useKV<ValidationResponse | null>('validation-results', null)
  const [commitResults, setCommitResults] = useKV<CommitResponse | null>('commit-results', null)
  const [quoteResults, setQuoteResults] = useKV<QuoteResponse | null>('quote-results', null)
  const [isValidating, setIsValidating] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false)

  // Mock validation request for demonstration
  const handleTestValidation = async () => {
    setIsValidating(true)
    
    try {
      const mockRequest: ValidationRequest = {
        version_id: "v2024.1",
        dry_run: true,
        files: {
          benchmark_rates: "https://example.com/csv/benchmark_rates.csv",
          value_added_options: "https://example.com/csv/value_added_options.csv", 
          category_mappings: "https://example.com/csv/category_mappings.csv",
          industry_sources: "https://example.com/csv/industry_sources.csv",
          region_mappings: "https://example.com/csv/region_mappings.csv"
        }
      }
      
      const result = await BenchmarkValidationAPI.validateImport(mockRequest)
      setValidationResults(result)
      
      // Show appropriate toast based on validation status
      if (result.status === 'valid') {
        toast.success('Validation completed successfully', {
          description: 'All files passed validation checks'
        })
      } else if (result.status === 'warnings') {
        toast.warning('Validation completed with warnings', {
          description: `${result.warnings.length} warnings found`
        })
      } else {
        toast.error('Validation failed', {
          description: `${result.errors.length} errors found`
        })
      }
      
    } catch (error) {
      toast.error('Validation failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Mock commit request for demonstration
  const handleTestCommit = async () => {
    if (!validationResults || validationResults.status === 'invalid') {
      toast.error('Cannot commit - validation must pass first')
      return
    }
    
    setIsCommitting(true)
    
    try {
      const mockCommitRequest: CommitRequest = {
        version_id: validationResults.version_id,
        mode: 'replace'
      }
      
      const result = await commitImports(mockCommitRequest)
      setCommitResults(result)
      
      toast.success('Commit completed successfully', {
        description: `Import ID: ${result.import_id}`
      })
      
    } catch (error) {
      toast.error('Commit failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsCommitting(false)
    }
  }

  // Mock quote generation for demonstration
  const handleTestQuote = async () => {
    setIsGeneratingQuote(true)
    
    try {
      const mockQuoteRequest: QuoteRequest = {
        version_id: "v2024.1",
        customer_id: "CUST_001",
        effective_date: "2024-01-01",
        origin: {
          zip3: "902",
          state: "CA",
          country: "US"
        },
        destination: {
          zip3: "750",
          state: "TX", 
          country: "US"
        },
        services: {
          receiving: {
            pallets: 100,
            cartons: 500,
            pieces: 2500
          },
          fulfillment: {
            orders: 1000,
            lines: 3500,
            pieces: 5000
          },
          storage: {
            pallets: 200,
            sq_ft: 5000
          },
          vas: [
            {
              service_code: "LABEL_APPLY",
              quantity: 1000
            },
            {
              service_code: "GIFT_WRAP",
              quantity: 50
            }
          ]
        },
        discounts: [
          {
            type: "flat",
            amount: 500,
            description: "Volume discount"
          },
          {
            type: "percentage",
            amount: 5,
            description: "Contract discount (5%)"
          }
        ]
      }
      
      const result = await generateQuote(mockQuoteRequest)
      setQuoteResults(result)
      
      toast.success('Quote generated successfully', {
        description: `Quote ID: ${result.quote_id}`
      })
      
    } catch (error) {
      toast.error('Quote generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsGeneratingQuote(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warnings':
        return <Warning className="h-4 w-4 text-yellow-600" />
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Valid</Badge>
      case 'warnings':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Warnings</Badge>
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your command center</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Gear className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Validation & Quote Generation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Benchmark Data Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the benchmark data validation API with simulated CSV data
            </p>
            <Button 
              onClick={handleTestValidation} 
              disabled={isValidating || isCommitting}
              className="w-full"
            >
              {isValidating ? 'Validating...' : 'Run Validation Test'}
            </Button>
            
            {validationResults && validationResults.status !== 'invalid' && (
              <Button 
                variant="secondary"
                onClick={handleTestCommit} 
                disabled={isCommitting || isValidating}
                className="w-full"
              >
                {isCommitting ? 'Committing...' : 'Test Commit (Replace)'}
              </Button>
            )}
            
            {validationResults && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(validationResults.status)}
                  <span className="font-medium">Overall Status:</span>
                  {getStatusBadge(validationResults.status)}
                </div>
                
                <div className="text-sm space-y-1">
                  <div>Version: {validationResults.version_id}</div>
                  {validationResults.errors.length > 0 && (
                    <div className="text-red-600">Errors: {validationResults.errors.length}</div>
                  )}
                  {validationResults.warnings.length > 0 && (
                    <div className="text-yellow-600">Warnings: {validationResults.warnings.length}</div>
                  )}
                  {validationResults.diff && (
                    <div className="text-blue-600">
                      Changes: {validationResults.diff.inserts} inserts, {validationResults.diff.updates} updates, {validationResults.diff.deletes} deletes
                    </div>
                  )}
                </div>
                
                {commitResults && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div className="font-medium text-green-700">Commit Successful!</div>
                      <div>Import ID: {commitResults.import_id}</div>
                      <div>Mode: {commitResults.mode}</div>
                      <div>
                        Total changes: {
                          Object.values(commitResults.counts).reduce((sum, counts) => 
                            sum + counts.inserted + counts.updated + counts.deleted, 0
                          )
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Quote Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the quote generation API with sample logistics data
            </p>
            <Button 
              onClick={handleTestQuote} 
              disabled={isGeneratingQuote || isValidating || isCommitting}
              className="w-full"
            >
              {isGeneratingQuote ? 'Generating Quote...' : 'Generate Test Quote'}
            </Button>
            
            {quoteResults && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Quote Generated</span>
                </div>
                
                <div className="text-sm space-y-1">
                  <div>Quote ID: {quoteResults.quote_id}</div>
                  <div>Customer: {quoteResults.customer_id}</div>
                  <div>Lane: {quoteResults.lanes.outbound}</div>
                  <div className="font-medium">Total: ${quoteResults.totals.total.toFixed(2)}</div>
                  {quoteResults.comparison && (
                    <div className="text-green-600">
                      Savings: ${quoteResults.comparison.savings_amount.toFixed(2)} ({quoteResults.comparison.savings_percentage.toFixed(1)}%)
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Package size={20} className="text-accent" />
                <div>
                  <p className="font-medium">New order received</p>
                  <p className="text-sm text-muted-foreground">Order #12345 from Acme Corp</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <CreditCard size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Invoice generated</p>
                  <p className="text-sm text-muted-foreground">INV-2024-001 for $2,450</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Users size={20} className="text-secondary-foreground" />
                <div>
                  <p className="font-medium">New client onboarded</p>
                  <p className="text-sm text-muted-foreground">TechStart Inc. - Full service agreement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Details */}
      {validationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(validationResults.per_file).map(([fileName, result]) => (
                <div key={fileName} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="text-sm font-medium capitalize">
                      {fileName.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Rows: {result.rows_processed}</div>
                    <div>Valid: {result.valid_rows}</div>
                    <div>Invalid: {result.invalid_rows}</div>
                    {result.errors.length > 0 && (
                      <div className="text-red-600">Errors: {result.errors.length}</div>
                    )}
                    {result.warnings.length > 0 && (
                      <div className="text-yellow-600">Warnings: {result.warnings.length}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {(validationResults.errors.length > 0 || validationResults.warnings.length > 0) && (
              <div className="mt-6 space-y-4">
                {validationResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Errors</h4>
                    <div className="space-y-1">
                      {validationResults.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                      {validationResults.errors.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {validationResults.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {validationResults.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2">Warnings</h4>
                    <div className="space-y-1">
                      {validationResults.warnings.slice(0, 5).map((warning, index) => (
                        <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          {warning}
                        </div>
                      ))}
                      {validationResults.warnings.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {validationResults.warnings.length - 5} more warnings
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quote Details */}
      {quoteResults && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Line Items</h4>
                <div className="space-y-2">
                  {quoteResults.lines.map((line, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="text-sm font-medium">{line.description}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {line.quantity} × ${line.unit_rate.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-medium">${line.extended_cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Subtotals</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Receiving:</span>
                      <span>${quoteResults.subtotals.receiving.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fulfillment:</span>
                      <span>${quoteResults.subtotals.fulfillment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span>${quoteResults.subtotals.storage.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAS:</span>
                      <span>${quoteResults.subtotals.vas.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {quoteResults.discounts_applied.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Discounts Applied</h4>
                    <div className="space-y-1 text-sm">
                      {quoteResults.discounts_applied.map((discount, index) => (
                        <div key={index} className="flex justify-between text-green-600">
                          <span>{discount.description}:</span>
                          <span>-${discount.applied_to_amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${quoteResults.totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem] = useKV('sidebar-active', 'dashboard')

  const renderContent = () => {
    switch (activeItem) {
      case 'import':
        return <BenchmarkImportPage />
      case 'quote-generator':
        return <QuoteGeneratorPage />
      case 'dashboard':
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main>
          {renderContent()}
        </main>
      </div>
      
      <Toaster />
    </div>
  )
}