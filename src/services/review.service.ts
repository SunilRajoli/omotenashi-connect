/**
 * Review Service
 * Handles review creation, moderation, and management
 */

import { Transaction, WhereOptions, Op } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { Review } from '../models/review.model';
import { Business } from '../models/business.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { Customer } from '../models/customer.model';
import { User } from '../models/user.model';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from '../utils/httpErrors';
import { logger } from '../utils/logger';
import {
  CreateReviewRequest,
  UpdateReviewRequest,
  ModerateReviewRequest,
  RespondToReviewRequest,
  ReviewQueryParams,
} from '../validators/review.validator';

/**
 * Create a new review
 */
export async function createReview(
  data: CreateReviewRequest,
  userId?: string
): Promise<Review> {
  return sequelize.transaction(async (transaction: Transaction) => {
    // Verify business exists
    const business = await Business.findByPk(data.business_id, { transaction });
    if (!business || business.deleted_at) {
      throw new NotFoundError('Business not found');
    }

    // Verify booking if provided
    if (data.booking_id) {
      const booking = await Booking.findByPk(data.booking_id, { transaction });
      if (!booking || booking.deleted_at) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.business_id !== data.business_id) {
        throw new BadRequestError('Booking does not belong to this business');
      }

      // Check if booking is completed
      if (booking.status !== BookingStatus.COMPLETED) {
        throw new BadRequestError('Can only review completed bookings');
      }

      // Check if review already exists for this booking
      const existingReview = await Review.findOne({
        where: {
          booking_id: data.booking_id,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
        transaction,
      });

      if (existingReview) {
        throw new ConflictError('Review already exists for this booking');
      }
    }

    // Get or verify customer
    let customerId = data.customer_id;
    if (!customerId && userId) {
      const customer = await Customer.findOne({
        where: {
          business_id: data.business_id,
          user_id: userId,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
        transaction,
      });

      if (customer) {
        customerId = customer.id;
      } else if (data.booking_id) {
        // Try to get customer from booking
        const booking = await Booking.findByPk(data.booking_id, {
          include: [{ model: Customer, as: 'customer' }],
          transaction,
        });

        if (booking) {
          const bookingCustomer = booking.get('customer') as Customer | undefined;
          if (bookingCustomer) {
            customerId = bookingCustomer.id;
          }
        }
      }
    }

    // Calculate sentiment score (simple implementation - can be enhanced with NLP)
    let sentimentScore: number | undefined;
    if (data.comment) {
      // Simple sentiment: positive words = positive score, negative words = negative score
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'best', 'fantastic', 'awesome'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 'poor', 'disgusting'];
      
      const commentLower = data.comment.toLowerCase();
      let score = 0;
      positiveWords.forEach(word => {
        if (commentLower.includes(word)) score += 0.1;
      });
      negativeWords.forEach(word => {
        if (commentLower.includes(word)) score -= 0.1;
      });
      
      sentimentScore = Math.max(-1, Math.min(1, score));
    }

    // Create review
    const review = await Review.create(
      {
        booking_id: data.booking_id,
        business_id: data.business_id,
        customer_id: customerId,
        rating: data.rating,
        comment: data.comment,
        sentiment_score: sentimentScore,
        is_visible: true, // Default to visible, can be moderated later
      },
      { transaction }
    );

    logger.info({ reviewId: review.id, businessId: data.business_id, rating: data.rating }, 'Review created');

    return review.reload({
      include: [
        { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: Booking, as: 'booking', attributes: ['id', 'start_at', 'end_at'] },
      ],
      transaction,
    });
  });
}

/**
 * List reviews
 */
export async function listReviews(
  query: ReviewQueryParams,
  userId?: string,
  userRole?: string
): Promise<{ reviews: Review[]; total: number; page: number; limit: number }> {
  const where: WhereOptions = {
    deleted_at: { [Op.is]: null },
  };

  if (query.business_id) {
    where.business_id = query.business_id;
  }
  if (query.customer_id) {
    where.customer_id = query.customer_id;
  }
  if (query.booking_id) {
    where.booking_id = query.booking_id;
  }
  if (query.rating) {
    where.rating = query.rating;
  }

  // Access control: non-admin users can only see visible reviews
  if (userRole !== 'admin' && userRole !== 'owner') {
    where.is_visible = true;
  } else if (query.is_visible !== undefined) {
    where.is_visible = query.is_visible;
  }

  // Customers can only see their own reviews
  if (userRole === 'customer' && userId) {
    const customer = await Customer.findOne({
      where: {
        user_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    if (customer) {
      where.customer_id = customer.id;
    } else {
      return { reviews: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }
  }

  // Owners can only see reviews for their businesses
  if (userRole === 'owner' && userId) {
    const businesses = await Business.findAll({
      where: {
        owner_id: userId,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
      attributes: ['id'],
    });

    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) {
      return { reviews: [], total: 0, page: query.page || 1, limit: query.limit || 20 };
    }

    where.business_id = { [Op.in]: businessIds };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Review.findAndCountAll({
    where,
    include: [
      { model: Business, as: 'business', attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'] },
      { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] },
      { model: Booking, as: 'booking', attributes: ['id', 'start_at', 'end_at'] },
      { model: User, as: 'moderator', attributes: ['id', 'email', 'display_name'] },
      { model: User, as: 'responder', attributes: ['id', 'email', 'display_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    reviews: rows,
    total: count,
    page,
    limit,
  };
}

/**
 * Get review by ID
 */
export async function getReviewById(
  reviewId: string,
  userId?: string,
  userRole?: string
): Promise<Review> {
  const review = await Review.findByPk(reviewId, {
    include: [
      { model: Business, as: 'business' },
      { model: Customer, as: 'customer' },
      { model: Booking, as: 'booking' },
      { model: User, as: 'moderator', attributes: ['id', 'email', 'display_name'] },
      { model: User, as: 'responder', attributes: ['id', 'email', 'display_name'] },
    ],
  });

  if (!review || review.deleted_at) {
    throw new NotFoundError('Review not found');
  }

  // Access control
  if (userRole === 'customer' && userId) {
    const customer = await Customer.findOne({
      where: {
        user_id: userId,
        business_id: review.business_id,
        deleted_at: { [Op.is]: null },
      } as WhereOptions,
    });

    if (!customer || review.customer_id !== customer.id) {
      throw new ForbiddenError('You can only view your own reviews');
    }
  }

  if (userRole === 'owner' && userId) {
    const business = await Business.findByPk(review.business_id);
    if (!business || business.owner_id !== userId) {
      throw new ForbiddenError('You can only view reviews for your businesses');
    }
  }

  // Non-admin/owner users can only see visible reviews
  if (userRole !== 'admin' && userRole !== 'owner' && !review.is_visible) {
    throw new NotFoundError('Review not found');
  }

  return review;
}

/**
 * Update review
 */
export async function updateReview(
  reviewId: string,
  data: UpdateReviewRequest,
  userId: string,
  userRole: string
): Promise<Review> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const review = await Review.findByPk(reviewId, { transaction });

    if (!review || review.deleted_at) {
      throw new NotFoundError('Review not found');
    }

    // Access control: only customers can update their own reviews
    if (userRole === 'customer') {
      const customer = await Customer.findOne({
        where: {
          user_id: userId,
          business_id: review.business_id,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
        transaction,
      });

      if (!customer || review.customer_id !== customer.id) {
        throw new ForbiddenError('You can only update your own reviews');
      }

      // Customers can only update reviews that haven't been moderated
      if (review.moderated_at) {
        throw new ForbiddenError('Cannot update moderated review');
      }
    } else if (userRole !== 'admin') {
      throw new ForbiddenError('Only customers and admins can update reviews');
    }

    // Recalculate sentiment score if comment is updated
    let sentimentScore = review.sentiment_score;
    if (data.comment !== undefined && data.comment !== review.comment) {
      if (data.comment) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'best', 'fantastic', 'awesome'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointed', 'poor', 'disgusting'];
        
        const commentLower = data.comment.toLowerCase();
        let score = 0;
        positiveWords.forEach(word => {
          if (commentLower.includes(word)) score += 0.1;
        });
        negativeWords.forEach(word => {
          if (commentLower.includes(word)) score -= 0.1;
        });
        
        sentimentScore = Math.max(-1, Math.min(1, score));
      } else {
        sentimentScore = undefined;
      }
    }

    // Update review
    await review.update(
      {
        rating: data.rating ?? review.rating,
        comment: data.comment ?? review.comment,
        sentiment_score: sentimentScore,
      },
      { transaction }
    );

    logger.info({ reviewId, userId }, 'Review updated');

    return review.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Customer, as: 'customer' },
        { model: Booking, as: 'booking' },
      ],
      transaction,
    });
  });
}

/**
 * Moderate review
 */
export async function moderateReview(
  reviewId: string,
  data: ModerateReviewRequest,
  moderatorId: string,
  moderatorRole: string
): Promise<Review> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const review = await Review.findByPk(reviewId, { transaction });

    if (!review || review.deleted_at) {
      throw new NotFoundError('Review not found');
    }

    // Access control: only admins and business owners can moderate
    if (moderatorRole !== 'admin' && moderatorRole !== 'owner') {
      throw new ForbiddenError('Only admins and business owners can moderate reviews');
    }

    if (moderatorRole === 'owner') {
      const business = await Business.findByPk(review.business_id, { transaction });
      if (!business || business.owner_id !== moderatorId) {
        throw new ForbiddenError('You can only moderate reviews for your businesses');
      }
    }

    // Update review moderation
    await review.update(
      {
        is_visible: data.is_visible,
        moderation_reason: data.moderation_reason || undefined,
        moderated_by: moderatorId,
        moderated_at: new Date(),
      },
      { transaction }
    );

    logger.info({ reviewId, moderatorId, isVisible: data.is_visible }, 'Review moderated');

    return review.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Customer, as: 'customer' },
        { model: User, as: 'moderator' },
      ],
      transaction,
    });
  });
}

/**
 * Respond to review
 */
export async function respondToReview(
  reviewId: string,
  data: RespondToReviewRequest,
  responderId: string,
  responderRole: string
): Promise<Review> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const review = await Review.findByPk(reviewId, { transaction });

    if (!review || review.deleted_at) {
      throw new NotFoundError('Review not found');
    }

    // Access control: only business owners and admins can respond
    if (responderRole !== 'admin' && responderRole !== 'owner') {
      throw new ForbiddenError('Only business owners and admins can respond to reviews');
    }

    if (responderRole === 'owner') {
      const business = await Business.findByPk(review.business_id, { transaction });
      if (!business || business.owner_id !== responderId) {
        throw new ForbiddenError('You can only respond to reviews for your businesses');
      }
    }

    // Update review response
    await review.update(
      {
        response_text: data.response_text,
        responded_by: responderId,
        responded_at: new Date(),
      },
      { transaction }
    );

    logger.info({ reviewId, responderId }, 'Review response added');

    return review.reload({
      include: [
        { model: Business, as: 'business' },
        { model: Customer, as: 'customer' },
        { model: User, as: 'responder' },
      ],
      transaction,
    });
  });
}

/**
 * Delete review (soft delete)
 */
export async function deleteReview(
  reviewId: string,
  userId: string,
  userRole: string
): Promise<void> {
  return sequelize.transaction(async (transaction: Transaction) => {
    const review = await Review.findByPk(reviewId, { transaction });

    if (!review || review.deleted_at) {
      throw new NotFoundError('Review not found');
    }

    // Access control: customers can delete their own reviews, admins can delete any
    if (userRole === 'customer') {
      const customer = await Customer.findOne({
        where: {
          user_id: userId,
          business_id: review.business_id,
          deleted_at: { [Op.is]: null },
        } as WhereOptions,
        transaction,
      });

      if (!customer || review.customer_id !== customer.id) {
        throw new ForbiddenError('You can only delete your own reviews');
      }
    } else if (userRole !== 'admin' && userRole !== 'owner') {
      throw new ForbiddenError('Only customers, owners, and admins can delete reviews');
    }

    if (userRole === 'owner') {
      const business = await Business.findByPk(review.business_id, { transaction });
      if (!business || business.owner_id !== userId) {
        throw new ForbiddenError('You can only delete reviews for your businesses');
      }
    }

    // Soft delete
    await review.update(
      {
        deleted_at: new Date(),
      },
      { transaction }
    );

    logger.info({ reviewId, userId }, 'Review deleted');
  });
}

/**
 * Get business review statistics
 */
export async function getBusinessReviewStats(businessId: string): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  recentReviews: Review[];
}> {
  const business = await Business.findByPk(businessId);
  if (!business || business.deleted_at) {
    throw new NotFoundError('Business not found');
  }

  const reviews = await Review.findAll({
    where: {
      business_id: businessId,
      is_visible: true,
      deleted_at: { [Op.is]: null },
    } as WhereOptions,
    attributes: ['rating', 'created_at'],
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
  });

  const recentReviews = await Review.findAll({
    where: {
      business_id: businessId,
      is_visible: true,
      deleted_at: { [Op.is]: null },
    } as WhereOptions,
    include: [
      { model: Customer, as: 'customer', attributes: ['id', 'name'] },
      { model: User, as: 'responder', attributes: ['id', 'display_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    ratingDistribution,
    recentReviews,
  };
}

