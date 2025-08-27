/**
 * Quote Service - Handles logistics pricing calculations
exp

export interface BenchmarkRate {
  service_type: string
  unit_type: string
  origin_state?: string
}
export interface ValueAd
  description: string
  base_rate: number
  effective_end_date: string

  category: string
  description: string
 


  receiving: number
  storage: number
  total_discountabl
}
export interface QuoteDiscount
  amount: number
 

  before_discounts: number
  total: number

  version_id: string
  effective_date: 
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
      base_rate: 
      effective_en
    {
   
      destinatio
      effective_s
    },
      service_type:
   
      base_ra
      effective_e
  ]

async function loadVA
    {
      description: 
      base_rate: 0.50
      effective_end_
    {
     
      base_rate
      effective_end_da
  ]

 * Find the best 
function findBestRate(
  serviceType: string,
  dest
  r
    rate.origin_count
  ) || null

 * Add receiving line i
func
  input: QuoteRequest,
)

  const rate = findBestRate(rate
  if (pallets > 0 
      category: 'Rec
      description: 'P
      unit_rate: rate.ba
      discountable: tr
  }
  if (cartons > 0 &&
   
      description: 'Cart
      unit_rate: rate.base_
      discountable: true
  }

 * Add fulfillment line it
const addFulfillmentLines = (
  i
)

  const rate = findBestRate(rates, 'fulfillment', input.origin, input.d
  if (orders > 0 && rate) {
      cate
     
      unit_rate: rate.base_rate,
      discountable: true
  }

 * Add storage line ite
function addStorageLines(
  input: QuoteRequest,
) {

  const rate = findBestRate(rates,
  if (pallets > 0 && rate
      category: 'Storage',
      description: 'Pallet Stora
      unit_rate: rate.
      discountable: true
  }

 * Ad
function addVASLines(
  input: QuoteRequest,
) {

    const vasOption = v
      lines.push({
        service_code: vasOption.servic
     
   
 


 * Calculate subtotals by category
function c
    r
    storage: 0,
    total_discountable: 0,
  }
  lines.forEach(line =
      case 'Receiving':
        break
      
     
        break
        subtotals.vas += line.exten
    }
    if (line.discounta
    } else {
    }

}
/

  l
): { discountsApplied: QuoteDiscount[], totalDiscount: number } 
  
    .filter(line => li


  for (const discount of requeste

    
      type: discount.type,
      description: discount.description,
    })
    remainingDiscountableAmount -= appliedAmount

 

   
    )
   
      amount: discount.amou
      applied_to_amount: 

  }
  c
  return { discountsApplied, totalDisco

 * Generate a pricing quote based on input parameters
export async function priceQuote(input: QuoteRequest): Promise<QuoteResponse> {


  const lines: Q
  // 3. Line Item Calculatio
  addFulfillmentLines(lines, inpu
  addVASLines(lines, input, vasCatalog
  // 4. Subtotal Calcula

  const discountResults = input.discounts && i
    : { discountsApplied
  cons
  /

  const totals: QuoteTotals 
    discount_amo
  }
  // 7. Return Statement
    quote_id: `QT-${Date.now()}`,
    customer_id: input.c
    generated_at: new Date().toISOString(),
      outbound: `${input.origin.state || input.origin.
    lines,
    di
  }
 

   
      savings_percentage: sav
  }
  return response



























































































        break

        subtotals.fulfillment += line.extended_cost

      case 'Storage':

        break


        break









  return subtotals





function applyDiscounts(




  
  const discountableSubtotal = lines










    



























































  const totalDiscount = discountResults.totalDiscount








    total: grandTotal





    version_id: input.version_id,

    effective_date: input.effective_date,

    lanes: {

    },









    const savingsPercentage = (savingsAmount / input.competitorBaseline) * 100




  }

  return response
