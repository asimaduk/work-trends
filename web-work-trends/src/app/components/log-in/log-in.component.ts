import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
// import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthenticationService } from '../../_services/authentication.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {
  submittingRequest = false;
  username = '';
  password = '';
  returnUrl: string;
  loginBtnText = 'Log in'

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    // private _snackBar: MatSnackBar
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) { 
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // openSnackBar(message: string, action: string) {
  //   this._snackBar.open(message, action, {
  //     duration: 2000,
  //   });
  // }

  onUsernameKey(event: any) {
    this.username = event.target.value;
  }

  onPasswordKey(event: any) {
    this.password = event.target.value;
  }

  onSubmit() {
    if(this.submittingRequest){
      alert('Please wait, we are processing request...')
      return;
    }
    if(this.username === ''){
      alert('Provide username')
      // this.openSnackBar('Provide username','');
      return;
    }
    else if(this.password === ''){
      alert('Provide password')
      // this.openSnackBar('Provide password','');
      return;
    }

    this.submittingRequest = true;
    this.loginBtnText = 'Processing... Please wait.';
    
    this.authenticationService.login(this.username, this.password)
        .pipe(first())
        .subscribe(
            data => {
                this.router.navigate([this.returnUrl]);
            },
            error => {
                alert(error.error.message);
                console.log('Login error', error)
                this.submittingRequest = false;
                this.loginBtnText = 'Log in'
            });
  }
}
