/**
 * seed.e2e.ts — E2E-only Seed (Idempotent)
 *
 * Script này upsert toàn bộ E2E fixtures vào database đã có base seed.
 * Chạy sau `npm run db:seed` (base accounts phải tồn tại trước).
 *
 * Đặc điểm:
 *   - Dùng prisma.upsert với where: { id } — chạy nhiều lần không lỗi
 *   - Không xóa dữ liệu hiện có (không deleteMany toàn bộ DB)
 *   - Tạo thêm E2E fixtures mà không ảnh hưởng demo data
 *
 * Chạy: npm run db:seed:e2e
 *
 * Prerequisite:
 *   - DATABASE_URL trỏ vào test DB (Railway hoặc Docker local) — KHÔNG dùng production
 *   - npm run db:migrate:prod đã chạy thành công
 *   - npm run db:seed đã chạy (base accounts phải tồn tại)
 *
 * Fixtures tạo (nếu chưa có) / cập nhật (nếu đã có):
 *   Users:           Manager B, Employee out-of-scope, Employee empty, Manager empty
 *   Trips:           PENDING_LEVEL2, REJECTED, SUBMITTED-out-scope, ONGOING,
 *                    APPROVED-2, CLOSED, APPROVED-3
 *   PolicyCheck:     result cho TRIP_URGENT_L2
 *   ApprovalRecords: L1-APPROVED (urgent), L1-REJECTED, L2-APPROVED, MANAGER_REAPPROVE
 *   Expenses:        EXPENSE_SUBMITTED, EXPENSE_VARIANCE_5PCT, EXPENSE_REAPPROVE, EXPENSE_CLOSED
 *   ExpenseItems:    10 items cho 3 expenses trên
 *   Notifications:   TRIP_REJECTED, PENDING_LEVEL2, FINANCE_REQUEST_REVISION,
 *                    MANAGER_REAPPROVE_REQUIRED, unread batch
 *   TripCodeSequence: year=2026, value=10
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─── Shared Constants ─────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;
const DEMO_PASSWORD  = 'Password123!';

// IDs phải khớp với seed.ts — đây là nguồn sự thật duy nhất cho fixtures E2E
const IDS = {
  // Base accounts (phải tồn tại từ seed.ts)
  ADMIN:        'aaaaaaaa-0000-4000-a000-000000000001',
  MANAGER:      'bbbbbbbb-0000-4000-b000-000000000002',
  EMPLOYEE_1:   'cccccccc-0000-4000-c000-000000000003',
  EMPLOYEE_2:   'dddddddd-0000-4000-d000-000000000004',
  TRAVEL_ADMIN: 'eeeeeeee-0000-4000-e000-000000000005',
  FINANCE:      'ffffffff-0000-4000-f000-000000000006',

  // E2E-only users
  MANAGER_B:          'bbbbbbbb-0000-4000-b000-000000000099',
  EMPLOYEE_OUT_SCOPE: 'cccccccc-0000-4000-c000-000000000099',
  EMPLOYEE_EMPTY:     'cccccccc-0000-4000-c000-000000000098',
  MANAGER_EMPTY:      'bbbbbbbb-0000-4000-b000-000000000098',

  // Base trips (từ seed.ts — không upsert ở đây, chỉ reference)
  TRIP_APPROVED: '33333333-0000-4000-a000-000000000003',

  // E2E trips
  TRIP_URGENT_L2:  '44444444-0000-4000-a000-000000000004',
  TRIP_REJECTED:   '55555555-0000-4000-a000-000000000005',
  TRIP_OUT_SCOPE:  '66666666-0000-4000-a000-000000000006',
  TRIP_ONGOING:    '77777777-0000-4000-a000-000000000007',
  TRIP_APPROVED_2: '88888888-0000-4000-a000-000000000008',
  TRIP_CLOSED:     '99999999-0000-4000-a000-000000000009',
  TRIP_APPROVED_3: 'aaaaaaaa-0000-4000-a000-000000000010',

  // E2E policy check
  POLICY_RESULT_2: 'p2222222-0000-4000-a000-000000000002',

  // E2E approval records
  APPROVAL_2: 'ap222222-0000-4000-a000-000000000002',
  APPROVAL_3: 'ap333333-0000-4000-a000-000000000003',
  APPROVAL_4: 'ap444444-0000-4000-a000-000000000004',
  APPROVAL_5: 'ap555555-0000-4000-a000-000000000005',

  // E2E expenses
  EXPENSE_SUBMITTED:     'ex222222-0000-4000-a000-000000000002',
  EXPENSE_VARIANCE_5PCT: 'ex333333-0000-4000-a000-000000000003',
  EXPENSE_REAPPROVE:     'ex444444-0000-4000-a000-000000000004',
  EXPENSE_CLOSED:        'ex555555-0000-4000-a000-000000000005',
} as const;

// ─── Upsert Helpers ───────────────────────────────────────────────────────────

async function upsertE2EUsers(passwordHash: string): Promise<void> {
  console.log('  → Upserting E2E users...');

  const users = [
    {
      id: IDS.MANAGER_B, name: 'Nguyễn Minh Khoa', email: 'khoa.nguyen@smarttravel.dev',
      passwordHash, role: 'MANAGER', jobGrade: 'MANAGER_GRADE',
      department: 'Operations', managerId: IDS.ADMIN, isActive: true,
    },
    {
      id: IDS.EMPLOYEE_OUT_SCOPE, name: 'Lý Văn Phong', email: 'phong.ly@smarttravel.dev',
      passwordHash, role: 'EMPLOYEE', jobGrade: 'STAFF',
      department: 'Operations', managerId: IDS.MANAGER_B, isActive: true,
    },
    {
      id: IDS.EMPLOYEE_EMPTY, name: 'Đinh Thị Hoa', email: 'hoa.dinh@smarttravel.dev',
      passwordHash, role: 'EMPLOYEE', jobGrade: 'STAFF',
      department: 'HR', managerId: IDS.MANAGER, isActive: true,
    },
    {
      id: IDS.MANAGER_EMPTY, name: 'Trần Văn An', email: 'an.tran@smarttravel.dev',
      passwordHash, role: 'MANAGER', jobGrade: 'MANAGER_GRADE',
      department: 'Legal', managerId: IDS.ADMIN, isActive: true,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where:  { id: u.id },
      update: { name: u.name, email: u.email, role: u.role, isActive: u.isActive },
      create: u,
    });
  }

  console.log('  ✓ 4 E2E users upserted');
}

async function upsertE2ETrips(): Promise<void> {
  console.log('  → Upserting E2E trips...');

  const now = new Date();

  function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const dow = result.getDay();
      if (dow !== 0 && dow !== 6) added++;
    }
    return result;
  }

  const urgentDep     = addBusinessDays(now, 1);
  const urgentRet     = new Date(urgentDep); urgentRet.setDate(urgentDep.getDate() + 2);
  const rejDep        = new Date(now); rejDep.setDate(now.getDate() + 10);
  const rejRet        = new Date(rejDep);  rejRet.setDate(rejDep.getDate() + 2);
  const outDep        = new Date(now); outDep.setDate(now.getDate() + 15);
  const outRet        = new Date(outDep);  outRet.setDate(outDep.getDate() + 2);
  const onDep         = new Date(now); onDep.setDate(now.getDate() - 1);
  const onRet         = new Date(now); onRet.setDate(now.getDate() + 2);
  const ap2Dep        = new Date(now); ap2Dep.setDate(now.getDate() + 25);
  const ap2Ret        = new Date(ap2Dep);  ap2Ret.setDate(ap2Dep.getDate() + 3);
  const clDep         = new Date(now); clDep.setDate(now.getDate() - 30);
  const clRet         = new Date(now); clRet.setDate(now.getDate() - 26);
  const ap3Dep        = new Date(now); ap3Dep.setDate(now.getDate() - 20);
  const ap3Ret        = new Date(now); ap3Ret.setDate(now.getDate() - 16);

  type TripUpsertData = {
    id: string; tripCode: string; employeeId: string; origin: string;
    destination: string; destinationType: string; departureDate: Date; returnDate: Date;
    purpose: string; estimatedBudget: number; hotelCostPerNight: number; hotelNights: number;
    perDiemBudget: number; transportBudget: number; otherBudget: number; status: string;
    isUrgent: boolean; urgencyReason: string | null; requiresLevel2: boolean;
    submittedAt?: Date | null; approvedAt?: Date | null; closedAt?: Date | null;
    approvalReasons?: string | null;
  };

  const trips: TripUpsertData[] = [
    {
      id: IDS.TRIP_URGENT_L2, tripCode: 'TR-2026-0004', employeeId: IDS.EMPLOYEE_1,
      origin: 'Hà Nội', destination: 'TP. Hồ Chí Minh', destinationType: 'TIER1_CITY',
      departureDate: urgentDep, returnDate: urgentRet,
      purpose: 'Họp khẩn với đối tác chiến lược tại TP.HCM theo yêu cầu khách hàng',
      estimatedBudget: 18_000_000, hotelCostPerNight: 950_000, hotelNights: 2,
      perDiemBudget: 800_000, transportBudget: 4_000_000, otherBudget: 1_200_000,
      status: 'PENDING_LEVEL2', isUrgent: true, urgencyReason: 'Đối tác yêu cầu họp khẩn',
      requiresLevel2: true, submittedAt: new Date(now.getTime() - 3 * 3600_000),
      approvalReasons: JSON.stringify([{ code: 'URGENT', rule: 'BR-TR-03' }]),
    },
    {
      id: IDS.TRIP_REJECTED, tripCode: 'TR-2026-0005', employeeId: IDS.EMPLOYEE_2,
      origin: 'TP. Hồ Chí Minh', destination: 'Hà Nội', destinationType: 'TIER1_CITY',
      departureDate: rejDep, returnDate: rejRet,
      purpose: 'Tham dự hội thảo sản phẩm khu vực phía Bắc và gặp đối tác',
      estimatedBudget: 9_000_000, hotelCostPerNight: 850_000, hotelNights: 2,
      perDiemBudget: 800_000, transportBudget: 2_500_000, otherBudget: 800_000,
      status: 'REJECTED', isUrgent: false, urgencyReason: null, requiresLevel2: false,
      submittedAt: new Date(now.getTime() - 2 * 86400_000),
    },
    {
      id: IDS.TRIP_OUT_SCOPE, tripCode: 'TR-2026-0006', employeeId: IDS.EMPLOYEE_OUT_SCOPE,
      origin: 'TP. Hồ Chí Minh', destination: 'Đà Lạt', destinationType: 'OTHER',
      departureDate: outDep, returnDate: outRet,
      purpose: 'Khảo sát địa điểm tổ chức sự kiện team building cho bộ phận Operations',
      estimatedBudget: 7_000_000, hotelCostPerNight: 700_000, hotelNights: 2,
      perDiemBudget: 600_000, transportBudget: 1_800_000, otherBudget: 500_000,
      status: 'SUBMITTED', isUrgent: false, urgencyReason: null, requiresLevel2: false,
      submittedAt: new Date(now.getTime() - 6 * 3600_000),
    },
    {
      id: IDS.TRIP_ONGOING, tripCode: 'TR-2026-0007', employeeId: IDS.EMPLOYEE_1,
      origin: 'Hà Nội', destination: 'Cần Thơ', destinationType: 'OTHER',
      departureDate: onDep, returnDate: onRet,
      purpose: 'Làm việc với nhà phân phối khu vực Tây Nam Bộ, kiểm tra tiến độ hợp đồng Q4',
      estimatedBudget: 11_000_000, hotelCostPerNight: 750_000, hotelNights: 3,
      perDiemBudget: 900_000, transportBudget: 3_000_000, otherBudget: 1_000_000,
      status: 'ONGOING', isUrgent: false, urgencyReason: null, requiresLevel2: false,
      submittedAt: new Date(now.getTime() - 7 * 86400_000),
      approvedAt: new Date(now.getTime() - 5 * 86400_000),
    },
    {
      id: IDS.TRIP_APPROVED_2, tripCode: 'TR-2026-0008', employeeId: IDS.EMPLOYEE_2,
      origin: 'Hà Nội', destination: 'Hải Phòng', destinationType: 'TIER1_CITY',
      departureDate: ap2Dep, returnDate: ap2Ret,
      purpose: 'Gặp đối tác cảng biển Hải Phòng, thảo luận hợp đồng logistics Q1 năm sau',
      estimatedBudget: 13_000_000, hotelCostPerNight: 900_000, hotelNights: 3,
      perDiemBudget: 1_200_000, transportBudget: 3_500_000, otherBudget: 1_200_000,
      status: 'APPROVED', isUrgent: false, urgencyReason: null, requiresLevel2: false,
      submittedAt: new Date(now.getTime() - 5 * 86400_000),
      approvedAt:  new Date(now.getTime() - 3 * 86400_000),
    },
    {
      id: IDS.TRIP_CLOSED, tripCode: 'TR-2026-0009', employeeId: IDS.EMPLOYEE_1,
      origin: 'Hà Nội', destination: 'Nha Trang', destinationType: 'OTHER',
      departureDate: clDep, returnDate: clRet,
      purpose: 'Kiểm tra tiến độ dự án triển khai tại khu vực Nam Trung Bộ',
      estimatedBudget: 10_000_000, hotelCostPerNight: 800_000, hotelNights: 4,
      perDiemBudget: 1_200_000, transportBudget: 2_500_000, otherBudget: 800_000,
      status: 'CLOSED', isUrgent: false, urgencyReason: null, requiresLevel2: false,
      submittedAt: new Date(now.getTime() - 45 * 86400_000),
      approvedAt:  new Date(now.getTime() - 43 * 86400_000),
      closedAt:    new Date(now.getTime() - 25 * 86400_000),
    },
    {
      id: IDS.TRIP_APPROVED_3, tripCode: 'TR-2026-0010', employeeId: IDS.EMPLOYEE_1,
      origin: 'Hà Nội', destination: 'Đà Nẵng', destinationType: 'TIER1_CITY',
      departureDate: ap3Dep, returnDate: ap3Ret,
      purpose: 'Hội nghị khách hàng khu vực miền Trung và ký hợp đồng phân phối Q4',
      estimatedBudget: 10_000_000, hotelCostPerNight: 850_000, hotelNights: 4,
      perDiemBudget: 1_600_000, transportBudget: 2_800_000, otherBudget: 600_000,
      status: 'APPROVED', isUrgent: false, urgencyReason: null, requiresLevel2: false,
      submittedAt: new Date(now.getTime() - 30 * 86400_000),
      approvedAt:  new Date(now.getTime() - 28 * 86400_000),
    },
  ];

  for (const t of trips) {
    await prisma.trip.upsert({
      where:  { id: t.id },
      update: { status: t.status, isUrgent: t.isUrgent, urgencyReason: t.urgencyReason,
                requiresLevel2: t.requiresLevel2, submittedAt: t.submittedAt ?? null,
                approvedAt: t.approvedAt ?? null, closedAt: t.closedAt ?? null },
      create: t,
    });
  }

  await prisma.tripCodeSequence.upsert({
    where:  { year: 2026 },
    update: { value: 10 },
    create: { year: 2026, value: 10 },
  });

  console.log('  ✓ 7 E2E trips upserted; TripCodeSequence 2026=10');
}

async function upsertE2EPolicyCheck(): Promise<void> {
  console.log('  → Upserting E2E policy check result...');

  const urgentViolations = JSON.stringify([{
    code: 'POLICY_URGENT_TRIP',
    detail: 'Chuyến đi khởi hành trong vòng 3 ngày làm việc — yêu cầu duyệt 2 cấp',
    severity: 'WARNING', rule: 'BR-TR-03', limit: 3, actual: 1,
  }]);

  await prisma.policyCheckResult.upsert({
    where:  { id: IDS.POLICY_RESULT_2 },
    update: { violations: urgentViolations, requiresLevel2Approval: true },
    create: {
      id: IDS.POLICY_RESULT_2, tripId: IDS.TRIP_URGENT_L2, passed: false,
      violations: urgentViolations, violationCount: 1, requiresLevel2Approval: true,
      checkedAt: new Date(),
    },
  });

  console.log('  ✓ 1 E2E policy check result upserted');
}

async function upsertE2EApprovalRecords(): Promise<void> {
  console.log('  → Upserting E2E approval records...');

  const now = new Date();

  type ApprovalData = {
    id: string; tripId: string; approverId: string; approvalLevel: string;
    action: string; comment: string; budgetSnapshot: number;
    hadViolationsSnapshot: boolean; actedAt: Date;
  };

  const records: ApprovalData[] = [
    {
      id: IDS.APPROVAL_2, tripId: IDS.TRIP_URGENT_L2, approverId: IDS.MANAGER,
      approvalLevel: 'LEVEL_1', action: 'APPROVED',
      comment: 'Chuyến khẩn cấp hợp lệ theo BR-TR-03. Chuyển Travel Admin duyệt cấp 2.',
      budgetSnapshot: 18_000_000, hadViolationsSnapshot: true,
      actedAt: new Date(now.getTime() - 2 * 3600_000),
    },
    {
      id: IDS.APPROVAL_3, tripId: IDS.TRIP_REJECTED, approverId: IDS.MANAGER,
      approvalLevel: 'LEVEL_1', action: 'REJECTED',
      comment: 'Ngân sách vượt mức cho phép trong quý này. Đề nghị xem xét lại và gửi lại vào quý sau.',
      budgetSnapshot: 9_000_000, hadViolationsSnapshot: false,
      actedAt: new Date(now.getTime() - 1 * 86400_000),
    },
    {
      id: IDS.APPROVAL_4, tripId: IDS.TRIP_APPROVED, approverId: IDS.TRAVEL_ADMIN,
      approvalLevel: 'LEVEL_2', action: 'APPROVED',
      comment: 'Xác nhận chuyến công tác hợp lệ và đủ điều kiện. Duyệt cấp 2.',
      budgetSnapshot: 12_000_000, hadViolationsSnapshot: false,
      actedAt: new Date(now.getTime() - 23 * 3600_000),
    },
    {
      id: IDS.APPROVAL_5, tripId: IDS.TRIP_APPROVED_2, approverId: IDS.MANAGER,
      approvalLevel: 'MANAGER_REAPPROVE', action: 'APPROVED',
      comment: 'Xác nhận khoản phát sinh hợp lý do tình huống ngoài kế hoạch. Đồng ý vượt dự toán.',
      budgetSnapshot: 13_000_000, hadViolationsSnapshot: false,
      actedAt: new Date(now.getTime() - 12 * 3600_000),
    },
  ];

  for (const r of records) {
    await prisma.approvalRecord.upsert({
      where:  { id: r.id },
      update: { action: r.action, comment: r.comment, actedAt: r.actedAt },
      create: r,
    });
  }

  console.log('  ✓ 4 E2E approval records upserted');
}

async function upsertE2EExpenses(): Promise<void> {
  console.log('  → Upserting E2E expenses...');

  const now = new Date();

  // ── Expenses header ───────────────────────────────────────────────────────

  await prisma.expense.upsert({
    where:  { id: IDS.EXPENSE_SUBMITTED },
    update: { status: 'EXPENSE_SUBMITTED', totalActual: 9_500_000 },
    create: {
      id: IDS.EXPENSE_SUBMITTED, tripId: IDS.TRIP_ONGOING,
      totalActual: 9_500_000, estimatedBudgetSnapshot: 11_000_000,
      variancePct: -0.136, varianceAmount: -1_500_000, justification: null,
      managerReapprovalRequired: false, managerReapproved: false,
      managerReapproverId: null, managerReapprovedAt: null,
      status: 'EXPENSE_SUBMITTED',
      submittedAt: new Date(now.getTime() - 1 * 86400_000), approvedAt: null,
    },
  });

  await prisma.expense.upsert({
    where:  { id: IDS.EXPENSE_VARIANCE_5PCT },
    update: { status: 'DRAFT', justification: null },
    create: {
      id: IDS.EXPENSE_VARIANCE_5PCT, tripId: IDS.TRIP_APPROVED_3,
      totalActual: 10_500_000, estimatedBudgetSnapshot: 10_000_000,
      variancePct: 0.05, varianceAmount: 500_000, justification: null,
      managerReapprovalRequired: false, managerReapproved: false,
      managerReapproverId: null, managerReapprovedAt: null,
      status: 'DRAFT', submittedAt: null, approvedAt: null,
    },
  });

  await prisma.expense.upsert({
    where:  { id: IDS.EXPENSE_REAPPROVE },
    update: { status: 'EXPENSE_SUBMITTED', managerReapproved: true,
              managerReapproverId: IDS.MANAGER,
              managerReapprovedAt: new Date(now.getTime() - 12 * 3600_000) },
    create: {
      id: IDS.EXPENSE_REAPPROVE, tripId: IDS.TRIP_APPROVED_2,
      totalActual: 14_495_000, estimatedBudgetSnapshot: 13_000_000,
      variancePct: 0.115, varianceAmount: 1_495_000,
      justification: 'Phát sinh chi phí thuê phòng họp ngoài kế hoạch do khách sạn hết phòng hội thảo vào ngày cuối',
      managerReapprovalRequired: true, managerReapproved: true,
      managerReapproverId: IDS.MANAGER,
      managerReapprovedAt: new Date(now.getTime() - 12 * 3600_000),
      status: 'EXPENSE_SUBMITTED',
      submittedAt: new Date(now.getTime() - 2 * 86400_000), approvedAt: null,
    },
  });

  await prisma.expense.upsert({
    where:  { id: IDS.EXPENSE_CLOSED },
    update: { status: 'CLOSED' },
    create: {
      id: IDS.EXPENSE_CLOSED, tripId: IDS.TRIP_CLOSED,
      totalActual: 9_800_000, estimatedBudgetSnapshot: 10_000_000,
      variancePct: -0.02, varianceAmount: -200_000, justification: null,
      managerReapprovalRequired: false, managerReapproved: false,
      managerReapproverId: null, managerReapprovedAt: null,
      status: 'CLOSED',
      submittedAt: new Date(now.getTime() - 28 * 86400_000),
      approvedAt:  new Date(now.getTime() - 26 * 86400_000),
    },
  });

  // ── ExpenseItems — chỉ tạo nếu chưa tồn tại (createMany skipDuplicates) ──

  await prisma.expenseItem.createMany({
    skipDuplicates: true,
    data: [
      // EXPENSE_SUBMITTED items
      { id: 'ei331111-0000-4000-a000-000000000001', expenseId: IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 86400_000), category: 'TRANSPORT',
        amount: 2_800_000, description: 'Vé máy bay HAN-VCA khứ hồi', receiptUrl: null },
      { id: 'ei331112-0000-4000-a000-000000000002', expenseId: IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 86400_000), category: 'ACCOMMODATION',
        amount: 2_250_000, description: 'Khách sạn Cần Thơ - 3 đêm × 750k', receiptUrl: null },
      { id: 'ei331113-0000-4000-a000-000000000003', expenseId: IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 86400_000), category: 'MEAL',
        amount: 900_000, description: 'Tiếp khách đối tác — 3 bữa', receiptUrl: null },
      { id: 'ei331114-0000-4000-a000-000000000004', expenseId: IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 86400_000), category: 'OTHER',
        amount: 3_550_000, description: 'Chi phí phát sinh khác trong chuyến công tác', receiptUrl: null },

      // EXPENSE_REAPPROVE items
      { id: 'ei441111-0000-4000-a000-000000000001', expenseId: IDS.EXPENSE_REAPPROVE,
        expenseDate: new Date(now.getTime() - 3 * 86400_000), category: 'TRANSPORT',
        amount: 3_500_000, description: 'Vé máy bay HAN-HPH khứ hồi', receiptUrl: null },
      { id: 'ei441112-0000-4000-a000-000000000002', expenseId: IDS.EXPENSE_REAPPROVE,
        expenseDate: new Date(now.getTime() - 3 * 86400_000), category: 'ACCOMMODATION',
        amount: 2_700_000, description: 'Khách sạn Hải Phòng - 3 đêm × 900k', receiptUrl: null },
      { id: 'ei441113-0000-4000-a000-000000000003', expenseId: IDS.EXPENSE_REAPPROVE,
        expenseDate: new Date(now.getTime() - 3 * 86400_000), category: 'OTHER',
        amount: 8_295_000, description: 'Thuê phòng họp ngoài kế hoạch + chi phí phát sinh', receiptUrl: null },

      // EXPENSE_CLOSED items
      { id: 'ei551111-0000-4000-a000-000000000001', expenseId: IDS.EXPENSE_CLOSED,
        expenseDate: new Date(now.getTime() - 28 * 86400_000), category: 'TRANSPORT',
        amount: 2_500_000, description: 'Vé máy bay HAN-CXR khứ hồi', receiptUrl: null },
      { id: 'ei551112-0000-4000-a000-000000000002', expenseId: IDS.EXPENSE_CLOSED,
        expenseDate: new Date(now.getTime() - 28 * 86400_000), category: 'ACCOMMODATION',
        amount: 3_200_000, description: 'Khách sạn Nha Trang - 4 đêm × 800k', receiptUrl: null },
      { id: 'ei551113-0000-4000-a000-000000000003', expenseId: IDS.EXPENSE_CLOSED,
        expenseDate: new Date(now.getTime() - 28 * 86400_000), category: 'OTHER',
        amount: 4_100_000, description: 'Chi phí di chuyển nội địa và tiếp khách', receiptUrl: null },
    ],
  });

  console.log('  ✓ 4 E2E expenses + 10 expense items upserted');
}

async function upsertE2ENotifications(): Promise<void> {
  console.log('  → Upserting E2E notifications...');

  const now = new Date();

  type NotifData = {
    id: string; recipientId: string; type: string; message: string;
    referenceId: string; referenceType: string; isRead: boolean;
    readAt: Date | null; createdAt?: Date;
  };

  const notifs: NotifData[] = [
    {
      id: 'nf444444-0000-4000-a000-000000000004', recipientId: IDS.EMPLOYEE_2,
      type: 'TRIP_REJECTED',
      message: 'Yêu cầu công tác "Hội thảo sản phẩm Hà Nội" đã bị từ chối. Lý do: Ngân sách vượt mức cho phép trong quý này.',
      referenceId: IDS.TRIP_REJECTED, referenceType: 'TRIP', isRead: false, readAt: null,
    },
    {
      id: 'nf555555-0000-4000-a000-000000000005', recipientId: IDS.TRAVEL_ADMIN,
      type: 'PENDING_LEVEL2_APPROVAL',
      message: 'Nguyễn Văn Nam có yêu cầu công tác khẩn cấp đang chờ duyệt cấp 2. Vui lòng xem xét sớm.',
      referenceId: IDS.TRIP_URGENT_L2, referenceType: 'TRIP', isRead: false, readAt: null,
    },
    {
      id: 'nf666666-0000-4000-a000-000000000006', recipientId: IDS.EMPLOYEE_1,
      type: 'FINANCE_REQUEST_REVISION',
      message: 'Finance yêu cầu bổ sung thông tin quyết toán chuyến Cần Thơ. Lý do: Thiếu hóa đơn khoản ACCOMMODATION.',
      referenceId: IDS.EXPENSE_SUBMITTED, referenceType: 'EXPENSE', isRead: false, readAt: null,
    },
    {
      id: 'nf777777-0000-4000-a000-000000000007', recipientId: IDS.MANAGER,
      type: 'MANAGER_REAPPROVE_REQUIRED',
      message: 'Trần Thị Bảo vừa nộp quyết toán vượt dự toán hơn 10%. Cần duyệt bổ sung trước khi Finance xử lý.',
      referenceId: IDS.EXPENSE_REAPPROVE, referenceType: 'EXPENSE', isRead: false, readAt: null,
    },
    {
      id: 'nf888888-0000-4000-a000-000000000008', recipientId: IDS.MANAGER,
      type: 'PENDING_LEVEL1_APPROVAL',
      message: 'Lý Văn Phong vừa gửi yêu cầu công tác "Khảo sát địa điểm Đà Lạt". Vui lòng xem xét và phê duyệt.',
      referenceId: IDS.TRIP_OUT_SCOPE, referenceType: 'TRIP', isRead: false, readAt: null,
      createdAt: new Date(now.getTime() - 6 * 3600_000),
    },
  ];

  for (const n of notifs) {
    await prisma.notification.upsert({
      where:  { id: n.id },
      update: { isRead: n.isRead, readAt: n.readAt },
      create: n,
    });
  }

  console.log('  ✓ 5 E2E notifications upserted');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n🌱 Starting E2E seed (idempotent)...\n');
  console.log('  ⚠️  Prerequisite: DATABASE_URL must point to test DB — NOT production!\n');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  await upsertE2EUsers(passwordHash);
  await upsertE2ETrips();
  await upsertE2EPolicyCheck();
  await upsertE2EApprovalRecords();
  await upsertE2EExpenses();
  await upsertE2ENotifications();

  console.log('\n✅ E2E seed completed (idempotent — safe to re-run)!\n');
  console.log('E2E accounts (password: Password123!):');
  console.log('  Manager B:          khoa.nguyen@smarttravel.dev   (Nguyễn Minh Khoa)');
  console.log('  Employee out-scope: phong.ly@smarttravel.dev      (Lý Văn Phong — báo cáo Manager B)');
  console.log('  Employee empty:     hoa.dinh@smarttravel.dev      (Đinh Thị Hoa — không có trip)');
  console.log('  Manager empty:      an.tran@smarttravel.dev       (Trần Văn An — queue rỗng)\n');
  console.log('E2E trips: TR-2026-0004 → TR-2026-0010');
  console.log('TripCodeSequence 2026 = 10 (app tiếp theo: TR-2026-0011)\n');
}

main()
  .catch((err: unknown) => {
    console.error('\n❌ E2E seed failed:', err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
