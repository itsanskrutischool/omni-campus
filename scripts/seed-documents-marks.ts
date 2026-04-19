import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({
    include: {
      tenant: true
    }
  });

  if (!student) {
    console.log('No student found in any tenant.');
    return;
  }

  let academicYear = await prisma.academicYear.findFirst({
    where: { tenantId: student.tenantId }
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        name: '2023-24',
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31'),
        isCurrent: true,
        tenantId: student.tenantId,
      }
    });
  }

  console.log(`Adding documents and academic history for student: ${student.name}`);

  // Create documents
  await prisma.studentDocument.createMany({
    data: [
      {
        studentId: student.id,
        fileUrl: 'https://example.com/birth-cert.pdf',
        type: 'Birth Certificate (PDF)'
      },
      {
        studentId: student.id,
        fileUrl: 'https://example.com/tc.pdf',
        type: 'Transfer Certificate (PDF)'
      },
      {
        studentId: student.id,
        fileUrl: 'https://example.com/medical.jpg',
        type: 'Medical Report (IMAGE)'
      }
    ],
    skipDuplicates: true,
  });

  // Create subjects if they don't exist
  const subjectsData = ['Mathematics', 'Science', 'English', 'History'];
  const subjects = [];
  
  for (const sub of subjectsData) {
    let subject = await prisma.subject.findFirst({
      where: { name: sub, tenantId: student.tenantId }
    });
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: sub,
          code: sub.toUpperCase().substring(0, 3) + Math.floor(Math.random() * 100),
          tenantId: student.tenantId,
        }
      });
    }
    subjects.push(subject);
  }

  // Create An exam
  let exam = await prisma.exam.findFirst({
    where: { name: 'Mid-Term Examination 2023', tenantId: student.tenantId }
  });

  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        name: 'Mid-Term Examination 2023',
        type: 'MID_TERM',
        term: 1,
        startDate: new Date('2023-10-10'),
        endDate: new Date('2023-10-20'),
        tenantId: student.tenantId,
        academicYearId: academicYear.id,
      }
    });
  }

  // Add Marks
  for (const subject of subjects) {
    // Generate a random mark between 60 and 100
    const randomMark = Math.floor(Math.random() * 41) + 60;
    
    // Check if mark already exists
    const existingMark = await prisma.markEntry.findFirst({
      where: {
        studentId: student.id,
        examId: exam.id,
        subjectId: subject.id,
      }
    });

    if (!existingMark) {
      await prisma.markEntry.create({
        data: {
          studentId: student.id,
          examId: exam.id,
          subjectId: subject.id,
          marks: randomMark,
          maxMarks: 100,
        }
      });
    }
  }
  
  // Create another Exam
  let exam2 = await prisma.exam.findFirst({
    where: { name: 'Final Examination 2023', tenantId: student.tenantId }
  });

  if (!exam2) {
    exam2 = await prisma.exam.create({
      data: {
        name: 'Final Examination 2023',
        type: 'FINAL',
        term: 2,
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-03-20'),
        tenantId: student.tenantId,
        academicYearId: academicYear.id,
      }
    });
  }

  // Add Marks
  for (const subject of subjects) {
    // Generate a random mark between 60 and 100
    const randomMark = Math.floor(Math.random() * 41) + 60;
    
    // Check if mark already exists
    const existingMark = await prisma.markEntry.findFirst({
      where: {
        studentId: student.id,
        examId: exam2.id,
        subjectId: subject.id,
      }
    });

    if (!existingMark) {
      await prisma.markEntry.create({
        data: {
          studentId: student.id,
          examId: exam2.id,
          subjectId: subject.id,
          marks: randomMark,
          maxMarks: 100,
        }
      });
    }
  }

  console.log('Successfully seeded documents and academic history features.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
