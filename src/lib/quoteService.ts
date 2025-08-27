/**
 * Quote Service - Handles logistics pricing calculations
 */

// Core data interfaces
export interface BenchmarkRate {
  service_type: string
  unit_type: string
  origin_zip3?: string
  origin_state?: string
  origin_country: string
  destination_zip3?: string
  destination_state?: string
  destination_country: string
  base_rate: number
  effective_start_date: string
  effective_end_date: string
}

export interface ValueAddedOption {
  service_code: string
  description: string
  unit_type: string
  base_rate: number
  effective_start_date: string
  effective_end_date: string
}

export interface QuoteLineItem {
  category: string
  service_code: string
  description: string
  quantity: number
  unit_rate: number
  extended_cost: number
  discountable?: boolean
}

export interface QuoteSubtotals {
  receiving: number
  fulfillment: number
  storage: number
  vas: number
  surcharges: number
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
  total_discount: number
  total: number
}

export interface QuoteRequest {
  version_id: string
  customer_id: string
  effective_date: string
  origin: {
    zip3?: string
    state?: string
    country: string
  }
  destination: {
    zip3?: string
    state?: string
    country: string
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
  competitorBaseline?: number
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
  lines: QuoteLineItem[]
  subtotals: QuoteSubtotals
  discounts_applied: QuoteDiscount[]
  totals: QuoteTotals
  comparison?: {
    savings_amount: number
    savings_percentage: number
  }
}

// Simulate loading benchmark rates (replace with actual database call)
async function loadBenchmarkRates(): Promise<BenchmarkRate[]> {
  return [
    {
      service_type: 'receiving',
      unit_type: 'pallet',
      origin_country: 'US',
      destination_country: 'US',
      base_rate: 15.50,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_type: 'receiving',
      unit_type: 'carton',
      origin_country: 'US',
      destination_country: 'US',
      base_rate: 2.75,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_type: 'fulfillment',
      unit_type: 'order',
      origin_country: 'US',
      destination_country: 'US',
      base_rate: 8.25,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_type: 'storage',
      unit_type: 'sq_ft',
      origin_country: 'US',
      destination_country: 'US',
      base_rate: 0.85,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
  ]
}

// Simulate loading value-added options (replace with actual database call)
async function loadValueAddedOptions(): Promise<ValueAddedOption[]> {
  return [
    {
      service_code: 'LABEL_APPLY',
      description: 'Label Application',
      unit_type: 'piece',
      base_rate: 0.45,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_code: 'GIFT_WRAP',
      description: 'Gift Wrapping Service',
      unit_type: 'piece',
      base_rate: 2.50,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
  ]
}

/**
 * Find best matching rate using lane resolution logic:
 * 1. ZIP3 match (highest priority)
 * 2. State match (medium priority)
 * 3. Country match (lowest priority)
 */
function resolveLaneRate(
  rates: BenchmarkRate[],
  serviceType: string,
  unitType: string,
  origin: { zip3?: string; state?: string; country: string },
  destination: { zip3?: string; state?: string; country: string }
): BenchmarkRate | null {
  // Try ZIP3 match first
  let bestMatch = rates.find(rate => 
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_zip3 === origin.zip3 &&
    rate.destination_zip3 === destination.zip3
  )
  
  if (bestMatch) return bestMatch
  
  // Try state match
  bestMatch = rates.find(rate =>
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_state === origin.state &&
    rate.destination_state === destination.state &&
    !rate.origin_zip3 &&
    !rate.destination_zip3
  )
  
  if (bestMatch) return bestMatch
  
  // Try country match
  bestMatch = rates.find(rate =>
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_country === origin.country &&
    rate.destination_country === destination.country &&
    !rate.origin_state &&
    !rate.destination_state &&
    !rate.origin_zip3 &&
    !rate.destination_zip3
  )
  
  return bestMatch || null
}

/**
 * Add receiving line items to the quote
 */
function addReceiving(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
): void {
  if (!input.services.receiving) return
  
  const { pallets = 0, cartons = 0, pieces = 0 } = input.services.receiving
  
  if (pallets > 0) {
    const rate = resolveLaneRate(rates, 'receiving', 'pallet', input.origin, input.destination)
    if (rate) {
      lines.push({
        category: 'Receiving',
        service_code: 'RECV_PALLET',
        description: 'Pallet Receiving',
        quantity: pallets,
        unit_rate: rate.base_rate,
        extended_cost: pallets * rate.base_rate,
        discountable: true
      })
    }
  }
  
  if (cartons > 0) {
    const rate = resolveLaneRate(rates, 'receiving', 'carton', input.origin, input.destination)
    if (rate) {
      lines.push({
        category: 'Receiving',
        service_code: 'RECV_CARTON',
        description: 'Carton Receiving',
        quantity: cartons,
        unit_rate: rate.base_rate,
        extended_cost: cartons * rate.base_rate,
        discountable: true
      })
    }
  }
}

/**
 * Add fulfillment line items to the quote
 */
function addFulfillment(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
): void {
  if (!input.services.fulfillment) return
  
  const { orders = 0, lines: orderLines = 0, pieces = 0 } = input.services.fulfillment
  
  if (orders > 0) {
    const rate = resolveLaneRate(rates, 'fulfillment', 'order', input.origin, input.destination)
    if (rate) {
      lines.push({
        category: 'Fulfillment',
        service_code: 'FULL_ORDER',
        description: 'Order Fulfillment',
        quantity: orders,
        unit_rate: rate.base_rate,
        extended_cost: orders * rate.base_rate,
        discountable: true
      })
    }
  }
}

/**
 * Add storage line items to the quote
 */
function addStorage(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
): void {
  if (!input.services.storage) return
  
  const { pallets = 0, sq_ft = 0 } = input.services.storage
  
  if (sq_ft > 0) {
    const rate = resolveLaneRate(rates, 'storage', 'sq_ft', input.origin, input.destination)
    if (rate) {
      lines.push({
        category: 'Storage',
        service_code: 'STOR_SQFT',
        description: 'Storage per Sq Ft',
        quantity: sq_ft,
        unit_rate: rate.base_rate,
        extended_cost: sq_ft * rate.base_rate,
        discountable: true
      })
    }
  }
}

/**
 * Add VAS line items to the quote
 */
function addVas(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  vasCatalog: ValueAddedOption[]
): void {
  if (!input.services.vas) return
  
  for (const vasRequest of input.services.vas) {
    const vasOption = vasCatalog.find(option => option.service_code === vasRequest.service_code)
    if (vasOption) {
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

/**
 * Add surcharge line items to the quote
 */
function addSurcharges(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
): void {
  // Placeholder for surcharges - would implement based on specific business rules
  // For now, no surcharges are added
}

/**
 * Calculate subtotals from line items
 */
function calculateSubtotals(lines: QuoteLineItem[]): QuoteSubtotals {
  const subtotals: QuoteSubtotals = {
    receiving: 0,
    fulfillment: 0,
    storage: 0,
    vas: 0,
    surcharges: 0,
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
      case 'Surcharges':
        subtotals.surcharges += line.extended_cost
        break
    }
    
    if (line.discountable !== false) {
      subtotals.total_discountable += line.extended_cost
    } else {
      subtotals.total_non_discountable += line.extended_cost
    }
  })
  
  return subtotals
}

/**
 * Apply discounts in correct order: flat discounts first, then percentage discounts
 */
function applyDiscounts(
  lines: QuoteLineItem[],
  requestedDiscounts: Array<{ type: 'flat' | 'percentage'; amount: number; description: string }>
): { discountsApplied: QuoteDiscount[]; totalDiscount: number } {
  const discountsApplied: QuoteDiscount[] = []
  let totalDiscount = 0
  
  // Calculate total discountable amount
  const discountableSubtotal = lines
    .filter(line => line.discountable !== false)
    .reduce((sum, line) => sum + line.extended_cost, 0)
  
  let remainingDiscountableAmount = discountableSubtotal
  
  // Sort discounts: flat first, then percentage
  const sortedDiscounts = [...requestedDiscounts].sort((a, b) => {
    if (a.type === 'flat' && b.type === 'percentage') return -1
    if (a.type === 'percentage' && b.type === 'flat') return 1
    return 0
  })
  
  for (const discount of sortedDiscounts) {
    let appliedAmount = 0
    
    if (discount.type === 'flat') {
      appliedAmount = Math.min(discount.amount, remainingDiscountableAmount)
    } else if (discount.type === 'percentage') {
      appliedAmount = Math.min(
        (remainingDiscountableAmount * discount.amount) / 100,
        remainingDiscountableAmount
      )
    }
    
    if (appliedAmount > 0) {
      discountsApplied.push({
        type: discount.type,
        amount: discount.amount,
        description: discount.description,
        applied_to_amount: appliedAmount
      })
      
      remainingDiscountableAmount -= appliedAmount
      totalDiscount += appliedAmount
    }
  }
  
  return { discountsApplied, totalDiscount }
}

/**
 * Main quote pricing function
 */
export async function priceQuote(input: QuoteRequest): Promise<QuoteResponse> {
  // 1. Data Loading
  const rates = await loadBenchmarkRates()
  const vasCatalog = await loadValueAddedOptions()
  
  // 2. Initialize lines array
  const lines: QuoteLineItem[] = []
  
  // 3. Line Item Calculation
  addReceiving(lines, input, rates)
  addFulfillment(lines, input, rates)
  addStorage(lines, input, rates)
  addVas(lines, input, vasCatalog)
  addSurcharges(lines, input, rates)
  
  // 4. Subtotal Calculation
  const subtotals = calculateSubtotals(lines)
  const discountableSubtotal = subtotals.total_discountable
  const nonDiscountableSubtotal = subtotals.total_non_discountable
  const beforeDiscounts = discountableSubtotal + nonDiscountableSubtotal
  
  // 5. Discount Application
  const discountResults = input.discounts 
    ? applyDiscounts(lines, input.discounts)
    : { discountsApplied: [], totalDiscount: 0 }
  
  const totalDiscount = discountResults.totalDiscount
  const afterDiscounts = Math.max(0, discountableSubtotal - totalDiscount) + nonDiscountableSubtotal
  
  // 6. Final Totals
  const grandTotal = afterDiscounts
  
  const totals: QuoteTotals = {
    total_discount: totalDiscount,
    total: grandTotal
  }
  
  // 7. Generate response
  const response: QuoteResponse = {
    quote_id: `Q-${Date.now()}`,
    version_id: input.version_id,
    customer_id: input.customer_id,
    effective_date: input.effective_date,
    generated_at: new Date().toISOString(),
    lanes: {
      outbound: `${input.origin.country}-${input.origin.state || input.origin.zip3} to ${input.destination.country}-${input.destination.state || input.destination.zip3}`
    },
    lines,
    subtotals,
    discounts_applied: discountResults.discountsApplied,
    totals
  }
  
  // 8. Comparison calculation (if competitor baseline exists)
  if (input.competitorBaseline && input.competitorBaseline > 0) {
    const savingsAmount = input.competitorBaseline - grandTotal
    const savingsPercentage = (savingsAmount / input.competitorBaseline) * 100
    
    response.comparison = {
      savings_amount: savingsAmount,
      savings_percentage: savingsPercentage
    }
  }
  
  return response
}