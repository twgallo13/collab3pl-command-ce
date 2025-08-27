/**
 * Quote Service - Handles logistics pricing calculations
 * Implements the core pricing logic as defined in section A.7 of the collab3pl V9.5 Final document
 */

// Type Definitions
export interface BenchmarkRate {
  id: string
  service_type: string
  unit_type: string
  rate_benchmark: number
  origin_country?: string
  origin_state?: string
  origin_zip3?: string
  destination_country?: string
  destination_state?: string
  destination_zip3?: string
  effective_start_date: string
  effective_end_date: string
}

export interface ValueAddedOption {
  service_code: string
  description: string
  base_rate: number
  unit_type: string
  effective_start_date: string
  effective_end_date: string
}

export interface QuoteLine {
  category: string
  service_code: string
  description: string
  quantity: number
  unit_rate: number
  extended_cost: number
  discountable: boolean
}

export interface QuoteSubtotals {
  receiving: number
  fulfillment: number
  storage: number
  vas: number
  total_discountable: number
  total_non_discountable: number
}

export interface QuoteDiscount {
  type: 'flat' | 'percentage'
  amount: number
  description: string
  applied_to_amount: number
}

export interface QuoteTotals {
  before_discounts: number
  discount_amount: number
  total: number
}

export interface QuoteComparison {
  competitor_baseline: number
  savings_amount: number
  savings_percentage: number
}

export interface QuoteRequest {
  version_id: string
  customer_id: string
  effective_date: string
  origin: {
    country: string
    state?: string
    zip3?: string
  }
  destination: {
    country: string
    state?: string
    zip3?: string
  }
  services: {
    receiving?: {
      pallets?: number
      cartons?: number
      pieces?: number
    }
    fulfillment?: {
      orders?: number
      lines?: number
      pieces?: number
    }
    storage?: {
      pallets?: number
      sq_ft?: number
    }
    vas?: Array<{
      service_code: string
      quantity: number
    }>
  }
  discounts?: Array<{
    type: 'flat' | 'percentage'
    amount: number
    description: string
  }>
  competitor_baseline?: number
}

export interface QuoteResponse {
  quote_id: string
  version_id: string
  customer_id: string
  effective_date: string
  generated_at: string
  lanes: {
    outbound: string
  }
  lines: QuoteLine[]
  subtotals: QuoteSubtotals
  discounts_applied: QuoteDiscount[]
  totals: QuoteTotals
  comparison?: QuoteComparison
}

// Mock data loaders (in a real implementation, these would query the database)
async function loadBenchmarkRates(versionId: string): Promise<BenchmarkRate[]> {
  // Mock benchmark rates data
  return [
    {
      id: "rate_001",
      service_type: "receiving",
      unit_type: "per_pallet",
      rate_benchmark: 25.00,
      origin_country: "US",
      origin_state: "CA",
      destination_country: "US",
      destination_state: "TX",
      effective_start_date: "2024-01-01",
      effective_end_date: "2024-12-31"
    },
    {
      id: "rate_002",
      service_type: "fulfillment",
      unit_type: "per_order",
      rate_benchmark: 3.50,
      origin_country: "US",
      destination_country: "US",
      effective_start_date: "2024-01-01",
      effective_end_date: "2024-12-31"
    },
    {
      id: "rate_003",
      service_type: "storage",
      unit_type: "per_pallet",
      rate_benchmark: 15.00,
      origin_country: "US",
      destination_country: "US",
      effective_start_date: "2024-01-01",
      effective_end_date: "2024-12-31"
    }
  ]
}

async function loadValueAddedOptions(versionId: string): Promise<ValueAddedOption[]> {
  // Mock VAS options data
  return [
    {
      service_code: "LABEL_APPLY",
      description: "Label Application",
      base_rate: 0.50,
      unit_type: "per_piece",
      effective_start_date: "2024-01-01",
      effective_end_date: "2024-12-31"
    },
    {
      service_code: "GIFT_WRAP",
      description: "Gift Wrapping",
      base_rate: 2.50,
      unit_type: "per_piece",
      effective_start_date: "2024-01-01",
      effective_end_date: "2024-12-31"
    }
  ]
}

// Helper function to resolve the best matching rate for a lane
function resolveLaneRate(
  rates: BenchmarkRate[],
  serviceType: string,
  origin: QuoteRequest['origin'],
  destination: QuoteRequest['destination']
): BenchmarkRate | null {
  // Filter rates by service type first
  const serviceRates = rates.filter(rate => rate.service_type === serviceType)
  
  // Try zip3 match first (most specific)
  if (origin.zip3 && destination.zip3) {
    const zip3Match = serviceRates.find(rate => 
      rate.origin_zip3 === origin.zip3 && rate.destination_zip3 === destination.zip3
    )
    if (zip3Match) return zip3Match
  }
  
  // Try state match
  if (origin.state && destination.state) {
    const stateMatch = serviceRates.find(rate => 
      rate.origin_state === origin.state && rate.destination_state === destination.state
    )
    if (stateMatch) return stateMatch
  }
  
  // Fall back to country match
  const countryMatch = serviceRates.find(rate => 
    rate.origin_country === origin.country && rate.destination_country === destination.country
  )
  
  return countryMatch || null
}

// Helper functions to add line items by category
function addReceivingLines(
  lines: QuoteLine[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
): void {
  const { receiving } = input.services
  if (!receiving) return
  
  const rate = resolveLaneRate(rates, 'receiving', input.origin, input.destination)
  if (!rate) return
  
  if (receiving.pallets && receiving.pallets > 0) {
    lines.push({
      category: 'Receiving',
      service_code: 'RCV_PALLET',
      description: 'Pallet Receiving',
      quantity: receiving.pallets,
      unit_rate: rate.rate_benchmark,
      extended_cost: receiving.pallets * rate.rate_benchmark,
      discountable: true
    })
  }
  
  if (receiving.cartons && receiving.cartons > 0) {
    lines.push({
      category: 'Receiving',
      service_code: 'RCV_CARTON',
      description: 'Carton Receiving',
      quantity: receiving.cartons,
      unit_rate: rate.rate_benchmark * 0.3, // Assume cartons are 30% of pallet rate
      extended_cost: receiving.cartons * (rate.rate_benchmark * 0.3),
      discountable: true
    })
  }
}

function addFulfillmentLines(
  lines: QuoteLine[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
): void {
  const { fulfillment } = input.services
  if (!fulfillment) return
  
  const rate = resolveLaneRate(rates, 'fulfillment', input.origin, input.destination)
  if (!rate) return
  
  if (fulfillment.orders && fulfillment.orders > 0) {
    lines.push({
      category: 'Fulfillment',
      service_code: 'FUL_ORDER',
      description: 'Order Fulfillment',
      quantity: fulfillment.orders,
      unit_rate: rate.rate_benchmark,
      extended_cost: fulfillment.orders * rate.rate_benchmark,
      discountable: true
    })
  }
  
  if (fulfillment.lines && fulfillment.lines > 0) {
    lines.push({
      category: 'Fulfillment',
      service_code: 'FUL_LINE',
      description: 'Line Picking',
      quantity: fulfillment.lines,
      unit_rate: rate.rate_benchmark * 0.4, // Assume lines are 40% of order rate
      extended_cost: fulfillment.lines * (rate.rate_benchmark * 0.4),
      discountable: true
    })
  }
}

function addStorageLines(
  lines: QuoteLine[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
): void {
  const { storage } = input.services
  if (!storage) return
  
  const rate = resolveLaneRate(rates, 'storage', input.origin, input.destination)
  if (!rate) return
  
  if (storage.pallets && storage.pallets > 0) {
    lines.push({
      category: 'Storage',
      service_code: 'STG_PALLET',
      description: 'Pallet Storage',
      quantity: storage.pallets,
      unit_rate: rate.rate_benchmark,
      extended_cost: storage.pallets * rate.rate_benchmark,
      discountable: true
    })
  }
  
  if (storage.sq_ft && storage.sq_ft > 0) {
    lines.push({
      category: 'Storage',
      service_code: 'STG_SQFT',
      description: 'Square Foot Storage',
      quantity: storage.sq_ft,
      unit_rate: rate.rate_benchmark * 0.1, // Assume sq ft is 10% of pallet rate
      extended_cost: storage.sq_ft * (rate.rate_benchmark * 0.1),
      discountable: true
    })
  }
}

function addVASLines(
  lines: QuoteLine[],
  input: QuoteRequest,
  vasCatalog: ValueAddedOption[]
): void {
  const { vas } = input.services
  if (!vas) return
  
  for (const vasRequest of vas) {
    const vasOption = vasCatalog.find(option => option.service_code === vasRequest.service_code)
    if (vasOption && vasRequest.quantity > 0) {
      lines.push({
        category: 'VAS',
        service_code: vasOption.service_code,
        description: vasOption.description,
        quantity: vasRequest.quantity,
        unit_rate: vasOption.base_rate,
        extended_cost: vasRequest.quantity * vasOption.base_rate,
        discountable: true
      })
    }
  }
}

// Calculate subtotals by category
function calculateSubtotals(lines: QuoteLine[]): QuoteSubtotals {
  const subtotals: QuoteSubtotals = {
    receiving: 0,
    fulfillment: 0,
    storage: 0,
    vas: 0,
    total_discountable: 0,
    total_non_discountable: 0
  }
  
  lines.forEach(line => {
    switch (line.category) {
      case 'Receiving':
        subtotals.receiving += line.extended_cost
        break
      case 'Fulfillment':
        subtotals.fulfillment += line.extended_cost
        break
      case 'Storage':
        subtotals.storage += line.extended_cost
        break
      case 'VAS':
        subtotals.vas += line.extended_cost
        break
    }
    
    if (line.discountable) {
      subtotals.total_discountable += line.extended_cost
    } else {
      subtotals.total_non_discountable += line.extended_cost
    }
  })
  
  return subtotals
}

// Apply discounts according to the specified order of operations
function applyDiscounts(
  lines: QuoteLine[],
  requestedDiscounts: QuoteRequest['discounts']
): { discountsApplied: QuoteDiscount[], totalDiscount: number } {
  if (!requestedDiscounts || requestedDiscounts.length === 0) {
    return { discountsApplied: [], totalDiscount: 0 }
  }
  
  const discountableSubtotal = lines
    .filter(line => line.discountable)
    .reduce((sum, line) => sum + line.extended_cost, 0)
  
  let remainingDiscountableAmount = discountableSubtotal
  const discountsApplied: QuoteDiscount[] = []
  
  // Apply flat discounts first
  for (const discount of requestedDiscounts.filter(d => d.type === 'flat')) {
    const appliedAmount = Math.min(discount.amount, remainingDiscountableAmount)
    if (appliedAmount > 0) {
      discountsApplied.push({
        type: discount.type,
        amount: discount.amount,
        description: discount.description,
        applied_to_amount: appliedAmount
      })
      remainingDiscountableAmount -= appliedAmount
    }
  }
  
  // Then apply percentage discounts
  for (const discount of requestedDiscounts.filter(d => d.type === 'percentage')) {
    const appliedAmount = Math.min(
      (discount.amount / 100) * discountableSubtotal,
      remainingDiscountableAmount
    )
    if (appliedAmount > 0) {
      discountsApplied.push({
        type: discount.type,
        amount: discount.amount,
        description: discount.description,
        applied_to_amount: appliedAmount
      })
      remainingDiscountableAmount -= appliedAmount
    }
  }
  
  const totalDiscount = discountsApplied.reduce((sum, discount) => sum + discount.applied_to_amount, 0)
  
  return { discountsApplied, totalDiscount }
}

/**
 * Generate a pricing quote based on input parameters
 * Implements the core pricing logic from section A.7 of the collab3pl V9.5 Final document
 */
export async function priceQuote(input: QuoteRequest): Promise<QuoteResponse> {
  // 1. Data Loading
  const rates = await loadBenchmarkRates(input.version_id)
  const vasCatalog = await loadValueAddedOptions(input.version_id)
  
  // 2. Initialize lines array
  const lines: QuoteLine[] = []
  
  // 3. Line Item Calculation
  addReceivingLines(lines, input, rates)
  addFulfillmentLines(lines, input, rates)
  addStorageLines(lines, input, rates)
  addVASLines(lines, input, vasCatalog)
  
  // 4. Subtotal Calculation
  const subtotals = calculateSubtotals(lines)
  
  // 5. Discount Application
  const discountResults = applyDiscounts(lines, input.discounts)
  
  // 6. Final Totals
  const beforeDiscounts = subtotals.total_discountable + subtotals.total_non_discountable
  const discountAmount = discountResults.totalDiscount
  const grandTotal = beforeDiscounts - discountAmount
  
  const totals: QuoteTotals = {
    before_discounts: beforeDiscounts,
    discount_amount: discountAmount,
    total: grandTotal
  }
  
  // 7. Build response object
  const response: QuoteResponse = {
    quote_id: `QT-${Date.now()}`,
    version_id: input.version_id,
    customer_id: input.customer_id,
    effective_date: input.effective_date,
    generated_at: new Date().toISOString(),
    lanes: {
      outbound: `${input.origin.state || input.origin.country} to ${input.destination.state || input.destination.country}`
    },
    lines,
    subtotals,
    discounts_applied: discountResults.discountsApplied,
    totals
  }
  
  // 8. Add comparison if competitor baseline is provided
  if (input.competitor_baseline && input.competitor_baseline > 0) {
    const savingsAmount = input.competitor_baseline - grandTotal
    const savingsPercentage = (savingsAmount / input.competitor_baseline) * 100
    
    response.comparison = {
      competitor_baseline: input.competitor_baseline,
      savings_amount: savingsAmount,
      savings_percentage: savingsPercentage
    }
  }
  
  return response
}