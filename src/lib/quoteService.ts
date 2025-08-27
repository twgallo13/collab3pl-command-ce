/**
 * Quote Service - Handles logistics pricing calculations


  origin_zip3?: string
  origin_country: string
  destination_state?: 
  base_rate: number
  effective_end_date: 

  service_code: string
  unit_type: string
  effective_start_date: stri
}
export interface Qu
  service_code: string
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
  origin: {
    state?: string
  }
    zip3?: string
 

      pallets?: number
      pieces?: numb
    fulfillment?: {
      lines?: num
    }
      pallets?: numb
    }
      service_code: string
 

    amount: number
  }>
}
export interface Quot
  version_id: string
 

  }
  subtotals: QuoteSubtot
  totals: Quote
 


async function loadB
    {
      unit_type: 'pallet
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
        extended_cost: pallets *
      })
  }
  if (cartons > 0) {
    if
     
        description: 'Carton Rec
        unit_rate: rate.ba
        discountable: true
    }
}
/**
 */
  line
  rat
  if (!input.services.fulfillment)
  const { orders = 0, lin
  if (orders > 0) {
    if (rate) {
        category: 'Ful
        description: 'Order Fulfillment',
        unit_rate: rate.base_rate,
      
    }
}
/**
 */
  lines: QuoteLineItem[],
  rates: BenchmarkRate
  if (!input.services.storage) return
  const { pallets = 0, sq_ft = 0 } = i
  if 
   
 

        unit_rate: rate.base_rate,
        discountable: true
    }
}
/**
 */
  lines: QuoteLineItem[],
  vasCatalog: ValueAdd
  if (!input.services.vas) return
  for (const vasRequest of input.servi
    if
     
        description: vasOption.d
        unit_rate: vasOption.base_rate,
        discountable: tru
    }
}
/**
 */
  l
 

}
/**
 */
  const subtotals: QuoteSubtotals =
    fulfillment: 0,
   
    total_discountable: 0
  }
  lines.forEach(line =
      case 'Receivi
        break
        subtotals.fulfillment += line.extended_cost
      case 'Storage':
        break
        subtotals.vas += line.extende
      case 'Surcharges':
        break
    
      subtotals.total_discountable += line.ext
   
  
  return subtotals

 * Apply discounts i
function applyDiscounts(
  requestedDiscounts: Array<{ type: 'fla
  const discountsApplied: QuoteDis
  
  const discountableSubtotal = lines
    .reduce((sum, line) 
  let remainingDiscountabl
  /
  
    return 0
  
    let appliedAmount 
    if (discount.type === 'flat'
    } else if (discount.type === 'percen
        (remainingDiscountableAmou
      )
    
      discountsApplied.pu
        amount: discount.amoun
        applied_to_amoun
      
   
  
  return { discountsApplie


exp
  const rates = await loadBenchmarkRates
  
  const lines: QuoteLi
  // 3. Line Item Calcula
  addFulfillment(lines
  addVas(lines, input, v
  
  const subtotals = calculateSubtotals(
  
  
  
    : { discountsApp
  const totalDiscount = discountResults.totalDiscount
  
  const grandTotal
  const totals: QuoteTotals = 
    total: grandTotal
  
  const response: QuoteRes
    version_id: input.version_id,
    effective_date: input.effective_date,
    lanes: {
    },
    s
   
  
  if (input.competit
    const savingsPercentage = (savingsAmount / input.competitorBaseline) * 100
    response.co
      savings_perc
  }
  return response











































































































































































































































































