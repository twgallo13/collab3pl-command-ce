/**
 * Based on section A.7 of the collab3pl V9.5 Final docum

exp

  quantity: number
  extended_cost: number
}
export interface Quot
  fulfillment: numb
  quantity: number
  unit_rate: number
  extended_cost: number
  discountable: boolean
}

export interface QuoteSubtotals {
  receiving: number
  fulfillment: number
  storage: number
  benchmark_t
  savings_percentage

  quote_id: string
 

    outbound: string
  lines: QuoteLineItem[]
  discounts_appl
  comparison?: QuoteCompari

 

    zip3?: string
    country: strin
  destination: {
    state?: str
 

      cartons?: number
  benchmark_total: number
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
  ret
      service_code:
      base_rate: 0.25
      category: 'VAS
    {
     
      unit_type
    }
}
/**
 * Priority order
 * 3. Country match (lowes
function findBestRate(
  orig
  s
): BenchmarkRate | nu
  // Priority 1: ZIP3 match
    rate.service_t
    rate.origin_zip3 ==
    
 

  bestMatch = rates.find(rate =>
    rate.unit_type === un
    rate.destination_sta
    rate.destination_co
  )

  bestMatch = rates.find(rat
    rate.unit_type === unit
    rate.destination_c
    !rate.origin_zi
  
}

 */
  const subtotals: Quo
    fulfillment: 0,
    vas: 0,
    total_discounta
  }
 

   
        subtotals.fulfillment += line.extended_cost
      case 'Storage':
 */
        subtotals.vas += line.extended_cost
      case 'Surcharges':
        br
    
      subtotals.total_disco
      subtotals.total_non
  })
  return subtotals

 * Applies discounts accor
function applyDiscounts
  tota
  app
} {
  let totalDiscount = 0
  // Sort discounts: flat first, t
    if (a.type === 'flat'
    return 0

    l
    if (discount.type === '
    } else {
        (discount.amount / 100
      )

     
   
 

  }
  return { applied: appliedDiscounts, totalDiscount }

 * Main function to generate a logistics pricing quote
 */
  try
    const valueAddedOptions = awai
    const lines: QuoteLineItem[] = []
    // Calculate recei
      const { pallets, ca
      if (pallets && p
      
     
            unit_type: 'pallet',
            unit_rate: rate.base_ra
            discountab
        }
    }
    /
   
 

   
            unit_type: 'order',
            unit_rate: rate.base_rate,
            discountable: true
        }
   
    // Calculate stora
      const { pallets, sq
      if (sq_ft && sq_ft > 0) {
        if (rate) {
            category: 
            unit_t
            unit_rate: ra
  
        }
    }
    // Calculate VAS costs
      for (const vasRequest of req
        if (vasOption) {
            category: 'VAS',
            unit_type: vasOption.unit_type,
            unit_rate: vasOption.base_rate,
   
        }

    // Calculate subtotals

    const { applied: appliedDiscounts, t
      subtotals.total_discountable

      subtotal: subtotals.total_discountable + subt
      total: subtotals.total_discountable + s

    const originDesc = request.origin.zip3 || r

      quote_id: `Q${Date.now()}`,

      generated_at: new Date()
        outbound: `${originDesc}
      lines,
      discounts_applied: appliedDi
    }
    // Add comparison if there's a benchmark to compare
    if (benchmarkTotal > totals.total) {
        benchmark_total: benchmarkTotal,
   
  
    return respons
 

/**
 */
  r
    typeof request.version_id === 'string' &&
    typeof request.effective_date ===
    typeof reques
  )






















































































export async function priceQuote(request: QuoteRequest): Promise<QuoteResponse> {
  try {
    const benchmarkRates = await loadBenchmarkRates()

















































































































































