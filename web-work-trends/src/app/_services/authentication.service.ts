import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/users/login`, { username, password })
            .pipe(map(res => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                const _user = {
                    id: res.user._id,
                    firstName: res.user.firstname,
                    lastName: res.user.lastname,
                    username: res.user.username,
                    email: res.user.email,
                    avatar: res.user.avatar,
                    isAdmin: res.user.isAdmin,
                    enabled: res.user.enabled,
                    emailVerified: res.user.emailVerified,
                    token: res.token
                }

                localStorage.setItem('currentUser', JSON.stringify(_user));
                this.currentUserSubject.next(_user);
                return _user;
            }));
    }

    register(
        firstname: string, 
        lastname: string, 
        username: string,
        email: string,
        password: string,
    ) {
        return this.http.post<any>(`${environment.apiUrl}/users`, { firstname, lastname, username, email, password })
            .pipe(map(res => {
                console.log('Sign up response',res)
                
                return res;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}