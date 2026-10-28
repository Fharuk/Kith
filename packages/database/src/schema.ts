import {
  pgTable, pgEnum, text, timestamp, boolean, uuid, integer, bigint, jsonb,
  index, unique, decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ── Enums ─────────────────────────────────────────────────────────── */
export const userRoleEnum = pgEnum("user_role", ["student", "landlord", "porter", "admin"]);
export const roomTierEnum = pgEnum("room_tier", ["circle", "elite", "market"]);
export const saleModeEnum = pgEnum("sale_mode", ["auction", "fixed"]);
export const auctionStatusEnum = pgEnum("auction_status", ["active", "extended", "completed", "cancelled"]);
export const bidStatusEnum = pgEnum("bid_status", ["active", "won", "outbid", "withdrawn"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]);
export const escrowStatusEnum = pgEnum("escrow_status", ["pending", "held", "released", "disputed", "refunded"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["bid", "booking", "refund", "payout", "auction_payment"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "cancelled"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);
export const kycStepEnum = pgEnum("kyc_step", ["nin", "matric", "biometric", "review"]);
export const notificationChannelEnum = pgEnum("notification_channel", ["in_app", "email", "sms"]);
export const porterTaskTypeEnum = pgEnum("porter_task_type", ["check_in", "check_out", "verify_property"]);
export const porterTaskStatusEnum = pgEnum("porter_task_status", ["open", "assigned", "done", "failed"]);
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "under_review", "resolved", "rejected"]);
export const auditActionEnum = pgEnum("audit_action_type", [
  "create", "update", "delete", "approve", "reject", "verify", "cancel", "complete", "dispute", "release", "login",
]);

const id = () => uuid("id").defaultRandom().primaryKey();
const now = (n: string) => timestamp(n, { withTimezone: true, mode: "date" }).defaultNow().notNull();
const kobo = (n: string) => bigint(n, { mode: "bigint" }).notNull();
/** nullable minor-unit money (rooms: auction rows have no fixed price, fixed rows no floor) */
const koboNull = (n: string) => bigint(n, { mode: "bigint" });

/* ── users ─────────────────────────────────────────────────────────── */
export const users = pgTable("users", {
  id: id(),
  role: userRoleEnum("role").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  pseudonymizedId: text("pseudonymized_id").notNull(),
  totpSecretEnc: text("totp_secret_enc"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  failedLogins: integer("failed_logins").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true, mode: "date" }),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true, mode: "date" }),
  suspendedAt: timestamp("suspended_at", { withTimezone: true, mode: "date" }),
  suspensionReason: text("suspension_reason"),
  createdAt: now("created_at"),
  updatedAt: now("updated_at"),
}, (t) => ({
  emailUnique: unique("users_email_unique").on(t.email),
  pseudonymUnique: unique("users_pseudonymized_unique").on(t.pseudonymizedId),
  roleIdx: index("users_role_idx").on(t.role),
}));

/* ── universities ──────────────────────────────────────────────────── */
export const universities = pgTable("universities", {
  id: id(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  emailDomains: jsonb("email_domains").$type<string[]>().notNull(),
  matricPattern: text("matric_pattern").notNull(),
  active: boolean("active").notNull().default(true),
}, (t) => ({ codeUnique: unique("universities_code_unique").on(t.code) }));

/* ── role profiles ─────────────────────────────────────────────────── */
export const studentProfiles = pgTable("student_profiles", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  universityId: uuid("university_id").references(() => universities.id, { onDelete: "set null" }),
  matricNumber: text("matric_number"),
  studentEmail: text("student_email"),
  level: text("level"),
  faculty: text("faculty"),
  ninHash: text("nin_hash"),
  nimcVerified: boolean("nimc_verified").notNull().default(false),
  matricVerified: boolean("matric_verified").notNull().default(false),
  biometricVerified: boolean("biometric_verified").notNull().default(false),
  livenessScore: decimal("liveness_score", { precision: 4, scale: 3 }),
  currentStep: kycStepEnum("current_step").notNull().default("nin"),
}, (t) => ({
  userUnique: unique("student_profiles_user_unique").on(t.userId),
  matricUnique: unique("student_profiles_matric_unique").on(t.universityId, t.matricNumber),
}));

export const landlordProfiles = pgTable("landlord_profiles", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  cacNumber: text("cac_number"),
  paystackSubaccountCode: text("paystack_subaccount_code"),
  kycStatus: verificationStatusEnum("kyc_status").notNull().default("pending"),
  /* payout destination — verified with Paystack /bank/resolve before any transfer */
  bankCode: text("bank_code"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountName: text("bank_account_name"),
  paystackRecipientCode: text("paystack_recipient_code"),
  bankVerifiedAt: timestamp("bank_verified_at", { withTimezone: true, mode: "date" }),
  /* admin hold: stops new payouts without touching escrow state */
  payoutHold: boolean("payout_hold").notNull().default(false),
}, (t) => ({ userUnique: unique("landlord_profiles_user_unique").on(t.userId) }));

export const porterProfiles = pgTable("porter_profiles", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  zone: text("zone").notNull(),
  campusCode: text("campus_code"),
  active: boolean("active").notNull().default(true),
}, (t) => ({ userUnique: unique("porter_profiles_user_unique").on(t.userId) }));

/* ── verification documents ────────────────────────────────────────── */
export const userVerifications = pgTable("user_verifications", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(),
  documentUrl: text("document_url").notNull(),
  documentNumber: text("document_number").notNull(),
  status: verificationStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
  createdAt: now("created_at"),
}, (t) => ({
  userIdx: index("user_verifications_user_idx").on(t.userId),
  statusIdx: index("user_verifications_status_idx").on(t.status),
}));

/* ── properties & rooms ────────────────────────────────────────────── */
export const properties = pgTable("properties", {
  id: id(),
  landlordId: uuid("landlord_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull().default("Lagos"),
  country: text("country").notNull().default("NG"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isPhysicallyVerified: boolean("is_physically_verified").notNull().default(false),
  verifiedByPorterId: uuid("verified_by_porter_id").references(() => users.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "date" }),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  createdAt: now("created_at"),
}, (t) => ({
  landlordIdx: index("properties_landlord_idx").on(t.landlordId),
  cityIdx: index("properties_city_idx").on(t.city),
  verifiedIdx: index("properties_verified_idx").on(t.isPhysicallyVerified),
}));

export const rooms = pgTable("rooms", {
  id: id(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  roomNumber: text("room_number").notNull(),
  roomType: text("room_type").notNull(),
  capacity: integer("capacity").notNull().default(1),
  tier: roomTierEnum("tier").notNull(),
  saleMode: saleModeEnum("sale_mode").notNull(),
  priceKobo: koboNull("price_kobo"),
  floorPriceKobo: koboNull("floor_price_kobo"),
  minIncrementKobo: koboNull("min_increment_kobo"),
  isAvailable: boolean("is_available").notNull().default(true),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  createdAt: now("created_at"),
}, (t) => ({
  propertyIdx: index("rooms_property_idx").on(t.propertyId),
  tierIdx: index("rooms_tier_idx").on(t.tier),
  availableIdx: index("rooms_available_idx").on(t.isAvailable),
  numberUnique: unique("rooms_number_property_unique").on(t.roomNumber, t.propertyId),
}));

export const media = pgTable("media", {
  id: id(),
  ownerType: text("owner_type").notNull(), // 'property' | 'room' | 'verification' | 'task'
  ownerId: uuid("owner_id").notNull(),
  url: text("url").notNull(),
  format: text("format").notNull().default("webp"),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  sort: integer("sort").notNull().default(0),
}, (t) => ({ ownerIdx: index("media_owner_idx").on(t.ownerType, t.ownerId) }));

/* ── auctions & bids ───────────────────────────────────────────────── */
export const auctions = pgTable("auctions", {
  id: id(),
  roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  landlordId: uuid("landlord_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  currentPriceKobo: kobo("current_price_kobo"),
  floorPriceKobo: kobo("floor_price_kobo"),
  minIncrementKobo: kobo("min_increment_kobo"),
  scheduledEndTime: timestamp("scheduled_end_time", { withTimezone: true, mode: "date" }).notNull(),
  actualEndTime: timestamp("actual_end_time", { withTimezone: true, mode: "date" }),
  status: auctionStatusEnum("status").notNull().default("active"),
  winningStudentId: uuid("winning_student_id").references(() => users.id, { onDelete: "set null" }),
  totalBids: integer("total_bids").notNull().default(0),
  version: integer("version").notNull().default(1),
  createdAt: now("created_at"),
}, (t) => ({
  roomIdx: index("auctions_room_idx").on(t.roomId),
  statusIdx: index("auctions_status_idx").on(t.status),
  endIdx: index("auctions_end_idx").on(t.actualEndTime),
}));

export const bids = pgTable("bids", {
  id: id(),
  auctionId: uuid("auction_id").notNull().references(() => auctions.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountKobo: kobo("amount_kobo"),
  status: bidStatusEnum("status").notNull().default("active"),
  idempotencyKey: text("idempotency_key"),
  createdAt: now("created_at"),
}, (t) => ({
  auctionIdx: index("bids_auction_idx").on(t.auctionId),
  studentIdx: index("bids_student_idx").on(t.studentId),
  idemUnique: unique("bids_idempotency_unique").on(t.idempotencyKey),
}));

/* ── bookings, passes, money ───────────────────────────────────────── */
export const bookings = pgTable("bookings", {
  id: id(),
  auctionId: uuid("auction_id").references(() => auctions.id, { onDelete: "set null" }),
  roomId: uuid("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  landlordId: uuid("landlord_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookedPriceKobo: kobo("booked_price_kobo"),
  checkInDate: timestamp("check_in_date", { withTimezone: true, mode: "date" }).notNull(),
  checkOutDate: timestamp("check_out_date", { withTimezone: true, mode: "date" }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  signedAgreementHash: text("signed_agreement_hash"),
  createdAt: now("created_at"),
}, (t) => ({
  studentIdx: index("bookings_student_idx").on(t.studentId),
  landlordIdx: index("bookings_landlord_idx").on(t.landlordId),
  statusIdx: index("bookings_status_idx").on(t.status),
}));

export const guestPasses = pgTable("guest_passes", {
  id: id(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  totpSecretEnc: text("totp_secret_enc").notNull(),
  stepSeconds: integer("step_seconds").notNull().default(300),
  status: text("status").notNull().default("active"),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: now("created_at"),
}, (t) => ({
  bookingUnique: unique("guest_passes_booking_unique").on(t.bookingId),
  codeIdx: index("guest_passes_code_idx").on(t.codeHash),
}));

export const transactions = pgTable("transactions", {
  id: id(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  auctionId: uuid("auction_id").references(() => auctions.id, { onDelete: "set null" }),
  studentId: uuid("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  landlordId: uuid("landlord_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountKobo: kobo("amount_kobo"),
  platformFeeKobo: kobo("platform_fee_kobo"),
  landlordNetKobo: kobo("landlord_net_kobo"),
  currency: text("currency").notNull().default("NGN"),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  escrowStatus: escrowStatusEnum("escrow_status").notNull().default("pending"),
  paystackReference: text("paystack_reference"),
  autoReleaseAt: timestamp("auto_release_at", { withTimezone: true, mode: "date" }),
  releasedAt: timestamp("released_at", { withTimezone: true, mode: "date" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: now("created_at"),
}, (t) => ({
  refUnique: unique("transactions_paystack_ref_unique").on(t.paystackReference),
  studentIdx: index("transactions_student_idx").on(t.studentId),
  escrowIdx: index("transactions_escrow_idx").on(t.escrowStatus),
  autoReleaseIdx: index("transactions_auto_release_idx").on(t.autoReleaseAt),
}));

export const disputes = pgTable("disputes", {
  id: id(),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  openedBy: uuid("opened_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence").$type<Record<string, unknown>>(),
  status: disputeStatusEnum("status").notNull().default("open"),
  resolution: text("resolution"),
  /** outcome: release_to_landlord | refund_student | split */
  resolutionOutcome: text("resolution_outcome"),
  /** kobo returned to the student (0 for release) */
  refundedKobo: bigint("refunded_kobo", { mode: "bigint" }),
  /** kobo released to the landlord (0 for refund) */
  releasedKobo: bigint("released_kobo", { mode: "bigint" }),
  paystackRefundReference: text("paystack_refund_reference"),
  resolvedBy: uuid("resolved_by").references(() => users.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "date" }),
  createdAt: now("created_at"),
}, (t) => ({
  txIdx: index("disputes_tx_idx").on(t.transactionId),
  statusIdx: index("disputes_status_idx").on(t.status),
}));

/* ── payouts: escrow → landlord bank account ───────────────────────── */
export const payoutStatusEnum = pgEnum("payout_status", [
  "queued", "processing", "paid", "failed", "cancelled",
]);

export const payouts = pgTable("payouts", {
  id: id(),
  /** the booking transaction whose escrow is being paid out */
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  landlordId: uuid("landlord_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountKobo: kobo("amount_kobo"),
  status: payoutStatusEnum("status").notNull().default("queued"),
  /** Paystack transfer reference — unique per attempt, the idempotency key */
  transferReference: text("transfer_reference"),
  transferCode: text("transfer_code"),
  recipientCode: text("recipient_code"),
  attempts: integer("attempts").notNull().default(0),
  failureReason: text("failure_reason"),
  /** when the queued transfer may next be attempted (backoff) */
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true, mode: "date" }),
  processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),
  createdAt: now("created_at"),
}, (t) => ({
  txUnique: unique("payouts_transaction_unique").on(t.transactionId),
  refUnique: unique("payouts_transfer_ref_unique").on(t.transferReference),
  landlordIdx: index("payouts_landlord_idx").on(t.landlordId),
  statusIdx: index("payouts_status_idx").on(t.status, t.nextAttemptAt),
}));

/* ── verification attempt ledger (bribe/collusion resistance) ───────── */
export const verificationAttempts = pgTable("verification_attempts", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  step: kycStepEnum("step").notNull(),
  succeeded: boolean("succeeded").notNull().default(false),
  reason: text("reason"),
  createdAt: now("created_at"),
}, (t) => ({
  userIdx: index("verif_attempts_user_idx").on(t.userId, t.step, t.createdAt),
}));

/* ── email verification tokens ─────────────────────────────────────── */
export const emailVerifications = pgTable("email_verifications", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "date" }),
  createdAt: now("created_at"),
}, (t) => ({
  tokenUnique: unique("email_verifications_token_unique").on(t.tokenHash),
  userIdx: index("email_verifications_user_idx").on(t.userId),
}));

/* ── porter work ───────────────────────────────────────────────────── */
export const porterTasks = pgTable("porter_tasks", {
  id: id(),
  type: porterTaskTypeEnum("type").notNull(),
  porterId: uuid("porter_id").references(() => users.id, { onDelete: "set null" }),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
  status: porterTaskStatusEnum("status").notNull().default("open"),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  geoLat: decimal("geo_lat", { precision: 10, scale: 8 }),
  geoLng: decimal("geo_lng", { precision: 11, scale: 8 }),
  notes: text("notes"),
  createdAt: now("created_at"),
}, (t) => ({
  porterIdx: index("porter_tasks_porter_idx").on(t.porterId),
  statusIdx: index("porter_tasks_status_idx").on(t.status),
}));

/* ── notifications, audit, infra ───────────────────────────────────── */
export const notifications = pgTable("notifications", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: notificationChannelEnum("channel").notNull().default("in_app"),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  providerMessageId: text("provider_message_id"),
  readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
  createdAt: now("created_at"),
}, (t) => ({ userIdx: index("notifications_user_idx").on(t.userId, t.readAt) }));

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actionType: auditActionEnum("action_type").notNull(),
  targetResourceType: text("target_resource_type").notNull(),
  targetResourceId: uuid("target_resource_id").notNull(),
  oldValues: jsonb("old_values").$type<Record<string, unknown>>(),
  newValues: jsonb("new_values").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: now("created_at"),
}, (t) => ({
  actorIdx: index("audit_actor_idx").on(t.actorId),
  targetIdx: index("audit_target_idx").on(t.targetResourceType, t.targetResourceId),
}));

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: id(),
  scope: text("scope").notNull(),
  key: text("key").notNull(),
  response: jsonb("response").$type<Record<string, unknown>>(),
  createdAt: now("created_at"),
}, (t) => ({ scopeKeyUnique: unique("idempotency_scope_key_unique").on(t.scope, t.key) }));

/* ── relations ─────────────────────────────────────────────────────── */
export const usersRelations = relations(users, ({ many, one }) => ({
  studentProfile: one(studentProfiles, { fields: [users.id], references: [studentProfiles.userId] }),
  landlordProfile: one(landlordProfiles, { fields: [users.id], references: [landlordProfiles.userId] }),
  porterProfile: one(porterProfiles, { fields: [users.id], references: [porterProfiles.userId] }),
  properties: many(properties),
  bookings: many(bookings, { relationName: "studentBookings" }),
  bids: many(bids),
  notifications: many(notifications),
}));
export const propertiesRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, { fields: [properties.landlordId], references: [users.id] }),
  rooms: many(rooms),
  media: many(media),
}));
export const roomsRelations = relations(rooms, ({ one, many }) => ({
  property: one(properties, { fields: [rooms.propertyId], references: [properties.id] }),
  auctions: many(auctions),
  bookings: many(bookings),
  media: many(media),
}));
export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  room: one(rooms, { fields: [auctions.roomId], references: [rooms.id] }),
  bids: many(bids),
  winner: one(users, { fields: [auctions.winningStudentId], references: [users.id] }),
}));
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  student: one(users, { fields: [bookings.studentId], references: [users.id], relationName: "studentBookings" }),
  room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
  guestPass: one(guestPasses, { fields: [bookings.id], references: [guestPasses.bookingId] }),
  transactions: many(transactions),
}));

export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Auction = typeof auctions.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
