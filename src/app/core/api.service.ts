import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, Country, City } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private API = "http://localhost:8080/api/users";
  private CATALOG = "http://localhost:8080/api";

  constructor(private http: HttpClient) {}

  /* users */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  createUser(user:User): Observable<User> {
    return this.http.post<User>(`${this.API}/create`, user);
  }

  updateUser(user:User): Observable<User> {
    return this.http.put<User>(this.API, user);
  }

  deleteUser(id:number) {
    return this.http.delete(`${this.API}/${id}`);
  }

  /* catalogos */
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.CATALOG}/countries`);
  }

  getCities(countryId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.CATALOG}/cities`, { params: { countryId: countryId.toString() } });
  }

}