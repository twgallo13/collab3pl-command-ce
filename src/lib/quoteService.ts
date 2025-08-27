/**
 * Quote Service - Handles logistics pricing calculations
 */

export interface BenchmarkRate {
  service_type: string
  unit_type: string
  origin_state?: string
  origin_zip3?: string
  origin_country: string
  destination_state?: string
  destination_zip3?: string
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
      base_rate: 25.50,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_type: 'fulfillment',
      unit_type: 'order',
      origin_country: 'US',
      destination_country: 'US',
      base_rate: 3.75,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_type: 'storage',
      unit_type: 'pallet',
      origin_country: 'US',
      destination_country: 'US',
      base_rate: 15.00,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
  ]
}

// Simulate loading VAS catalog (replace with actual database call)
async function loadVASCatalog(): Promise<ValueAddedOption[]> {
  return [
    {
      service_code: 'LABEL_APPLY',
      description: 'Label Application',
      unit_type: 'piece',
      base_rate: 0.50,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    {
      service_code: 'GIFT_WRAP',
      description: 'Gift Wrapping',
      unit_type: 'piece',
      base_rate: 2.00,
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
  ]
}

/**
 * Find the best matching rate for a given service type and lane
 */
function findBestRate(
  rates: BenchmarkRate[],
  serviceType: string,
  origin: QuoteRequest['origin'],
  destination: QuoteRequest['destination']
): BenchmarkRate | null {
  return rates.find(rate => 
    rate.service_type === serviceType &&
    rate.origin_country === origin.country &&
    rate.destination_country === destination.country
  ) || null
}

/**
 * Add receiving line items
 */
function addReceivingLines(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
) {
  if (!input.services.receiving) return

  const { pallets = 0, cartons = 0, pieces = 0 } = input.services.receiving
  const rate = findBestRate(rates, 'receiving', input.origin, input.destination)

  if (pallets > 0 && rate) {
    lines.push({
      category: 'Receiving',
      service_code: 'REC_PALLET',
      description: 'Pallet Receiving',
      quantity: pallets,
      unit_rate: rate.base_rate,
      extended_cost: pallets * rate.base_rate,
      discountable: true
    })
  }

  if (cartons > 0 && rate) {
    lines.push({
      category: 'Receiving',
      service_code: 'REC_CARTON',
      description: 'Carton Receiving',
      quantity: cartons,
      unit_rate: rate.base_rate * 0.5, // Assume cartons are 50% of pallet rate
      extended_cost: cartons * (rate.base_rate * 0.5),
      discountable: true
    })
  }
}

/**
 * Add fulfillment line items
 */
const addFulfillmentLines = (
  lines: QuoteLineItem[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
) => {
  if (!input.services.fulfillment) return

  const { orders = 0 } = input.services.fulfillment
  const rate = findBestRate(rates, 'fulfillment', input.origin, input.destination)

  if (orders > 0 && rate) {
    lines.push({
      category: 'Fulfillment',
      service_code: 'FUL_ORDER',
      description: 'Order Fulfillment',
      quantity: orders,
      unit_rate: rate.base_rate,
      extended_cost: orders * rate.base_rate,
      discountable: true
    })
  }
}

/**
 * Add storage line items
 */
function addStorageLines(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  rates: BenchmarkRate[]
) {
  if (!input.services.storage) return

  const { pallets = 0, sq_ft = 0 } = input.services.storage
  const rate = findBestRate(rates, 'storage', input.origin, input.destination)

  if (pallets > 0 && rate) {
    lines.push({
      category: 'Storage',
      service_code: 'STO_PALLET',
      description: 'Pallet Storage',
      quantity: pallets,
      unit_rate: rate.base_rate,
      extended_cost: pallets * rate.base_rate,
      discountable: true
    })
  }
}

/**
 * Add VAS line items
 */
function addVASLines(
  lines: QuoteLineItem[],
  input: QuoteRequest,
  vasCatalog: ValueAddedOption[]
) {
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
 * Calculate subtotals by category
 */
function calculateSubtotals(lines: QuoteLineItem[]): QuoteSubtotals {
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

/**
 * Apply discounts in the correct order: flat first, then percentage
 */
function applyDiscounts(
  lines: QuoteLineItem[],
  requestedDiscounts: Array<{ type: 'flat' | 'percentage', amount: number, description: string }>
): { discountsApplied: QuoteDiscount[], totalDiscount: number } {
  const discountsApplied: QuoteDiscount[] = []
  
  const discountableSubtotal = lines
    .filter(line => line.discountable)
    .reduce((sum, line) => sum + line.extended_cost, 0)

  let remainingDiscountableAmount = discountableSubtotal

  // Apply flat discounts first
  for (const discount of requestedDiscounts.filter(d => d.type === 'flat')) {
    if (remainingDiscountableAmount <= 0) break

    let appliedAmount = Math.min(discount.amount, remainingDiscountableAmount)
    
    discountsApplied.push({
      type: discount.type,
      amount: discount.amount,
      description: discount.description,
      applied_to_amount: appliedAmount
    })

    remainingDiscountableAmount -= appliedAmount
  }

  // Apply percentage discounts to remaining amount
  for (const discount of requestedDiscounts.filter(d => d.type === 'percentage')) {
    if (remainingDiscountableAmount <= 0) break

    let appliedAmount = Math.min(
      (discount.amount / 100) * remainingDiscountableAmount,
      remainingDiscountableAmount
    )
    
    discountsApplied.push({
      type: discount.type,
      amount: discount.amount,
      description: discount.description,
      applied_to_amount: appliedAmount
    })

    remainingDiscountableAmount -= appliedAmount
  }

  const totalDiscount = discountsApplied.reduce((sum, discount) => sum + discount.applied_to_amount, 0)

  return { discountsApplied, totalDiscount }
}

/**
 * Generate a pricing quote based on input parameters
 */
export async function priceQuote(input: QuoteRequest): Promise<QuoteResponse> {
  // 1. Data Loading
  const rates = await loadBenchmarkRates()
  const vasCatalog = await loadVASCatalog()

  // 2. Initialize lines array
  const lines: QuoteLineItem[] = []

  // 3. Line Item Calculation - call helper functions to populate lines
  addReceivingLines(lines, input, rates)
  addFulfillmentLines(lines, input, rates)
  addStorageLines(lines, input, rates)
  addVASLines(lines, input, vasCatalog)

  // 4. Subtotal Calculation
  const subtotals = calculateSubtotals(lines)

  // 5. Discount Application
  const discountResults = input.discounts && input.discounts.length > 0
    ? applyDiscounts(lines, input.discounts)
    : { discountsApplied: [], totalDiscount: 0 }

  const totalDiscount = discountResults.totalDiscount

  // 6. Final Totals & Comparison
  const beforeDiscounts = subtotals.total_discountable + subtotals.total_non_discountable
  const grandTotal = Math.max(0, subtotals.total_discountable - totalDiscount) + subtotals.total_non_discountable

  const totals: QuoteTotals = {
    before_discounts: beforeDiscounts,
    discount_amount: totalDiscount,
    total: grandTotal
  }

  // 7. Return Statement
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

  // Add comparison if competitor baseline provided
  if (input.competitorBaseline) {
    const savingsAmount = input.competitorBaseline - grandTotal
    const savingsPercentage = (savingsAmount / input.competitorBaseline) * 100
    response.comparison = {
      savings_amount: savingsAmount,
      savings_percentage: savingsPercentage
    }
  }

  return response
}