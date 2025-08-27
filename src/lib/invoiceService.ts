/**
 * Invoice Service - Financial calculation engine for invoices



import { LineItem, Discount, Invoice } from '@/types/invoices'

export interface CalculationInput {
  lineItems: LineItem[]
  discounts: Discount[]

  subtotals: {
    nonDiscountableSubtotal: n
  }
   
    descripti
    originalAmount: number
  }>
   
 

export interface CalculationResult {
  subtotals: {
    discountableSubtotal: number
    nonDiscountableSubtotal: number
    beforeDiscounts: number
  }
  discountsApplied: Array<{
    id: string
    type: 'flat' | 'percentage'
    description: string
    applyTo: string
    originalAmount: number
    appliedAmount: number
  }>
  totals: {
    afterDiscounts: number
    taxes: number
    grandTotal: number
  }
}

    
  
     
    }
  
   * 
  private static calculateSubtotals(lineItems: LineItem[]) {
    let nonDiscountableSubtotal = 
    for (const item of lineItems) {
    
        nonDiscountableSubtotal += item.extendedCost
    }
    return {
      nonDiscountableS
    }
  
   *
   */
    lineItems: LineItem[],
    dis
    c
    
      applyTo: string
      appliedAmount: number
    
    const sortedDiscounts = [...discounts].sort((a, b) => 
      if (a.type === 'percentage' && b.ty
    
    let remainingDiscountableA
    for (const discount of sortedDiscounts) {
      const applicableAmount = thi
        discount.apply
    
      if (applicableAmount <= 0) {
        discountsApplied.push({
         
    
          appliedAmount: 0
        continue
    
      
        // Flat 
      } else if (discou
        applied
      
      appliedA
      discountsApp
       
     
   
  
     
      // Stop if we've exhausted all discountable amount
     
    }
    return discountsApplied
  
   *
  private static calculateApplicabl
    applyTo: string,
  ): number {
      return r
    
    con
    )
    
      0
    
    return Math.min(categoryAm
  
   * 
  p
  
    c
    switch (rounding.mode) {
        return Math.ceil(amount * factor) / factor
     
      default:
    }
  
   * Helper method to validate l
  sta
    
      const item
      if (!item.id) {
      }
      if (item.quanti
      }
      if (item.unitRate < 0
      }
    
      }
      if (!['receiving', 'fulfillment', 'storage', 'vas', '
      }
    
  }
  /**
   *
    const errors: string[] = []
    
    for (const discount of sortedDiscounts) {
        errors.push(`Discount ${i + 1}: Missing ID`)
      
        errors.pus
      
        errors.push(`Discount ${i +
      
      
      
      if (!validApplyTo.includes(discount.applyTo))
        discountsApplied.push({
          id: discount.id,
          type: discount.type,
          description: discount.description,
          applyTo: discount.applyTo,
          originalAmount: discount.amount,
          appliedAmount: 0
        })
        continue
      }

      let appliedAmount = 0

      if (discount.type === 'flat') {


      } else if (discount.type === 'percentage') {


      }




      discountsApplied.push({
        id: discount.id,
        type: discount.type,
        description: discount.description,
        applyTo: discount.applyTo,
        originalAmount: discount.amount,
        appliedAmount
      })








    }

    return discountsApplied
  }

  /**

   */





    if (applyTo === 'all') {

    }

    // Category-specific discounts











  }

  /**

   */




    const factor = Math.pow(10, rounding.precision)
    
    switch (rounding.mode) {
      case 'up':

      case 'down':

      case 'standard':
      default:

    }
  }

  /**

   */

    const errors: string[] = []























    }

































    }

    return errors
  }
}