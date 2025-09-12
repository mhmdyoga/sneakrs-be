import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import productRoutes from "./routes/product.route.js";
import categoryRoutes from './routes/category.route.js'
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import txRoutes from './routes/tx.routes.js';


// config
dotenv.config();
const app = express();

app.set("trust proxy", 1);

// rate limiter
const AuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: 'to many attempts, please try again after 15 minutes', // message to send
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 100 requests per windowMs
    message: 'to many request, please try again after 15 minutes', // message to send
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// middleware
app.use(cors({
    origin: "https://sneakersco.vercel.app"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES;
app.use('/api/v1', generalLimiter, userRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', generalLimiter, categoryRoutes);
app.use('/api/v1/auth', AuthLimiter, authRoutes);
app.use('/api/v1', generalLimiter, txRoutes);



const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})