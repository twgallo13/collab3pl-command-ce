/**
 * Invoice calculation service for the Collab3PL billing system
 * Implements financial calculation rules from section B.3 of the collab3pl V9.5 Final document
 */

import { LineItem, Discount } from '@/types/invoices'

export interface InvoiceCalculationInput {
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

export interface DiscountApplied {
  id: string
  type: 'flat' | 'percentage'
  description: string
  applyTo: string
  originalAmount: number
  appliedAmount: number
}

export interface InvoiceCalculationResult {
  subtotals: {
    discountableSubtotal: number
    nonDiscountableSubtotal: number
    beforeDiscounts: number
  }
  discountsApplied: DiscountApplied[]
  totals: {
    afterDiscounts: number
    taxes: number
    grandTotal: number
  }
}

export class InvoiceService {
  /**
   * Calculates all financial aspects of an invoice including subtotals, discounts, taxes, and grand total
   * Implements the business rules from section B.3 of the specification
   */
  static calculateInvoiceTotals(input: InvoiceCalculationInput): InvoiceCalculationResult {
    // Step 1: Calculate subtotals from line items
    const subtotals = this.calculateSubtotals(input.lineItems)

    // Step 2: Apply discounts in the correct order (flat first, then percentage)
    const discountsApplied = this.applyDiscounts(input.lineItems, input.discounts, subtotals.discountableSubtotal)

    // Step 3: Calculate total discount amount
    const totalDiscountAmount = discountsApplied.reduce((sum, discount) => sum + discount.appliedAmount, 0)

    // Step 4: Calculate after-discount total
    const afterDiscounts = Math.max(0, subtotals.discountableSubtotal - totalDiscountAmount) + subtotals.nonDiscountableSubtotal

    // Step 5: Calculate taxes based on specified basis
    const taxBasis = input.tax.basis === 'subtotal' ? subtotals.beforeDiscounts : afterDiscounts
    const taxes = input.tax.enabled ? (taxBasis * input.tax.rate / 100) : 0

    // Step 6: Calculate grand total with rounding
    const preRoundingGrandTotal = afterDiscounts + taxes
    const grandTotal = this.applyRounding(preRoundingGrandTotal, input.rounding)

    return {
      subtotals,
      discountsApplied,
      totals: {
        afterDiscounts: this.applyRounding(afterDiscounts, input.rounding),
        taxes: this.applyRounding(taxes, input.rounding),
        grandTotal
      }
    }
  }

  /**
   * Calculates subtotals from line items, separating discountable and non-discountable amounts
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
   * Applies discounts according to business rules:
   * 1. Flat discounts applied first
   * 2. Percentage discounts applied second
   * 3. Total discount cannot exceed discountable subtotal
   * 4. Respects applyTo scope restrictions
   */
  private static applyDiscounts(
    lineItems: LineItem[], 
    discounts: Discount[], 
    discountableSubtotal: number
  ): DiscountApplied[] {
    const discountsApplied: DiscountApplied[] = []
    let remainingDiscountableAmount = discountableSubtotal

    // Sort discounts: flat discounts first, then percentage discounts
    const sortedDiscounts = [...discounts].sort((a, b) => {
      if (a.type === 'flat' && b.type === 'percentage') return -1
      if (a.type === 'percentage' && b.type === 'flat') return 1
      return 0
    })

    for (const discount of sortedDiscounts) {
      // Calculate eligible amount based on applyTo scope
      const eligibleAmount = this.calculateEligibleDiscountAmount(lineItems, discount.applyTo)
      
      // Skip if no eligible amount or no remaining discountable amount
      if (eligibleAmount <= 0 || remainingDiscountableAmount <= 0) {
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
        // Flat discount: apply the fixed amount, limited by eligible and remaining amounts
        appliedAmount = Math.min(discount.amount, eligibleAmount, remainingDiscountableAmount)
      } else if (discount.type === 'percentage') {
        // Percentage discount: apply percentage to eligible amount, limited by remaining amount
        const percentageAmount = eligibleAmount * (discount.amount / 100)
        appliedAmount = Math.min(percentageAmount, remainingDiscountableAmount)
      }

      // Update remaining discountable amount
      remainingDiscountableAmount = Math.max(0, remainingDiscountableAmount - appliedAmount)

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
   * Calculates the eligible amount for discount application based on the applyTo scope
   */
  private static calculateEligibleDiscountAmount(lineItems: LineItem[], applyTo: string): number {
    if (applyTo === 'all') {
      return lineItems
        .filter(item => item.discountable)
        .reduce((sum, item) => sum + item.extendedCost, 0)
    }

    // Category-specific discounts
    return lineItems
      .filter(item => item.discountable && item.category === applyTo)
      .reduce((sum, item) => sum + item.extendedCost, 0)
  }

  /**
   * Applies rounding rules to a monetary value
   */
  private static applyRounding(value: number, rounding: { mode: string; precision: number }): number {
    const factor = Math.pow(10, rounding.precision)
    
    switch (rounding.mode) {
      case 'up':
        return Math.ceil(value * factor) / factor
      case 'down':
        return Math.floor(value * factor) / factor
      case 'standard':
      default:
        return Math.round(value * factor) / factor
    }
  }

  /**
   * Helper function to validate invoice calculation inputs
   */
  static validateCalculationInput(input: InvoiceCalculationInput): string[] {
    const errors: string[] = []

    if (!input.lineItems || input.lineItems.length === 0) {
      errors.push('Line items are required')
    }

    if (input.lineItems) {
      input.lineItems.forEach((item, index) => {
        if (item.quantity <= 0) {
          errors.push(`Line item ${index + 1}: Quantity must be positive`)
        }
        if (item.unitRate < 0) {
          errors.push(`Line item ${index + 1}: Unit rate cannot be negative`)
        }
        if (Math.abs(item.extendedCost - (item.quantity * item.unitRate)) > 0.01) {
          errors.push(`Line item ${index + 1}: Extended cost does not match quantity × unit rate`)
        }
      })
    }

    if (input.discounts) {
      input.discounts.forEach((discount, index) => {
        if (discount.amount < 0) {
          errors.push(`Discount ${index + 1}: Amount cannot be negative`)
        }
        if (discount.type === 'percentage' && discount.amount > 100) {
          errors.push(`Discount ${index + 1}: Percentage discount cannot exceed 100%`)
        }
      })
    }

    if (input.tax.enabled && (input.tax.rate < 0 || input.tax.rate > 100)) {
      errors.push('Tax rate must be between 0 and 100')
    }

    if (input.rounding.precision < 0 || input.rounding.precision > 4) {
      errors.push('Rounding precision must be between 0 and 4 decimal places')
    }

    return errors
  }
}