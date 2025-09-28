import prisma from "../config/database.js";
import express from 'express'


export const totalSales = async (
  _req: express.Request,
  res: express.Response
) => {
  try {
    const result = await prisma.transactions.aggregate({
      _sum: {
        gross_amount: true,
      },
    });

    const total = result._sum.gross_amount || 0;

    res.status(200).json({
      message: "Total Sale all product",
      totalSales: total,
    });
  } catch (error) {
    console.error("Error calculating total sales:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

type SalesTrend = "UP" | "DOWN" | "SAME" | null;

interface SalesByMonth {
  month: string;
  total: number;
  trend: SalesTrend;
  percentage: number | null;
}

export const totalSalesByMonth = async (_req: express.Request, res: express.Response) => {
  try {
    const result = await prisma.transactions.groupBy({
      by: ["createdAt"],
      _sum: { gross_amount: true },
    });

    // record sales per bulan
    const salesMonth: Record<string, number> = {};
    result.forEach((item) => {
      const createdAt: Date = item.createdAt as Date;
      const month: string = createdAt.toISOString().slice(0, 7);
      const grossAmount: number = item._sum.gross_amount ?? 0;
      salesMonth[month] = (salesMonth[month] ?? 0) + grossAmount;
    });

    // urutkan bulan
    const sortedMonths: string[] = Object.keys(salesMonth).sort();

    const salesWithTrend: SalesByMonth[] = sortedMonths.map((month, idx, arr) => {
      const current: number = salesMonth[month] ?? 0;

      // ambil bulan sebelumnya via arr[idx-1], jadi TS yakin string[]
      const prevMonth: string | undefined = idx > 0 ? arr[idx - 1] : undefined;
      const prev: number | null = prevMonth ? salesMonth[prevMonth] ?? 0 : null;

      let trend: SalesTrend = null;
      let percentage: number | null = null;

      if (prev !== null) {
        if (current > prev) trend = "UP";
        else if (current < prev) trend = "DOWN";
        else trend = "SAME";

        percentage = prev > 0 ? ((current - prev) / prev) * 100 : current > 0 ? 100 : 0;
      }

      return {
        month,
        total: current,
        trend,
        percentage: percentage !== null ? Number(percentage.toFixed(2)) : null,
      };
    });

    res.status(200).json({
      message: "Data Sales By Month",
      totalSales: salesWithTrend,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};