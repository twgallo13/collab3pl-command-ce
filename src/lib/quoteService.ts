/**
 * Quote Service - Handles logistics pricing calculations

exp

// Core data interfaces
export interface BenchmarkRate {
  service_type: string
  unit_type: string
  base_rate: number
  destination_country:
  origin_state?: string
}
  destination_zip3?: string
  destination_state?: string
  destination_country: string
  effective_start_date: string
  effective_end_date: string


  description: string
}
export interface Quot
  fulfillment: numb
  vas: number
  total_discountabl
}

  total: number

  savings_amount: numb
}
export interface Q
  customer_id: stri
  origin: {
 

    zip3?: string
    country: string
  services: {
      pallets?: numbe
      pieces?: number
 

    }
      pallets?: num
    }
      service_cod
    }>
  discounts?: Array<
    amount: number
  }>


  customer_id: string
  generated_at: string
    outbound: s
 

  comparison?: QuoteComparison

async function loadBenchmark
 

      origin_country: 'US',
      destination_co
      effective_start
    },
      servi
      base_rate: 
      origin_state
      destination_s
   
    {
      unit_type: 
      origin_count
      effective_sta
   
}
// Simulate loadi
  return [
      service_code: 'L
      unit_type: 'pie
     
    {
      description: 'G
      category: 'VAS
    }
}
/**
 * 1. ZIP3 match (high
 * 3. Country match 
funct
  serviceType: st
  origin: { zip3?: string;
): BenchmarkRate | nul
  let 
   
           rate.desti
  if (bestMatch) return bestMat
  // Priority 2: S
    return rate.service
    
 


  bestMatch = rate
           rate.unit
           rate.desti
           !rate.origin_
           !rate.desti

}
/**
 */
  const subtotals: QuoteSub
    fulfillment: 0,
    vas: 0,
    total_discountable: 0,
 

      case 'Receiving':
        break
        su
    {
        break
      unit_type: 'pallet',
      case 'Surcharges'
        break
    
    subtotals.total_discountable

}
/**
    },
    {
): { discountsApplied: QuoteDiscou
  let remainingDiscountab

  const sortedDiscounts = [
    if (a.type === 'perce
  })
  for (const discount of sorte

      appliedAmount = Math.min(discoun
      
    {
    }
    if (appliedAmount > 0
        type: discount
        description: discou
      })
      remainingDiscountableAmount -= appl
    }

}
/

  // Load benchmark data
  const vasOptions = await loadValueAddedOptions()
  return [
    {
    const { pallets = 0, cartons =
    if (pallets > 0) {
      if (rate) {
          category: 'R
          description
    },
     
    }
    if (cartons > 0) {
      // Use pallet rate 
      if (fallbackRate
        lines.push({
    }
   
 

  }
  // Calculate fulfillment costs
    const { orders = 0, lines: orde
    if (orders > 0) {
      if (rate) {
 */
          description:
          unit_rate: rate
        })
  unitType: string,

  if (request.services.storage) {

      const rate = findBest
  let bestMatch = rates.find(rate => {
    return rate.service_type === serviceType &&
           rate.unit_type === unitType &&
           rate.origin_zip3 === origin.zip3 &&
           rate.destination_zip3 === destination.zip3
  })
  // Calculate VAS costs

      if (vasOption) {
  bestMatch = rates.find(rate => {
    return rate.service_type === serviceType &&
           rate.unit_type === unitType &&
           rate.origin_state === origin.state &&
           rate.destination_state === destination.state &&
           !rate.origin_zip3 &&
           !rate.destination_zip3
  })
    ? applyDiscounts(subtotals, r

  const totals: QuoteTotals = 
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

    response.comparison = 
}

  r




    receiving: 0,

    storage: 0,

    surcharges: 0,









      case 'Fulfillment':

        break

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