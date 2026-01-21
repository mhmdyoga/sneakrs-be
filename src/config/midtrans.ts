import MidtransClient from "midtrans-client";

export const snap = new MidtransClient.Snap({
    serverKey: process.env.SERVER_KEY_MIDTRANS as string,
    clientKey: process.env.CLIENT_KEY_MIDTRANS as string,
    isProduction: true
})

