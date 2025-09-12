/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerName` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "ownerId",
ADD COLUMN     "ownerName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "public"."User"("name");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_ownerName_fkey" FOREIGN KEY ("ownerName") REFERENCES "public"."User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
