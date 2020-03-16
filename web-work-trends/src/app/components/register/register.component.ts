import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../_services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  submittingRequest = false;
  registerBtnText = 'Register';
  firstname = '';
  lastname = '';
  username = '';
  email = '';
  password = '';
  confirm_password = '';

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit(): void {
  }

  onFirstnameKey(event: any) {
    this.firstname = event.target.value;
  }

  onLastnameKey(event: any) {
    this.lastname = event.target.value;
  }

  onUsernameKey(event: any) {
    this.username = event.target.value;
  }

  onEmailKey(event: any) {
    this.email = event.target.value;
  }

  onPasswordKey(event: any) {
    this.password = event.target.value;
  }

  onConfirmPasswordKey(event: any) {
    this.confirm_password = event.target.value;
  }

  onSubmit(){
    if(this.submittingRequest){
      alert('Please wait, we are processing request...')
      return;
    }

    if(!this.firstname.trim()) {alert('Provide firstname'); return;}
    if(!this.lastname.trim()) {alert('Provide lastname'); return;}
    if(!this.username.trim()) {alert('Provide username'); return;}
    if(!this.email.trim()) {alert('Provide email'); return;}
    if(!this.password) {alert('Provide password'); return;}
    if(this.password.length < 8) {alert('Provide should be at least 8 characters'); return;}
    if(!this.confirm_password) {alert('Confirm password'); return;}
    if(this.password !== this.confirm_password) {alert('Passwords mismatch'); return;}

    this.submittingRequest = true;
    this.registerBtnText = 'Registering... Please wait.';

    this.authenticationService.register(
      this.firstname,
      this.lastname,
      this.username,
      this.email,
      this.password
    )
      .pipe(first())
      .subscribe(
          data => {
              alert('Sign up successful. A link has been sent to your email address. Confirm your email address within 3 hours to activate your account.')
              this.router.navigate(['/login']);
          },
          error => {
              alert(error.error.error);
              console.log('Sign up error', error)
              this.submittingRequest = false;
              this.registerBtnText = 'Register'
          });
  }
}
