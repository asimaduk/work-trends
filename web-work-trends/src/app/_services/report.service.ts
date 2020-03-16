import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { User } from '../_models/user';

import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
    currentUser: User;

    constructor(private http: HttpClient, private authenticationService: AuthenticationService) {
        this.authenticationService.currentUser.subscribe(u => this.currentUser = u);
    }

    getAll() {
        const httpOptions = {
            headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${this.currentUser.token}`
            })
        };

        return this.http.get<any>(`${environment.apiUrl}/reports`,httpOptions)
            .pipe(map(res => {
                console.log('Get report response',res)
                
                return res.reports;
            }));
    }

    saveNewReport(
        name: string, 
        hours: number, 
        date: Date,
    ) {
        const body = {
            name, hours, date, 
            userId: this.currentUser.id,
            userFullname: this.currentUser.firstName+' '+this.currentUser.lastName,
            username: this.currentUser.username
        }
        const httpOptions = {
            headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${this.currentUser.token}`
            })
        };

        return this.http.post<any>(`${environment.apiUrl}/reports`, body,  httpOptions)
            .pipe(map(res => {
                console.log('New report response',res)
                
                return res;
            }));
    }
}