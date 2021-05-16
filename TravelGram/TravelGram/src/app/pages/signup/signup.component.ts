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


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  picture : string = 
  "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg"
  
  uploadPercent : number = null;

  
  constructor(private auth : AuthService,
    private toastr : ToastrService,
    private router : Router,
    private db : AngularFireDatabase,
    private storage : AngularFireStorage) { }

  ngOnInit(): void {
  }

  
  async uploadFile(event){
    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file,imageConfig);

    const filepath = file.name // rename the image by uuid in production
    const fileRef = this.storage.ref(filepath) // grabbing the image url

    const task = this.storage.upload(filepath , resizedImage);

    //uploading the image
    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });
    
    // when task is done we can look on the changes using snapshots
    task.snapshotChanges()
          .pipe(
            finalize( () => {fileRef.getDownloadURL().subscribe((url) => {
              this.picture = url;
              this.toastr.success("image upload finish")
            })
          })
        )
        .subscribe()
  }

  

  onSubmit(f : NgForm){
    const {email,password,username,country,bio,name} = f.form.value;

    this.auth.signup(email,password)
    .then( (res) => {
      console.log(res);
      const {uid} = res.user
      this.db.object(`/users/${uid}`)
      .set({
        id : uid,
        name : name,
        email : email,
        instaUserName : username,
        country : country,
        bio : bio,
        picture : this.picture
      })
    })
    .then( () => {
      this.router.navigateByUrl('/signin');
      this.toastr.success("signup success")
    })
    .catch((error) => {
      this.toastr.error("signup failed")
    })
  }

}
