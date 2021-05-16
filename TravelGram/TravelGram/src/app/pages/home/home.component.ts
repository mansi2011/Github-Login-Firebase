import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {AngularFireDatabase } from '@angular/fire/database';
import {AngularFireStorage } from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';



import {v4 as uuidv4} from "uuid";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  users = [];
  posts = [];

  isLoading = false;

  constructor(private db : AngularFireDatabase,
    private toastr : ToastrService) 
    {
      this.isLoading = true;

      //get all the users
      db.object(`/users`)
      .valueChanges()
      .subscribe((obj) =>{
        if(obj){
          this.users = Object.values(obj)
          this.isLoading = false;
        }else{
          toastr.error("No user found")
          this.users = [];
          this.isLoading = false;
        }
  })

        //get all the posts
        db.object(`/posts`)
        .valueChanges()
        .subscribe((obj) =>{
          if(obj){
            this.posts = Object.values(obj).sort((a,b) => b.date-a.date)
            this.isLoading = false;
          }else{
            toastr.error("No posts found to display")
            this.posts = [];
            this.isLoading = false;
          }
        })

    }

  ngOnInit(): void {
  }

 
}
