import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {AngularFireDatabase } from '@angular/fire/database';
import {AngularFireStorage } from '@angular/fire/storage';
import {NgForm} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {finalize} from 'rxjs/operators';
import {readAndCompressImage } from "browser-image-resizer";
import { imageConfig } from 'src/utils/congig';


import {v4 as uuidv4} from "uuid";


@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css']
})
export class AddpostComponent implements OnInit {

  locationName: string;
  description : string;
  picture : string = null;

  user = null;
  uploadPercent:number = null;

  constructor(private auth : AuthService,
    private toastr : ToastrService,
    private storage : AngularFireStorage,
    private db : AngularFireDatabase,
    private router : Router) {

      auth.getUser().subscribe((user) => {
        this.db.object(`/users/${user.uid}`)
        .valueChanges()
        .subscribe((user) => {
          this.user = user;
        })
      })
     }

  ngOnInit(): void {
  }

  onSubmit(){
    const uid = uuidv4();

    this.db.object(`/posts/${uid}`)
    .set({
      id: uid,
      locationName : this.locationName,
      description: this.description,
      picture : this.picture,
      by : this.user.name,
      instaId : this.user.instaUserName,
      date : Date.now()
    })
    .then(() => {
      this.toastr.success("posted successfully")
      this.router.navigateByUrl('/')
    })
    .catch((err) => {
      this.toastr.error("error occured while posting")
    })
  }

  async uploadFile(event){

    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file,imageConfig);

    const filepath = file.name;
    const fileRef = this.storage.ref(filepath);

    const task = this.storage.upload(filepath,resizedImage);

    task.percentageChanges().subscribe((percentage) =>{
      this.uploadPercent = percentage;
    })
    
    task.snapshotChanges().pipe(
      finalize(() =>{
        fileRef.getDownloadURL().subscribe((url)=>{
          this.picture = url;
          this.toastr.success("image upload finish")
        })
      })
    )
    .subscribe()
    
  }
}
