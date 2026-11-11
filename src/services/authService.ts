export type PermissionMode = 'full_access' | 'data_entry' | 'read_only';

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: 'owner' | 'manager' | 'vet_doctor' | 'staff';
  permissionMode: PermissionMode;
  phone?: string;
  avatar?: string;
  loggedInAt: string;
}

export interface RegisteredUser {
  id: string;
  username: string;
  password: string;
  displayName: string;
  role: 'owner' | 'manager' | 'vet_doctor' | 'staff';
  permissionMode: PermissionMode;
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

const STORAGE_SESSION_KEY = 'rs_admin_session';
const STORAGE_USERS_KEY = 'rs_registered_users';

const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: 'admin123',
    displayName: 'প্রধান পরিচালক (মালিক)',
    role: 'owner',
    permissionMode: 'full_access',
    phone: '০১৭১২-৩৪৫৬৭৮',
    createdAt: '2026-01-01',
    isActive: true
  },
  {
    id: 'usr-2',
    username: 'manager',
    password: 'manager123',
    displayName: 'খামার ম্যানেজার',
    role: 'manager',
    permissionMode: 'data_entry',
    phone: '০১৭৩৩-৯৮৭৬৫৪',
    createdAt: '2026-02-15',
    isActive: true
  },
  {
    id: 'usr-3',
    username: 'doctor',
    password: 'vet123',
    displayName: 'ডাঃ তানভীর হাসান (পশু চিকিৎসক)',
    role: 'vet_doctor',
    permissionMode: 'read_only',
    phone: '০১৮১৯-১১২২৩৩',
    createdAt: '2026-03-10',
    isActive: true
  }
];

class AuthService {
  private currentUser: AdminUser | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    try {
      const storedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (storedSession) {
        this.currentUser = JSON.parse(storedSession);
      }
    } catch (e) {
      this.currentUser = null;
    }

    // Ensure initial users exist in storage
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (!storedUsers) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      }
    } catch (e) {}
  }

  public getUsers(): RegisteredUser[] {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (stored) {
        const parsed: RegisteredUser[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize permissionMode for legacy records
          return parsed.map(u => ({
            ...u,
            permissionMode: u.permissionMode || (u.role === 'owner' ? 'full_access' : u.role === 'vet_doctor' ? 'read_only' : 'data_entry')
          }));
        }
      }
    } catch (e) {}
    return INITIAL_USERS;
  }

  public addUser(data: {
    username: string;
    password: string;
    displayName: string;
    role: 'owner' | 'manager' | 'vet_doctor' | 'staff';
    permissionMode?: PermissionMode;
    phone?: string;
  }): { success: boolean; message?: string; user?: RegisteredUser } {
    const cleanUser = data.username.trim().toLowerCase();
    const cleanPass = data.password.trim();

    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, message: 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
    }

    const currentUsers = this.getUsers();
    if (currentUsers.some(u => u.username.toLowerCase() === cleanUser)) {
      return { success: false, message: `"${cleanUser}" নামের ইউজারনেমটি ইতিমধ্যে বিদ্যমান! অন্য ইউজারনেম দিন।` };
    }

    const defaultPerm: PermissionMode = data.role === 'owner' 
      ? 'full_access' 
      : (data.permissionMode || (data.role === 'vet_doctor' ? 'read_only' : 'data_entry'));

    const newUser: RegisteredUser = {
      id: `usr-${Date.now()}`,
      username: cleanUser,
      password: cleanPass,
      displayName: data.displayName.trim() || cleanUser,
      role: data.role,
      permissionMode: defaultPerm,
      phone: data.phone?.trim() || '',
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true
    };

    const updated = [...currentUsers, newUser];
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
    this.notify();
    return { success: true, user: newUser };
  }

  public updateUser(id: string, updates: Partial<RegisteredUser>): { success: boolean; message?: string } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'ইউজার পাওয়া যায়নি।' };

    if (updates.username) {
      const cleanU = updates.username.trim().toLowerCase();
      if (users.some(u => u.id !== id && u.username.toLowerCase() === cleanU)) {
        return { success: false, message: 'এই ইউজারনেমটি ইতিমধ্যে অন্য কারো জন্য ব্যবহৃত।' };
      }
      updates.username = cleanU;
    }

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    
    // If updating current active session
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = {
        ...this.currentUser,
        displayName: updates.displayName || this.currentUser.displayName,
        username: updates.username || this.currentUser.username,
        role: updates.role || this.currentUser.role,
        permissionMode: updates.permissionMode || this.currentUser.permissionMode
      };
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(this.currentUser));
    }

    this.notify();
    return { success: true };
  }

  public deleteUser(id: string): { success: boolean; message?: string } {
    const users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return { success: false, message: 'ইউজার পাওয়া যায়নি।' };

    // Prevent deleting the last owner or the currently logged in master user
    if (target.username === 'admin' && users.length === 1) {
      return { success: false, message: 'প্রধান অ্যাডমিন অ্যাকাউন্টটি মুছে ফেলা যাবে না।' };
    }

    const updated = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));

    if (this.currentUser?.id === id) {
      this.logout();
    } else {
      this.notify();
    }

    return { success: true };
  }

  public loginWithUsername(username: string, password: string): { success: boolean; message?: string; user?: AdminUser } {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const users = this.getUsers();
    const matched = users.find(u => u.username.toLowerCase() === cleanUser && u.password === cleanPass);

    if (matched) {
      if (!matched.isActive) {
        return { success: false, message: 'এই অ্যাকাউন্টটি নিষ্ক্রিয় (Deactivated) করা রয়েছে। মালিকের সাথে যোগাযোগ করুন।' };
      }

      const sessionUser: AdminUser = {
        id: matched.id,
        username: matched.username,
        displayName: matched.displayName,
        role: matched.role,
        permissionMode: matched.permissionMode || (matched.role === 'owner' ? 'full_access' : 'data_entry'),
        phone: matched.phone,
        loggedInAt: new Date().toISOString()
      };

      this.currentUser = sessionUser;
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionUser));
      this.notify();
      return { success: true, user: sessionUser };
    }

    return { 
      success: false, 
      message: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! শুধুমাত্র খামার মালিকের নির্ধারিত অনুমোদিত ইউজারনেম ও পাসওয়ার্ড দিয়ে অ্যাডমিন প্যানেলে প্রবেশ করা যাবে।' 
    };
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_SESSION_KEY);
    this.notify();
  }

  public getCurrentUser(): AdminUser | null {
    return this.currentUser;
  }

  public isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  public hasWritePermission(user?: AdminUser | null): boolean {
    const active = user !== undefined ? user : this.currentUser;
    if (!active) return false;
    if (active.role === 'owner') return true;
    return active.permissionMode === 'full_access' || active.permissionMode === 'data_entry';
  }

  public isReadOnly(user?: AdminUser | null): boolean {
    const active = user !== undefined ? user : this.currentUser;
    if (!active) return false;
    if (active.role === 'owner') return false;
    return active.permissionMode === 'read_only';
  }

  public canManageUsers(user?: AdminUser | null): boolean {
    const active = user !== undefined ? user : this.currentUser;
    if (!active) return false;
    return active.role === 'owner' || active.permissionMode === 'full_access';
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }
}

export const authService = new AuthService();
