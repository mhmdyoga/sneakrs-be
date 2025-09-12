import prisma from "../config/database.js";
export const getCategories = async (req, res) => {
    try {
        const category = await prisma.category.findMany();
        if (category.length === 0) {
            res.status(404).json({
                message: "Failed find the category"
            });
            return;
        }
        res.status(200).json({
            category,
            message: "Success to find the product"
        });
    }
    catch (error) {
        console.log(error);
    }
};
export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                category: true,
                product: true
            }
        });
        if (!category) { // check exist of Category
            res.status(404).json({
                message: "Category doesn't exist"
            });
            return;
        }
        ;
        res.status(200).json({
            category,
            mesaage: "Category Found Successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "internal Server Error"
        });
        ;
    }
};
export const createCategory = async (req, res) => {
    const { categoryName } = req.body;
    try {
        const categories = await prisma.category.create({
            data: {
                category: categoryName,
            }
        });
        // check does category required?
        if (!categories) {
            res.status(400).json({
                message: "Category is Required!"
            });
            return;
        }
        ;
        // successfully added categories
        res.status(201).json({
            categories,
            message: "the category has been added successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { category } = req.body;
    try {
        const categories = await prisma.category.findUnique({
            where: {
                id: Number(id),
            }
        });
        if (!categories) {
            res.status(404).json({
                message: "No Category Founded"
            });
        }
        else {
            const updateCategory = await prisma.category.update({
                where: {
                    id: Number(id)
                },
                data: {
                    category
                }
            });
            res.status(200).json({
                category: updateCategory,
                message: "category has been updated"
            });
        }
    }
    catch (error) {
        console.log(error);
    }
};
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: Number(id)
            }
        });
        if (!category) {
            res.status(404).json({
                message: "The Category not founded"
            });
        }
        ;
        await prisma.category.delete({
            where: {
                id: Number(id)
            }
        });
        res.status(200).json({
            message: "the Category has been deleted"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
//# sourceMappingURL=categories.controller.js.map