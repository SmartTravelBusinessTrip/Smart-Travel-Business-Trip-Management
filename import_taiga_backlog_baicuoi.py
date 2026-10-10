#!/usr/bin/env python3
"""
Import backlog BÀI CUỐI "Smart Travel & Business Trip Management" (Nhóm 11 - MIS3032_1)
lên Taiga qua REST API chính thức (https://docs.taiga.io/api.html).

Phạm vi: EP-05 -> EP-07, US-11 -> US-21, 32 Task (TSK-1101 -> TSK-2105).
Nguồn dữ liệu: sheet "Nhom11_TheoDoi_TienDo_BaiCuoi" (owner, deadline, trạng thái, phụ thuộc)
               + docs/logs/scope-freeze.md trong repo (Epic/Story, Must).

CHUẨN BỊ:
  1. pip install requests
  2. Kiểm tra CONFIG bên dưới (USERNAME / PASSWORD / PROJECT_SLUG / MEMBERS).
     Chạy vào CHÍNH project đã import Bài 1+2 (EP-01..EP-04) để backlog liền mạch.
  3. Project phải có sẵn 3 status "Chưa bắt đầu", "Đang làm", "Hoàn thành"
     cho Epic / User Story / Task (giống lần import trước).

CHẠY:
    python import_taiga_backlog_baicuoi.py --dry-run   # chỉ in cây Epic > Story > Task, KHÔNG gọi API
    python import_taiga_backlog_baicuoi.py             # import thật

Epic / User Story: idempotent (trùng subject thì bỏ qua).
Task: trùng subject thì bỏ qua (không tạo lại), nên chạy lại nhiều lần vẫn an toàn.
"""

import sys
import requests

# ============================== CONFIG ======================================
TAIGA_API_HOST = "https://api.taiga.io"
TAIGA_USERNAME = "mynhi1011"
TAIGA_PASSWORD = "Nhi10112005@"   # ⚠️ KHÔNG chia sẻ / nộp kèm file này
PROJECT_SLUG = "mynhi1011-smart-travel-business-trip-management"

# Map "tên trong backlog" -> "username Taiga" (giữ nguyên như file Bài 1+2)
MEMBERS = {
    "Mỹ Nhi": "mynhi1011",          # Product / BA
    "Ánh Tuyết": "anhtuyet04",      # Engineering (BE)
    "Kim Dung": "dung2610-vizulla", # UX / UI
    "Tuyết Nhi": "tuyetnhi0601",    # AI / Vault
    "Bảo Ngọc": "baongoclvcw",      # QA / Release
}

# Vai trò hiển thị -> dùng làm tag trên Taiga (theo docs/team-roles.md)
ROLE_TAG = {
    "Mỹ Nhi": "BA",
    "Ánh Tuyết": "Backend",
    "Kim Dung": "UX",
    "Tuyết Nhi": "AI",
    "Bảo Ngọc": "QA",
}
ROLE_LABEL = {
    "Mỹ Nhi": "Mỹ Nhi (BA)",
    "Ánh Tuyết": "Ánh Tuyết (BE)",
    "Kim Dung": "Kim Dung (UX)",
    "Tuyết Nhi": "Tuyết Nhi (AI)",
    "Bảo Ngọc": "Bảo Ngọc (QA)",
}

STATUS_CHUA_BAT_DAU = "Chưa bắt đầu"
STATUS_DANG_LAM = "Đang làm"
STATUS_HOAN_THANH = "Hoàn thành"

TEAM = "Cả nhóm"  # task không có 1 owner duy nhất -> không assign, cả nhóm làm watcher
# =============================================================================

# ---------------------------- DỮ LIỆU BACKLOG -------------------------------
# Task = dict:
#   id, title, owner, support, depends, deadline ("YYYY-MM-DD HH:MM" hoặc None),
#   status, output, folder, passcond
#
# Quy ước deadline:
#   - Ghi rõ ngày giờ trong sheet  -> lấy đúng.
#   - Sheet ghi "19h thứ 7"        -> 19:00 thứ Bảy. Tuần 19-27/09 có 2 thứ Bảy (19/09 và 26/09),
#                                     chọn ngày hợp lý theo thứ tự phụ thuộc (xem ghi chú từng task).
#   - Sheet để TRỐNG               -> None (không đặt due date, cần nhóm bổ sung).
DL_THU7_1 = "2026-09-19 19:00"
DL_THU7_2 = "2026-09-26 19:00"


def T(id_, title, owner, support, depends, deadline, status, output, folder, passcond):
    return dict(id=id_, title=title, owner=owner, support=support, depends=depends,
                deadline=deadline, status=status, output=output, folder=folder, passcond=passcond)


BACKLOG = [
    # ======================= EP-05 =======================
    {
        "id": "EP-05", "subject": "EP-05 Test Automation, QA & Bug Remediation",
        "stories": [
            {
                "id": "US-11", "subject": "US-11 Thiết lập nền tảng kiểm thử tự động",
                "tasks": [
                    T("TSK-1101", "Cài Vitest + Supertest (BE), Vitest + RTL (FE); viết test-strategy.md",
                      "Ánh Tuyết", "Bảo Ngọc (QA) - đồng viết test-strategy.md", "Không",
                      "2026-09-19 12:00", STATUS_HOAN_THANH,
                      "package.json (script test), test-strategy.md",
                      "src/backend/, src/frontend/, docs/08-quality/test-strategy.md",
                      "Không chỉ test 200 OK; có rule/permission/validation"),
                    T("TSK-1102", "Unit test trip.service.ts, policy.service.ts, approval.service.ts, expense.service.ts",
                      "Ánh Tuyết", "-", "TSK-1101",
                      None, STATUS_HOAN_THANH,  # sheet để trống deadline
                      "tests/unit/*.test.ts", "tests/unit/",
                      "Test business rule/validation, có failure path"),
                    T("TSK-1103", "Integration/API test Auth + RBAC (401/403 cho từng role)",
                      "Ánh Tuyết", "-", "TSK-1101",
                      None, STATUS_HOAN_THANH,  # sheet để trống deadline
                      "tests/integration/auth.test.ts", "tests/integration/",
                      "Backend thực thi permission, không chỉ ẩn nút UI"),
                ],
            },
            {
                "id": "US-12", "subject": "US-12 E2E & Regression Testing",
                "tasks": [
                    T("TSK-1201", "Integration test workflow Trip Request → Approval → Itinerary → Expense → Close (happy + failure path)",
                      "Bảo Ngọc", "Ánh Tuyết (BE)", "TSK-1102",
                      None, STATUS_CHUA_BAT_DAU,  # sheet để trống deadline
                      "tests/integration/trip-workflow.test.ts", "tests/integration/",
                      "State/rule được enforce ở server/domain"),
                    T("TSK-1202", "E2E test critical path: Login → Tạo Trip Request → Duyệt → Itinerary → Expense → Close",
                      "Bảo Ngọc", "Ánh Tuyết (BE)", "TSK-1201",
                      "2026-09-23 22:00", STATUS_CHUA_BAT_DAU,
                      "tests/e2e/critical-path.test.ts", "tests/e2e/",
                      "Critical path + failure path chạy đúng"),
                    T("TSK-1203", "Chạy regression test sau mỗi bug fix, cập nhật kết quả vào regression log",
                      "Bảo Ngọc", "Ánh Tuyết (BE)", "TSK-1301",
                      "2026-09-21 22:00", STATUS_CHUA_BAT_DAU,
                      "Regression log trong bug-log.md", "docs/06-testing/bug-log.md",
                      "Bug không tái xuất hiện, có regression evidence"),
                ],
            },
            {
                "id": "US-13", "subject": "US-13 Code Review & Bug Remediation",
                "tasks": [
                    T("TSK-1301", "Fix bug QA nội bộ (QAF-001, QAF-002, QAF-005 PDF trả HTML...) + viết regression test",
                      "Ánh Tuyết", "Bảo Ngọc (QA)", "-",
                      DL_THU7_1, STATUS_CHUA_BAT_DAU,  # 1303/1203 (21/09) phụ thuộc -> thứ 7 = 19/09
                      "pdf.controller.ts (fix) + tests/regression/*.test.ts",
                      "src/backend/src/controllers/pdf.controller.ts & tests/regression/",
                      "Bug reproducible; closure có evidence"),
                    T("TSK-1302", "Mở ≥2 Pull Request có review thật + viết code-review.md",
                      "Ánh Tuyết", "Mỹ Nhi (BA) - reviewer", "TSK-1301",
                      None, STATUS_CHUA_BAT_DAU,  # sheet để trống deadline
                      "PR #1, PR #2 trên GitHub; code-review.md", "docs/06-testing/code-review.md",
                      "PR link được story/task/test; có blocker/major/minor + resolution"),
                    T("TSK-1303", "Chuẩn hóa bug-log.md đầy đủ (severity, steps, expected/actual, evidence, owner, status)",
                      "Bảo Ngọc", "Ánh Tuyết (BE)", "TSK-1301",
                      "2026-09-21 22:00", STATUS_CHUA_BAT_DAU,
                      "bug-log.md (v1.0)", "docs/06-testing/bug-log.md",
                      "Bug reproducible; closure có evidence"),
                ],
            },
            {
                "id": "US-14", "subject": "US-14 QA Report & Release Sign-off",
                "tasks": [
                    T("TSK-1401", "Chạy toàn bộ test suite, ghi kết quả đầu tiên vào QA_REPORT.md (bản nháp v0.1)",
                      "Bảo Ngọc", "-", "TSK-1102, TSK-1103, TSK-1201",
                      "2026-09-20 22:00", STATUS_CHUA_BAT_DAU,
                      "QA_REPORT.md (v0.1)", "docs/06-testing/QA_REPORT.md",
                      "Số liệu khớp test evidence; có scope, environment, result, known issues, risk"),
                    T("TSK-1402", "Chạy release checklist trên URL Railway thật; hoàn thiện QA_REPORT.md v1.0 (blockers = 0)",
                      "Bảo Ngọc", TEAM, "TSK-1701",
                      "2026-09-24 22:00", STATUS_CHUA_BAT_DAU,
                      "QA_REPORT.md (v1.0)", "docs/06-testing/QA_REPORT.md",
                      "Số liệu khớp test evidence; blockers = 0; có sign-off"),
                ],
            },
        ],
    },
    # ======================= EP-06 =======================
    {
        "id": "EP-06", "subject": "EP-06 Security, CI/CD & Release (Railway)",
        "stories": [
            {
                "id": "US-15", "subject": "US-15 Security & NFR Hardening (kèm Repo Audit)",
                "tasks": [
                    T("TSK-1501", "Rà soát RBAC, input validation (Zod), secrets scan, lỗi không lộ stack trace",
                      "Bảo Ngọc", "Ánh Tuyết (BE)", "-",
                      "2026-09-22 21:00", STATUS_CHUA_BAT_DAU,
                      "Checklist bảo mật đã rà soát", "docs/06-testing/security-nfr.md",
                      "Không lộ secret/stack trace; log điều tra được"),
                    T("TSK-1502", "Viết security-nfr.md + demo case unauthorized action bị chặn thật",
                      "Bảo Ngọc", "-", "TSK-1501",
                      "2026-09-22 21:00", STATUS_CHUA_BAT_DAU,
                      "security-nfr.md", "docs/06-testing/security-nfr.md",
                      "Unauthorized action bị chặn thật; có security evidence"),
                    T("TSK-1503", "Repo audit: secrets scan toàn bộ lịch sử commit, xác nhận .env/API key không bị commit; mỗi thành viên đối chiếu git log của mình",
                      "Bảo Ngọc", "Ánh Tuyết (BE)", "TSK-1501",
                      "2026-09-22 22:00", STATUS_CHUA_BAT_DAU,
                      "repo-audit-checklist.md", "docs/08-quality/repo-audit-checklist.md",
                      "Không chứa secret; lịch sử đóng góp rõ"),
                ],
            },
            {
                "id": "US-16", "subject": "US-16 Chuẩn bị Railway & CI/CD Pipeline",
                "tasks": [
                    T("TSK-1601", "Chuẩn bị project deploy Railway: cấu hình PostgreSQL/Prisma, build/start command, biến môi trường, host/port, health endpoint",
                      "Ánh Tuyết", "-", "-",
                      DL_THU7_1, STATUS_CHUA_BAT_DAU,
                      "schema.prisma, package.json, .env.example, server config",
                      "Project root + src/backend/",
                      "Clean clone build/run được và sẵn sàng deploy Railway; không Docker"),
                    T("TSK-1602", "GitHub Actions CI: build + lint + typecheck + test tự động khi push/PR",
                      "Ánh Tuyết", "-", "TSK-1601",
                      DL_THU7_1, STATUS_CHUA_BAT_DAU,
                      ".github/workflows/ci.yml", ".github/workflows/",
                      "Pipeline PASS trước khi deploy"),
                ],
            },
            {
                "id": "US-17", "subject": "US-17 Deploy Railway & Smoke Test",
                "tasks": [
                    T("TSK-1701", "Deploy ứng dụng lên Railway; provision PostgreSQL; cấu hình env; chạy Prisma migration + seed; kiểm tra health endpoint",
                      "Ánh Tuyết", "Kim Dung (UX)", "TSK-1601, TSK-1602, TSK-1702",
                      None, STATUS_CHUA_BAT_DAU,  # sheet để trống deadline
                      "Railway Demo URL", "Railway environment",
                      "Truy cập được bằng URL Railway, không cần sửa code tại chỗ"),
                    T("TSK-1702", "Chuẩn bị seed demo data đầy đủ (không hard-code); review UI khớp API thật, bỏ mock data",
                      "Ánh Tuyết", "Kim Dung (UX) - review UI khớp API thật", "-",
                      DL_THU7_1, STATUS_CHUA_BAT_DAU,
                      "seed.ts (cập nhật demo data)", "src/backend/src/prisma/seed.ts",
                      "Seed chạy được trên DB thật, không cần sửa code tại chỗ"),
                    T("TSK-1703", "Smoke test end-to-end trên URL Railway thật: tạo trip, duyệt, itinerary AI, expense, close — không sửa code tại chỗ",
                      TEAM, "-", "TSK-1701",
                      "2026-09-24 22:00", STATUS_CHUA_BAT_DAU,
                      "Smoke test log", "docs/06-testing/QA_REPORT.md (phụ lục)",
                      "Workflow chính chạy được; không sửa code trực tiếp trên staging/production"),
                ],
            },
            {
                "id": "US-18", "subject": "US-18 Release Documentation",
                "tasks": [
                    T("TSK-1801", "Hoàn thiện README.md (setup/env/seed/run/test/deploy) + RUNBOOK.md; nhờ 1 người khác clone & chạy thử trong 10 phút",
                      "Mỹ Nhi", "Kim Dung (UX) - người test clone", "TSK-1701",
                      "2026-09-25 21:00", STATUS_CHUA_BAT_DAU,
                      "README.md (final), RUNBOOK.md", "README.md & docs/07-release/RUNBOOK.md",
                      "Không phụ thuộc kiến thức ngầm của tác giả"),
                    T("TSK-1802", "Viết RELEASE.md + CHANGELOG.md khớp git tag v1.0.0-final",
                      "Mỹ Nhi", "-", "TSK-1402",
                      "2026-09-25 22:00", STATUS_CHUA_BAT_DAU,
                      "RELEASE.md, CHANGELOG.md", "docs/07-release/RELEASE.md & docs/07-release/CHANGELOG.md",
                      "Khớp đúng v1.0.0-final"),
                ],
            },
        ],
    },
    # ======================= EP-07 =======================
    {
        "id": "EP-07", "subject": "EP-07 AI Finalization & Final Evidence",
        "stories": [
            {
                "id": "US-19", "subject": "US-19 AI Feature Guardrail & Eval Finalization",
                "tasks": [
                    T("TSK-1901", "Bổ sung eval-set.json case edge/fallback cho đủ ≥20 case",
                      "Tuyết Nhi", "-", "Không",
                      DL_THU7_1, STATUS_DANG_LAM,
                      "eval-set.json (cập nhật)", "docs/05-technical/ai/eval-set.json",
                      "Có đo/kiểm chứng, không phải chatbot chung chung; eval set ≥20 case"),
                    T("TSK-1902", "Hoàn thiện validation/fallback trong ai.service.ts khi model sai/không chắc chắn",
                      "Tuyết Nhi", "Ánh Tuyết (BE)", "TSK-1901",
                      None, STATUS_CHUA_BAT_DAU,  # sheet để trống deadline
                      "ai.service.ts (cập nhật)", "src/backend/src/services/ai.service.ts",
                      "Structured output + validation + fallback; không hallucination ngoài kiểm soát"),
                    T("TSK-1903", "Chạy benchmark hallucination giá/policy/trạng thái = 0/20; cập nhật evaluation-result.md + ai-feature-spec.md",
                      "Tuyết Nhi", "Bảo Ngọc (QA)", "TSK-1902",
                      None, STATUS_CHUA_BAT_DAU,  # sheet để trống deadline
                      "evaluation-result.md (cập nhật)", "docs/05-technical/ai/evaluation-result.md",
                      "AI output được kiểm chứng; evaluation ≥20 case"),
                    T("TSK-1904", "Demo AI feature trên Railway thật, xác nhận không hallucination giá/policy/trạng thái",
                      "Tuyết Nhi", "-", "TSK-1701, TSK-1903",
                      DL_THU7_2, STATUS_CHUA_BAT_DAU,  # phụ thuộc deploy (sau 24/09) -> thứ 7 = 26/09
                      "evaluation-result.md (final)", "docs/05-technical/ai/evaluation-result.md",
                      "Giá/policy/status chính xác trên môi trường thật"),
                ],
            },
            {
                "id": "US-20", "subject": "US-20 Traceability Matrix Final",
                "tasks": [
                    T("TSK-2001", "Thêm cột Commit/PR/Test/Release Status vào TRACEABILITY.md",
                      "Mỹ Nhi", "Bảo Ngọc (QA)", "TSK-1302",
                      "2026-09-22 22:00", STATUS_CHUA_BAT_DAU,
                      "TRACEABILITY.md (v2)", "docs/TRACEABILITY.md",
                      "100% scope Done truy vết được"),
                    T("TSK-2002", "Rà soát 100% scope Must/Should Done truy vết được, không có story mồ côi",
                      "Bảo Ngọc", "Mỹ Nhi (BA)", "TSK-2001",
                      "2026-09-25 22:00", STATUS_CHUA_BAT_DAU,
                      "TRACEABILITY.md (final)", "docs/TRACEABILITY.md",
                      "REQ → Story → Task → Design/API → Commit/PR → Test → Status đầy đủ"),
                ],
            },
            {
                "id": "US-21", "subject": "US-21 AI Usage Log Final & Retrospective",
                "tasks": [
                    T("TSK-2101", "Chốt AI_USAGE_LOG.md (đủ input-output-verification-correction; mỗi thành viên ≥1 case AI sai đã sửa)",
                      "Tuyết Nhi", TEAM, "-",
                      DL_THU7_2, STATUS_CHUA_BAT_DAU,  # TSK-2102 (26/09 20:00) phụ thuộc -> thứ 7 = 26/09
                      "AI_USAGE_LOG.md (final)", "docs/logs/AI_USAGE_LOG.md",
                      "Có evidence thật, không kể chung chung"),
                    T("TSK-2102", "Viết retrospective.md: Keep/Improve/Stop, metric kỹ thuật + AI, 3 cải tiến cụ thể",
                      "Mỹ Nhi", TEAM, "TSK-2101",
                      "2026-09-26 20:00", STATUS_CHUA_BAT_DAU,
                      "retrospective.md", "docs/retrospective.md",
                      "Có evidence thật; 3 cải tiến cụ thể"),
                    T("TSK-2103", "Cập nhật 00-project-index.md trỏ đủ 15 mục Bài cuối; kiểm tra toàn bộ link không lỗi",
                      "Bảo Ngọc", "-", "Toàn bộ artifact Bài cuối",
                      "2026-09-26 21:00", STATUS_CHUA_BAT_DAU,
                      "00-project-index.md (final)", "docs/00-project-index.md",
                      "Link không lỗi; 100% scope Done truy vết được"),
                    T("TSK-2104", "Đối chiếu từng hạng mục với bảng 'A. DANH SÁCH ARTIFACT PHẢI CÓ' (PASS/FAIL); freeze evidence link; xác nhận tag v1.0.0-final",
                      "Mỹ Nhi", "Bảo Ngọc (QA)", "Toàn bộ công việc 19-26/09",
                      "2026-09-27 18:00", STATUS_CHUA_BAT_DAU,
                      "Checklist 15/15 đã tick", "docs/00-project-index.md",
                      "Không còn Must/nợ mở; 100% Must story Done"),
                    T("TSK-2105", "Chạy thử buổi báo cáo nội bộ: mỗi người 4 phút demo + 1 phút Q&A; ghi lại vấn đề cần sửa trước báo cáo thật 03/10/2026",
                      TEAM, "-", "Checklist 15/15 (TSK-2104)",
                      "2026-09-27 21:00", STATUS_CHUA_BAT_DAU,
                      "Ghi chú dry-run + danh sách việc cần sửa", "-",
                      "Mỗi người giải thích được commit/test của mình"),
                ],
            },
        ],
    },
]
# =============================================================================


def die(msg):
    print(f"[LỖI] {msg}")
    sys.exit(1)


def st(table, name):
    """Tra id status theo tên, không phân biệt hoa/thường."""
    return table[name.strip().lower()]


def derive_status(statuses):
    """Story/Epic: tất cả Hoàn thành -> Hoàn thành; có cái đã/đang làm -> Đang làm; còn lại Chưa bắt đầu."""
    if statuses and all(s == STATUS_HOAN_THANH for s in statuses):
        return STATUS_HOAN_THANH
    if any(s in (STATUS_HOAN_THANH, STATUS_DANG_LAM) for s in statuses):
        return STATUS_DANG_LAM
    return STATUS_CHUA_BAT_DAU


def story_status(story):
    return derive_status([t["status"] for t in story["tasks"]])


def epic_status(epic):
    return derive_status([story_status(s) for s in epic["stories"]])


def task_description(t):
    lines = [
        f"**Deadline:** {fmt_deadline(t['deadline'])}",
        f"**Owner:** {ROLE_LABEL.get(t['owner'], t['owner'])}",
        f"**Hỗ trợ:** {t['support']}",
        f"**Phụ thuộc vào:** {t['depends']}",
        "",
        f"**Output / Bằng chứng:** {t['output']}",
        f"**Vị trí lưu:** {t['folder']}",
        f"**Điều kiện PASS:** {t['passcond']}",
    ]
    return "\n".join(lines)


def fmt_deadline(dl):
    if not dl:
        return "(sheet chưa ghi deadline)"
    d, h = dl.split(" ")
    y, m, dd = d.split("-")
    return f"{dd}/{m}/{y} {h}"


# ------------------------------ API HELPERS ---------------------------------
def api_login():
    r = requests.post(
        f"{TAIGA_API_HOST}/api/v1/auth",
        json={"type": "normal", "username": TAIGA_USERNAME, "password": TAIGA_PASSWORD},
    )
    if r.status_code != 200:
        die(f"Đăng nhập thất bại ({r.status_code}): {r.text}")
    return r.json()["auth_token"]


def get_project(session, slug):
    r = session.get(f"{TAIGA_API_HOST}/api/v1/projects/by_slug", params={"slug": slug})
    if r.status_code != 200:
        die(f"Không tìm thấy project slug='{slug}' ({r.status_code}): {r.text}")
    return r.json()


def get_statuses(session, endpoint, project_id):
    r = session.get(f"{TAIGA_API_HOST}/api/v1/{endpoint}", params={"project": project_id})
    r.raise_for_status()
    return {s["name"].strip().lower(): s["id"] for s in r.json()}


def get_members(session, project_id):
    r = session.get(f"{TAIGA_API_HOST}/api/v1/memberships", params={"project": project_id})
    r.raise_for_status()
    result = {}
    for m in r.json():
        user_id = m.get("user")
        if not user_id:
            continue  # member Pending
        ur = session.get(f"{TAIGA_API_HOST}/api/v1/users/{user_id}")
        if ur.status_code == 200:
            uname = ur.json().get("username")
            if uname:
                result[uname] = user_id
    return result


def find_existing(session, endpoint, project_id, subject):
    r = session.get(f"{TAIGA_API_HOST}/api/v1/{endpoint}", params={"project": project_id})
    r.raise_for_status()
    for item in r.json():
        if item["subject"].strip() == subject.strip():
            return item
    return None


def create_epic(session, project_id, subject, status_id):
    existing = find_existing(session, "epics", project_id, subject)
    if existing:
        print(f"  [=] Epic đã tồn tại, bỏ qua: {subject}")
        return existing["id"]
    r = session.post(
        f"{TAIGA_API_HOST}/api/v1/epics",
        json={"project": project_id, "subject": subject, "status": status_id},
    )
    if r.status_code != 201:
        die(f"Tạo Epic thất bại '{subject}' ({r.status_code}): {r.text}")
    print(f"  [+] Đã tạo Epic: {subject}")
    return r.json()["id"]


def create_user_story(session, project_id, epic_id, subject, status_id):
    existing = find_existing(session, "userstories", project_id, subject)
    if existing:
        print(f"    [=] User Story đã tồn tại, bỏ qua: {subject}")
        us_id = existing["id"]
    else:
        r = session.post(
            f"{TAIGA_API_HOST}/api/v1/userstories",
            json={"project": project_id, "subject": subject, "status": status_id},
        )
        if r.status_code != 201:
            die(f"Tạo User Story thất bại '{subject}' ({r.status_code}): {r.text}")
        us_id = r.json()["id"]
        print(f"    [+] Đã tạo User Story: {subject}")

    r = session.post(
        f"{TAIGA_API_HOST}/api/v1/epics/{epic_id}/related_userstories",
        json={"epic": epic_id, "user_story": us_id},
    )
    if r.status_code not in (200, 201):
        print(f"      [!] Không link được US vào Epic ({r.status_code}): {r.text}")
        print("          -> Vào Taiga web, mở Epic, gán US thủ công.")
    return us_id


def create_task(session, project_id, us_id, t, status_id, members, all_user_ids):
    subject = f"{t['id']} {t['title']}"
    existing = find_existing(session, "tasks", project_id, subject)
    if existing:
        print(f"      [=] Task đã tồn tại, bỏ qua: {t['id']}")
        return

    is_team = t["owner"] == TEAM
    user_id = None if is_team else members.get(t["owner"])

    payload = {
        "project": project_id,
        "user_story": us_id,
        "subject": subject,
        "status": status_id,
        "description": task_description(t),
        "tags": ["Bài cuối", TEAM if is_team else ROLE_TAG[t["owner"]]],
    }
    if user_id:
        payload["assigned_to"] = user_id
    if is_team and all_user_ids:
        payload["watchers"] = all_user_ids
    if t["deadline"]:
        payload["due_date"] = t["deadline"].split(" ")[0]

    r = session.post(f"{TAIGA_API_HOST}/api/v1/tasks", json=payload)
    if r.status_code != 201 and "due_date" in payload:
        # Server cũ không có due_date -> tạo lại không có due_date (deadline vẫn nằm trong description)
        payload.pop("due_date")
        r = session.post(f"{TAIGA_API_HOST}/api/v1/tasks", json=payload)
        if r.status_code == 201:
            print(f"      [!] Server không nhận due_date, deadline chỉ ghi trong Description: {t['id']}")
    if r.status_code != 201:
        die(f"Tạo Task thất bại '{subject}' ({r.status_code}): {r.text}")

    owner_display = "Cả nhóm (watchers)" if is_team else (t["owner"] if user_id else f"{t['owner']} (CHƯA gán được)")
    print(f"      [+] {t['id']} | {owner_display} | {fmt_deadline(t['deadline'])} | {t['status']}")


# ------------------------------- DRY RUN ------------------------------------
def dry_run():
    n_story = n_task = 0
    missing = []
    for e in BACKLOG:
        print(f"\n{e['subject']}  [{epic_status(e)}]")
        for s in e["stories"]:
            n_story += 1
            print(f"  {s['subject']}  [{story_status(s)}]")
            for t in s["tasks"]:
                n_task += 1
                owner = t["owner"] if t["owner"] == TEAM else ROLE_LABEL[t["owner"]]
                print(f"    {t['id']:9} {owner:16} {fmt_deadline(t['deadline']):27} {t['status']:13} {t['title'][:60]}")
                if not t["deadline"]:
                    missing.append(t["id"])
    print(f"\nTổng: {len(BACKLOG)} Epic, {n_story} User Story, {n_task} Task")
    if missing:
        print(f"Task chưa có deadline trong sheet: {', '.join(missing)}")


def main():
    if "--dry-run" in sys.argv:
        dry_run()
        return

    token = api_login()
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}"})

    project = get_project(session, PROJECT_SLUG)
    project_id = project["id"]
    print(f"Đã kết nối project: {project['name']} (id={project_id})")

    epic_statuses = get_statuses(session, "epic-statuses", project_id)
    us_statuses = get_statuses(session, "userstory-statuses", project_id)
    task_statuses = get_statuses(session, "task-statuses", project_id)

    for label, table in [("Epic", epic_statuses), ("User Story", us_statuses), ("Task", task_statuses)]:
        for needed in (STATUS_CHUA_BAT_DAU, STATUS_DANG_LAM, STATUS_HOAN_THANH):
            if needed.strip().lower() not in table:
                die(f"Thiếu status '{needed}' trong {label} Statuses. Kiểm tra Settings > Statuses.")

    raw_username_map = get_members(session, project_id)
    print(f"  (Member Active trên project: {list(raw_username_map.keys())})")
    resolved_members = {}
    for display_name, username in MEMBERS.items():
        match = next((uid for uname, uid in raw_username_map.items()
                      if uname.lower() == username.strip().lower()), None)
        if match is None:
            print(f"  [!] '{username}' ({display_name}) không phải member Active -> Task của người này sẽ KHÔNG có Owner.")
            continue
        resolved_members[display_name] = match
    all_user_ids = list(resolved_members.values())

    print("\nBắt đầu tạo Epic > User Story > Task (Bài cuối) ...\n")
    for epic in BACKLOG:
        epic_id = create_epic(session, project_id, epic["subject"], st(epic_statuses, epic_status(epic)))
        for story in epic["stories"]:
            us_id = create_user_story(session, project_id, epic_id, story["subject"],
                                      st(us_statuses, story_status(story)))
            for t in story["tasks"]:
                create_task(session, project_id, us_id, t, st(task_statuses, t["status"]),
                            resolved_members, all_user_ids)

    print("\nHOÀN TẤT. Vào Taiga web kiểm tra lại Epics / Backlog / Taskboard.")


if __name__ == "__main__":
    main()
