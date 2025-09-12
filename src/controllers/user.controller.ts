import express from 'express';
import prisma from '../config/database.js';
import bcrypt from 'bcrypt';


export const getUsers = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        // find all users
        const user = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        // if no user found
        if (user.length === 0) {
            res.status(404).json({ message: 'No users found' });
        }
        // if user found
        res.status(200).json({ user, message: 'Users retrieved successfully' });
    } catch (error) {
        console.log(error);
    }
}

export const getUserById = async (req: express.Request, res: express.Response): Promise<void> => {
    const { id } = req.params;
    try {
        // find user by id
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        // if user not found
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }
        // if user found
        res.status(200).json({ user, message: 'User retrieved successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateUser = async (req: express.Request, res: express.Response): Promise<void> => {
    const { id } = req.params;
    const { password } = req.body;
    try {
        // find user by id
        const findUser = await prisma.user.findUnique({
            where: {
                id: Number(id)
            }
        });
        if (!findUser) {
            res.status(404).json({ message: 'User not found' });
        }

        // if password is not provided
        if (!password) {
            res.status(400).json({ message: 'Password is required' });
        }

        //hash password which is changed
        const hashedPassword = await bcrypt.hash(password, 10);

        // update password user by user id
         await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                password: hashedPassword
            }
        });
        res.status(200).json({ message: 'User password updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteUser = async (req: express.Request, res: express.Response):Promise<void> => {
    try {
        // get user id from params
        const {id} = req.params;
        const findUser = await prisma.user.findUnique({
            where: {
                id: Number(id)
            }
        })
        // check if user exists
        if(!findUser){
            res.status(404).json({message: 'User not found'});
            return;
        }
        // delete user by id
        await prisma.user.delete({
            where: {
                id: Number(id)
            }
        })
        res.status(200).json({message: 'User deleted successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}