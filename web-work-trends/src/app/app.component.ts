import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services/authentication.service';
import { User } from './_models/user';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Work Trends';

  currentUser: User;
  loading = true;
  avatarUrl = environment.apiUrl+'/users/avatar/default_dp.png'

  constructor(
      private router: Router,
      private authenticationService: AuthenticationService
  ){
      this.authenticationService.currentUser.subscribe(u => this.currentUser = u);
      
      setTimeout(() => {
        if(this.currentUser){
          if(this.currentUser.avatar){
            this.avatarUrl = environment.apiUrl+'/users/avatar/'+this.currentUser.avatar;
          }
          this.router.navigate(['/reports']);
        }
        else {
          this.router.navigate(['/login']);
        }

        this.loading = false;
      }, 300);
  }

  logout() {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
  }
}
