import { 
  BenchmarkRate, 
  ValueAddedOption, 
  CategoryMapping, 
  IndustrySource, 
  RegionMapping 
} from '../benchmarks';

/**
 * Validation result structure for CSV data validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowsProcessed: number;
  validRows: number;
  invalidRows: number;
}

/**
 * Expected CSV headers for each data type
 */
export const REQUIRED_HEADERS = {
  benchmarkRates: [
    'id', 'serviceType', 'rateType', 'baseRate', 'currency', 
    'effectiveDate', 'regionCode', 'industryCode', 'isActive'
  ],
  valueAddedOptions: [
    'id', 'serviceCode', 'serviceName', 'description', 'category',
    'baseRate', 'rateType', 'skillLevel', 'estimatedHours', 'isActive'
  ],
  categoryMappings: [
    'id', 'categoryCode', 'categoryName', 'description', 'serviceTypes',
    'benchmarkMultiplier', 'complexityFactor', 'riskFactor', 'isActive'
  ],
  industrySources: [
    'id', 'industryCode', 'industryName', 'description', 'sector',
    'laborMultiplier', 'equipmentMultiplier', 'spaceMultiplier', 'isActive'
  ],
  regionMappings: [
    'id', 'regionCode', 'regionName', 'country', 'timezone',
    'laborCostIndex', 'realEstateCostIndex', 'averageWageRate', 'isActive'
  ]
} as const;

/**
 * Service class for validating benchmark data from CSV imports
 */
export class ValidationService {
  
  /**
   * Validates that all required CSV headers are present
   */
  static validateHeaders(
    headers: string[], 
    dataType: keyof typeof REQUIRED_HEADERS
  ): ValidationResult {
    const requiredHeaders = REQUIRED_HEADERS[dataType];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    const extraHeaders = headers.filter(header => !requiredHeaders.includes(header));
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    if (extraHeaders.length > 0) {
      warnings.push(`Extra headers found (will be ignored): ${extraHeaders.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowsProcessed: 0,
      validRows: 0,
      invalidRows: 0
    };
  }

  /**
   * Validates data types for CSV row data
   */
  static validateDataTypes(
    rowData: Record<string, any>, 
    rowNumber: number,
    dataType: keyof typeof REQUIRED_HEADERS
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Common validations for all data types
    this.validateCommonFields(rowData, rowNumber, errors, warnings);

    // Type-specific validations
    switch (dataType) {
      case 'benchmarkRates':
        this.validateBenchmarkRateTypes(rowData, rowNumber, errors, warnings);
        break;
      case 'valueAddedOptions':
        this.validateValueAddedOptionTypes(rowData, rowNumber, errors, warnings);
        break;
      case 'categoryMappings':
        this.validateCategoryMappingTypes(rowData, rowNumber, errors, warnings);
        break;
      case 'industrySources':
        this.validateIndustrySourceTypes(rowData, rowNumber, errors, warnings);
        break;
      case 'regionMappings':
        this.validateRegionMappingTypes(rowData, rowNumber, errors, warnings);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowsProcessed: 1,
      validRows: errors.length === 0 ? 1 : 0,
      invalidRows: errors.length > 0 ? 1 : 0
    };
  }

  /**
   * Validates common fields present in all data types
   */
  private static validateCommonFields(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validate ID field
    if (!rowData.id || typeof rowData.id !== 'string' || rowData.id.trim() === '') {
      errors.push(`Row ${rowNumber} — ID is required and must be a non-empty string`);
    }

    // Validate isActive field
    if (rowData.isActive !== undefined) {
      const isActiveLower = String(rowData.isActive).toLowerCase();
      if (!['true', 'false', '1', '0'].includes(isActiveLower)) {
        errors.push(`Row ${rowNumber} — isActive must be true/false or 1/0`);
      }
    }

    // Validate timestamp fields if present
    if (rowData.createdAt && !this.isValidISODate(rowData.createdAt)) {
      errors.push(`Row ${rowNumber} — createdAt must be in ISO YYYY-MM-DD format`);
    }
    
    if (rowData.updatedAt && !this.isValidISODate(rowData.updatedAt)) {
      errors.push(`Row ${rowNumber} — updatedAt must be in ISO YYYY-MM-DD format`);
    }
  }

  /**
   * Validates benchmark rate specific data types
   */
  private static validateBenchmarkRateTypes(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validate rate type
    const validRateTypes = ['per_unit', 'per_hour', 'per_pallet', 'per_order', 'percentage'];
    if (rowData.rateType && !validRateTypes.includes(rowData.rateType)) {
      errors.push(`Row ${rowNumber} — rateType must be one of: ${validRateTypes.join(', ')}`);
    }

    // Validate base rate (monetary value to 4 decimal places)
    if (rowData.baseRate !== undefined) {
      const rate = parseFloat(rowData.baseRate);
      if (isNaN(rate) || rate < 0) {
        errors.push(`Row ${rowNumber} — baseRate must be a positive number`);
      } else if (!this.isValidMonetaryValue(rowData.baseRate)) {
        errors.push(`Row ${rowNumber} — baseRate must be accurate to 4 decimal places`);
      }
    }

    // Validate currency code
    if (rowData.currency && !/^[A-Z]{3}$/.test(rowData.currency)) {
      warnings.push(`Row ${rowNumber} — currency should be a 3-letter ISO code (e.g., USD)`);
    }

    // Validate dates
    if (rowData.effectiveDate && !this.isValidISODate(rowData.effectiveDate)) {
      errors.push(`Row ${rowNumber} — effectiveDate must be in ISO YYYY-MM-DD format`);
    }
    
    if (rowData.expirationDate && !this.isValidISODate(rowData.expirationDate)) {
      errors.push(`Row ${rowNumber} — expirationDate must be in ISO YYYY-MM-DD format`);
    }
  }

  /**
   * Validates value-added option specific data types
   */
  private static validateValueAddedOptionTypes(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validate category
    const validCategories = ['packaging', 'labeling', 'kitting', 'quality_control', 'special_handling'];
    if (rowData.category && !validCategories.includes(rowData.category)) {
      errors.push(`Row ${rowNumber} — category must be one of: ${validCategories.join(', ')}`);
    }

    // Validate skill level
    const validSkillLevels = ['basic', 'intermediate', 'advanced', 'specialized'];
    if (rowData.skillLevel && !validSkillLevels.includes(rowData.skillLevel)) {
      errors.push(`Row ${rowNumber} — skillLevel must be one of: ${validSkillLevels.join(', ')}`);
    }

    // Validate estimated hours
    if (rowData.estimatedHours !== undefined) {
      const hours = parseFloat(rowData.estimatedHours);
      if (isNaN(hours) || hours < 0) {
        errors.push(`Row ${rowNumber} — estimatedHours must be a positive number`);
      }
    }
  }

  /**
   * Validates category mapping specific data types
   */
  private static validateCategoryMappingTypes(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validate multiplier fields
    const multiplierFields = ['benchmarkMultiplier', 'complexityFactor', 'riskFactor'];
    multiplierFields.forEach(field => {
      if (rowData[field] !== undefined) {
        const value = parseFloat(rowData[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`Row ${rowNumber} — ${field} must be a positive number`);
        }
      }
    });

    // Validate service types (should be comma-separated list)
    if (rowData.serviceTypes && typeof rowData.serviceTypes === 'string') {
      const serviceTypes = rowData.serviceTypes.split(',').map((s: string) => s.trim());
      if (serviceTypes.some((type: string) => type === '')) {
        warnings.push(`Row ${rowNumber} — serviceTypes contains empty values`);
      }
    }
  }

  /**
   * Validates industry source specific data types
   */
  private static validateIndustrySourceTypes(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validate multiplier fields
    const multiplierFields = ['laborMultiplier', 'equipmentMultiplier', 'spaceMultiplier'];
    multiplierFields.forEach(field => {
      if (rowData[field] !== undefined) {
        const value = parseFloat(rowData[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`Row ${rowNumber} — ${field} must be a positive number`);
        }
      }
    });

    // Validate NAICS code format if present
    if (rowData.naicsCode && !/^\d{2,6}$/.test(rowData.naicsCode)) {
      warnings.push(`Row ${rowNumber} — naicsCode should be 2-6 digits`);
    }

    // Validate SIC code format if present
    if (rowData.sicCode && !/^\d{4}$/.test(rowData.sicCode)) {
      warnings.push(`Row ${rowNumber} — sicCode should be 4 digits`);
    }
  }

  /**
   * Validates region mapping specific data types
   */
  private static validateRegionMappingTypes(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validate cost index fields
    const indexFields = ['laborCostIndex', 'realEstateCostIndex'];
    indexFields.forEach(field => {
      if (rowData[field] !== undefined) {
        const value = parseFloat(rowData[field]);
        if (isNaN(value) || value < 0) {
          errors.push(`Row ${rowNumber} — ${field} must be a positive number`);
        }
      }
    });

    // Validate average wage rate
    if (rowData.averageWageRate !== undefined) {
      const rate = parseFloat(rowData.averageWageRate);
      if (isNaN(rate) || rate < 0) {
        errors.push(`Row ${rowNumber} — averageWageRate must be a positive number`);
      } else if (!this.isValidMonetaryValue(rowData.averageWageRate)) {
        errors.push(`Row ${rowNumber} — averageWageRate must be accurate to 4 decimal places`);
      }
    }

    // Validate timezone format
    if (rowData.timezone && !/^[A-Za-z]+\/[A-Za-z_]+$/.test(rowData.timezone)) {
      warnings.push(`Row ${rowNumber} — timezone should be in format 'Region/City' (e.g., 'America/New_York')`);
    }
  }

  /**
   * Enforces business rules for data consistency
   */
  static validateBusinessRules(
    rowData: Record<string, any>, 
    rowNumber: number,
    dataType: keyof typeof REQUIRED_HEADERS
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Common business rule: effective dates
    if (rowData.effectiveDate && rowData.expirationDate) {
      const startDate = new Date(rowData.effectiveDate);
      const endDate = new Date(rowData.expirationDate);
      
      if (endDate < startDate) {
        errors.push(`Row ${rowNumber} — End date is before start date`);
      }
    }

    // Future date validation for effective dates
    if (rowData.effectiveDate) {
      const effectiveDate = new Date(rowData.effectiveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for date-only comparison
      
      if (effectiveDate < today) {
        warnings.push(`Row ${rowNumber} — Effective date is in the past`);
      }
    }

    // Type-specific business rules
    switch (dataType) {
      case 'benchmarkRates':
        this.validateBenchmarkRateBusinessRules(rowData, rowNumber, errors, warnings);
        break;
      case 'categoryMappings':
        this.validateCategoryMappingBusinessRules(rowData, rowNumber, errors, warnings);
        break;
      case 'industrySources':
        this.validateIndustrySourceBusinessRules(rowData, rowNumber, errors, warnings);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowsProcessed: 1,
      validRows: errors.length === 0 ? 1 : 0,
      invalidRows: errors.length > 0 ? 1 : 0
    };
  }

  /**
   * Validates benchmark rate specific business rules
   */
  private static validateBenchmarkRateBusinessRules(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Percentage rates should not exceed 100%
    if (rowData.rateType === 'percentage' && parseFloat(rowData.baseRate) > 100) {
      warnings.push(`Row ${rowNumber} — Percentage rate exceeds 100%`);
    }

    // Very high base rates should be flagged
    if (parseFloat(rowData.baseRate) > 10000) {
      warnings.push(`Row ${rowNumber} — Base rate seems unusually high, please verify`);
    }
  }

  /**
   * Validates category mapping specific business rules
   */
  private static validateCategoryMappingBusinessRules(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Multipliers should typically be between 0.1 and 10
    const multiplierFields = ['benchmarkMultiplier', 'complexityFactor', 'riskFactor'];
    multiplierFields.forEach(field => {
      const value = parseFloat(rowData[field]);
      if (!isNaN(value) && (value < 0.1 || value > 10)) {
        warnings.push(`Row ${rowNumber} — ${field} is outside typical range (0.1-10.0)`);
      }
    });
  }

  /**
   * Validates industry source specific business rules
   */
  private static validateIndustrySourceBusinessRules(
    rowData: Record<string, any>, 
    rowNumber: number, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Labor multiplier should typically be between 0.5 and 3.0
    const laborMultiplier = parseFloat(rowData.laborMultiplier);
    if (!isNaN(laborMultiplier) && (laborMultiplier < 0.5 || laborMultiplier > 3.0)) {
      warnings.push(`Row ${rowNumber} — laborMultiplier is outside typical range (0.5-3.0)`);
    }
  }

  /**
   * Performs cross-file validation to ensure data consistency
   */
  static validateCrossFileReferences(
    benchmarkRates: any[],
    industrySources: any[],
    regionMappings: any[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRows = 0;
    let invalidRows = 0;

    // Extract valid industry codes and region codes
    const validIndustryCodes = new Set(
      industrySources
        .filter(source => source.isActive !== false)
        .map(source => source.industryCode)
    );
    
    const validRegionCodes = new Set(
      regionMappings
        .filter(region => region.isActive !== false)
        .map(region => region.regionCode)
    );

    // Validate benchmark rates against industry sources and region mappings
    benchmarkRates.forEach((rate, index) => {
      const rowNumber = index + 2; // Assuming header row
      let hasError = false;

      // Check industry code reference
      if (rate.industryCode && !validIndustryCodes.has(rate.industryCode)) {
        errors.push(`Row ${rowNumber} — Industry code '${rate.industryCode}' not found in industry sources`);
        hasError = true;
      }

      // Check region code reference
      if (rate.regionCode && !validRegionCodes.has(rate.regionCode)) {
        errors.push(`Row ${rowNumber} — Region code '${rate.regionCode}' not found in region mappings`);
        hasError = true;
      }

      // Check for inactive references
      if (rate.industryCode) {
        const industrySource = industrySources.find(s => s.industryCode === rate.industryCode);
        if (industrySource && industrySource.isActive === false) {
          warnings.push(`Row ${rowNumber} — References inactive industry source '${rate.industryCode}'`);
        }
      }

      if (rate.regionCode) {
        const regionMapping = regionMappings.find(r => r.regionCode === rate.regionCode);
        if (regionMapping && regionMapping.isActive === false) {
          warnings.push(`Row ${rowNumber} — References inactive region '${rate.regionCode}'`);
        }
      }

      if (hasError) {
        invalidRows++;
      } else {
        validRows++;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowsProcessed: benchmarkRates.length,
      validRows,
      invalidRows
    };
  }

  /**
   * Validates that a date string is in ISO YYYY-MM-DD format
   */
  private static isValidISODate(dateString: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(dateString)) {
      return false;
    }
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().substr(0, 10) === dateString;
  }

  /**
   * Validates that a monetary value is accurate to 4 decimal places
   */
  private static isValidMonetaryValue(value: string | number): boolean {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return false;
    
    // Check if the value has more than 4 decimal places
    const stringValue = numValue.toString();
    const decimalIndex = stringValue.indexOf('.');
    
    if (decimalIndex === -1) return true; // No decimal places
    
    const decimalPlaces = stringValue.length - decimalIndex - 1;
    return decimalPlaces <= 4;
  }

  /**
   * Combines multiple validation results into a single result
   */
  static combineValidationResults(results: ValidationResult[]): ValidationResult {
    const combined: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      rowsProcessed: 0,
      validRows: 0,
      invalidRows: 0
    };

    results.forEach(result => {
      combined.errors.push(...result.errors);
      combined.warnings.push(...result.warnings);
      combined.rowsProcessed += result.rowsProcessed;
      combined.validRows += result.validRows;
      combined.invalidRows += result.invalidRows;
    });

    combined.isValid = combined.errors.length === 0;
    
    return combined;
  }
}