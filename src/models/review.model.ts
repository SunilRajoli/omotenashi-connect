import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface ReviewAttributes {
  id: string;
  booking_id?: string;
  business_id: string;
  customer_id?: string;
  rating: number;
  comment?: string;
  sentiment_score?: number;
  is_visible: boolean;
  moderated_by?: string;
  moderated_at?: Date;
  moderation_reason?: string;
  response_text?: string;
  responded_by?: string;
  responded_at?: Date;
  deleted_at?: Date;
  created_at: Date;
}

type ReviewCreationAttributes = Optional<ReviewAttributes, 'id' | 'is_visible' | 'created_at'>;

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  declare id: string;
  declare booking_id?: string;
  declare business_id: string;
  declare customer_id?: string;
  declare rating: number;
  declare comment?: string;
  declare sentiment_score?: number;
  declare is_visible: boolean;
  declare moderated_by?: string;
  declare moderated_at?: Date;
  declare moderation_reason?: string;
  declare response_text?: string;
  declare responded_by?: string;
  declare responded_at?: Date;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
}

export function initReview(sequelize: Sequelize): typeof Review {
  Review.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE',
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sentiment_score: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      is_visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      moderated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      moderated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      moderation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      response_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      responded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'reviews',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['business_id', 'created_at'] },
      ],
    }
  );

  return Review;
}

