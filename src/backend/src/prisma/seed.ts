/**
 * seed.ts — Database Seed Data
 *
 * Tạo dữ liệu mẫu đại diện đủ 5 roles để test toàn bộ luồng nghiệp vụ.
 * Personas bám đúng user-stories.md và persona-jtbd.md.
 *
 * Chạy: npm run db:seed
 *
 * Dữ liệu tạo:
 *   - 10 users backend (đủ 5 roles + admin + Manager B + Employee ngoài scope + 2 empty accounts)
 *   - 4 frontend demo users (*@smarttravel.vn)
 *   - 9 trips (DRAFT, SUBMITTED, APPROVED, PENDING_LEVEL2, REJECTED, SUBMITTED-out-scope,
 *              ONGOING, APPROVED-2, CLOSED)
 *   - 2 PolicyCheckResults
 *   - 5 ApprovalRecords
 *   - 3 ItineraryItems
 *   - 5 Expenses + 8 ExpenseItems
 *   - 8 Notifications
 *
 * Mật khẩu tất cả users: "Password123!" (bcrypt hash, cost=12)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// ─── Seed Data Constants ──────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;
const DEMO_PASSWORD = 'Password123!';
const FE_DEMO_PASSWORD = '12345678'; // Password cho frontend demo accounts

// IDs cố định để dễ reference trong dev/test
const IDS = {
  // Users — backend personas
  ADMIN:              'aaaaaaaa-0000-4000-a000-000000000001',
  MANAGER:            'bbbbbbbb-0000-4000-b000-000000000002',
  EMPLOYEE_1:         'cccccccc-0000-4000-c000-000000000003',
  EMPLOYEE_2:         'dddddddd-0000-4000-d000-000000000004',
  TRAVEL_ADMIN:       'eeeeeeee-0000-4000-e000-000000000005',
  FINANCE:            'ffffffff-0000-4000-f000-000000000006',
  // E2E extra users (TASK-SEED-01)
  MANAGER_B:          'bbbbbbbb-0000-4000-b000-000000000099',
  EMPLOYEE_OUT_SCOPE: 'cccccccc-0000-4000-c000-000000000099',
  EMPLOYEE_EMPTY:     'cccccccc-0000-4000-c000-000000000098',
  MANAGER_EMPTY:      'bbbbbbbb-0000-4000-b000-000000000098',

  // Users — frontend demo accounts (email: *@smarttravel.vn, password: 123456)
  FE_EMPLOYEE:     'fe000001-0000-4000-a000-000000000001',
  FE_MANAGER:      'fe000002-0000-4000-a000-000000000002',
  FE_TRAVEL_ADMIN: 'fe000003-0000-4000-a000-000000000003',
  FE_FINANCE:      'fe000004-0000-4000-a000-000000000004',

  // Trips (gốc)
  TRIP_DRAFT:     '11111111-0000-4000-a000-000000000001',
  TRIP_SUBMITTED: '22222222-0000-4000-a000-000000000002',
  TRIP_APPROVED:  '33333333-0000-4000-a000-000000000003',
  // Trips E2E (TASK-SEED-02)
  TRIP_URGENT_L2:      '44444444-0000-4000-a000-000000000004',
  TRIP_REJECTED:       '55555555-0000-4000-a000-000000000005',
  TRIP_OUT_SCOPE:      '66666666-0000-4000-a000-000000000006',
  TRIP_ONGOING:        '77777777-0000-4000-a000-000000000007',
  TRIP_APPROVED_2:     '88888888-0000-4000-a000-000000000008',
  TRIP_CLOSED:         '99999999-0000-4000-a000-000000000009',
  // Trip thêm cho EXPENSE_VARIANCE_5PCT (Trip–Expense là 1:1, không thể share TRIP_CLOSED)
  TRIP_APPROVED_3:     'aaaaaaaa-0000-4000-a000-000000000010',

  // PolicyCheckResult
  POLICY_RESULT_1: 'p1111111-0000-4000-a000-000000000001',
  POLICY_RESULT_2: 'p2222222-0000-4000-a000-000000000002',

  // ApprovalRecord (gốc + E2E — TASK-SEED-04)
  APPROVAL_1: 'ap111111-0000-4000-a000-000000000001',
  APPROVAL_2: 'ap222222-0000-4000-a000-000000000002',
  APPROVAL_3: 'ap333333-0000-4000-a000-000000000003',
  APPROVAL_4: 'ap444444-0000-4000-a000-000000000004',
  APPROVAL_5: 'ap555555-0000-4000-a000-000000000005',

  // Expense (gốc + E2E — TASK-SEED-03)
  EXPENSE_1:             'ex111111-0000-4000-a000-000000000001',
  EXPENSE_SUBMITTED:     'ex222222-0000-4000-a000-000000000002',
  EXPENSE_VARIANCE_5PCT: 'ex333333-0000-4000-a000-000000000003',
  EXPENSE_REAPPROVE:     'ex444444-0000-4000-a000-000000000004',
  EXPENSE_CLOSED:        'ex555555-0000-4000-a000-000000000005',
} as const;

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedUsers(passwordHash: string): Promise<void> {
  console.log('  → Seeding users...');

  await prisma.user.createMany({
    data: [
      // ── ADMIN ──────────────────────────────────────────────────────────────
      {
        id:           IDS.ADMIN,
        name:         'System Admin',
        email:        'admin@smarttravel.dev',
        passwordHash,
        role:         'ADMIN',
        jobGrade:     'DIRECTOR',
        department:   'IT',
        managerId:    null,
        isActive:     true,
      },

      // ── MANAGER — Trần Đình Hùng (Persona 2) ──────────────────────────────
      {
        id:           IDS.MANAGER,
        name:         'Trần Đình Hùng',
        email:        'hung.tran@smarttravel.dev',
        passwordHash,
        role:         'MANAGER',
        jobGrade:     'MANAGER_GRADE',
        department:   'Engineering',
        managerId:    IDS.ADMIN, // Manager báo cáo lên Admin trong seed
        isActive:     true,
      },

      // ── EMPLOYEE 1 — Nguyễn Văn Nam (Persona 1 — US-01..07) ───────────────
      {
        id:           IDS.EMPLOYEE_1,
        name:         'Nguyễn Văn Nam',
        email:        'nam.nguyen@smarttravel.dev',
        passwordHash,
        role:         'EMPLOYEE',
        jobGrade:     'STAFF',
        department:   'Sales',
        managerId:    IDS.MANAGER, // Nam báo cáo lên Hùng
        isActive:     true,
      },

      // ── EMPLOYEE 2 — Nhân viên thứ 2 (để test multi-employee) ─────────────
      {
        id:           IDS.EMPLOYEE_2,
        name:         'Trần Thị Bảo',
        email:        'bao.tran@smarttravel.dev',
        passwordHash,
        role:         'EMPLOYEE',
        jobGrade:     'STAFF',
        department:   'Marketing',
        managerId:    IDS.MANAGER,
        isActive:     true,
      },

      // ── TRAVEL_ADMIN — Lê Thị Mai (Persona 3) ─────────────────────────────
      {
        id:           IDS.TRAVEL_ADMIN,
        name:         'Lê Thị Mai',
        email:        'mai.le@smarttravel.dev',
        passwordHash,
        role:         'TRAVEL_ADMIN',
        jobGrade:     'MANAGER_GRADE',
        department:   'Administration',
        managerId:    IDS.ADMIN,
        isActive:     true,
      },

      // ── FINANCE — Phạm Thu Trang (Persona 4) ──────────────────────────────
      {
        id:           IDS.FINANCE,
        name:         'Phạm Thu Trang',
        email:        'trang.pham@smarttravel.dev',
        passwordHash,
        role:         'FINANCE',
        jobGrade:     'MANAGER_GRADE',
        department:   'Finance & Accounting',
        managerId:    IDS.ADMIN,
        isActive:     true,
      },
    ],
  });

  console.log('  ✓ 6 users created');
}

async function seedE2EUsers(passwordHash: string): Promise<void> {
  console.log('  → Seeding E2E extra users...');

  await prisma.user.createMany({
    data: [
      // ── MANAGER B — Nguyễn Minh Khoa (quản lý Employee ngoài scope của Manager A) ──
      {
        id:           IDS.MANAGER_B,
        name:         'Nguyễn Minh Khoa',
        email:        'khoa.nguyen@smarttravel.dev',
        passwordHash,
        role:         'MANAGER',
        jobGrade:     'MANAGER_GRADE',
        department:   'Operations',
        managerId:    IDS.ADMIN,
        isActive:     true,
      },

      // ── EMPLOYEE ngoài phạm vi Manager A — Lý Văn Phong ──────────────────
      // E2E-04: Manager A (Hùng) không được duyệt trip của Employee này
      {
        id:           IDS.EMPLOYEE_OUT_SCOPE,
        name:         'Lý Văn Phong',
        email:        'phong.ly@smarttravel.dev',
        passwordHash,
        role:         'EMPLOYEE',
        jobGrade:     'STAFF',
        department:   'Operations',
        managerId:    IDS.MANAGER_B,  // báo cáo lên Manager B, không phải Manager A
        isActive:     true,
      },

      // ── EMPLOYEE không có trip — Đinh Thị Hoa ────────────────────────────
      // E2E-09: dashboard Employee rỗng hiển thị empty state
      {
        id:           IDS.EMPLOYEE_EMPTY,
        name:         'Đinh Thị Hoa',
        email:        'hoa.dinh@smarttravel.dev',
        passwordHash,
        role:         'EMPLOYEE',
        jobGrade:     'STAFF',
        department:   'HR',
        managerId:    IDS.MANAGER,
        isActive:     true,
      },

      // ── MANAGER không có direct report nào gửi trip — Trần Văn An ────────
      // E2E-09: queue Manager rỗng hiển thị empty state
      {
        id:           IDS.MANAGER_EMPTY,
        name:         'Trần Văn An',
        email:        'an.tran@smarttravel.dev',
        passwordHash,
        role:         'MANAGER',
        jobGrade:     'MANAGER_GRADE',
        department:   'Legal',
        managerId:    IDS.ADMIN,
        isActive:     true,
      },
    ],
  });

  console.log('  ✓ 4 E2E extra users created');
}

async function seedFrontendUsers(fePasswordHash: string): Promise<void> {
  console.log('  → Seeding frontend demo users (email: *@smarttravel.vn, password: 123456)...');

  await prisma.user.createMany({
    data: [
      // ── Nguyễn Văn Nam — Nhân viên (Employee) ─────────────────────────────
      {
        id:           IDS.FE_EMPLOYEE,
        name:         'Nguyễn Văn Nam',
        email:        'nhanvien@smarttravel.vn',
        passwordHash: fePasswordHash,
        role:         'EMPLOYEE',
        jobGrade:     'STAFF',
        department:   'Sales',
        managerId:    IDS.FE_MANAGER,
        isActive:     true,
      },

      // ── Trần Thị Lan — Quản lý (Manager) ──────────────────────────────────
      {
        id:           IDS.FE_MANAGER,
        name:         'Trần Thị Lan',
        email:        'truongphong@smarttravel.vn',
        passwordHash: fePasswordHash,
        role:         'MANAGER',
        jobGrade:     'MANAGER_GRADE',
        department:   'Sales',
        managerId:    IDS.ADMIN, // báo cáo lên System Admin
        isActive:     true,
      },

      // ── Lê Minh Tuấn — Travel Admin ───────────────────────────────────────
      {
        id:           IDS.FE_TRAVEL_ADMIN,
        name:         'Lê Minh Tuấn',
        email:        'admin@smarttravel.vn',
        passwordHash: fePasswordHash,
        role:         'TRAVEL_ADMIN',
        jobGrade:     'MANAGER_GRADE',
        department:   'Administration',
        managerId:    IDS.ADMIN,
        isActive:     true,
      },

      // ── Phạm Thu Hà — Finance ──────────────────────────────────────────────
      {
        id:           IDS.FE_FINANCE,
        name:         'Phạm Thu Hà',
        email:        'ketoan@smarttravel.vn',
        passwordHash: fePasswordHash,
        role:         'FINANCE',
        jobGrade:     'MANAGER_GRADE',
        department:   'Finance & Accounting',
        managerId:    IDS.ADMIN,
        isActive:     true,
      },
    ],
  });

  console.log('  ✓ 4 frontend demo users created');
}

async function seedTrips(): Promise<void> {
  console.log('  → Seeding trips...');

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  const nextWeekPlus3 = new Date(nextWeek);
  nextWeekPlus3.setDate(nextWeek.getDate() + 3);

  const twoWeeksLater = new Date(now);
  twoWeeksLater.setDate(now.getDate() + 14);
  const twoWeeksPlus2 = new Date(twoWeeksLater);
  twoWeeksPlus2.setDate(twoWeeksLater.getDate() + 2);

  const threeWeeksLater = new Date(now);
  threeWeeksLater.setDate(now.getDate() + 21);
  const threeWeeksPlus4 = new Date(threeWeeksLater);
  threeWeeksPlus4.setDate(threeWeeksLater.getDate() + 4);

  await prisma.trip.createMany({
    data: [
      // ── Trip 1: DRAFT — Nguyễn Văn Nam đang soạn ─────────────────────────
      {
        id:               IDS.TRIP_DRAFT,
        tripCode:         'TR-2026-0001',
        employeeId:       IDS.EMPLOYEE_1,
        origin:           'Hà Nội',
        destination:      'Đà Nẵng',
        destinationType:  'TIER1_CITY',
        departureDate:    nextWeek,
        returnDate:       nextWeekPlus3,
        purpose:          'Gặp gỡ khách hàng tiềm năng tại Đà Nẵng, thuyết trình demo sản phẩm và ký kết hợp đồng Q4',
        estimatedBudget:  8_500_000,   // 8.5 triệu VNĐ
        hotelCostPerNight: 900_000,    // Dưới hạn mức STAFF (1M/đêm) — BR-TR-01
        hotelNights:      3,
        perDiemBudget:    1_200_000,   // 3 ngày × 400k = đúng hạn mức TIER1_CITY — BR-TR-02
        transportBudget:  2_000_000,
        otherBudget:      700_000,
        status:           'DRAFT',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
      },

      // ── Trip 2: SUBMITTED — Nguyễn Văn Nam đã nộp (có policy violation) ───
      {
        id:               IDS.TRIP_SUBMITTED,
        tripCode:         'TR-2026-0002',
        employeeId:       IDS.EMPLOYEE_1,
        origin:           'Hà Nội',
        destination:      'TP. Hồ Chí Minh',
        destinationType:  'TIER1_CITY',
        departureDate:    twoWeeksLater,
        returnDate:       twoWeeksPlus2,
        purpose:          'Họp chiến lược Q1 với Ban Giám đốc khu vực phía Nam và đối tác chiến lược',
        estimatedBudget:  15_000_000,  // 15 triệu VNĐ — dưới ngưỡng 20M
        hotelCostPerNight: 1_200_000,  // VƯỢT hạn mức STAFF (1M) → policy violation BR-TR-01
        hotelNights:      2,
        perDiemBudget:    800_000,     // 2 ngày × 400k = đúng hạn mức
        transportBudget:  3_500_000,
        otherBudget:      1_500_000,
        status:           'SUBMITTED',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,       // 15 triệu + chỉ warning BR-TR-01 (ngoài white-list BR-TR-04) → 1 cấp
        submittedAt:      new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 tiếng trước
      },

      // ── Trip 3: APPROVED — Trần Thị Bảo, trip đã được duyệt ──────────────
      {
        id:               IDS.TRIP_APPROVED,
        tripCode:         'TR-2026-0003',
        employeeId:       IDS.EMPLOYEE_2,
        origin:           'Hà Nội',
        destination:      'Cần Thơ',
        destinationType:  'OTHER',
        departureDate:    threeWeeksLater,
        returnDate:       threeWeeksPlus4,
        purpose:          'Khảo sát thị trường khu vực Đồng bằng sông Cửu Long, gặp 3 đại lý phân phối',
        estimatedBudget:  12_000_000,
        hotelCostPerNight: 800_000,    // Dưới hạn mức STAFF (1M) — BR-TR-01
        hotelNights:      4,
        perDiemBudget:    1_200_000,   // 4 ngày × 300k = đúng hạn mức OTHER — BR-TR-02
        transportBudget:  2_500_000,
        otherBudget:      1_500_000,
        status:           'APPROVED',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
        submittedAt:      new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 ngày trước
        approvedAt:       new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 ngày trước
      },
    ],
  });

  console.log('  ✓ 3 trips created (DRAFT, SUBMITTED, APPROVED)');
}

async function seedE2ETrips(): Promise<void> {
  console.log('  → Seeding E2E trips...');

  const now = new Date();

  // ── Helper: thêm ngày làm việc (bỏ qua Thứ 7, Chủ nhật) ─────────────────
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

  // Trip 4: PENDING_LEVEL2 — khẩn cấp, Manager A đã duyệt L1, chờ Travel Admin
  const urgentDeparture = addBusinessDays(now, 1); // < 3 ngày làm việc → khẩn cấp
  const urgentReturn    = new Date(urgentDeparture);
  urgentReturn.setDate(urgentDeparture.getDate() + 2);

  // Trip 5: REJECTED
  const rejectedDep = new Date(now); rejectedDep.setDate(now.getDate() + 10);
  const rejectedRet = new Date(rejectedDep); rejectedRet.setDate(rejectedDep.getDate() + 2);

  // Trip 6: SUBMITTED — Employee ngoài scope (Lý Văn Phong, Manager B)
  const outScopeDep = new Date(now); outScopeDep.setDate(now.getDate() + 15);
  const outScopeRet = new Date(outScopeDep); outScopeRet.setDate(outScopeDep.getDate() + 2);

  // Trip 7: ONGOING — đã khởi hành, chưa kết thúc
  const ongoingDep = new Date(now); ongoingDep.setDate(now.getDate() - 1);
  const ongoingRet = new Date(now); ongoingRet.setDate(now.getDate() + 2);

  // Trip 8: APPROVED thứ hai — Trần Thị Bảo, để test Finance/re-approve
  const approved2Dep = new Date(now); approved2Dep.setDate(now.getDate() + 25);
  const approved2Ret = new Date(approved2Dep); approved2Ret.setDate(approved2Dep.getDate() + 3);

  // Trip 9: CLOSED — hồ sơ đã đóng, test read-only
  const closedDep = new Date(now); closedDep.setDate(now.getDate() - 30);
  const closedRet = new Date(now); closedRet.setDate(now.getDate() - 26);

  await prisma.trip.createMany({
    data: [
      // ── Trip 4: PENDING_LEVEL2 — khẩn cấp, chờ Travel Admin ─────────────
      // E2E-03: luồng duyệt 2 cấp; E2E-09: Travel Admin thấy trong queue
      {
        id:               IDS.TRIP_URGENT_L2,
        tripCode:         'TR-2026-0004',
        employeeId:       IDS.EMPLOYEE_1,
        origin:           'Hà Nội',
        destination:      'TP. Hồ Chí Minh',
        destinationType:  'TIER1_CITY',
        departureDate:    urgentDeparture,
        returnDate:       urgentReturn,
        purpose:          'Họp khẩn với đối tác chiến lược tại TP.HCM theo yêu cầu khách hàng',
        estimatedBudget:  18_000_000,
        hotelCostPerNight: 950_000,
        hotelNights:      2,
        perDiemBudget:    800_000,
        transportBudget:  4_000_000,
        otherBudget:      1_200_000,
        status:           'PENDING_LEVEL2',
        isUrgent:         true,
        urgencyReason:    'Đối tác yêu cầu họp khẩn',  // ≥10 ký tự sau trim
        requiresLevel2:   true,
        submittedAt:      new Date(now.getTime() - 3 * 60 * 60 * 1000),   // 3 giờ trước
        approvalReasons:  JSON.stringify([{ code: 'URGENT', rule: 'BR-TR-03' }]),
      },

      // ── Trip 5: REJECTED — Manager A từ chối Trần Thị Bảo ────────────────
      // E2E-03, E2E-04: test luồng từ chối
      {
        id:               IDS.TRIP_REJECTED,
        tripCode:         'TR-2026-0005',
        employeeId:       IDS.EMPLOYEE_2,
        origin:           'TP. Hồ Chí Minh',
        destination:      'Hà Nội',
        destinationType:  'TIER1_CITY',
        departureDate:    rejectedDep,
        returnDate:       rejectedRet,
        purpose:          'Tham dự hội thảo sản phẩm khu vực phía Bắc và gặp đối tác',
        estimatedBudget:  9_000_000,
        hotelCostPerNight: 850_000,
        hotelNights:      2,
        perDiemBudget:    800_000,
        transportBudget:  2_500_000,
        otherBudget:      800_000,
        status:           'REJECTED',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
        submittedAt:      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
      },

      // ── Trip 6: SUBMITTED — Lý Văn Phong (ngoài scope Manager A) ─────────
      // E2E-04: Manager A thử duyệt → bị chặn; E2E-09: Manager B thấy trong queue
      {
        id:               IDS.TRIP_OUT_SCOPE,
        tripCode:         'TR-2026-0006',
        employeeId:       IDS.EMPLOYEE_OUT_SCOPE,
        origin:           'TP. Hồ Chí Minh',
        destination:      'Đà Lạt',
        destinationType:  'OTHER',
        departureDate:    outScopeDep,
        returnDate:       outScopeRet,
        purpose:          'Khảo sát địa điểm tổ chức sự kiện team building cho bộ phận Operations',
        estimatedBudget:  7_000_000,
        hotelCostPerNight: 700_000,
        hotelNights:      2,
        perDiemBudget:    600_000,
        transportBudget:  1_800_000,
        otherBudget:      500_000,
        status:           'SUBMITTED',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
        submittedAt:      new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 giờ trước
      },

      // ── Trip 7: ONGOING — Nguyễn Văn Nam, đang trong hành trình ──────────
      // E2E-05: Employee tạo Expense Claim cho trip ONGOING
      {
        id:               IDS.TRIP_ONGOING,
        tripCode:         'TR-2026-0007',
        employeeId:       IDS.EMPLOYEE_1,
        origin:           'Hà Nội',
        destination:      'Cần Thơ',
        destinationType:  'OTHER',
        departureDate:    ongoingDep,
        returnDate:       ongoingRet,
        purpose:          'Làm việc với nhà phân phối khu vực Tây Nam Bộ, kiểm tra tiến độ hợp đồng Q4',
        estimatedBudget:  11_000_000,
        hotelCostPerNight: 750_000,
        hotelNights:      3,
        perDiemBudget:    900_000,
        transportBudget:  3_000_000,
        otherBudget:      1_000_000,
        status:           'ONGOING',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
        submittedAt:      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),  // 7 ngày trước
        approvedAt:       new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),  // 5 ngày trước
      },

      // ── Trip 8: APPROVED (2nd) — Trần Thị Bảo, để test expense re-approve ─
      // E2E-07: Finance close + Manager re-approve; E2E-11: PDF permission test
      {
        id:               IDS.TRIP_APPROVED_2,
        tripCode:         'TR-2026-0008',
        employeeId:       IDS.EMPLOYEE_2,
        origin:           'Hà Nội',
        destination:      'Hải Phòng',
        destinationType:  'TIER1_CITY',
        departureDate:    approved2Dep,
        returnDate:       approved2Ret,
        purpose:          'Gặp đối tác cảng biển Hải Phòng, thảo luận hợp đồng logistics Q1 năm sau',
        estimatedBudget:  13_000_000,
        hotelCostPerNight: 900_000,
        hotelNights:      3,
        perDiemBudget:    1_200_000,
        transportBudget:  3_500_000,
        otherBudget:      1_200_000,
        status:           'APPROVED',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
        submittedAt:      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),  // 5 ngày trước
        approvedAt:       new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),  // 3 ngày trước
      },

      // ── Trip 9: CLOSED — Nguyễn Văn Nam, hồ sơ đã đóng ──────────────────
      // E2E-07: hồ sơ CLOSED là read-only, không thể chỉnh sửa lịch trình
      {
        id:               IDS.TRIP_CLOSED,
        tripCode:         'TR-2026-0009',
        employeeId:       IDS.EMPLOYEE_1,
        origin:           'Hà Nội',
        destination:      'Nha Trang',
        destinationType:  'OTHER',
        departureDate:    closedDep,
        returnDate:       closedRet,
        purpose:          'Kiểm tra tiến độ dự án triển khai tại khu vực Nam Trung Bộ',
        estimatedBudget:  10_000_000,
        hotelCostPerNight: 800_000,
        hotelNights:      4,
        perDiemBudget:    1_200_000,
        transportBudget:  2_500_000,
        otherBudget:      800_000,
        status:           'CLOSED',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
        submittedAt:      new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 ngày trước
        approvedAt:       new Date(now.getTime() - 43 * 24 * 60 * 60 * 1000), // 43 ngày trước
        closedAt:         new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 ngày trước
      },

      // ── Trip 10: APPROVED (3rd) — Nguyễn Văn Nam, dành riêng cho Expense variance 5% ──
      // Expense–Trip là 1:1; TRIP_CLOSED đã dùng cho EXPENSE_CLOSED
      // E2E-06: test luồng justification khi variance ≤10%
      {
        id:               IDS.TRIP_APPROVED_3,
        tripCode:         'TR-2026-0010',
        employeeId:       IDS.EMPLOYEE_1,
        origin:           'Hà Nội',
        destination:      'Đà Nẵng',
        destinationType:  'TIER1_CITY',
        departureDate:    new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 ngày trước
        returnDate:       new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000), // 16 ngày trước
        purpose:          'Hội nghị khách hàng khu vực miền Trung và ký hợp đồng phân phối Q4',
        estimatedBudget:  10_000_000,
        hotelCostPerNight: 850_000,
        hotelNights:      4,
        perDiemBudget:    1_600_000,
        transportBudget:  2_800_000,
        otherBudget:      600_000,
        status:           'APPROVED',
        isUrgent:         false,
        urgencyReason:    null,
        requiresLevel2:   false,
        submittedAt:      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        approvedAt:       new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Cập nhật TripCodeSequence để app biết trip tiếp theo bắt đầu từ số 11
  await prisma.tripCodeSequence.upsert({
    where:  { year: 2026 },
    update: { value: 10 },
    create: { year: 2026, value: 10 },
  });

  console.log('  ✓ 7 E2E trips created (PENDING_LEVEL2, REJECTED, SUBMITTED-out-scope, ONGOING, APPROVED-2, CLOSED, APPROVED-3)');
}

async function seedPolicyCheckResults(): Promise<void> {
  console.log('  → Seeding policy check results...');

  // Policy result cho Trip SUBMITTED (có violation)
  const violations = JSON.stringify([
    {
      code:     'POLICY_VIOLATION_ACCOMMODATION_OVER_BUDGET',
      detail:   'Chi phí khách sạn 1.200.000 VNĐ/đêm vượt hạn mức STAFF (1.000.000 VNĐ/đêm)',
      severity: 'WARNING',
      rule:     'BR-TR-01',
      limit:    1_000_000,
      actual:   1_200_000,
    },
  ]);

  await prisma.policyCheckResult.createMany({
    data: [
      {
        id:                    IDS.POLICY_RESULT_1,
        tripId:                IDS.TRIP_SUBMITTED,
        passed:                false,
        violations,
        violationCount:        1,         // vẫn còn warning BR-TR-01 accommodation (để hiển thị banner)
        requiresLevel2Approval: false,    // white-list BR-TR-04 không match → 1 cấp
        checkedAt:             new Date(),
      },
    ],
  });

  console.log('  ✓ 1 policy check result created');
}

async function seedE2EPolicyCheckResults(): Promise<void> {
  console.log('  → Seeding E2E policy check results...');

  // Policy result cho Trip URGENT_L2 (khẩn cấp → requiresLevel2Approval = true)
  const urgentViolations = JSON.stringify([
    {
      code:     'POLICY_URGENT_TRIP',
      detail:   'Chuyến đi khởi hành trong vòng 3 ngày làm việc — yêu cầu duyệt 2 cấp',
      severity: 'WARNING',
      rule:     'BR-TR-03',
      limit:    3,
      actual:   1,
    },
  ]);

  await prisma.policyCheckResult.createMany({
    data: [
      {
        id:                     IDS.POLICY_RESULT_2,
        tripId:                 IDS.TRIP_URGENT_L2,
        passed:                 false,
        violations:             urgentViolations,
        violationCount:         1,
        requiresLevel2Approval: true,
        checkedAt:              new Date(),
      },
    ],
  });

  console.log('  ✓ 1 E2E policy check result created');
}

async function seedApprovalRecords(): Promise<void> {
  console.log('  → Seeding approval records...');

  // Approval record cho Trip APPROVED (Manager đã duyệt)
  await prisma.approvalRecord.createMany({
    data: [
      {
        id:                   IDS.APPROVAL_1,
        tripId:               IDS.TRIP_APPROVED,
        approverId:           IDS.MANAGER,
        approvalLevel:        'LEVEL_1',
        action:               'APPROVED',
        comment:             'Chuyến đi hợp lý, ngân sách trong hạn mức, lịch trình rõ ràng. Approved.',
        budgetSnapshot:       12_000_000,
        hadViolationsSnapshot: false,
        actedAt:              new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('  ✓ 1 approval record created');
}

async function seedE2EApprovalRecords(): Promise<void> {
  console.log('  → Seeding E2E approval records...');

  const now = new Date();

  await prisma.approvalRecord.createMany({
    data: [
      // ── Record 2: Level 1 APPROVED cho Trip URGENT_L2 ────────────────────
      // Chứng minh Manager đã duyệt Level 1; trip đang chờ Travel Admin Level 2
      {
        id:                   IDS.APPROVAL_2,
        tripId:               IDS.TRIP_URGENT_L2,
        approverId:           IDS.MANAGER,
        approvalLevel:        'LEVEL_1',
        action:               'APPROVED',
        comment:             'Chuyến khẩn cấp hợp lệ theo BR-TR-03. Chuyển Travel Admin duyệt cấp 2.',
        budgetSnapshot:       18_000_000,
        hadViolationsSnapshot: true,
        actedAt:              new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 giờ trước
      },

      // ── Record 3: Level 1 REJECTED cho Trip REJECTED ─────────────────────
      // E2E-04: Manager từ chối với lý do; trip chuyển REJECTED
      {
        id:                   IDS.APPROVAL_3,
        tripId:               IDS.TRIP_REJECTED,
        approverId:           IDS.MANAGER,
        approvalLevel:        'LEVEL_1',
        action:               'REJECTED',
        comment:             'Ngân sách vượt mức cho phép trong quý này. Đề nghị xem xét lại và gửi lại vào quý sau.',
        budgetSnapshot:       9_000_000,
        hadViolationsSnapshot: false,
        actedAt:              new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước
      },

      // ── Record 4: Level 2 APPROVED bởi Travel Admin ──────────────────────
      // Gắn với TRIP_APPROVED (có cả L1 lẫn L2 để làm mẫu luồng hoàn chỉnh)
      // E2E-03: Travel Admin duyệt cấp 2
      {
        id:                   IDS.APPROVAL_4,
        tripId:               IDS.TRIP_APPROVED,
        approverId:           IDS.TRAVEL_ADMIN,
        approvalLevel:        'LEVEL_2',
        action:               'APPROVED',
        comment:             'Xác nhận chuyến công tác hợp lệ và đủ điều kiện. Duyệt cấp 2.',
        budgetSnapshot:       12_000_000,
        hadViolationsSnapshot: false,
        actedAt:              new Date(now.getTime() - 23 * 60 * 60 * 1000), // 23 giờ trước
      },

      // ── Record 5: MANAGER_REAPPROVE APPROVED ─────────────────────────────
      // E2E-07: Manager duyệt bổ sung expense >10%; sau đó Finance mới được close
      {
        id:                   IDS.APPROVAL_5,
        tripId:               IDS.TRIP_APPROVED_2,
        approverId:           IDS.MANAGER,
        approvalLevel:        'MANAGER_REAPPROVE',
        action:               'APPROVED',
        comment:             'Xác nhận khoản phát sinh hợp lý do tình huống ngoài kế hoạch. Đồng ý vượt dự toán.',
        budgetSnapshot:       13_000_000,
        hadViolationsSnapshot: false,
        actedAt:              new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 giờ trước
      },
    ],
  });

  console.log('  ✓ 4 E2E approval records created');
}

async function seedItineraryItems(): Promise<void> {
  console.log('  → Seeding itinerary items...');

  const threeWeeksLater = new Date();
  threeWeeksLater.setDate(new Date().getDate() + 21);

  const day2 = new Date(threeWeeksLater);
  day2.setDate(threeWeeksLater.getDate() + 1);

  const day3 = new Date(threeWeeksLater);
  day3.setDate(threeWeeksLater.getDate() + 2);

  await prisma.itineraryItem.createMany({
    data: [
      // Ngày 1 — Di chuyển + Check-in
      {
        id:            'it111111-0000-4000-a000-000000000001',
        tripId:        IDS.TRIP_APPROVED,
        itemDate:      threeWeeksLater,
        dayNumber:     1,
        timeSlot:      'MORNING',
        location:      'Sân bay Nội Bài, Hà Nội',
        activity:      'Bay chuyến HAN-VCA, khởi hành 7:30',
        category:      'TRANSPORT',
        estimatedCost: 1_200_000,
        notes:         'Vé máy bay đã book trước',
        isAiGenerated: false,
        sortOrder:     1,
      },
      {
        id:            'it222222-0000-4000-a000-000000000002',
        tripId:        IDS.TRIP_APPROVED,
        itemDate:      threeWeeksLater,
        dayNumber:     1,
        timeSlot:      'AFTERNOON',
        location:      'Khách sạn Mường Thanh Cần Thơ',
        activity:      'Check-in khách sạn, chuẩn bị tài liệu họp',
        category:      'ACCOMMODATION',
        estimatedCost: 800_000,
        notes:         'Phòng Superior, bao gồm bữa sáng',
        isAiGenerated: true,
        sortOrder:     2,
      },

      // Ngày 2 — Gặp đại lý
      {
        id:            'it333333-0000-4000-a000-000000000003',
        tripId:        IDS.TRIP_APPROVED,
        itemDate:      day2,
        dayNumber:     2,
        timeSlot:      'MORNING',
        location:      'Đại lý ABC - 15 Hùng Vương, Cần Thơ',
        activity:      'Họp thương thảo hợp đồng phân phối Q1 với đại lý ABC',
        category:      'MEETING',
        estimatedCost: 0,
        notes:         'Mang theo catalog và bảng giá mới',
        isAiGenerated: false,
        sortOrder:     3,
      },
    ],
  });

  console.log('  ✓ 3 itinerary items created');
}

async function seedExpenses(): Promise<void> {
  console.log('  → Seeding expense data...');

  // BR-TR-05 (luồng mới): expense >10% (giá trị thô) khi submit → trip = MANAGER_REAPPROVE
  // (chờ Manager duyệt bổ sung), chỉ sau khi Manager duyệt mới về EXPENSE_SUBMITTED cho Finance.
  // Seed dưới đây là expense DRAFT (chưa submit) nên không cần cờ managerReapprovalRequired.
  // LƯU Ý: dữ liệu cũ tạo trước luồng mới có thể còn trip EXPENSE_SUBMITTED kèm
  // managerReapprovalRequired=true (trạng thái lái so với luồng mới) → chạy `npm run db:reset`.

  // Expense DRAFT cho Trip APPROVED (Trần Thị Bảo đang kê khai)
  await prisma.expense.createMany({
    data: [
      {
        id:                       IDS.EXPENSE_1,
        tripId:                   IDS.TRIP_APPROVED,
        totalActual:              3_800_000,     // Tổng 2 items bên dưới
        estimatedBudgetSnapshot:  12_000_000,   // Snapshot từ trip.estimatedBudget
        variancePct:              null,          // Chưa submit → chưa tính
        varianceAmount:           null,
        justification:            null,
        managerReapprovalRequired: false,
        managerReapproved:         false,
        managerReapproverId:       null,
        managerReapprovedAt:       null,
        status:                   'DRAFT',
        submittedAt:              null,
        approvedAt:               null,
      },
    ],
  });

  await prisma.expenseItem.createMany({
    data: [
      {
        id:          'ei111111-0000-4000-a000-000000000001',
        expenseId:   IDS.EXPENSE_1,
        expenseDate: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000),
        category:    'TRANSPORT',
        amount:      1_200_000,
        description: 'Vé máy bay HAN-VCA khứ hồi',
        receiptUrl:  null,
      },
      {
        id:          'ei222222-0000-4000-a000-000000000002',
        expenseId:   IDS.EXPENSE_1,
        expenseDate: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000),
        category:    'ACCOMMODATION',
        amount:      2_600_000,   // 800k × ~ 3 đêm (tạm tính)
        description: 'Khách sạn Mường Thanh Cần Thơ - 3 đêm',
        receiptUrl:  null,
      },
    ],
  });

  console.log('  ✓ 1 expense + 2 expense items created');
}

async function seedE2EExpenses(): Promise<void> {
  console.log('  → Seeding E2E expenses...');

  const now = new Date();

  await prisma.expense.createMany({
    data: [
      // ── Expense 2: EXPENSE_SUBMITTED — không vượt dự toán ────────────────
      // E2E-05: Finance thấy trong queue, có thể approve/close
      {
        id:                       IDS.EXPENSE_SUBMITTED,
        tripId:                   IDS.TRIP_ONGOING,
        totalActual:              9_500_000,
        estimatedBudgetSnapshot:  11_000_000,
        variancePct:              -0.136,        // âm → không vượt dự toán
        varianceAmount:           -1_500_000,
        justification:            null,          // không cần justification
        managerReapprovalRequired: false,
        managerReapproved:         false,
        managerReapproverId:       null,
        managerReapprovedAt:       null,
        status:                   'EXPENSE_SUBMITTED',
        submittedAt:              new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 ngày trước
        approvedAt:               null,
      },

      // ── Expense 3: DRAFT — variance 5% (chưa có justification) ──────────
      // E2E-06: UI block khi submit thiếu justification; hợp lệ khi nhập xong
      // Dùng TRIP_APPROVED_3 (Trip–Expense là 1:1; TRIP_CLOSED đã có EXPENSE_CLOSED)
      {
        id:                       IDS.EXPENSE_VARIANCE_5PCT,
        tripId:                   IDS.TRIP_APPROVED_3,
        totalActual:              10_500_000,    // vượt 500k (5%) so với 10M
        estimatedBudgetSnapshot:  10_000_000,
        variancePct:              0.05,
        varianceAmount:           500_000,
        justification:            null,          // chưa nhập — test UI block
        managerReapprovalRequired: false,        // ≤10% không cần re-approve
        managerReapproved:         false,
        managerReapproverId:       null,
        managerReapprovedAt:       null,
        status:                   'DRAFT',
        submittedAt:              null,
        approvedAt:               null,
      },

      // ── Expense 4: MANAGER_REAPPROVE — variance >10% ─────────────────────
      // E2E-07: Finance thử close → bị chặn; Manager duyệt bổ sung → Finance close được
      // TRIP_APPROVED_2 thuộc Trần Thị Bảo, Manager A quản lý
      {
        id:                       IDS.EXPENSE_REAPPROVE,
        tripId:                   IDS.TRIP_APPROVED_2,
        totalActual:              14_495_000,    // vượt 1.495M (~11.5%) so với 13M
        estimatedBudgetSnapshot:  13_000_000,
        variancePct:              0.115,
        varianceAmount:           1_495_000,
        justification:            'Phát sinh chi phí thuê phòng họp ngoài kế hoạch do khách sạn hết phòng hội thảo vào ngày cuối',
        managerReapprovalRequired: true,
        managerReapproved:         true,         // Manager đã duyệt bổ sung (Record 5)
        managerReapproverId:       IDS.MANAGER,
        managerReapprovedAt:       new Date(now.getTime() - 12 * 60 * 60 * 1000),
        status:                   'EXPENSE_SUBMITTED', // sau khi Manager duyệt → Finance xử lý
        submittedAt:              new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        approvedAt:               null,
      },

      // ── Expense 5: CLOSED — hồ sơ đã đóng ───────────────────────────────
      // E2E-07: test hồ sơ CLOSED không thể chỉnh sửa (read-only)
      {
        id:                       IDS.EXPENSE_CLOSED,
        tripId:                   IDS.TRIP_CLOSED,  // tái dùng TRIP_CLOSED
        totalActual:              9_800_000,
        estimatedBudgetSnapshot:  10_000_000,
        variancePct:              -0.02,
        varianceAmount:           -200_000,
        justification:            null,
        managerReapprovalRequired: false,
        managerReapproved:         false,
        managerReapproverId:       null,
        managerReapprovedAt:       null,
        status:                   'CLOSED',
        submittedAt:              new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        approvedAt:               new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ExpenseItems cho từng expense mới
  await prisma.expenseItem.createMany({
    data: [
      // Items cho EXPENSE_SUBMITTED (Trip ONGOING)
      {
        id:          'ei331111-0000-4000-a000-000000000001',
        expenseId:   IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        category:    'TRANSPORT',
        amount:      2_800_000,
        description: 'Vé máy bay HAN-VCA khứ hồi',
        receiptUrl:  null,
      },
      {
        id:          'ei331112-0000-4000-a000-000000000002',
        expenseId:   IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        category:    'ACCOMMODATION',
        amount:      2_250_000,
        description: 'Khách sạn Cần Thơ - 3 đêm × 750k',
        receiptUrl:  null,
      },
      {
        id:          'ei331113-0000-4000-a000-000000000003',
        expenseId:   IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        category:    'MEAL',
        amount:      900_000,
        description: 'Tiếp khách đối tác — 3 bữa',
        receiptUrl:  null,
      },
      {
        id:          'ei331114-0000-4000-a000-000000000004',
        expenseId:   IDS.EXPENSE_SUBMITTED,
        expenseDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        category:    'OTHER',
        amount:      3_550_000,
        description: 'Chi phí phát sinh khác trong chuyến công tác',
        receiptUrl:  null,
      },

      // Items cho EXPENSE_REAPPROVE (Trip APPROVED_2)
      {
        id:          'ei441111-0000-4000-a000-000000000001',
        expenseId:   IDS.EXPENSE_REAPPROVE,
        expenseDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        category:    'TRANSPORT',
        amount:      3_500_000,
        description: 'Vé máy bay HAN-HPH khứ hồi',
        receiptUrl:  null,
      },
      {
        id:          'ei441112-0000-4000-a000-000000000002',
        expenseId:   IDS.EXPENSE_REAPPROVE,
        expenseDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        category:    'ACCOMMODATION',
        amount:      2_700_000,
        description: 'Khách sạn Hải Phòng - 3 đêm × 900k',
        receiptUrl:  null,
      },
      {
        id:          'ei441113-0000-4000-a000-000000000003',
        expenseId:   IDS.EXPENSE_REAPPROVE,
        expenseDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        category:    'OTHER',
        amount:      8_295_000,
        description: 'Thuê phòng họp ngoài kế hoạch + chi phí phát sinh',
        receiptUrl:  null,
      },

      // Items cho EXPENSE_CLOSED (Trip CLOSED)
      {
        id:          'ei551111-0000-4000-a000-000000000001',
        expenseId:   IDS.EXPENSE_CLOSED,
        expenseDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        category:    'TRANSPORT',
        amount:      2_500_000,
        description: 'Vé máy bay HAN-CXR khứ hồi',
        receiptUrl:  null,
      },
      {
        id:          'ei551112-0000-4000-a000-000000000002',
        expenseId:   IDS.EXPENSE_CLOSED,
        expenseDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        category:    'ACCOMMODATION',
        amount:      3_200_000,
        description: 'Khách sạn Nha Trang - 4 đêm × 800k',
        receiptUrl:  null,
      },
      {
        id:          'ei551113-0000-4000-a000-000000000003',
        expenseId:   IDS.EXPENSE_CLOSED,
        expenseDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        category:    'OTHER',
        amount:      4_100_000,
        description: 'Chi phí di chuyển nội địa và tiếp khách',
        receiptUrl:  null,
      },
    ],
  });

  console.log('  ✓ 4 E2E expenses + 10 expense items created');
}

async function seedNotifications(): Promise<void> {
  console.log('  → Seeding notifications...');

  await prisma.notification.createMany({
    data: [
      // Thông báo cho Nguyễn Văn Nam: trip submitted
      {
        id:            'nf111111-0000-4000-a000-000000000001',
        recipientId:   IDS.EMPLOYEE_1,
        type:          'PENDING_LEVEL1_APPROVAL',
        message:       'Yêu cầu công tác "Họp chiến lược Q1 tại TP.HCM" đã được gửi thành công và đang chờ Manager phê duyệt.',
        referenceId:   IDS.TRIP_SUBMITTED,
        referenceType: 'TRIP',
        isRead:        false,
        readAt:        null,
      },

      // Thông báo cho Manager Trần Đình Hùng: có trip cần duyệt
      {
        id:            'nf222222-0000-4000-a000-000000000002',
        recipientId:   IDS.MANAGER,
        type:          'PENDING_LEVEL1_APPROVAL',
        message:       'Nguyễn Văn Nam vừa gửi yêu cầu công tác "Họp chiến lược Q1 tại TP.HCM". Vui lòng xem xét và phê duyệt.',
        referenceId:   IDS.TRIP_SUBMITTED,
        referenceType: 'TRIP',
        isRead:        false,
        readAt:        null,
      },

      // Thông báo cho Trần Thị Bảo: trip approved
      {
        id:            'nf333333-0000-4000-a000-000000000003',
        recipientId:   IDS.EMPLOYEE_2,
        type:          'TRIP_APPROVED',
        message:       'Yêu cầu công tác "Khảo sát thị trường ĐBSCL" đã được Manager phê duyệt. Chúc bạn chuyến đi thành công!',
        referenceId:   IDS.TRIP_APPROVED,
        referenceType: 'TRIP',
        isRead:        true,
        readAt:        new Date(new Date().getTime() - 23 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('  ✓ 3 notifications created');
}

async function seedE2ENotifications(): Promise<void> {
  console.log('  → Seeding E2E notifications...');

  const now = new Date();

  await prisma.notification.createMany({
    data: [
      // ── Notification 4: TRIP_REJECTED → Trần Thị Bảo ─────────────────────
      // E2E-10: Employee nhận notification khi trip bị từ chối
      {
        id:            'nf444444-0000-4000-a000-000000000004',
        recipientId:   IDS.EMPLOYEE_2,
        type:          'TRIP_REJECTED',
        message:       'Yêu cầu công tác "Hội thảo sản phẩm Hà Nội" đã bị từ chối. Lý do: Ngân sách vượt mức cho phép trong quý này.',
        referenceId:   IDS.TRIP_REJECTED,
        referenceType: 'TRIP',
        isRead:        false,
        readAt:        null,
      },

      // ── Notification 5: PENDING_LEVEL2_APPROVAL → Travel Admin ───────────
      // E2E-10: Travel Admin nhận notification khi có trip chờ duyệt Level 2
      {
        id:            'nf555555-0000-4000-a000-000000000005',
        recipientId:   IDS.TRAVEL_ADMIN,
        type:          'PENDING_LEVEL2_APPROVAL',
        message:       'Nguyễn Văn Nam có yêu cầu công tác khẩn cấp đang chờ duyệt cấp 2. Vui lòng xem xét sớm.',
        referenceId:   IDS.TRIP_URGENT_L2,
        referenceType: 'TRIP',
        isRead:        false,
        readAt:        null,
      },

      // ── Notification 6: FINANCE_REQUEST_REVISION → Nguyễn Văn Nam ────────
      // E2E-08: Employee nhận notification khi Finance yêu cầu chỉnh sửa claim
      {
        id:            'nf666666-0000-4000-a000-000000000006',
        recipientId:   IDS.EMPLOYEE_1,
        type:          'FINANCE_REQUEST_REVISION',
        message:       'Finance yêu cầu bổ sung thông tin quyết toán chuyến Cần Thơ. Lý do: Thiếu hóa đơn khoản ACCOMMODATION.',
        referenceId:   IDS.EXPENSE_SUBMITTED,
        referenceType: 'EXPENSE',
        isRead:        false,
        readAt:        null,
      },

      // ── Notification 7: MANAGER_REAPPROVE_REQUIRED → Manager ──────────────
      // E2E-07, E2E-10: Manager nhận notification yêu cầu duyệt bổ sung expense >10%
      {
        id:            'nf777777-0000-4000-a000-000000000007',
        recipientId:   IDS.MANAGER,
        type:          'MANAGER_REAPPROVE_REQUIRED',
        message:       'Trần Thị Bảo vừa nộp quyết toán vượt dự toán hơn 10%. Cần duyệt bổ sung trước khi Finance xử lý.',
        referenceId:   IDS.EXPENSE_REAPPROVE,
        referenceType: 'EXPENSE',
        isRead:        false,
        readAt:        null,
      },

      // ── Notification 8: unread thứ hai cho Manager ────────────────────────
      // E2E-10: Manager cần ≥2 notification unread để test "đánh dấu tất cả đã đọc"
      // (Manager đã có nf222222 unread; đây là notification thứ hai)
      {
        id:            'nf888888-0000-4000-a000-000000000008',
        recipientId:   IDS.MANAGER,
        type:          'PENDING_LEVEL1_APPROVAL',
        message:       'Lý Văn Phong vừa gửi yêu cầu công tác "Khảo sát địa điểm Đà Lạt". Vui lòng xem xét và phê duyệt.',
        referenceId:   IDS.TRIP_OUT_SCOPE,
        referenceType: 'TRIP',
        isRead:        false,
        readAt:        null,
        createdAt:     new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 giờ trước
      },
    ],
  });

  console.log('  ✓ 5 E2E notifications created');
}

// ─── Main Seed Runner ─────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n🌱 Starting database seed...\n');

  // Xóa dữ liệu cũ theo thứ tự ngược FK để tránh constraint error
  console.log('  → Cleaning existing seed data...');
  await prisma.notification.deleteMany({});
  await prisma.expenseItem.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.itineraryItem.deleteMany({});
  await prisma.approvalRecord.deleteMany({});
  await prisma.policyCheckResult.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('  ✓ Database cleaned\n');

  // Hash password một lần dùng cho tất cả users
  console.log('  → Hashing demo password...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  console.log('  ✓ Password hash ready\n');

  // Hash password frontend (123456)
  console.log('  → Hashing frontend demo password...');
  const fePasswordHash = await bcrypt.hash(FE_DEMO_PASSWORD, BCRYPT_ROUNDS);
  console.log('  ✓ Frontend password hash ready\n');

  // Chạy theo thứ tự để tránh FK constraint violations
  await seedUsers(passwordHash);
  await seedFrontendUsers(fePasswordHash);
  await seedE2EUsers(passwordHash);
  await seedTrips();
  await seedE2ETrips();
  await seedPolicyCheckResults();
  await seedE2EPolicyCheckResults();
  await seedApprovalRecords();
  await seedE2EApprovalRecords();
  await seedItineraryItems();
  await seedExpenses();
  await seedE2EExpenses();
  await seedNotifications();
  await seedE2ENotifications();

  console.log('\n✅ Seed completed successfully!\n');
  console.log('Demo accounts (password: Password123!):');
  console.log('  Employee 1:         nam.nguyen@smarttravel.dev    (Nguyễn Văn Nam - STAFF, Manager A)');
  console.log('  Employee 2:         bao.tran@smarttravel.dev      (Trần Thị Bảo - STAFF, Manager A)');
  console.log('  Employee out-scope: phong.ly@smarttravel.dev      (Lý Văn Phong - STAFF, Manager B)');
  console.log('  Employee empty:     hoa.dinh@smarttravel.dev      (Đinh Thị Hoa - STAFF, no trips)');
  console.log('  Manager A:          hung.tran@smarttravel.dev     (Trần Đình Hùng - MANAGER_GRADE)');
  console.log('  Manager B:          khoa.nguyen@smarttravel.dev   (Nguyễn Minh Khoa - MANAGER_GRADE)');
  console.log('  Manager empty:      an.tran@smarttravel.dev       (Trần Văn An - MANAGER_GRADE, no queue)');
  console.log('  Travel Admin:       mai.le@smarttravel.dev        (Lê Thị Mai - TRAVEL_ADMIN)');
  console.log('  Finance:            trang.pham@smarttravel.dev    (Phạm Thu Trang - FINANCE)');
  console.log('  Admin:              admin@smarttravel.dev         (System Admin - ADMIN)\n');
  console.log('Frontend demo accounts (password: 12345678):');
  console.log('  Employee:     nhanvien@smarttravel.vn      (Nguyễn Văn Nam - STAFF)');
  console.log('  Manager:      truongphong@smarttravel.vn   (Trần Thị Lan - MANAGER_GRADE)');
  console.log('  Travel Admin: admin@smarttravel.vn         (Lê Minh Tuấn - TRAVEL_ADMIN)');
  console.log('  Finance:      ketoan@smarttravel.vn        (Phạm Thu Hà - FINANCE)\n');
  console.log('Trips seeded: TR-2026-0001 (DRAFT) → TR-2026-0010 (APPROVED-3)');
  console.log('TripCodeSequence 2026 = 10 (app sẽ tạo tiếp từ TR-2026-0011)\n');
}

main()
  .catch((err: unknown) => {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
