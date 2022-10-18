import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { Role } from '../enum/role.enum';
import { CustomHttpResponse } from '../model/customer-http-response.model';
import { FileUploadStatus } from '../model/file-upload.status';
import { User } from '../model/user.model';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { UserService } from '../service/user.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();

  private subscriptions: Subscription[] = [];

  public users: User[];
  public user: User;
  refreshing: boolean = false;
  selectedUser: User;
  fileName: string;
  profileImage: File;
  editUser = new User();
  currentUsername: string;
  public fileStatus = new FileUploadStatus();

  private subs = new SubSink();

  constructor(private userService: UserService,
              private router: Router,
              private authService: AuthenticationService,
              private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authService.getUserFromLocalCache();
    this.getUsers(true);
  }

  changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  getUsers(showNotification: boolean): void {
    this.refreshing = true;
      this.subs.add(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          this.users = response;
          this.refreshing = false;
          if(showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.refreshing = false;
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    )
  }

  onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
  }

  onProfileImageChange(fileName: string, file: File): void {
    this.fileName = fileName;
    this.profileImage = file;
  }

  saveNewUser(): void {
    this.clickButton('new-user-save');
  }

  onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFormData(null, userForm.value, this.profileImage);
    this.subs.add(
      this.userService.addUser(formData).subscribe(
        (response: User) => {
          this.clickButton('new-user-close');
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          userForm.reset();
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName, response.lastName} added successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.refreshing = false;
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }

  onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  onUpdateUser(): void {
    const formData = this.userService.createUserFormData(this.currentUsername, this.editUser, this.profileImage);
    this.subs.add(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.clickButton('closeEditUserModalButton');
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          this.refreshing = false;
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName, response.lastName} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.refreshing = false;
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }

  onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUsername = this.authService.getUserFromLocalCache().username;
    const formData = this.userService.createUserFormData(this.currentUsername, user, this.profileImage);
    this.subs.add(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authService.addUserToLocalCache(response);
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          this.refreshing = false;
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName, response.lastName} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.refreshing = false;
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }

  searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for(const user of this.userService.getUsersFromLocalCache()) {
      if(user.firstName.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1 ||
          user.lastName.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1 ||
          user.username.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1 ||
          user.userId.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) !== -1) {
            results.push(user);
      }
    }
    this.users = results;
    if(results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subs.add(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: void) => {
          this.sendNotification(NotificationType.SUCCESS, 'Email successfully sent to ' + emailAddress);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.refreshing = false;
          this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    )
  }

  onDeleteUser(username: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, 'User successfully deleted!');
          this.getUsers(true);
        },
        (errorResponse: HttpErrorResponse) => {
          this.refreshing = false;
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    )
  }

  onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('profileImage', this.profileImage);

    this.subs.add(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadImageProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  reportUploadImageProgress(event: HttpEvent<any>) {
    switch(event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(100 * (event.loaded / event.total));
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if(event.status === 200) {
          this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
          this.sendNotification(NotificationType.SUCCESS, `${event.body.firstName}\s profile image updated successfully`);
          this.fileStatus.status = 'done';
          break
        } else {
          this.sendNotification(NotificationType.ERROR, `Unable to upload image. Please try again`);
          break;
        }
      default:
        `Finished all processes`;
    }
  }

  updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public get isAdmin(): boolean {
    return this.getUserRole() == Role.ADMIN || this.getUserRole() == Role.SUPER_ADMIN;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.getUserRole() == Role.MANAGER;
  }

  private getUserRole(): string {
    return this.authService.getUserFromLocalCache().role;
  }

  sendNotification(type: NotificationType, message: string): void {
    if(message){
      this.notificationService.notify(type, message);
    } else {
      this.notificationService.notify(type, 'An error occured. Please try again.');
    }
  }

  clickButton(buttoidId: string): void {
    document.getElementById(buttoidId).click();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
