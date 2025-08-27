import { ValidationService, ValidationResult, REQUIRED_HEADERS } from '@/lib/validationService';

/**
 * Request interface for benchmark validation API
 */
export interface ValidationRequest {
  version_id: string;
  dry_run?: boolean;
  files: {
    benchmark_rates: string;
    value_added_options: string;
    category_mappings: string;
    industry_sources: string;
    region_mappings: string;
  };
}

/**
 * Per-file validation result
 */
export interface PerFileResult {
  status: 'valid' | 'invalid' | 'warnings';
  rows_processed: number;
  valid_rows: number;
  invalid_rows: number;
  errors: string[];
  warnings: string[];
}

/**
 * Diff calculation result for dry run
 */
export interface DiffResult {
  inserts: number;
  updates: number;
  deletes: number;
  details: {
    new_records: number;
    modified_records: number;
    deprecated_records: number;
  };
}

/**
 * Complete validation response
 */
export interface ValidationResponse {
  status: 'valid' | 'invalid' | 'warnings';
  version_id: string;
  per_file: {
    benchmark_rates: PerFileResult;
    value_added_options: PerFileResult;
    category_mappings: PerFileResult;
    industry_sources: PerFileResult;
    region_mappings: PerFileResult;
  };
  errors: string[];
  warnings: string[];
  diff?: DiffResult;
}

/**
 * Simulates fetching and parsing CSV data from a URL
 * In a real implementation, this would fetch from the provided URL and parse CSV
 */
async function fetchAndParseCSV(url: string): Promise<Record<string, any>[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For demonstration, return mock data based on the URL pattern
  if (url.includes('benchmark_rates')) {
    return [
      {
        id: 'BR001',
        serviceType: 'storage',
        rateType: 'per_pallet',
        baseRate: '25.5000',
        currency: 'USD',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        regionCode: 'US-WEST',
        industryCode: 'RETAIL',
        isActive: 'true'
      },
      {
        id: 'BR002',
        serviceType: 'picking',
        rateType: 'per_unit',
        baseRate: '0.7500',
        currency: 'USD',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        regionCode: 'US-EAST',
        industryCode: 'ECOMMERCE',
        isActive: 'true'
      }
    ];
  }
  
  if (url.includes('value_added_options')) {
    return [
      {
        id: 'VAO001',
        optionName: 'gift_wrapping',
        baseRate: '5.0000',
        currency: 'USD',
        isActive: 'true'
      }
    ];
  }
  
  if (url.includes('category_mappings')) {
    return [
      {
        categoryCode: 'RETAIL',
        categoryName: 'Retail Operations',
        isActive: 'true'
      }
    ];
  }
  
  if (url.includes('industry_sources')) {
    return [
      {
        sourceTag: 'RETAIL',
        sourceName: 'Retail Industry',
        isActive: 'true'
      }
    ];
  }
  
  if (url.includes('region_mappings')) {
    return [
      {
        regionCode: 'US-WEST',
        regionName: 'United States West Coast',
        isActive: 'true'
      }
    ];
  }
  
  return [];
}

/**
 * Validates a single file's data and returns structured results
 */
function validateFileData(data: Record<string, any>[], fileType: string, fileName: string): PerFileResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (data.length === 0) {
    errors.push(`${fileName}: File appears to be empty`);
    return {
      status: 'invalid',
      rows_processed: 0,
      valid_rows: 0,
      invalid_rows: 0,
      errors,
      warnings
    };
  }
  
  // Validate each row
  let validRows = 0;
  data.forEach((row, index) => {
    const rowNumber = index + 2; // Assuming header is row 1
    
    // Data type validation
    const typeValidation = ValidationService.validateDataTypes(row, rowNumber);
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);
    
    // Business rules validation
    const businessValidation = ValidationService.validateBusinessRules(row, rowNumber);
    errors.push(...businessValidation.errors);
    warnings.push(...businessValidation.warnings);
    
    if (typeValidation.errors.length === 0 && businessValidation.errors.length === 0) {
      validRows++;
    }
  });
  
  const combinedResult = ValidationService.combineValidationResults([]);
  
  // Determine overall status
  let status: 'valid' | 'invalid' | 'warnings' = 'valid';
  if (errors.length > 0) {
    status = 'invalid';
  } else if (warnings.length > 0) {
    status = 'warnings';
  }
  
  return {
    status,
    rows_processed: data.length,
    valid_rows: validRows,
    invalid_rows: data.length - validRows,
    errors,
    warnings
  };
}

/**
 * Calculates diff for dry run mode
 */
function calculateDiff(
  benchmarkRates: Record<string, any>[],
  valueAddedOptions: Record<string, any>[],
  categoryMappings: Record<string, any>[],
  industrySources: Record<string, any>[],
  regionMappings: Record<string, any>[]
): DiffResult {
  // Simulate diff calculation by analyzing data counts
  const totalNewRecords = benchmarkRates.length + valueAddedOptions.length + 
                         categoryMappings.length + industrySources.length + 
                         regionMappings.length;
  
  return {
    inserts: totalNewRecords,
    updates: Math.floor(totalNewRecords * 0.1), // Simulate 10% updates
    deletes: Math.floor(totalNewRecords * 0.05), // Simulate 5% deletions
    details: {
      new_records: totalNewRecords,
      modified_records: Math.floor(totalNewRecords * 0.1),
      deprecated_records: Math.floor(totalNewRecords * 0.05)
    }
  };
}

/**
 * Benchmark Import Validation API
 * This class provides the core functionality for validating benchmark imports in both client and
 * server-side API implementations.
 */
export class BenchmarkValidationAPI {
  /**
   * This is the main API endpoint implementation that orchestrates the validation process
   */
  static async validateImport(request: ValidationRequest): Promise<ValidationResponse> {
    // Validate required fields
    if (!request.version_id || !request.files) {
      throw new Error('Missing required fields: version_id and files are required');
    }
    
    // Validate all required file URLs are provided
    const requiredFiles = ['benchmark_rates', 'value_added_options', 'category_mappings', 'industry_sources', 'region_mappings'] as const;
    for (const fileName of requiredFiles) {
      if (!request.files[fileName]) {
        throw new Error(`Missing required file URL: ${fileName}`);
      }
    }
    
    try {
      // Fetch and parse CSV data from all provided URLs
      const [
        benchmarkRatesData,
        valueAddedOptionsData,
        categoryMappingsData,
        industrySourcesData,
        regionMappingsData
      ] = await Promise.all([
        fetchAndParseCSV(request.files.benchmark_rates),
        fetchAndParseCSV(request.files.value_added_options),
        fetchAndParseCSV(request.files.category_mappings),
        fetchAndParseCSV(request.files.industry_sources),
        fetchAndParseCSV(request.files.region_mappings)
      ]);
      
      // Validate each file's data
      const benchmarkRatesResult = validateFileData(benchmarkRatesData, 'benchmarkRates', 'benchmark_rates');
      const valueAddedOptionsResult = validateFileData(valueAddedOptionsData, 'valueAddedOptions', 'value_added_options');
      const categoryMappingsResult = validateFileData(categoryMappingsData, 'categoryMappings', 'category_mappings');
      const industrySourcesResult = validateFileData(industrySourcesData, 'industrySources', 'industry_sources');
      const regionMappingsResult = validateFileData(regionMappingsData, 'regionMappings', 'region_mappings');
      
      // Perform cross-file validation
      const crossFileValidation = ValidationService.validateCrossFileReferences(
        benchmarkRatesData,
        industrySourcesData,
        regionMappingsData
      );
      
      // Combine all errors and warnings
      const allErrors = [
        ...benchmarkRatesResult.errors,
        ...valueAddedOptionsResult.errors,
        ...categoryMappingsResult.errors,
        ...industrySourcesResult.errors,
        ...regionMappingsResult.errors,
        ...crossFileValidation.errors
      ];
      
      const allWarnings = [
        ...benchmarkRatesResult.warnings,
        ...valueAddedOptionsResult.warnings,
        ...categoryMappingsResult.warnings,
        ...industrySourcesResult.warnings,
        ...regionMappingsResult.warnings,
        ...crossFileValidation.warnings
      ];
      
      // Determine overall status
      let overallStatus: 'valid' | 'invalid' | 'warnings' = 'valid';
      if (allErrors.length > 0) {
        overallStatus = 'invalid';
      } else if (allWarnings.length > 0) {
        overallStatus = 'warnings';
      }
      
      // Prepare response
      const response: ValidationResponse = {
        status: overallStatus,
        version_id: request.version_id,
        per_file: {
          benchmark_rates: benchmarkRatesResult,
          value_added_options: valueAddedOptionsResult,
          category_mappings: categoryMappingsResult,
          industry_sources: industrySourcesResult,
          region_mappings: regionMappingsResult
        },
        errors: allErrors,
        warnings: allWarnings
      };
      
      // Calculate diff if dry_run is requested
      if (request.dry_run) {
        response.diff = calculateDiff(
          benchmarkRatesData,
          valueAddedOptionsData,
          categoryMappingsData,
          industrySourcesData,
          regionMappingsData
        );
      }
      
      return response;
      
    } catch (error) {
      console.error('Validation API error:', error);
      throw new Error(`Internal error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Returns API documentation and supported operations
   */
  static getDocumentation() {
    return {
      endpoint: '/api/benchmarks/imports/validate',
      methods: ['POST'],
      description: 'Validates benchmark data imports from CSV files',
      payload_structure: {
        version_id: 'string (required)',
        dry_run: 'boolean (optional)',
        files: {
          benchmark_rates: 'string (CSV URL, required)',
          value_added_options: 'string (CSV URL, required)',
          category_mappings: 'string (CSV URL, required)',
          industry_sources: 'string (CSV URL, required)',
          region_mappings: 'string (CSV URL, required)'
        }
      },
      response_structure: {
        status: 'valid | invalid | warnings',
        version_id: 'string',
        per_file: 'object with validation results per file',
        errors: 'array of error messages',
        warnings: 'array of warning messages',
        diff: 'object (only present if dry_run=true)'
      }
    };
  }
}

/**
 * Convenience function for direct usage
 */
export const validateBenchmarkImport = BenchmarkValidationAPI.validateImport;