import prisma from "../config/database.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const RegisterUser = async (req: express.Request, res: express.Response): Promise<void> => {
    const { email, password, name, confirmPassword } = req.body;
    try {
        // check if user exist with the same email
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        if(user){
            res.status(400).json({
                massage: 'User already exists'
            })
        };
        // check if password and confirm password is match
        if(password !== confirmPassword){
            res.status(400).json({
                message: `Please make sure your password and confirm password match`
            })
        }

        // hash password 
        const saltedPassword = await bcrypt.hash(password, 10);

        //create user
        const newUser = await prisma.user.create({
            data: {
                email, 
                password: saltedPassword,
                name
            }
        });
        res.status(201).json({ 
            success: true,
            newUser, 
            message: 'User registered successfully'
         });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const LoginUser = async(req: express.Request, res: express.Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        // check if user exist with the same email
        const user = await prisma.user.findUnique({
            where: {
                email,
            }
        });

        // check user exist
        if(!user){
            res.status(400).json({
                message: 'user not found'
            });
            return;
        };

        // compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({
                message: 'Invalid email or password'
            });
            return;
        }

        // generate jwt token
        const token =  jwt.sign({ id: user.id, name: user.name,email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        // set cookies
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: new Date(Date.now() + 3600000), sameSite: 'strict' }); // 1 hour expiration 

        // if login is successful
        res.status(200).json({ 
            success: true,
            user,
            token, 
            message: 'User logged in successfully' 
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logoutUser = async(_req:express.Request, res:express.Response): Promise<void> => {
    try {
        // delete cookies
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        res.status(200).json({
            message: "User Logged out Successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            massage: "Interal Server error"
        })
    }
}