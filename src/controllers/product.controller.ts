import express from "express";
import prisma from "../config/database.js";
import supabase from "../config/supabaseStorage.js"; // ini buat upload image karna butuh bucket dari supabase

export const getProducts = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {

     const page = parseInt(req.query.page as string) || 1;
     const limit = parseInt(req.query.limit as string) || 10;

     const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          title: true,
          price: true,
          stock: true,
          imageUrl: true,
          category: true,
          ownerName: true,
        },
        skip,
        take: limit
      }),
      prisma.product.count()
    ]);

    // check if porduct it doesn't find out;
    if (products.length === 0) {
      res.status(404).json({
        message: "Failed to find products",
      });
    }

    // success 200
    res.status(200).json({
      products,
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      message: "Products Found Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getProductById = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "Product ID is required" });
    return;
  }
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: id as string | undefined,
      },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        imageUrl: true,
        category: true,
        ownerName: true,
      },
    });
    if (!product) {
      res.status(404).json({
        message: "The Product doesn't exist",
      });
    }
    res.status(200).json({
      product,
      message: "The Product has been Found",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getProductLastMonth = async (
  _req: express.Request,
  res: express.Response
): Promise<void> => {
  const OnMonthAgo = new Date();
  OnMonthAgo.setMonth(OnMonthAgo.getMonth() - 1); // get date one month ago from today

  try {
    // find products created in the last month
    const product = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // limit to 10 products
    });

    // check if no products found
    if (product.length === 0) {
      res.status(404).json({
        message: "No New Products Uploaded in The Last Month",
      });
    }

    // success
    res.status(200).json({
      product,
      message: "New Products Uploaded in The Last Month",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getProductByName = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { name }: any = req.params;
  try {
    const product = await prisma.product.findFirst({
      where: {
        title: name,
      },
      select: {
        id: true,
        category: true,
        imageUrl: true,
        ownerName: true,
        price: true,
        stock: true,
        title: true,
      },
    });
    if (!product) {
      res.status(404).json({
        message: "No Product founded by The Name",
      });
    }

    // success
    res.status(200).json({
      product,
      message: "Product Founded",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createProduct = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { title, price, stock, userId, categoryId } = req.body;
  const file = req.file;

  try {
    if (!file) {
      res.status(400).json({ message: "File is required" });
      return;
    }

    const fileName = `products-${Date.now()}-${file.originalname}`;

    // Upload ke Supabase Storage and create bucket on supabase with name 'product' at storage (supabase)
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype ?? "application/octet-stream",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Ambil public URL
    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    // URL Image Product;
    const imageUrl = publicUrlData.publicUrl;

    // Simpan ke DB lewat Prisma
    const newProduct = await prisma.product.create({
      data: {
        title,
        price: parseInt(price),
        stock: parseInt(stock),
        imageUrl,
        user: {
          connect: { id: parseInt(userId) }, // pakai id bukan name
        },
        category: {
          connect: {
            id: parseInt(categoryId),
          },
        },
      },
      include: {
        user: { select: { id: true, name: true } },
        category: { select: { category: true } },
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateProduct = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { id } = req.params;
  const { title, price } = req.body;

  if (!id) {
    res.status(400).json({ error: "Product ID is required" });
    return;
  }
  try {
    const product = await prisma.product.update({
      where: {
        id: id as string | undefined,
      },
      data: {
        title,
        price: Number(price),
      },
    });

    if (!product) {
      res.status(400).json({
        message:
          "Can't Update the product because id, it doesn't match with id product",
      });
    }

    res.status(200).json({
      product,
      message: "The Product has been Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: (error as any).massage,
    });
  }
};

export const deleteProduct = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: "Product ID is required" });
    return;
  }
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: id as string | undefined,
      },
    });

    // check Product Exist by ID
    if (!product) {
      res.status(404).json({
        message: "The Product Not Found",
      });
    }

    // logic of deleting product
    await prisma.product.delete({
      where: {
        id: id as string | undefined,
      },
    });

    // success deleting product
    res.status(200).json({
      message: "The Product has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      err: (error as any).message,
    });
  }
};
