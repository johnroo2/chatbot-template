import { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { API_STATUS } from '@/types/general';

export default function serverErrorHandler(
	method: 'GET' | 'POST', 
	req: NextApiRequest, 
	res: NextApiResponse, 
	fn: () => void
) {
	try {
		if (req.method !== method){
			res.status(API_STATUS.METHOD_NOT_ALLOWED).json({
				status: API_STATUS.METHOD_NOT_ALLOWED,
				message: `${req.method} not allowed`
			});
			return;
		}

		fn();
	} catch (error: unknown) {
		//this happens when we use two servers and something goes wrong
		if (error instanceof AxiosError) { 
			return res.status(API_STATUS.INTERNAL_SERVER_ERROR).json({
				status: API_STATUS.INTERNAL_SERVER_ERROR,
				message: `Internal server error: ${error.message}`
			});
		}
		else if (error instanceof Error){
			return res.status(API_STATUS.INTERNAL_SERVER_ERROR).json({
				status: API_STATUS.INTERNAL_SERVER_ERROR,
				message: error.message
			});
		}
		else {
			return res.status(API_STATUS.INTERNAL_SERVER_ERROR).json({
				status: API_STATUS.INTERNAL_SERVER_ERROR,
				message: 'An unknown error occured on the server side'
			});
		}
	}
}