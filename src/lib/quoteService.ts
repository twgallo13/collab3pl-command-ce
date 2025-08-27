/**
 * Quote Service for Logistics Pricing
 * Based on section A.7 of the collab3pl V9.5 Final document
 */

export interface QuoteLineItem {
  category: 'Receiving' | 'Fulfillment' | 'Storage' | 'VAS' | 'Surcharges'
  description: string
  unit_type: string
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
  surcharges: number
  total_discountable: number
  total_non_discountable: number
}

export interface QuoteDiscount {
  type: 'flat' | 'percentage'
  amount: number
  applied_to_amount: number
  description: string
}

export interface QuoteTotals {
  subtotal: number
  discount: number
  total: number
}

export interface QuoteComparison {
  benchmark_total: number
  savings_amount: number
  savings_percentage: number
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
}

export interface QuoteResponse {
  quote_id: string
  version_id: string
  customer_id: string
  effective_date: string
  generated_at: string
  lanes: {
    outbound: string
    inbound: string
  }
  lines: QuoteLineItem[]
  subtotals: QuoteSubtotals
  discounts_applied: QuoteDiscount[]
  totals: QuoteTotals
  comparison?: QuoteComparison
}

// Mock benchmark data interface
interface BenchmarkRate {
  rate_id: string
  origin_zip3?: string
  origin_state?: string
  origin_country: string
  destination_zip3?: string
  destination_state?: string
  destination_country: string
  service_type: string
  unit_type: string
  base_rate: number
  effective_start_date: string
  effective_end_date: string
}

interface ValueAddedOption {
  service_code: string
  description: string
  unit_type: string
  base_rate: number
  category: 'VAS'
}

/**
 * Mock function to simulate loading benchmark rates from database
 */
async function loadBenchmarkRates(versionId: string): Promise<BenchmarkRate[]> {
  // In a real implementation, this would query the database
  return [
    {
      rate_id: 'rate_001',
      origin_country: 'US',
      origin_state: 'CA',
      origin_zip3: '902',
      destination_country: 'US',
      destination_state: 'TX',
      destination_zip3: '750',
      service_type: 'Receiving',
      unit_type: 'per_pallet',
      base_rate: 15.00,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      rate_id: 'rate_002',
      origin_country: 'US',
      destination_country: 'US',
      service_type: 'Fulfillment',
      unit_type: 'per_order',
      base_rate: 3.50,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      rate_id: 'rate_003',
      origin_country: 'US',
      destination_country: 'US',
      service_type: 'Storage',
      unit_type: 'per_pallet_month',
      base_rate: 12.00,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
  ]
}

/**
 * Mock function to simulate loading value-added options from database
 */
async function loadValueAddedOptions(versionId: string): Promise<ValueAddedOption[]> {
  return [
    {
      service_code: 'LABEL_APPLY',
      description: 'Label Application',
      unit_type: 'per_piece',
      base_rate: 0.25,
      category: 'VAS'
    },
    {
      service_code: 'GIFT_WRAP',
      description: 'Gift Wrapping',
      unit_type: 'per_piece',
      base_rate: 2.50,
      category: 'VAS'
    }
  ]
}

/**
 * Implements lane resolution logic with fallback hierarchy:
 * 1. Exact zip3 match (highest priority)
 * 2. State match (medium priority)
 * 3. Country match (lowest priority)
 */
function findBestRate(
  rates: BenchmarkRate[],
  origin: QuoteRequest['origin'],
  destination: QuoteRequest['destination'],
  serviceType: string,
  unitType: string
): BenchmarkRate | null {
  
  // Priority 1: Exact zip3 match
  let bestMatch = rates.find(rate => 
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_zip3 === origin.zip3 &&
    rate.destination_zip3 === destination.zip3 &&
    rate.origin_country === origin.country &&
    rate.destination_country === destination.country
  )
  
  if (bestMatch) return bestMatch
  
  // Priority 2: State match
  bestMatch = rates.find(rate =>
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_state === origin.state &&
    rate.destination_state === destination.state &&
    rate.origin_country === origin.country &&
    rate.destination_country === destination.country &&
    !rate.origin_zip3 && !rate.destination_zip3
  )
  
  if (bestMatch) return bestMatch
  
  // Priority 3: Country match
  bestMatch = rates.find(rate =>
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_country === origin.country &&
    rate.destination_country === destination.country &&
    !rate.origin_state && !rate.destination_state &&
    !rate.origin_zip3 && !rate.destination_zip3
  )
  
  return bestMatch
}

/**
 * Calculates subtotals by category
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
    
    if (line.discountable) {
      subtotals.total_discountable += line.extended_cost
    } else {
      subtotals.total_non_discountable += line.extended_cost
    }
  })
  
  return subtotals
}

/**
 * Applies discounts in the correct order: flat first, then percentage
 */
function applyDiscounts(
  totalDiscountable: number,
  requestedDiscounts: QuoteRequest['discounts'] = []
): { applied: QuoteDiscount[], totalDiscount: number } {
  
  const appliedDiscounts: QuoteDiscount[] = []
  let remainingDiscountableAmount = totalDiscountable
  let totalDiscount = 0
  
  // Sort discounts: flat first, then percentage
  const sortedDiscounts = [...requestedDiscounts].sort((a, b) => {
    if (a.type === 'flat' && b.type === 'percentage') return -1
    if (a.type === 'percentage' && b.type === 'flat') return 1
    return 0
  })
  
  for (const discount of sortedDiscounts) {
    let discountAmount = 0
    
    if (discount.type === 'flat') {
      discountAmount = Math.min(discount.amount, remainingDiscountableAmount)
    } else if (discount.type === 'percentage') {
      discountAmount = Math.min(
        (discount.amount / 100) * remainingDiscountableAmount,
        remainingDiscountableAmount
      )
    }
    
    if (discountAmount > 0) {
      appliedDiscounts.push({
        type: discount.type,
        amount: discount.amount,
        applied_to_amount: discountAmount,
        description: discount.description
      })
      
      remainingDiscountableAmount -= discountAmount
      totalDiscount += discountAmount
    }
  }
  
  return { applied: appliedDiscounts, totalDiscount }
}

/**
 * Generates a unique quote ID
 */
function generateQuoteId(): string {
  return `Q${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Main pricing function that generates a complete quote
 */
export async function priceQuote(request: QuoteRequest): Promise<QuoteResponse> {
  try {
    // Load benchmark data
    const [rates, valueAddedOptions] = await Promise.all([
      loadBenchmarkRates(request.version_id),
      loadValueAddedOptions(request.version_id)
    ])
    
    const lines: QuoteLineItem[] = []
    
    // Calculate Receiving costs
    if (request.services.receiving) {
      const { pallets = 0, cartons = 0, pieces = 0 } = request.services.receiving
      
      if (pallets > 0) {
        const rate = findBestRate(rates, request.origin, request.destination, 'Receiving', 'per_pallet')
        if (rate) {
          lines.push({
            category: 'Receiving',
            description: 'Pallet Receiving',
            unit_type: 'per_pallet',
            quantity: pallets,
            unit_rate: rate.base_rate,
            extended_cost: pallets * rate.base_rate,
            discountable: true
          })
        }
      }
    }
    
    // Calculate Fulfillment costs
    if (request.services.fulfillment) {
      const { orders = 0, lines: orderLines = 0, pieces = 0 } = request.services.fulfillment
      
      if (orders > 0) {
        const rate = findBestRate(rates, request.origin, request.destination, 'Fulfillment', 'per_order')
        if (rate) {
          lines.push({
            category: 'Fulfillment',
            description: 'Order Processing',
            unit_type: 'per_order',
            quantity: orders,
            unit_rate: rate.base_rate,
            extended_cost: orders * rate.base_rate,
            discountable: true
          })
        }
      }
    }
    
    // Calculate Storage costs
    if (request.services.storage) {
      const { pallets = 0, sq_ft = 0 } = request.services.storage
      
      if (pallets > 0) {
        const rate = findBestRate(rates, request.origin, request.destination, 'Storage', 'per_pallet_month')
        if (rate) {
          lines.push({
            category: 'Storage',
            description: 'Pallet Storage',
            unit_type: 'per_pallet_month',
            quantity: pallets,
            unit_rate: rate.base_rate,
            extended_cost: pallets * rate.base_rate,
            discountable: true
          })
        }
      }
    }
    
    // Calculate VAS costs
    if (request.services.vas) {
      for (const vasRequest of request.services.vas) {
        const vasOption = valueAddedOptions.find(option => option.service_code === vasRequest.service_code)
        if (vasOption) {
          lines.push({
            category: 'VAS',
            description: vasOption.description,
            unit_type: vasOption.unit_type,
            quantity: vasRequest.quantity,
            unit_rate: vasOption.base_rate,
            extended_cost: vasRequest.quantity * vasOption.base_rate,
            discountable: true
          })
        }
      }
    }
    
    // Calculate subtotals
    const subtotals = calculateSubtotals(lines)
    const subtotal = subtotals.total_discountable + subtotals.total_non_discountable
    
    // Apply discounts
    const { applied: appliedDiscounts, totalDiscount } = applyDiscounts(
      subtotals.total_discountable,
      request.discounts
    )

    // Calculate totals
    const totals: QuoteTotals = {
      subtotal,
      discount: totalDiscount,
      total: subtotal - totalDiscount
    }
    
    // Generate lane descriptions
    const originDesc = request.origin.zip3 || request.origin.state || request.origin.country
    const destDesc = request.destination.zip3 || request.destination.state || request.destination.country
    
    // Build response
    const response: QuoteResponse = {
      quote_id: generateQuoteId(),
      version_id: request.version_id,
      customer_id: request.customer_id,
      effective_date: request.effective_date,
      generated_at: new Date().toISOString(),
      lanes: {
        outbound: `${originDesc} → ${destDesc}`,
        inbound: `${destDesc} → ${originDesc}`
      },
      lines,
      subtotals,
      discounts_applied: appliedDiscounts,
      totals
    }

    // Add comparison if we have benchmark data (simulation)
    const benchmarkTotal = totals.subtotal * 1.15 // Simulate 15% higher benchmark
    if (benchmarkTotal > totals.total) {
      response.comparison = {
        benchmark_total: benchmarkTotal,
        savings_amount: benchmarkTotal - totals.total,
        savings_percentage: ((benchmarkTotal - totals.total) / benchmarkTotal) * 100
      }
    }
    
    return response
    
  } catch (error) {
    throw new Error(`Failed to generate quote: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Utility function to validate quote request structure
 */
export function validateQuoteRequest(request: any): request is QuoteRequest {
  return (
    typeof request === 'object' &&
    typeof request.version_id === 'string' &&
    typeof request.customer_id === 'string' &&
    typeof request.effective_date === 'string' &&
    typeof request.origin === 'object' &&
    typeof request.destination === 'object' &&
    typeof request.services === 'object'
  )
}