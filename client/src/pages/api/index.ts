import { NextApiRequest, NextApiResponse } from 'next';

import { API_STATUS } from '@/types/general';

export default async function index(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	res.status(API_STATUS.OK).json({'message': 'Hello World!'});
}