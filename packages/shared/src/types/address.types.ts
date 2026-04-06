export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface AddressJson {
  // Identity
  contactName: string;
  company?: string;
  phone: string;
  email?: string;

  // Vietnam hierarchical address (primary)
  provinceCode?: string;
  provinceName?: string;
  districtCode?: string;
  districtName?: string;
  wardCode?: string;
  wardName?: string;
  streetAddress: string;

  // International fallback (for cross-border)
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string; // ISO 3166-1 alpha-2, default "VN"

  // Vietnam delivery essentials
  landmark?: string;
  notes?: string;

  // Geo
  lat?: number;
  lng?: number;
}
