import { AxiosError } from 'axios';

import { Service } from '@/lib/serviceRoot';
import { APIError } from '@/types/general';
import { SignupResponse, LoginResponse, GetUserResponse, GetAllUsersResponse, CreateUserResponse, EditUserResponse, DeleteUserResponse, ChangePasswordResponse } from '@/types/server';

class UserService extends Service {
	constructor(url: string) {
		super(url);
	}

	/**
	 * Fetches the current user based on the token
	 * @returns {Promise<GetUserResponse | AxiosError<APIError>>} The user from token
	 */
	async getUser(): Promise<GetUserResponse | AxiosError<APIError>>{
		return this.safeAxiosApply<GetUserResponse>(() =>
			this.instance.get('/api/user', this.applyHeaders())
		)();
	}

	/**
	 * Fetches all users, ADMIN only
	 * @returns {Promise<GetAllUsersResponse | AxiosError<APIError>>} A list of all users
	 */
	async getAllUsers(): Promise<GetAllUsersResponse | AxiosError<APIError>>{
		return this.safeAxiosApply<GetAllUsersResponse>(() =>
			this.instance.get('/api/user/get-users', this.applyHeaders())
		)();
	}

	/**
	 * Creates a user, signs them in, and returns the user and token
	 * @param {string} username - The user's username
     * @param {string} password - The user's password
     * @param {boolean} isAdmin - Admin access on signup
	 * @returns {Promise<SignupResponse | AxiosError<APIError>>} The user and token
	 */
	async signup(username: string, password: string, isAdmin: boolean): Promise<SignupResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<SignupResponse>(() =>
			this.instance.post('/api/user/signup', {
				username,
				password,
				isAdmin
			})
		)();
	}

	/**
	 * Creates a user, signs them in, and returns the user and token
	 * @param {string} username - The user's username
     * @param {string} newPassword - The user's new password
	 * @returns {Promise<ChangePasswordResponse | AxiosError<APIError>>} The user and token
	 */
	async changePassword(username: string, newPassword: string): Promise<ChangePasswordResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<ChangePasswordResponse>(() =>
			this.instance.post('/api/user/change-password', {
				username,
				newPassword
			})
		)();
	}

	/**
	 * Signs in the user and returns the user and token
	 * @param {string} username - The user's username
     * @param {string} password - The user's password
	 * @returns {Promise<LoginResponse | AxiosError<APIError>>} The user and token
	 */
	async login(username: string, password: string): Promise<LoginResponse | AxiosError<APIError>> {
		return this.safeAxiosApply<LoginResponse>(() =>
			this.instance.post('/api/user/login', {
				username,
				password
			})
		)();
	}

	/**
	 * Creates a new user, ADMIN only
	 * @param {string} username new user's username
	 * @param {string} password new user's password
	 * @param {boolean} isAdmin permissions of the new user
	 * @returns {Promise<CreateUserResponse | AxiosError<APIError>>} The newly created user
	 */
	async createUser(username: string, password: string, isAdmin: boolean): Promise<CreateUserResponse | AxiosError<APIError>>{
		return this.safeAxiosApply<CreateUserResponse>(() =>
			this.instance.post('/api/user/create-user', {
				username,
				password,
				isAdmin
			},
			this.applyHeaders())
		)();
	}

	/**
	 * Modifies an existing user, ADMIN only
	 * @param {string} id the queried user's id
	 * @param {string} username set a new username
	 * @param {boolean} isAdmin change permissions of the user
	 * @returns {Promise<EditUserResponse | AxiosError<APIError>>} A list of all users and whether or not the current user is modified
	 */
	async editUser(id: string, username: string, isAdmin: boolean): Promise<EditUserResponse | AxiosError<APIError>>{
		return this.safeAxiosApply<EditUserResponse>(() =>
			this.instance.post('/api/user/edit-user', {
				id,
				username,
				isAdmin
			},
			this.applyHeaders())
		)();
	}

	/**
	 * Deletes an existing user by id, ADMIN only
	 * @param {string} id the queried user's id
	 * @returns {Promise<DeleteUserResponse | AxiosError<APIError>>} A list of all users and whether or not the current user is modified
	 */
	async deleteUserById(id: string): Promise<DeleteUserResponse | AxiosError<APIError>>{
		return this.safeAxiosApply<DeleteUserResponse>(() =>
			this.instance.post('/api/user/delete-user', {
				id,
			},
			this.applyHeaders())
		)();
	}
}

/**
* Client for handling user-related stuff
 */
const userService = new UserService(process.env.NEXT_PUBLIC_CLIENT_URL as string);

export default userService;