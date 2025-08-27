/**
 * Invoice Service - Financial calculation engine for invoices
 * Implements business rules from section B.3 of the collab3pl V9.5 Final document
 */

import { LineItem, Discount, Invoice } from '@/types/invoices'

export interface CalculationInput {
  lineItems: LineItem[]
  discounts: Discount[]
  tax: {
    enabled: boolean
    rate: number // percentage
    basis: 'subtotal' | 'discounted_subtotal'
  }
  rounding: {
    mode: 'standard' | 'up' | 'down'
    precision: number // decimal places
  }
}

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

export class InvoiceService {
  
  /**
   * Calculate all financial aspects of an invoice
   * Implements the calculation rules from section B.3
   */
  static calculateInvoiceTotals(input: CalculationInput): CalculationResult {
    // Step 1: Calculate Subtotals
    const subtotals = this.calculateSubtotals(input.lineItems)
    
    // Step 2: Apply Discounts (flat first, then percentage)
    const discountsApplied = this.applyDiscounts(
      input.lineItems,
      input.discounts,
      subtotals.discountableSubtotal
    )
    
    const totalDiscountAmount = discountsApplied.reduce(
      (sum, discount) => sum + discount.appliedAmount,
      0
    )
    
    // Step 3: Calculate after-discount total
    const afterDiscounts = Math.max(
      0,
      subtotals.discountableSubtotal - totalDiscountAmount
    ) + subtotals.nonDiscountableSubtotal
    
    // Step 4: Calculate Taxes
    const taxBasis = input.tax.basis === 'subtotal' 
      ? subtotals.beforeDiscounts 
      : afterDiscounts
    
    const taxes = input.tax.enabled 
      ? this.applyRounding(taxBasis * (input.tax.rate / 100), input.rounding)
      : 0
    
    // Step 5: Calculate Grand Total with rounding
    const grandTotal = this.applyRounding(afterDiscounts + taxes, input.rounding)
    
    return {
      subtotals,
      discountsApplied,
      totals: {
        afterDiscounts: this.applyRounding(afterDiscounts, input.rounding),
        taxes,
        grandTotal
      }
    }
  }
  
  /**
   * Calculate discountable, non-discountable, and total subtotals
   */
  private static calculateSubtotals(lineItems: LineItem[]) {
    let discountableSubtotal = 0
    let nonDiscountableSubtotal = 0
    
    for (const item of lineItems) {
      if (item.discountable) {
        discountableSubtotal += item.extendedCost
      } else {
        nonDiscountableSubtotal += item.extendedCost
      }
    }
    
    return {
      discountableSubtotal,
      nonDiscountableSubtotal,
      beforeDiscounts: discountableSubtotal + nonDiscountableSubtotal
    }
  }
  
  /**
   * Apply discounts with proper order of operations (flat first, then percentage)
   * and scope filtering (all, category-specific, etc.)
   */
  private static applyDiscounts(
    lineItems: LineItem[],
    discounts: Discount[],
    discountableSubtotal: number
  ) {
    const discountsApplied: Array<{
      id: string
      type: 'flat' | 'percentage'
      description: string
      applyTo: string
      originalAmount: number
      appliedAmount: number
    }> = []
    
    // Sort discounts: flat first, then percentage
    const sortedDiscounts = [...discounts].sort((a, b) => {
      if (a.type === 'flat' && b.type === 'percentage') return -1
      if (a.type === 'percentage' && b.type === 'flat') return 1
      return 0
    })
    
    let remainingDiscountableAmount = discountableSubtotal
    
    for (const discount of sortedDiscounts) {
      // Calculate the base amount this discount applies to
      const applicableAmount = this.calculateApplicableAmount(
        lineItems,
        discount.applyTo,
        remainingDiscountableAmount
      )
      
      if (applicableAmount <= 0) {
        // No applicable amount, skip this discount
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
        // Flat discount: apply the lesser of discount amount or applicable amount
        appliedAmount = Math.min(discount.amount, applicableAmount)
      } else if (discount.type === 'percentage') {
        // Percentage discount: apply percentage to applicable amount
        appliedAmount = applicableAmount * (discount.amount / 100)
      }
      
      // Ensure we don't exceed the remaining discountable amount
      appliedAmount = Math.min(appliedAmount, remainingDiscountableAmount)
      
      discountsApplied.push({
        id: discount.id,
        type: discount.type,
        description: discount.description,
        applyTo: discount.applyTo,
        originalAmount: discount.amount,
        appliedAmount
      })
      
      // Reduce the remaining discountable amount
      remainingDiscountableAmount -= appliedAmount
      
      // Stop if we've exhausted all discountable amount
      if (remainingDiscountableAmount <= 0) {
        break
      }
    }
    
    return discountsApplied
  }
  
  /**
   * Calculate the amount a discount applies to based on its scope
   */
  private static calculateApplicableAmount(
    lineItems: LineItem[],
    applyTo: string,
    remainingDiscountableAmount: number
  ): number {
    if (applyTo === 'all') {
      return remainingDiscountableAmount
    }
    
    // Category-specific discounts
    const categoryLineItems = lineItems.filter(
      item => item.discountable && item.category === applyTo
    )
    
    const categoryAmount = categoryLineItems.reduce(
      (sum, item) => sum + item.extendedCost,
      0
    )
    
    // Return the lesser of category amount or remaining discountable amount
    return Math.min(categoryAmount, remainingDiscountableAmount)
  }
  
  /**
   * Apply rounding rules to a monetary amount
   */
  private static applyRounding(
    amount: number,
    rounding: { mode: 'standard' | 'up' | 'down'; precision: number }
  ): number {
    const factor = Math.pow(10, rounding.precision)
    
    switch (rounding.mode) {
      case 'up':
        return Math.ceil(amount * factor) / factor
      case 'down':
        return Math.floor(amount * factor) / factor
      case 'standard':
      default:
        return Math.round(amount * factor) / factor
    }
  }
  
  /**
   * Helper method to validate line items before calculation
   */
  static validateLineItems(lineItems: LineItem[]): string[] {
    const errors: string[] = []
    
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i]
      
      if (!item.id) {
        errors.push(`Line item ${i + 1}: Missing ID`)
      }
      
      if (item.quantity <= 0) {
        errors.push(`Line item ${i + 1}: Quantity must be positive`)
      }
      
      if (item.unitRate < 0) {
        errors.push(`Line item ${i + 1}: Unit rate cannot be negative`)
      }
      
      if (Math.abs(item.extendedCost - (item.quantity * item.unitRate)) > 0.01) {
        errors.push(`Line item ${i + 1}: Extended cost does not match quantity × unit rate`)
      }
      
      if (!['receiving', 'fulfillment', 'storage', 'vas', 'surcharges'].includes(item.category)) {
        errors.push(`Line item ${i + 1}: Invalid category '${item.category}'`)
      }
    }
    
    return errors
  }
  
  /**
   * Helper method to validate discounts before calculation
   */
  static validateDiscounts(discounts: Discount[]): string[] {
    const errors: string[] = []
    
    for (let i = 0; i < discounts.length; i++) {
      const discount = discounts[i]
      
      if (!discount.id) {
        errors.push(`Discount ${i + 1}: Missing ID`)
      }
      
      if (discount.amount <= 0) {
        errors.push(`Discount ${i + 1}: Amount must be positive`)
      }
      
      if (discount.type === 'percentage' && discount.amount > 100) {
        errors.push(`Discount ${i + 1}: Percentage cannot exceed 100%`)
      }
      
      if (!['flat', 'percentage'].includes(discount.type)) {
        errors.push(`Discount ${i + 1}: Invalid type '${discount.type}'`)
      }
      
      const validApplyTo = ['all', 'receiving', 'fulfillment', 'storage', 'vas', 'surcharges']
      if (!validApplyTo.includes(discount.applyTo)) {
        errors.push(`Discount ${i + 1}: Invalid applyTo scope '${discount.applyTo}'`)
      }
    }
    
    return errors
  }
}