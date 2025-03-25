/**
 * LocalStorageService provides a singleton service for managing local storage operations
 * in the sleep tracker application. It handles user data and sleep data persistence
 * using the browser's localStorage API.
 */

// Define the User interface for type safety
interface User {
  id: string;
  email: string;
  role: 'parent' | 'child';
  parentId?: string;
  createdAt: string;
}

// Define the SleepData interface for storing sleep tracking information
interface SleepData {
  id: string;
  userId: string;
  date: string;
  duration: number;
  quality: number;
  phases: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
}

/**
 * LocalStorageService implements the Singleton pattern to ensure only one instance
 * exists throughout the application lifecycle.
 */
class LocalStorageService {
  // Singleton instance
  private static instance: LocalStorageService;
  // Local storage keys for different data types
  private readonly USERS_KEY = 'sleep_tracker_users';
  private readonly SLEEP_DATA_KEY = 'sleep_tracker_data';

  // Private constructor to prevent direct instantiation
  private constructor() {}

  /**
   * Gets the singleton instance of LocalStorageService
   * @returns LocalStorageService instance
   */
  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  /**
   * Creates a new user and stores it in localStorage
   * @param email User's email address
   * @param password User's password (not stored for security)
   * @param role User's role (parent or child)
   * @param parentId Optional parent ID for child users
   * @returns Promise<User> The created user object
   */
  async createUser(email: string, password: string, role: 'parent' | 'child', parentId?: string): Promise<User> {
    const users = this.getUsers();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      parentId,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  /**
   * Authenticates a user by email and password
   * @param email User's email address
   * @param password User's password
   * @returns Promise<User | null> The authenticated user or null if not found
   */
  async loginUser(email: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    return user || null;
  }

  /**
   * Retrieves all users from localStorage
   * @returns User[] Array of all stored users
   */
  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * Saves sleep tracking data to localStorage
   * @param data Sleep data to save (without ID)
   * @returns Promise<SleepData> The saved sleep data with generated ID
   */
  async saveSleepData(data: Omit<SleepData, 'id'>): Promise<SleepData> {
    const sleepData = this.getSleepData();
    const newData: SleepData = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    sleepData.push(newData);
    localStorage.setItem(this.SLEEP_DATA_KEY, JSON.stringify(sleepData));
    return newData;
  }

  /**
   * Retrieves sleep data for a specific user
   * @param userId ID of the user
   * @returns Promise<SleepData[]> Array of sleep data records
   */
  async getSleepDataByUserId(userId: string): Promise<SleepData[]> {
    const sleepData = this.getSleepData();
    return sleepData.filter(data => data.userId === userId);
  }

  /**
   * Retrieves sleep data for all children of a parent user
   * @param parentId ID of the parent user
   * @returns Promise<SleepData[]> Array of sleep data records for all children
   */
  async getChildSleepData(parentId: string): Promise<SleepData[]> {
    const users = this.getUsers();
    const childIds = users
      .filter(user => user.parentId === parentId)
      .map(user => user.id);
    
    const sleepData = this.getSleepData();
    return sleepData.filter(data => childIds.includes(data.userId));
  }

  /**
   * Retrieves all sleep data from localStorage
   * @returns SleepData[] Array of all stored sleep data
   */
  private getSleepData(): SleepData[] {
    const dataJson = localStorage.getItem(this.SLEEP_DATA_KEY);
    return dataJson ? JSON.parse(dataJson) : [];
  }

  /**
   * Exports all application data as a JSON string
   * @returns string JSON string containing all users and sleep data
   */
  exportData(): string {
    const data = {
      users: this.getUsers(),
      sleepData: this.getSleepData(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Imports application data from a JSON string
   * @param jsonString JSON string containing users and sleep data
   * @throws Error if the data format is invalid
   */
  importData(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(data.users));
      }
      if (data.sleepData) {
        localStorage.setItem(this.SLEEP_DATA_KEY, JSON.stringify(data.sleepData));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }
}

// Export the singleton instance
export const localStorageService = LocalStorageService.getInstance(); 