export interface BIMItem {
  code: string;
  location: string;
  finish: string;
  supplier: string;
  contactInfo?: string;
  pricePerSqm?: {
    low: number;
    mid: number;
    high: number;
  };
  type: string;
}

export interface MaterialAnalysisResult {
  materials: BIMItem[];
  imageDescription: string;
}

