-- CreateTable
CREATE TABLE "PayHead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isPercent" BOOLEAN NOT NULL DEFAULT false,
    "amount" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "PayHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "SalaryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryTemplateRecord" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "payHeadId" TEXT NOT NULL,
    "isPercent" BOOLEAN NOT NULL DEFAULT false,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SalaryTemplateRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryStructureRecord" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "payHeadId" TEXT NOT NULL,
    "isPercent" BOOLEAN NOT NULL DEFAULT false,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SalaryStructureRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayHead_code_key" ON "PayHead"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryTemplateRecord_templateId_payHeadId_key" ON "SalaryTemplateRecord"("templateId", "payHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructure_staffId_effectiveFrom_key" ON "SalaryStructure"("staffId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStructureRecord_structureId_payHeadId_key" ON "SalaryStructureRecord"("structureId", "payHeadId");

-- AddForeignKey
ALTER TABLE "PayHead" ADD CONSTRAINT "PayHead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryTemplate" ADD CONSTRAINT "SalaryTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryTemplateRecord" ADD CONSTRAINT "SalaryTemplateRecord_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SalaryTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryTemplateRecord" ADD CONSTRAINT "SalaryTemplateRecord_payHeadId_fkey" FOREIGN KEY ("payHeadId") REFERENCES "PayHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SalaryTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructureRecord" ADD CONSTRAINT "SalaryStructureRecord_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "SalaryStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructureRecord" ADD CONSTRAINT "SalaryStructureRecord_payHeadId_fkey" FOREIGN KEY ("payHeadId") REFERENCES "PayHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
