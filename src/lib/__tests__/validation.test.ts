/**
 * Validation Schema Tests
 * ──────────────────────
 */

import {
  createStudentSchema,
  recordPaymentSchema,
  createEnquirySchema,
} from "../validation"

describe("createStudentSchema", () => {
  it("should validate correct student data", () => {
    const data = {
      name: "John Doe",
      gender: "MALE",
      dob: "2010-01-01T00:00:00Z",
      classRoomId: "cuid123456789",
      fatherName: "Father Name",
      motherName: "Mother Name",
      phone: "9876543210",
    }

    const result = createStudentSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should reject invalid phone number", () => {
    const data = {
      name: "John Doe",
      gender: "MALE",
      dob: "2010-01-01T00:00:00Z",
      classRoomId: "cuid123456789",
      fatherName: "Father Name",
      motherName: "Mother Name",
      phone: "12345", // Invalid
    }

    const result = createStudentSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it("should reject short name", () => {
    const data = {
      name: "J", // Too short
      gender: "MALE",
      dob: "2010-01-01T00:00:00Z",
      classRoomId: "cuid123456789",
      fatherName: "Father Name",
      motherName: "Mother Name",
      phone: "9876543210",
    }

    const result = createStudentSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe("recordPaymentSchema", () => {
  it("should validate correct payment data", () => {
    const data = {
      recordId: "cuid123456789",
      amount: 1000,
      paymentMethod: "CASH",
    }

    const result = recordPaymentSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should reject negative amount", () => {
    const data = {
      recordId: "cuid123456789",
      amount: -100,
      paymentMethod: "CASH",
    }

    const result = recordPaymentSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe("createEnquirySchema", () => {
  it("should validate correct enquiry data", () => {
    const data = {
      studentName: "Jane Doe",
      parentName: "Parent Name",
      phone: "9876543210",
      email: "parent@example.com",
      classAppliedId: "cuid123456789",
    }

    const result = createEnquirySchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
