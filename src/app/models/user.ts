export interface Country {
  id: number;
  name?: string;
}

export interface City {
  id: number;
  name?: string;
}

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  cui: string;  // 13-digit unique identifier
  country?: Country;
  city?: City;
}