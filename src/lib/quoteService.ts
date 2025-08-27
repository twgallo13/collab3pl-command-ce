/**
 * Quote Service - Handles logistics pricing calculations
// 

// Core data interfaces
export interface BenchmarkRate {
  service_type: string
  unit_type: string
  destination_zip3?
  origin_zip3?: string
  effective_start_date:
  origin_country: string
  destination_zip3?: string
  destination_state?: string
  destination_country: string
  effective_start_date: string
  effective_end_date: string
}

export interface ValueAddedOption {
  description: string
  description: string
  extended_cost: nu
  unit_type: string
export interface Q
}

export interface QuoteLineItem {
  total_discountab
  service_code: string

  quantity: number
  version_id: strin
  effective_date: strin
 

  destination: {
    state?: string
  }
    receiving?: {
      cartons
    }
      orders?: number
      pieces?: number
 

    vas?: Array<{
      quantity: number
  }
    type: 'flat' | 'p
    description: string
}

  version_id: string
  effective_date: string
  lanes: {
 

  totals: QuoteTotals
}
// Simulate loading benchmar
 

      unit_type: 'pallet',
  version_id: string
  customer_id: string
  effective_date: string
  origin: {
    zip3?: string
    state?: string
    country: string
   
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
     
    {
      unit_type: 'pie
      description: '
    }
}
/**
 * 1. ZIP3 match (high
 * 3. Country match 
funct
  serviceType: st
  origin: { zip3?: string;
): BenchmarkRate | nul

  b
           rate.unit_
           rate.destination_zip
  

  be
 

           !rate.destination_zip
  

  bestMatch = rates.f
           rate.unit_typ
           rate.destin
          
           !rate.des

}
/**
 */
  const subtotals: Qu
    fulfillment: 0,
 

  }
  lines.forEach(line => {
      case 'Receiving':
        br
     
      case 'Storage':
        break
        subtotals.vas +
      case 'Surcharges':
        break
    
    subtotals.total_discountable += li

}
/**
 */
  subtotals: QuoteSubt
): { discountsApplied: Qu
  let remainingDiscountableAmo

  const sortedDiscounts = [...re
    if (a.type === 'percentage' && b.type
  })
  for 

      appliedAmount = Math.min
      appliedAmount = Mat
        remainingDisco
    }
    if (appliedAmount > 0) {
        type: discount.type,
        description: discount.descript
     
   
 

}
/**
 */
  // 
  const vasOptions = await loadVal
  const lines: QuoteLineI
  // Calculate receivi
    const { pallets = 0, cartons = 0, p
    if (pallets > 0) 
      
     
          description: 'Pallet R
          unit_rate: rate
        })
    }
    if (cartons > 0) 
     
   
 

   
          extended_cost: cartons * cartonRate
      }
  }
  // Calculate fulfillment costs
   
    if (orders > 0) {
      if (rate) {
          category: 'F
          descripti
          unit_rate: rate.base_rate,
        })
    }



      const rate = findBestRate(ra
        lines.push({
          service_code: 'STOR_SQFT',
          quantity: sq_ft,
          extended_cost: sq_ft * rate.base_rate
      }
  
  // Calculate VAS costs

      if (vasOption) {
          category: 'VAS',
          description: vasOption.description,
          unit_rate: vasOption.base_rate,
        })
    }

  const subtotals = calculateSubt
  // Apply d
  


    total: subtotals.total_dis

  const response: QuoteResponse = {
    version_id: request.version_id,
    effective_date: request.effective_date,
    lanes: {
    },
    subtotals,
    totals

  if (discou

      savings_perc
 


























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