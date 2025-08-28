/**
 * Invoice Service - Financial calculation engine for invoices
 */

import { LineItem, Discount, Invoice } from '@/types/invoices'

export interface CalculationInput {
  lineItems: LineItem[]
  discounts: Discount[]
  tax: {
    enabled: boolean
    rate: number
    basis: 'discounted_subtotal' | 'subtotal'
  }
  rounding: {
    mode: 'round' | 'up' | 'down'
    precision: number
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
   * Main calculation function that processes line items, discounts, taxes, and rounding
   */
  static calculateInvoiceTotals(input: CalculationInput): CalculationResult {
    // Step 1: Calculate subtotals
    const subtotals = this.calculateSubtotals(input.lineItems)
    
    // Step 2: Apply discounts
    const discountsApplied = this.applyDiscounts(
      input.lineItems,
      input.discounts,
      subtotals.discountableSubtotal
    )
    
    // Step 3: Calculate after-discount amounts
    const totalDiscountAmount = discountsApplied.reduce((sum, d) => sum + d.appliedAmount, 0)
    const afterDiscounts = subtotals.discountableSubtotal - totalDiscountAmount + subtotals.nonDiscountableSubtotal
    
    // Step 4: Calculate taxes
    const taxBasis = input.tax.basis === 'discounted_subtotal' ? afterDiscounts : subtotals.beforeDiscounts
    const taxes = input.tax.enabled ? (taxBasis * input.tax.rate / 100) : 0
    
    // Step 5: Calculate grand total with rounding
    const grandTotal = this.applyRounding(afterDiscounts + taxes, input.rounding)
    
    return {
      subtotals,
      discountsApplied,
      totals: {
        afterDiscounts,
        taxes,
        grandTotal
      }
    }
  }

  /**
   * Calculate discountable and non-discountable subtotals
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
   * Apply discounts according to business rules
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
      const applicableAmount = this.calculateApplicableAmount(
        lineItems,
        discount.applyTo,
        remainingDiscountableAmount
      )

      if (applicableAmount <= 0) {
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
        // Flat discount: apply the full amount up to applicable amount
        appliedAmount = Math.min(discount.amount, applicableAmount)
      } else if (discount.type === 'percentage') {
        // Percentage discount: apply percentage of applicable amount
        appliedAmount = (applicableAmount * discount.amount) / 100
      }

      // Ensure we don't exceed remaining discountable amount
      appliedAmount = Math.min(appliedAmount, remainingDiscountableAmount)

      discountsApplied.push({
        id: discount.id,
        type: discount.type,
        description: discount.description,
        applyTo: discount.applyTo,
        originalAmount: discount.amount,
        appliedAmount
      })

      remainingDiscountableAmount -= appliedAmount

      // Stop if we've exhausted all discountable amount
      if (remainingDiscountableAmount <= 0) break
    }

    return discountsApplied
  }

  /**
   * Calculate the amount to which a discount can be applied
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
    const categoryPrefix = 'category:'
    if (applyTo.startsWith(categoryPrefix)) {
      const category = applyTo.substring(categoryPrefix.length)
      const categoryAmount = lineItems
        .filter(item => item.category === category && item.discountable)
        .reduce((sum, item) => sum + item.extendedCost, 0)
      
      return Math.min(categoryAmount, remainingDiscountableAmount)
    }

    // Non-surcharges scope
    if (applyTo === 'non_surcharges') {
      const nonSurchargeAmount = lineItems
        .filter(item => item.category !== 'surcharges' && item.discountable)
        .reduce((sum, item) => sum + item.extendedCost, 0)
      
      return Math.min(nonSurchargeAmount, remainingDiscountableAmount)
    }

    return 0
  }

  /**
   * Apply rounding rules to final amount
   */
  private static applyRounding(
    amount: number,
    rounding: { mode: 'round' | 'up' | 'down'; precision: number }
  ): number {
    const factor = Math.pow(10, rounding.precision)
    
    switch (rounding.mode) {
      case 'up':
        return Math.ceil(amount * factor) / factor
      case 'down':
        return Math.floor(amount * factor) / factor
      case 'round':
      default:
        return Math.round(amount * factor) / factor
    }
  }
}