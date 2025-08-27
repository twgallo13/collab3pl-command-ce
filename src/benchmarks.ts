export interface BenchmarkRate {
  id: string;
  serviceType: string;
  rateType: 'per_unit' | 'per_hour' | 'per_pallet' | 'per_order' | 'percentage';
  baseRate: number;
  currency: string;
  effectiveDate: string;
  expirationDate?: string;
  regionCode: string;
  industryCode: string;
  volumeThresholds?: VolumeThreshold[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VolumeThreshold {
  minVolume: number;
  maxVolume?: number;
  discountPercentage: number;
  adjustedRate: number;
}

export interface ValueAddedOption {
  id: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  category: 'packaging' | 'labeling' | 'kitting' | 'quality_control' | 'special_handling';
  rateStructure: {
    baseRate: number;
    rateType: 'per_unit' | 'per_hour' | 'flat_fee';
    minimumCharge?: number;
    setupFee?: number;
  };
  requiredEquipment?: string[];
  timeRequirement: {
    estimatedHours: number;
    setupTime?: number;
  };
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'specialized';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryMapping {
  id: string;
  categoryCode: string;
  categoryName: string;
  parentCategory?: string;
  description: string;
  serviceTypes: string[];
  benchmarkMultiplier: number;
  complexityFactor: number;
  riskFactor: number;
  seasonalAdjustment?: {
    peakSeason: {
      startMonth: number;
      endMonth: number;
      adjustmentPercentage: number;
    };
    offSeason: {
      startMonth: number;
      endMonth: number;
      adjustmentPercentage: number;
    };
  };
  complianceRequirements?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IndustrySource {
  id: string;
  industryCode: string;
  industryName: string;
  description: string;
  naicsCode?: string;
  sicCode?: string;
  sector: string;
  subsector?: string;
  characteristics: {
    typicalVolumeRange: {
      min: number;
      max: number;
      unit: string;
    };
    seasonality: 'high' | 'medium' | 'low' | 'none';
    complexityLevel: 'basic' | 'moderate' | 'complex' | 'highly_complex';
    regulatoryRequirements: string[];
  };
  benchmarkAdjustments: {
    laborMultiplier: number;
    equipmentMultiplier: number;
    spaceMultiplier: number;
    insuranceMultiplier: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegionMapping {
  id: string;
  regionCode: string;
  regionName: string;
  country: string;
  stateProvince?: string;
  city?: string;
  zipCodeRanges?: string[];
  timezone: string;
  economicFactors: {
    laborCostIndex: number;
    realEstateCostIndex: number;
    transportationCostIndex: number;
    utilityCostIndex: number;
    baseCurrency: string;
  };
  operationalFactors: {
    averageWageRate: number;
    skillAvailability: 'high' | 'medium' | 'low';
    infrastrucureQuality: 'excellent' | 'good' | 'fair' | 'poor';
    weatherImpact: 'minimal' | 'seasonal' | 'significant';
  };
  benchmarkAdjustments: {
    costOfLivingMultiplier: number;
    operationalComplexityMultiplier: number;
    riskMultiplier: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}