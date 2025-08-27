/**
 * 
 * 

export interface QuoteLineItem {
  d

  extended_cost: number
}
export interface QuoteSubtotals {
  fulfillment: number
  vas: number
  total_discountab
}
export interface QuoteD
  amount: number
 

  subtotal: number
  total: number

  benchmark_total
  savings_amo
}
export interface QuoteReques
  customer_id: string
 

  }
    zip3?: string
    country: str
  services: {
      pallets?: numbe
 

      lines?: number
    }
      pallets?: number
    }
 

  discounts?: Array<{
    amount: number
  }>

  quote_id: string
 

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
      service_type: 
    inbound: string
   
  lines: QuoteLineItem[]
  subtotals: QuoteSubtotals
  discounts_applied: QuoteDiscount[]
      destination_cou
  comparison?: QuoteComparison
 

// Mock benchmark data interface
interface BenchmarkRate {
      origin_coun
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
 

interface ValueAddedOption {
  service_code: string
  description: string
  unit_type: string
  base_rate: number
  category: 'VAS'
 

/**
 * Mock function to simulate loading benchmark rates from database
 * 
async function loadBenchmarkRates(versionId: string): Promise<BenchmarkRate[]> {
  // In a real implementation, this would query the database
  return [
  des
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
    r
      rate_id: 'rate_002',
      origin_country: 'US',
      destination_country: 'US',
      service_type: 'Fulfillment',
      unit_type: 'per_order',
  // Priority 3: Count
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    !
      rate_id: 'rate_003',
      origin_country: 'US',
      destination_country: 'US',
      service_type: 'Storage',
      unit_type: 'per_pallet_month',
 */
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
   
}

/**
 * Mock function to simulate loading value-added options from database
 */
async function loadValueAddedOptions(versionId: string): Promise<ValueAddedOption[]> {
  return [
     
      service_code: 'LABEL_APPLY',
      description: 'Label Application',
      unit_type: 'per_piece',
      base_rate: 0.25,
      category: 'VAS'
      
    {
      service_code: 'GIFT_WRAP',
      description: 'Gift Wrapping',
      unit_type: 'per_piece',
      base_rate: 2.50,
      category: 'VAS'
    }
}
}

/**
 * Implements lane resolution logic with fallback hierarchy:
 * 1. Exact zip3 match (highest priority)
 * 2. State match (medium priority)
 * 3. Country match (lowest priority)
  l
function findBestRate(
  // Sort discounts: flat
  origin: QuoteRequest['origin'],
  destination: QuoteRequest['destination'],
  serviceType: string,
  
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
/**
  
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
  
            category: 'Rec
}

/**
 * Calculates subtotals by category
 */
function calculateSubtotals(lines: QuoteLineItem[]): QuoteSubtotals {
  const subtotals: QuoteSubtotals = {
    // Calculate 
    fulfillment: 0,
      
    vas: 0,
    surcharges: 0,
    total_discountable: 0,
    total_non_discountable: 0
  }
  
  lines.forEach(line => {
          })
      case 'Receiving':
        subtotals.receiving += line.extended_cost
        break
    if (request.services.
        subtotals.fulfillment += line.extended_cost
      if (pal
      case 'Storage':
        subtotals.storage += line.extended_cost
            u
      case 'VAS':
        subtotals.vas += line.extended_cost
        break
      case 'Surcharges':
        subtotals.surcharges += line.extended_cost
        break
    
    
    if (line.discountable) {
      subtotals.total_discountable += line.extended_cost
          li
      subtotals.total_non_discountable += line.extended_cost
     
  })
  
  return subtotals
 

   
 * Applies discounts in the correct order: flat first, then percentage
   
function applyDiscounts(
    const { applied
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
    
  
  for (const discount of sortedDiscounts) {
    let discountAmount = 0
    
    if (discount.type === 'flat') {
      discountAmount = Math.min(discount.amount, remainingDiscountableAmount)
    } else if (discount.type === 'percentage') {
    
        (discount.amount / 100) * remainingDiscountableAmount,
        remainingDiscountableAmount
      )
     
    
    if (discountAmount > 0) {
      appliedDiscounts.push({
        type: discount.type,
        amount: discount.amount,
        applied_to_amount: discountAmount,
        description: discount.description

      
      remainingDiscountableAmount -= discountAmount
      totalDiscount += discountAmount
    t
  }
  
  return { applied: appliedDiscounts, totalDiscount }
 


 * Generates a unique quote ID

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

      loadValueAddedOptions(request.version_id)

    
    const lines: QuoteLineItem[] = []
    

    if (request.services.receiving) {
      const { pallets = 0, cartons = 0, pieces = 0 } = request.services.receiving
      

        const rate = findBestRate(rates, request.origin, request.destination, 'Receiving', 'per_pallet')

          lines.push({
            category: 'Receiving',
            description: 'Pallet Receiving',
            unit_type: 'per_pallet',
            quantity: pallets,
            unit_rate: rate.base_rate,
            extended_cost: pallets * rate.base_rate,

          })

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

          })

      }

    

    if (request.services.storage) {
      const { pallets = 0, sq_ft = 0 } = request.services.storage
      
      if (pallets > 0) {
        const rate = findBestRate(rates, request.origin, request.destination, 'Storage', 'per_pallet_month')

          lines.push({

            description: 'Pallet Storage',

            quantity: pallets,
            unit_rate: rate.base_rate,
            extended_cost: pallets * rate.base_rate,
            discountable: true
          })

      }
    }
    

    if (request.services.vas) {
      for (const vasRequest of request.services.vas) {
        const vasOption = valueAddedOptions.find(option => option.service_code === vasRequest.service_code)

          lines.push({

            description: vasOption.description,
            unit_type: vasOption.unit_type,
            quantity: vasRequest.quantity,

            extended_cost: vasRequest.quantity * vasOption.base_rate,

          })

      }
    }
    
    // Calculate subtotals
    const subtotals = calculateSubtotals(lines)
    const subtotal = subtotals.total_discountable + subtotals.total_non_discountable
    
    // Apply discounts
    const { applied: appliedDiscounts, totalDiscount } = applyDiscounts(

      subtotals.total_discountable,

    )

    // Calculate totals

      subtotal,

      total: subtotal - totalDiscount

    

    const originDesc = request.origin.zip3 || request.origin.state || request.origin.country
    const destDesc = request.destination.zip3 || request.destination.state || request.destination.country
    

    const response: QuoteResponse = {
      quote_id: generateQuoteId(),
      version_id: request.version_id,
      customer_id: request.customer_id,
      effective_date: request.effective_date,
      generated_at: new Date().toISOString(),
      lanes: {
        outbound: `${originDesc} → ${destDesc}`,
        inbound: `${destDesc} → ${originDesc}`

      lines,

      discounts_applied: appliedDiscounts,

    }

    // Add comparison if we have benchmark data (simulation)
    const benchmarkTotal = totals.subtotal * 1.15 // Simulate 15% higher benchmark
    if (benchmarkTotal > totals.total) {

        benchmark_total: benchmarkTotal,

        savings_amount: benchmarkTotal - totals.total,
        savings_percentage: ((benchmarkTotal - totals.total) / benchmarkTotal) * 100
      }
    }
    
    return response
    

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

    typeof request.effective_date === 'string' &&
    typeof request.origin === 'object' &&
    typeof request.destination === 'object' &&
    typeof request.services === 'object'
  )
