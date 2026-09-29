
export type CarPhoto = {
  id: number;
  path: string;
};

export type Car = {
  id: number;
  user_id: number;
  brand: string | null;
  model: string | null;
  year: number | null;
  cc: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  color: string | null;
  registration_number: string | null;
  created_at: string;
  updated_at: string;
  photos?: CarPhoto[];
};
