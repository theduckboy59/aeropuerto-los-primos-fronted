import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, Country, City } from '../models/user';
import { Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private API = "http://localhost:8080/api/users";
  private CATALOG = "http://localhost:8080/api";

  private countriesCache: Country[] | null = null;
  private countriesRequest$: Observable<Country[]> | null = null;
  private citiesCache = new Map<number, City[]>();
  private citiesRequests = new Map<number, Observable<City[]>>();

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
    if (this.countriesCache) {
      return of(this.countriesCache);
    }

    if (!this.countriesRequest$) {
      this.countriesRequest$ = this.http.get<Country[]>(`${this.CATALOG}/countries`).pipe(
        tap(data => {
          this.countriesCache = data;
        }),
        finalize(() => {
          this.countriesRequest$ = null;
        }),
        shareReplay(1)
      );
    }

    return this.countriesRequest$;
  }

  getCities(countryId: number): Observable<City[]> {
    const cachedCities = this.citiesCache.get(countryId);
    if (cachedCities) {
      return of(cachedCities);
    }

    const inFlightRequest = this.citiesRequests.get(countryId);
    if (inFlightRequest) {
      return inFlightRequest;
    }

    const request$ = this.http.get<City[]>(`${this.CATALOG}/cities`, { params: { countryId: countryId.toString() } }).pipe(
      tap(data => {
        this.citiesCache.set(countryId, data);
      }),
      finalize(() => {
        this.citiesRequests.delete(countryId);
      }),
      shareReplay(1)
    );

    this.citiesRequests.set(countryId, request$);
    return request$;
  }

}