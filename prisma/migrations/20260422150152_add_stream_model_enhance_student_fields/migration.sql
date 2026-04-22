-- AlterTable
ALTER TABLE "ClassRoom" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "streamId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "city" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fatherOccupation" TEXT,
ADD COLUMN     "fatherPhone" TEXT,
ADD COLUMN     "guardianRelation" TEXT,
ADD COLUMN     "motherOccupation" TEXT,
ADD COLUMN     "motherPhone" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "classRoomId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stream_tenantId_idx" ON "Stream"("tenantId");

-- CreateIndex
CREATE INDEX "Stream_classRoomId_idx" ON "Stream"("classRoomId");

-- CreateIndex
CREATE INDEX "ClassRoom_tenantId_idx" ON "ClassRoom"("tenantId");

-- CreateIndex
CREATE INDEX "ClassRoom_numeric_idx" ON "ClassRoom"("numeric");

-- CreateIndex
CREATE INDEX "Section_classRoomId_idx" ON "Section"("classRoomId");

-- CreateIndex
CREATE INDEX "Section_streamId_idx" ON "Section"("streamId");

-- CreateIndex
CREATE INDEX "Student_tenantId_idx" ON "Student"("tenantId");

-- CreateIndex
CREATE INDEX "Student_classRoomId_idx" ON "Student"("classRoomId");

-- CreateIndex
CREATE INDEX "Student_sectionId_idx" ON "Student"("sectionId");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_classRoomId_fkey" FOREIGN KEY ("classRoomId") REFERENCES "ClassRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
