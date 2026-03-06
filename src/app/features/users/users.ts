import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: User[] = [];

  user: User = {
    firstName:'',
    lastName:'',
    age:0,
    email:''
  };

  constructor(private api:ApiService){}

  ngOnInit(){
    this.loadUsers();
  }

  loadUsers(){
    this.api.getUsers().subscribe(data=>{
      this.users = data;
    });
  }

  saveUser(){

    this.api.createUser(this.user).subscribe(()=>{
      this.loadUsers();
    });

  }

  deleteUser(id:number){

    this.api.deleteUser(id).subscribe(()=>{
      this.loadUsers();
    });

  }

}