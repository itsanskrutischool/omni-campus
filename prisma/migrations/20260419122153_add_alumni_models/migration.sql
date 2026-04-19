-- CreateTable
CREATE TABLE "Alumni" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "graduationYear" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "currentJob" TEXT,
    "currentCompany" TEXT,
    "location" TEXT,
    "linkedin" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Alumni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "AlumniEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniDonation" (
    "id" TEXT NOT NULL,
    "alumniId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT,
    "donatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "AlumniDonation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniAchievement" (
    "id" TEXT NOT NULL,
    "alumniId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "achievementDate" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "AlumniAchievement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Alumni" ADD CONSTRAINT "Alumni_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniEvent" ADD CONSTRAINT "AlumniEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniDonation" ADD CONSTRAINT "AlumniDonation_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "Alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniDonation" ADD CONSTRAINT "AlumniDonation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniAchievement" ADD CONSTRAINT "AlumniAchievement_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "Alumni"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniAchievement" ADD CONSTRAINT "AlumniAchievement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
