// verify token
import express from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) {
        res.status(401).json({ message: 'Access Denied' });
        return;
    }

    try {
        const secretKey = process.env.JWT_SECRET as string;
        const verified = jwt.verify(token, secretKey);
        (req as any).user = verified;
        next();
        return;
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
        return;
    }
}