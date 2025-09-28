import prisma from "../config/database.js";
import express from "express";
import { snap } from "../config/midtrans.js";

export const getTx = async (
  _req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    const tx = await prisma.transactions.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                title: true,
                id: true,
                imageUrl: true,
                category: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    // check existing tx
    if (!tx) {
      res.status(404).json({
        message: "product has'nt ordered on this transaction ",
      });
      return;
    }

    // succes get all tx;
    res.status(200).json({
      transaction: tx,
      message: "the Transaction has been founded",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
    });
  }
};

export const getTxById = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const tx = await prisma.transactions.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                title: true,
                id: true,
                imageUrl: true,
                category: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    // check existing trasaction by id
    if (!tx) {
      res.status(404).json({ message: "transaction doesn't exist on this id" });
      return;
    }

    // success founded the transaction;
    res.status(200).json({
      transaction: tx,
      message: "Transaction Founded",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

export const createTx = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { userId, gross_amount, products } = req.body;
  const TxID = "TX-" + Date.now() + Math.floor(Math.random() * 1000);
  try {
    const tx = await prisma.transactions.create({
      data: {
        id: TxID,
        updatedAt: new Date(),
        gross_amount,
        user: {
          connect: { id: userId },
        },
        products: {
          create: products.map((items: any) => ({
            productId: items.productId,
            size: items.size,
            quantity: items.quantity,
            price: items.price,
          })),
        },
      },
      include: {
        user: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    // orderParams;
    const OrderParams = {
      transaction_details: {
        order_id: tx.id,
        gross_amount: tx.gross_amount,
      },
      customer_details: {
        buyer_name: tx.user.name,
        email: tx.user.email,
      },
      item_ordered: {
        products: products.map((items: any) => ({
          productId: items.productId,
          size: items.size,
          quantity: items.quantity,
          price: items.price,
          name: `${items.productId} - Size ${items.size}`,
        })),
      },
    };

    const MidtransTX = await snap.createTransaction(OrderParams);

    // check
    if (!tx) {
      res.status(400).json({
        message: "Failed to Checkout the Products",
      });
    }

    // success checkout
    res.status(201).json({
      transaction: tx,
      paymentToken: MidtransTX.token,
      redirectUrl: MidtransTX.redirect_url,
      message: "Checkout successfully created",
    });
  } catch (error: unknown) {
    console.log((error as any).ApiResponse);

    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

export const notification = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const notif = await (snap as any).transaction.notification(req.body);

    const orderId = notif.order_id;
    const transactionStatus = notif.transaction_status;
    const fraudStatus = notif.fraud_status;
    console.log(notif);

    // default status transaction
    let newStatus = "PENDING";

    // handle notification status
    if (transactionStatus === "capture" && fraudStatus === "accept") { 
      newStatus = "SUCCESS";
    } else if (transactionStatus === "settlement") {
      newStatus = "SUCCESS";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      newStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING";
    }

    // updated transaction status on db
   const transactionItem = await prisma.transactions.update({
      where: {
        id: orderId,
      },
      data: {
        status: newStatus,
      },
      include: {
        products: true
      }
    });

    // conditional if newStatus = "SUCCESS" we should decrement the stock by quantity;
    if (newStatus === "SUCCESS") {
      for (const item of transactionItem.products) {
         await prisma.product.update({
          where: {
            id: item.productId,
            stock: {gte: item.quantity}
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
         })
      }
    }

    res.status(200).json({ message: "notification received" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

