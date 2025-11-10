import { sequelize } from '../config/sequelize';

// Import all models
import { initUser, User } from './user.model';
import { initRefreshToken, RefreshToken } from './refreshToken.model';
import { initEmailVerification, EmailVerification } from './emailVerification.model';
import { initPasswordReset, PasswordReset } from './passwordReset.model';
import { initUserSession, UserSession } from './userSession.model';
import { initVertical, Vertical } from './vertical.model';
import { initBusiness, Business } from './business.model';
import { initBusinessSettings, BusinessSettings } from './businessSettings.model';
import { initBusinessVerification, BusinessVerification } from './businessVerification.model';
import { initBusinessDocument, BusinessDocument } from './businessDocument.model';
import { initBusinessHour, BusinessHour } from './businessHour.model';
import { initBusinessHoliday, BusinessHoliday } from './businessHoliday.model';
import { initBusinessMedia, BusinessMedia } from './businessMedia.model';
import { initService, Service } from './service.model';
import { initResource, Resource } from './resource.model';
import { initServiceResource, ServiceResource } from './serviceResource.model';
import { initStaffWorkingHour, StaffWorkingHour } from './staffWorkingHour.model';
import { initStaffException, StaffException } from './staffException.model';
import { initStaffAssignment, StaffAssignment } from './staffAssignment.model';
import { initCancellationPolicy, CancellationPolicy } from './cancellationPolicy.model';
import { initCustomer, Customer } from './customer.model';
import { initCustomerNote, CustomerNote } from './customerNote.model';
import { initBooking, Booking } from './booking.model';
import { initBookingHistory, BookingHistory } from './bookingHistory.model';
import { initBookingReminder, BookingReminder } from './bookingReminder.model';
import { initWaitlist, Waitlist } from './waitlist.model';
import { initBookingPayment, BookingPayment } from './bookingPayment.model';
import { initIdempotencyKey, IdempotencyKey } from './idempotencyKey.model';
import { initPaymentWebhook, PaymentWebhook } from './paymentWebhook.model';
import { initReview, Review } from './review.model';
import { initAuditLog, AuditLog } from './auditLog.model';
import { initNotificationOutbox, NotificationOutbox } from './notificationOutbox.model';
import { initAnalyticsDaily, AnalyticsDaily } from './analyticsDaily.model';
import { initRateLimit, RateLimit } from './rateLimit.model';
import { initFeatureFlag, FeatureFlag } from './featureFlag.model';
import { initLineUser, LineUser } from './lineUser.model';
import { initBookingQrCode, BookingQrCode } from './bookingQrCode.model';
import { initPricingRule, PricingRule } from './pricingRule.model';
import { initGroupBooking, GroupBooking } from './groupBooking.model';
import { initGroupBookingParticipant, GroupBookingParticipant } from './groupBookingParticipant.model';
import { initMembership, Membership } from './membership.model';
import { initMembershipPayment, MembershipPayment } from './membershipPayment.model';
import { initInvoice, Invoice } from './invoice.model';
import { initCustomerTag, CustomerTag } from './customerTag.model';
import { initCustomerSegment, CustomerSegment } from './customerSegment.model';

// Initialize all models
const models = {
  User: initUser(sequelize),
  RefreshToken: initRefreshToken(sequelize),
  EmailVerification: initEmailVerification(sequelize),
  PasswordReset: initPasswordReset(sequelize),
  UserSession: initUserSession(sequelize),
  Vertical: initVertical(sequelize),
  Business: initBusiness(sequelize),
  BusinessSettings: initBusinessSettings(sequelize),
  BusinessVerification: initBusinessVerification(sequelize),
  BusinessDocument: initBusinessDocument(sequelize),
  BusinessHour: initBusinessHour(sequelize),
  BusinessHoliday: initBusinessHoliday(sequelize),
  BusinessMedia: initBusinessMedia(sequelize),
  Service: initService(sequelize),
  Resource: initResource(sequelize),
  ServiceResource: initServiceResource(sequelize),
  StaffWorkingHour: initStaffWorkingHour(sequelize),
  StaffException: initStaffException(sequelize),
  StaffAssignment: initStaffAssignment(sequelize),
  CancellationPolicy: initCancellationPolicy(sequelize),
  Customer: initCustomer(sequelize),
  CustomerNote: initCustomerNote(sequelize),
  Booking: initBooking(sequelize),
  BookingHistory: initBookingHistory(sequelize),
  BookingReminder: initBookingReminder(sequelize),
  Waitlist: initWaitlist(sequelize),
  BookingPayment: initBookingPayment(sequelize),
  IdempotencyKey: initIdempotencyKey(sequelize),
  PaymentWebhook: initPaymentWebhook(sequelize),
  Review: initReview(sequelize),
  AuditLog: initAuditLog(sequelize),
  NotificationOutbox: initNotificationOutbox(sequelize),
  AnalyticsDaily: initAnalyticsDaily(sequelize),
  RateLimit: initRateLimit(sequelize),
  FeatureFlag: initFeatureFlag(sequelize),
  LineUser: initLineUser(sequelize),
  BookingQrCode: initBookingQrCode(sequelize),
  PricingRule: initPricingRule(sequelize),
  GroupBooking: initGroupBooking(sequelize),
  GroupBookingParticipant: initGroupBookingParticipant(sequelize),
  Membership: initMembership(sequelize),
  MembershipPayment: initMembershipPayment(sequelize),
  Invoice: initInvoice(sequelize),
  CustomerTag: initCustomerTag(sequelize),
  CustomerSegment: initCustomerSegment(sequelize),
};

// Define associations
export function setupAssociations() {
  const {
    User, RefreshToken, EmailVerification, PasswordReset, UserSession,
    Vertical, Business, BusinessSettings, BusinessVerification, BusinessDocument,
    BusinessHour, BusinessHoliday, BusinessMedia,
    Service, Resource, ServiceResource, StaffWorkingHour, StaffException, StaffAssignment,
    CancellationPolicy, Customer, CustomerNote,
    Booking, BookingHistory, BookingReminder, Waitlist,
    BookingPayment, BookingQrCode, Review, AuditLog, AnalyticsDaily,
    LineUser
  } = models;

  // User associations
  User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
  User.hasMany(EmailVerification, { foreignKey: 'user_id', as: 'emailVerifications' });
  User.hasMany(PasswordReset, { foreignKey: 'user_id', as: 'passwordResets' });
  User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
  User.hasMany(Business, { foreignKey: 'owner_id', as: 'businesses' });
  User.hasMany(StaffAssignment, { foreignKey: 'user_id', as: 'staffAssignments' });
  User.hasMany(Customer, { foreignKey: 'user_id', as: 'customers' });
  User.hasMany(Review, { foreignKey: 'moderated_by', as: 'moderatedReviews' });
  User.hasMany(Review, { foreignKey: 'responded_by', as: 'respondedReviews' });
  User.hasMany(AuditLog, { foreignKey: 'actor_user_id', as: 'auditLogs' });
  User.hasOne(LineUser, { foreignKey: 'user_id', as: 'lineAccount' });
  User.hasMany(BookingQrCode, { foreignKey: 'used_by', as: 'scannedQrCodes' });

  // Vertical associations
  Vertical.hasMany(Business, { foreignKey: 'vertical_id', as: 'businesses' });

  // Business associations
  Business.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
  Business.belongsTo(Vertical, { foreignKey: 'vertical_id', as: 'vertical' });
  Business.hasOne(BusinessSettings, { foreignKey: 'business_id', as: 'settings' });
  Business.hasMany(BusinessVerification, { foreignKey: 'business_id', as: 'verifications' });
  Business.hasMany(BusinessDocument, { foreignKey: 'business_id', as: 'documents' });
  Business.hasMany(BusinessHour, { foreignKey: 'business_id', as: 'hours' });
  Business.hasMany(BusinessHoliday, { foreignKey: 'business_id', as: 'holidays' });
  Business.hasMany(BusinessMedia, { foreignKey: 'business_id', as: 'media' });
  Business.hasMany(Service, { foreignKey: 'business_id', as: 'services' });
  Business.hasMany(Resource, { foreignKey: 'business_id', as: 'resources' });
  Business.hasMany(Customer, { foreignKey: 'business_id', as: 'customers' });
  Business.hasMany(Booking, { foreignKey: 'business_id', as: 'bookings' });
  Business.hasMany(Review, { foreignKey: 'business_id', as: 'reviews' });
  Business.hasMany(CancellationPolicy, { foreignKey: 'business_id', as: 'policies' });
  Business.hasMany(Waitlist, { foreignKey: 'business_id', as: 'waitlist' });
  Business.hasMany(StaffAssignment, { foreignKey: 'business_id', as: 'staffAssignments' });
  Business.hasMany(AnalyticsDaily, { foreignKey: 'business_id', as: 'analytics' });
  Business.hasMany(GroupBooking, { foreignKey: 'business_id', as: 'groupBookings' });
  Business.hasMany(Membership, { foreignKey: 'business_id', as: 'memberships' });
  Business.hasMany(Invoice, { foreignKey: 'business_id', as: 'invoices' });
  Business.hasMany(CustomerTag, { foreignKey: 'business_id', as: 'customerTags' });
  Business.hasMany(CustomerSegment, { foreignKey: 'business_id', as: 'customerSegments' });

  // BusinessSettings associations
  BusinessSettings.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

  // BusinessVerification associations
  BusinessVerification.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  BusinessVerification.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // BusinessDocument associations
  BusinessDocument.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  BusinessDocument.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
  BusinessDocument.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

  // BusinessHour associations
  BusinessHour.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

  // BusinessHoliday associations
  BusinessHoliday.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

  // BusinessMedia associations
  BusinessMedia.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  BusinessMedia.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

  // Service associations
  Service.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Service.belongsTo(CancellationPolicy, { foreignKey: 'policy_id', as: 'cancellationPolicy' });
  Service.belongsToMany(Resource, { through: ServiceResource, foreignKey: 'service_id', as: 'resources' });
  Service.hasMany(Booking, { foreignKey: 'service_id', as: 'bookings' });
  Service.hasMany(Waitlist, { foreignKey: 'service_id', as: 'waitlist' });
  Service.hasMany(PricingRule, { foreignKey: 'service_id', as: 'pricingRules' });
  Service.hasMany(GroupBooking, { foreignKey: 'service_id', as: 'groupBookings' });

  // Resource associations
  Resource.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Resource.belongsToMany(Service, { through: ServiceResource, foreignKey: 'resource_id', as: 'services' });
  Resource.hasMany(StaffWorkingHour, { foreignKey: 'resource_id', as: 'workingHours' });
  Resource.hasMany(StaffException, { foreignKey: 'resource_id', as: 'exceptions' });
  Resource.hasMany(Booking, { foreignKey: 'resource_id', as: 'bookings' });

  // ServiceResource associations
  ServiceResource.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
  ServiceResource.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' });

  // StaffWorkingHour associations
  StaffWorkingHour.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' });

  // StaffException associations
  StaffException.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' });

  // StaffAssignment associations
  StaffAssignment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  StaffAssignment.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

  // CancellationPolicy associations
  CancellationPolicy.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  CancellationPolicy.hasMany(Service, { foreignKey: 'policy_id', as: 'services' });

  // Customer associations
  Customer.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Customer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Customer.hasMany(CustomerNote, { foreignKey: 'customer_id', as: 'notes' });
  Customer.hasMany(Booking, { foreignKey: 'customer_id', as: 'bookings' });
  Customer.hasMany(Review, { foreignKey: 'customer_id', as: 'reviews' });
  Customer.hasMany(Waitlist, { foreignKey: 'customer_id', as: 'waitlist' });
  Customer.hasMany(GroupBooking, { foreignKey: 'organizer_customer_id', as: 'organizedGroupBookings' });
  Customer.hasMany(GroupBookingParticipant, { foreignKey: 'customer_id', as: 'groupBookingParticipants' });
  Customer.hasMany(Membership, { foreignKey: 'customer_id', as: 'memberships' });
  Customer.hasMany(Invoice, { foreignKey: 'customer_id', as: 'invoices' });
  Customer.hasMany(CustomerTag, { foreignKey: 'customer_id', as: 'tags' });

  // CustomerNote associations
  CustomerNote.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  CustomerNote.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Booking associations
  Booking.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Booking.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
  Booking.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' });
  Booking.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Booking.hasMany(BookingHistory, { foreignKey: 'booking_id', as: 'history' });
  Booking.hasMany(BookingReminder, { foreignKey: 'booking_id', as: 'reminders' });
  Booking.hasMany(BookingPayment, { foreignKey: 'booking_id', as: 'payments' });
  Booking.hasOne(BookingQrCode, { foreignKey: 'booking_id', as: 'qrCode' });
  Booking.hasOne(Review, { foreignKey: 'booking_id', as: 'review' });
  Booking.hasMany(Invoice, { foreignKey: 'booking_id', as: 'invoices' });

  // BookingHistory associations
  BookingHistory.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
  BookingHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changer' });

  // BookingReminder associations
  BookingReminder.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

  // Waitlist associations
  Waitlist.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Waitlist.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
  Waitlist.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

  // BookingPayment associations
  BookingPayment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

  // Review associations
  Review.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Review.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
  Review.belongsTo(User, { foreignKey: 'moderated_by', as: 'moderator' });
  Review.belongsTo(User, { foreignKey: 'responded_by', as: 'responder' });

  // AnalyticsDaily associations
  AnalyticsDaily.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

  // AuditLog associations
  AuditLog.belongsTo(User, { foreignKey: 'actor_user_id', as: 'actor' });

  // LineUser associations
  LineUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // BookingQrCode associations
  BookingQrCode.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
  BookingQrCode.belongsTo(User, { foreignKey: 'used_by', as: 'scannedBy' });

  // PricingRule associations
  PricingRule.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

  // GroupBooking associations
  GroupBooking.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  GroupBooking.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
  GroupBooking.belongsTo(Customer, { foreignKey: 'organizer_customer_id', as: 'organizer' });
  GroupBooking.hasMany(GroupBookingParticipant, { foreignKey: 'group_booking_id', as: 'participants' });

  // GroupBookingParticipant associations
  GroupBookingParticipant.belongsTo(GroupBooking, { foreignKey: 'group_booking_id', as: 'groupBooking' });
  GroupBookingParticipant.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

  // Membership associations
  Membership.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Membership.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Membership.hasMany(MembershipPayment, { foreignKey: 'membership_id', as: 'payments' });

  // MembershipPayment associations
  MembershipPayment.belongsTo(Membership, { foreignKey: 'membership_id', as: 'membership' });

  // Invoice associations
  Invoice.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  Invoice.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
  Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

  // CustomerTag associations
  CustomerTag.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  CustomerTag.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  CustomerTag.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // CustomerSegment associations
  CustomerSegment.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
  CustomerSegment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
}

// Initialize associations
setupAssociations();

export { sequelize };
export default models;

// Export all models for convenience
export {
  User,
  RefreshToken,
  EmailVerification,
  PasswordReset,
  UserSession,
  Vertical,
  Business,
  BusinessSettings,
  BusinessVerification,
  BusinessDocument,
  BusinessHour,
  BusinessHoliday,
  BusinessMedia,
  Service,
  Resource,
  ServiceResource,
  StaffWorkingHour,
  StaffException,
  StaffAssignment,
  CancellationPolicy,
  Customer,
  CustomerNote,
  Booking,
  BookingHistory,
  BookingReminder,
  Waitlist,
  BookingPayment,
  IdempotencyKey,
  PaymentWebhook,
  Review,
  AuditLog,
  NotificationOutbox,
  AnalyticsDaily,
  RateLimit,
  FeatureFlag,
  LineUser,
  BookingQrCode,
  PricingRule,
  GroupBooking,
  GroupBookingParticipant,
  Membership,
  MembershipPayment,
  Invoice,
  CustomerTag,
  CustomerSegment,
};