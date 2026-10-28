CREATE TYPE "public"."payout_status" AS ENUM('queued', 'processing', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_token_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"amount_kobo" bigint NOT NULL,
	"status" "payout_status" DEFAULT 'queued' NOT NULL,
	"transfer_reference" text,
	"transfer_code" text,
	"recipient_code" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"failure_reason" text,
	"next_attempt_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payouts_transaction_unique" UNIQUE("transaction_id"),
	CONSTRAINT "payouts_transfer_ref_unique" UNIQUE("transfer_reference")
);
--> statement-breakpoint
CREATE TABLE "verification_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"step" "kyc_step" NOT NULL,
	"succeeded" boolean DEFAULT false NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "disputes" ADD COLUMN "resolution_outcome" text;--> statement-breakpoint
ALTER TABLE "disputes" ADD COLUMN "refunded_kobo" bigint;--> statement-breakpoint
ALTER TABLE "disputes" ADD COLUMN "released_kobo" bigint;--> statement-breakpoint
ALTER TABLE "disputes" ADD COLUMN "paystack_refund_reference" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "bank_code" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "bank_account_number" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "bank_account_name" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "paystack_recipient_code" text;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "bank_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD COLUMN "payout_hold" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspension_reason" text;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_attempts" ADD CONSTRAINT "verification_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_verifications_user_idx" ON "email_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payouts_landlord_idx" ON "payouts" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "payouts_status_idx" ON "payouts" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "verif_attempts_user_idx" ON "verification_attempts" USING btree ("user_id","step","created_at");--> statement-breakpoint
CREATE INDEX "disputes_status_idx" ON "disputes" USING btree ("status");