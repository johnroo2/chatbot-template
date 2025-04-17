import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from 'axios';

import cookies from '@/lib/cookies';
import { APIError, LS_KEYS } from '@/types/general';

export abstract class Service {
	protected readonly instance: AxiosInstance;

	/**
	 * Applies custom headers to the request such as the api key, user data, etc.
	 * @param {Object} params - The parameters to be included in the request.
	 * @returns {AxiosRequestConfig<unknown>} A configuration object with the applied headers.
	 */
	protected applyHeaders(customHeaders: object = {}, params: object = {}): AxiosRequestConfig<unknown> {
		const token = cookies.get(LS_KEYS.token);

		return (token ? {
			'headers': {
				'Authorization': `Bearer ${token}`,
				...customHeaders
			},
			...params
		 } : {
			'headers': {
				...customHeaders
			},
			...params
		 }) as unknown as AxiosRequestConfig<unknown>;
	}

	/**
	 * Executes an Axios request function, handling errors gracefully.
	 * @template R - The type of the response data, should be specified.
	 * @template E - The type of the API error. By default, we use the built-in APIError
	 * @param {Function} fn - The function that makes the Axios request.
	 * @returns {Function} A wrapper function that ensures error handling.
	 */
	protected safeAxiosApply<R = unknown, E = APIError>(
		fn: (...args: unknown[]) => Promise<AxiosResponse<R, E>>,
	) {
		return async function (
			...args: Parameters<(...args: unknown[]) => Promise<AxiosResponse<R, E>>>
		): Promise<R | AxiosError<E>> {
			const res = await fn(...args)
				.then((res) => res)
				.catch((err) => {
					if (err instanceof AxiosError) {
						return err;
					}
					//handle unknown error, not sure if this is even possible
					throw err;
				});

			if (res instanceof AxiosError) {
				return res;
			} else {
				return res.data as R;
			}
		};
	}

	constructor(url: string) {
		this.instance = axios.create({
			baseURL: url,
			timeout: 120000,
			timeoutErrorMessage: 'Time out!',
		});
	}
}