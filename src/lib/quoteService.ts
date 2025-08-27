/**
 * Quote service implementation based on section A.7 of the collab3pl V9.5 Final document
// 

// Type definitions for benchmark data
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
  quantity: number
 


  receiving: number
  storage: number
  surcharges: numbe
  total_non_discoun

 

}
export interface QuoteTotals {
  total_discount: 
}
export interface Quot
  savings_amount: 
}
export interface Qu
  version_id: string
  effective_date: strin
 

  subtotals: QuoteSubtotals
  totals: QuoteTota
}
export interface 
  customer_id
  origin: {
    state?: string
  }
 

  services: {
      pallets?: number
      pieces?: n
    fulfillment?: {
      lines?: number
 

    }
      service_code
    }>
  discounts?: A
 


async function loadBenchm
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
  unitType
    {
      service_type: 'receiving',
      unit_type: 'pallet',
      base_rate: 15.50,
      origin_country: 'US',
      destination_country: 'US',
      destination_state: 'CA',
  if (bestMatch) return bestMa
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    },
    r
      service_type: 'fulfillment',
      unit_type: 'order',
      base_rate: 2.75,
      origin_country: 'US',
      destination_country: 'US',
      destination_state: 'TX',
      destination_zip3: '750',
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    !r
    {
      service_type: 'storage',
      unit_type: 'sq_ft',
}
      origin_country: 'US',
      destination_country: 'US',
      effective_start_date: '2024-01-01',
      effective_end_date: '2024-12-31'
    }
   
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
      
    {
      service_code: 'GIFT_WRAP',
      description: 'Gift Wrapping',
      unit_type: 'piece',
      base_rate: 3.50,
      category: 'VAS'
    }
   
}

/**
 * Find the best matching rate using priority order:
 * 1. ZIP3 match (highest priority)
 * 2. State match 
 * 3. Country match (lowest priority)
): 
function findBestRate(
  rates: BenchmarkRate[],
  serviceType: string,
    if (a.type === 
  origin: { zip3?: string; state?: string; country: string },
  destination: { zip3?: string; state?: string; country: string }
): BenchmarkRate | null {
  // Priority 1: ZIP3 match
  let bestMatch = rates.find(rate =>
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_zip3 === origin.zip3 &&
    rate.destination_zip3 === destination.zip3
   

  if (bestMatch) return bestMatch

  // Priority 2: State match
  bestMatch = rates.find(rate =>
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_state === origin.state &&
    rate.destination_state === destination.state &&
    !rate.origin_zip3 &&
    !rate.destination_zip3
 */

  if (bestMatch) return bestMatch

  // Priority 3: Country match
  bestMatch = rates.find(rate =>
    rate.service_type === serviceType &&
    rate.unit_type === unitType &&
    rate.origin_country === origin.country &&
    rate.destination_country === destination.country &&
    !rate.origin_zip3 &&
    !rate.origin_state &&
    !rate.destination_zip3 &&
    !rate.destination_state
   

  return bestMatch || null
}

/**
 * Calculate subtotals by category
 */
function calculateSubtotals(lines: QuoteLineItem[]): QuoteSubtotals {
  const subtotals: QuoteSubtotals = {
            categ
    fulfillment: 0,
            qua
    vas: 0,
            extend
    total_discountable: 0,
    total_non_discountable: 0
  }

  lines.forEach(line => {
    switch (line.category) {
      case 'Receiving':
        subtotals.receiving += line.extended_cost
        break
            category: 'St
        subtotals.fulfillment += line.extended_cost
            q
      case 'Storage':



























































































































































































































