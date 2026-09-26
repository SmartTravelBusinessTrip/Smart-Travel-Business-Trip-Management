-- CreateTable
CREATE TABLE "mutation_lock" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "mutation_lock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutation_receipts" (
    "scope" TEXT NOT NULL,
    "request_key" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "result" TEXT NOT NULL,

    CONSTRAINT "mutation_receipts_pkey" PRIMARY KEY ("scope","request_key")
);

-- CreateTable
CREATE TABLE "trip_code_sequences" (
    "year" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "trip_code_sequences_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "job_grade" TEXT NOT NULL DEFAULT 'STAFF',
    "department" TEXT,
    "manager_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "trip_code" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "destination_type" TEXT NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "estimated_budget" INTEGER NOT NULL,
    "hotel_cost_per_night" INTEGER,
    "hotel_nights" INTEGER,
    "per_diem_budget" INTEGER,
    "transport_budget" INTEGER,
    "other_budget" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "urgency_reason" TEXT,
    "requires_level2" BOOLEAN NOT NULL DEFAULT false,
    "approval_reasons" TEXT,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_check_results" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "violations" TEXT NOT NULL DEFAULT '[]',
    "violation_count" INTEGER NOT NULL DEFAULT 0,
    "requires_level2_approval" BOOLEAN NOT NULL DEFAULT false,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_check_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_items" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "item_date" TIMESTAMP(3) NOT NULL,
    "day_number" INTEGER NOT NULL,
    "time_slot" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimated_cost" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_records" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "approval_level" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comment" TEXT,
    "budget_snapshot" INTEGER NOT NULL,
    "had_violations_snapshot" BOOLEAN NOT NULL,
    "acted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "total_actual" INTEGER NOT NULL DEFAULT 0,
    "estimated_budget_snapshot" INTEGER NOT NULL,
    "variance_pct" DOUBLE PRECISION,
    "variance_amount" INTEGER,
    "justification" TEXT,
    "manager_reapproval_required" BOOLEAN NOT NULL DEFAULT false,
    "manager_reapproved" BOOLEAN NOT NULL DEFAULT false,
    "manager_reapprover_id" TEXT,
    "manager_reapproved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_items" (
    "id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "expense_date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "receipt_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previous_state" TEXT,
    "new_state" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_manager_id_idx" ON "users"("manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "trips_trip_code_key" ON "trips"("trip_code");

-- CreateIndex
CREATE INDEX "trips_employee_id_idx" ON "trips"("employee_id");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "trips_departure_date_idx" ON "trips"("departure_date");

-- CreateIndex
CREATE INDEX "trips_employee_id_status_idx" ON "trips"("employee_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "policy_check_results_trip_id_key" ON "policy_check_results"("trip_id");

-- CreateIndex
CREATE INDEX "itinerary_items_trip_id_idx" ON "itinerary_items"("trip_id");

-- CreateIndex
CREATE INDEX "itinerary_items_trip_id_item_date_idx" ON "itinerary_items"("trip_id", "item_date");

-- CreateIndex
CREATE INDEX "approval_records_trip_id_idx" ON "approval_records"("trip_id");

-- CreateIndex
CREATE INDEX "approval_records_approver_id_idx" ON "approval_records"("approver_id");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_trip_id_key" ON "expenses"("trip_id");

-- CreateIndex
CREATE INDEX "expenses_status_idx" ON "expenses"("status");

-- CreateIndex
CREATE INDEX "expense_items_expense_id_idx" ON "expense_items"("expense_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_idx" ON "notifications"("recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_reference_id_idx" ON "notifications"("reference_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_entity_type_idx" ON "audit_logs"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_check_results" ADD CONSTRAINT "policy_check_results_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_manager_reapprover_id_fkey" FOREIGN KEY ("manager_reapprover_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

