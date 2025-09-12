import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access Denied' });
        return;
    }
    try {
        const secretKey = process.env.JWT_SECRET;
        const verified = jwt.verify(token, secretKey);
        req.user = verified;
        next();
        return;
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
        return;
    }
};
//# sourceMappingURL=token-verify.js.map