import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private API = environment.usersApiUrl;
  private BASE_URL = this.API.replace(/\/api\/users$/, '');

  constructor(private http: HttpClient) {}

  /* users */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.API, user);
  }

  login(payload: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, payload);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.API}/${id}`, user);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }

  /* health & diagnostics */
  healthCheck(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/api/status`);
  }

  getDiagnostic(): Observable<any> {
    return this.http.get<any>(this.BASE_URL);
  }
}