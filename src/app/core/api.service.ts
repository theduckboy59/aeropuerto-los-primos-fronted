import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private API = "http://localhost:8080/api/users";

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  createUser(user:User): Observable<User> {
    return this.http.post<User>(`${this.API}/create`, user);
  }

  deleteUser(id:number) {
    return this.http.delete(`${this.API}/${id}`);
  }

}