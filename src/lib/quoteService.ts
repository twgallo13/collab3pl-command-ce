/**
 * Quote service implementation based on section A.7 of the collab3pl V9.5 Final document
 */

// Type definitions for benchmark data
export interface BenchmarkRate {
  service_type: string
  unit_type: string
  base_rate: number
  origin_zip3?: string
  origin_state?: string
  origin_country: string
  destination_zip3?: string
  destination_state?: string
  destination_country: string
  effective_start_date: string
  effective_end_date: string
}

export interface ValueAddedOption {
  service_code: string
  description: string
  unit_type: string
  base_rate: number
  category: string
}

export interface QuoteLineItem {
  category: string
  service_code: string
  description: string
  quantity: number
  unit_rate: number
  extended_cost: number
}

export interface QuoteDiscount {
  type: 'flat' | 'percentage'
  amount: number
  description: string
  applied_to_amount: number
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

export interface QuoteTotals {
  total_discount: number
  total: number
}

export interface QuoteComparison {
  savings_amount: number
  savings_percentage: number
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
  comparison?: QuoteComparison
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

// Mock data loaders (simulating database calls)
async function loadBenchmarkRates(): Promise<BenchmarkRate[]> {
  // Simulate loading benchmark rates from database
  return [
    {
      service_type: 'receiving',
      unit_type: 'pallet',
      base_rate: 15.50,
      origin_country: 'US',
      destination_country: 'US',
      destination_state: 'CA',
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_type: 'fulfillment',
      unit_type: 'order',
      base_rate: 2.75,
      origin_country: 'US',
      destination_country: 'US',
      destination_state: 'TX',
      destination_zip3: '750',
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_type: 'storage',
      unit_type: 'sq_ft',
      base_rate: 0.85,
      origin_country: 'US',
      destination_country: 'US',
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
  ]
}

async function loadValueAddedOptions(): Promise<ValueAddedOption[]> {
  // Simulate loading VAS options from database
  return [
    {
      service_code: 'LABEL_APPLY',
      description: 'Label Application',
      unit_type: 'piece',
      base_rate: 0.25,
      category: 'VAS'
    },
    {
      service_code: 'GIFT_WRAP',
      description: 'Gift Wrapping',
      unit_type: 'piece',
      base_rate: 3.50,
      category: 'VAS'
    }
  ]
}

/**
 * Find the best matching rate using priority order:
 * 1. ZIP3 match (highest priority)
 * 2. State match 
 * 3. Country match (lowest priority)
 */
function findBestRate(
  rates: BenchmarkRate[],
  serviceType: string,
  unitType: string,
  origin: { zip3?: string; state?: string; country: string },
  destination: { zip3?: string; state?: string; country: string }
): BenchmarkRate | null {
  // Priority 1: ZIP3 match
  let bestMatch = rates.find(rate => {
    return rate.service_type === serviceType &&
           rate.unit_type === unitType &&
           rate.origin_zip3 === origin.zip3 &&
           rate.destination_zip3 === destination.zip3
  })

  if (bestMatch) return bestMatch

  // Priority 2: State match
  bestMatch = rates.find(rate => {
    return rate.service_type === serviceType &&
           rate.unit_type === unitType &&
           rate.origin_state === origin.state &&
           rate.destination_state === destination.state &&
           !rate.origin_zip3 &&
           !rate.destination_zip3
  })

  if (bestMatch) return bestMatch

  // Priority 3: Country match
  bestMatch = rates.find(rate => {
    return rate.service_type === serviceType &&
           rate.unit_type === unitType &&
           rate.origin_country === origin.country &&
           rate.destination_country === destination.country &&
           !rate.origin_zip3 &&
           !rate.origin_state &&
           !rate.destination_zip3 &&
           !rate.destination_state
  })

  return bestMatch || null
}

/**
 * Calculate subtotals by category
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
    
    // All categories are considered discountable for now
    subtotals.total_discountable += line.extended_cost
  })

  return subtotals
}

/**
 * Apply discounts in correct order: flat discounts first, then percentage discounts
 */
function applyDiscounts(
  subtotals: QuoteSubtotals,
  requestedDiscounts: Array<{ type: 'flat' | 'percentage'; amount: number; description: string }>
): { discountsApplied: QuoteDiscount[]; totalDiscount: number } {
  const discountsApplied: QuoteDiscount[] = []
  let remainingDiscountableAmount = subtotals.total_discountable
  let totalDiscount = 0

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
export async function priceQuote(request: QuoteRequest): Promise<QuoteResponse> {
  // Load benchmark data
  const rates = await loadBenchmarkRates()
  const vasOptions = await loadValueAddedOptions()
  
  const lines: QuoteLineItem[] = []

  // Calculate receiving costs
  if (request.services.receiving) {
    const { pallets = 0, cartons = 0, pieces = 0 } = request.services.receiving

    if (pallets > 0) {
      const rate = findBestRate(rates, 'receiving', 'pallet', request.origin, request.destination)
      if (rate) {
        lines.push({
          category: 'Receiving',
          service_code: 'RECV_PALLET',
          description: 'Pallet Receiving',
          quantity: pallets,
          unit_rate: rate.base_rate,
          extended_cost: pallets * rate.base_rate
        })
      }
    }

    if (cartons > 0) {
      const rate = findBestRate(rates, 'receiving', 'carton', request.origin, request.destination)
      // Use pallet rate as fallback for cartons if specific carton rate not found
      const fallbackRate = rate || findBestRate(rates, 'receiving', 'pallet', request.origin, request.destination)
      if (fallbackRate) {
        const cartonRate = rate ? rate.base_rate : fallbackRate.base_rate * 0.1 // Estimate 10% of pallet rate
        lines.push({
          category: 'Receiving',
          service_code: 'RECV_CARTON',
          description: 'Carton Receiving',
          quantity: cartons,
          unit_rate: cartonRate,
          extended_cost: cartons * cartonRate
        })
      }
    }
  }

  // Calculate fulfillment costs
  if (request.services.fulfillment) {
    const { orders = 0, lines: orderLines = 0, pieces = 0 } = request.services.fulfillment

    if (orders > 0) {
      const rate = findBestRate(rates, 'fulfillment', 'order', request.origin, request.destination)
      if (rate) {
        lines.push({
          category: 'Fulfillment',
          service_code: 'FULL_ORDER',
          description: 'Order Fulfillment',
          quantity: orders,
          unit_rate: rate.base_rate,
          extended_cost: orders * rate.base_rate
        })
      }
    }
  }

  // Calculate storage costs
  if (request.services.storage) {
    const { pallets = 0, sq_ft = 0 } = request.services.storage

    if (sq_ft > 0) {
      const rate = findBestRate(rates, 'storage', 'sq_ft', request.origin, request.destination)
      if (rate) {
        lines.push({
          category: 'Storage',
          service_code: 'STOR_SQFT',
          description: 'Storage per Sq Ft',
          quantity: sq_ft,
          unit_rate: rate.base_rate,
          extended_cost: sq_ft * rate.base_rate
        })
      }
    }
  }

  // Calculate VAS costs
  if (request.services.vas) {
    for (const vasRequest of request.services.vas) {
      const vasOption = vasOptions.find(option => option.service_code === vasRequest.service_code)
      if (vasOption) {
        lines.push({
          category: 'VAS',
          service_code: vasOption.service_code,
          description: vasOption.description,
          quantity: vasRequest.quantity,
          unit_rate: vasOption.base_rate,
          extended_cost: vasRequest.quantity * vasOption.base_rate
        })
      }
    }
  }

  // Calculate subtotals
  const subtotals = calculateSubtotals(lines)

  // Apply discounts
  const discountResults = request.discounts 
    ? applyDiscounts(subtotals, request.discounts)
    : { discountsApplied: [], totalDiscount: 0 }

  // Calculate totals
  const totals: QuoteTotals = {
    total_discount: discountResults.totalDiscount,
    total: subtotals.total_discountable + subtotals.total_non_discountable - discountResults.totalDiscount
  }

  // Generate quote response
  const response: QuoteResponse = {
    quote_id: `Q-${Date.now()}`,
    version_id: request.version_id,
    customer_id: request.customer_id,
    effective_date: request.effective_date,
    generated_at: new Date().toISOString(),
    lanes: {
      outbound: `${request.origin.country}-${request.origin.state || request.origin.zip3} to ${request.destination.country}-${request.destination.state || request.destination.zip3}`
    },
    lines,
    subtotals,
    discounts_applied: discountResults.discountsApplied,
    totals
  }

  // Add comparison if significant savings
  if (discountResults.totalDiscount > 0) {
    const originalTotal = subtotals.total_discountable + subtotals.total_non_discountable
    response.comparison = {
      savings_amount: discountResults.totalDiscount,
      savings_percentage: (discountResults.totalDiscount / originalTotal) * 100
    }
  }

  return response
}