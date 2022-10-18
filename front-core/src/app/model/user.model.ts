export class User {
    public userId?: string;
    public firstName: string;
    public lastName: string;
    public username: string;
    public email: string;
    public profileImageUrl?: string;
    public lastLoginDateDisplay?: Date;
    public joinDate?: Date;
    public role: string;
    public authorities: [];
    public isActive: boolean;
    public isNotLocked: boolean;

    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.username = '';
        this.email = '';
        this.isActive = true;
        this.isNotLocked = true;
        this.role = '';
        this.authorities = [];
    }
}