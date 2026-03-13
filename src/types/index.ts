export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export type TimePeriod = 'summer' | 'year1' | 'year2';

export type Activity =
  | 'Internship'
  | 'Full Time'
  | 'Coterm'
  | 'Gap Year'
  | 'Premed'
  | 'Other'
  | '';

export interface UserEntry {
  id?: string;
  name: string;
  node_color: string;
  summer_city: string;
  summer_lat: number;
  summer_lng: number;
  summer_activity: string | null;
  year1_city: string;
  year1_lat: number;
  year1_lng: number;
  year1_activity: string | null;
  year2_city: string;
  year2_lat: number;
  year2_lng: number;
  year2_activity: string | null;
  created_at?: string;
}
