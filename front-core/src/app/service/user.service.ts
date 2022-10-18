import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { environment } from 'src/environments/environment';
import { CustomHttpResponse } from '../model/customer-http-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[] | HttpErrorResponse> {
    return this.http.get<User[]>(this.host + '/user/list');
  } 

  addUser(formData: FormData): Observable<User | HttpErrorResponse> {
    return this.http.post<User>(this.host + '/user/add', formData);
  } 

  updateUser(formData: FormData): Observable<User | HttpErrorResponse> {
    return this.http.put<User>(this.host + '/user/update', formData);
  } 

  resetPassword(email: string): Observable<void> {
    return this.http.get<void>(this.host + '/user/reset-password/' + email);
  } 

  updateProfileImage(formData: FormData): Observable<HttpEvent<User>> {
    return this.http.put<User>(this.host + '/user/update-profile-image', formData, {
      reportProgress: true,
      observe: 'events'
    });
  } 

  deleteUser(username: string): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.delete<CustomHttpResponse>(this.host + '/user/delete/' + username);
  } 

  addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  } 

  getUsersFromLocalCache(): User[] {
    if(localStorage.getItem('users')) {
      let users: any = localStorage.getItem('users');
      return JSON.parse(users);
    }
    return [];
  } 

  createUserFormData(loggedInUsername: string, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('role', user.role);
    formData.append('profileImage', profileImage);
    formData.append('isActive', JSON.stringify(user.isActive));
    formData.append('isNotLocked', JSON.stringify(user.isNotLocked));
    return formData;
  } 
}

