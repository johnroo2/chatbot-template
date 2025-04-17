import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiResponse } from 'next';

import { API_STATUS } from '@/types/general';

export default function verifyToken(authorization: string | undefined, res: NextApiResponse){
	if (!authorization || !authorization.startsWith('Bearer')) {
		res.status(API_STATUS.BAD_REQUEST).json({
			status: API_STATUS.BAD_REQUEST,
			message: 'Invalid token'
		});

		return undefined;
	}

	try {
		const token = authorization.split(' ')[1];
		const decodedToken: string | JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string);

		if (typeof decodedToken === 'string' || !decodedToken?.id){
			res.status(API_STATUS.BAD_REQUEST).json({
				status: API_STATUS.BAD_REQUEST,
				message: 'Invalid token'
			});
    
			return undefined;
		}
    
		return decodedToken;
	} catch {
		res.status(API_STATUS.BAD_REQUEST).json({
			status: API_STATUS.BAD_REQUEST,
			message: 'Token expired'
		});

		return undefined;
	}
}