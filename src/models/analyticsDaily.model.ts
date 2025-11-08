import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface AnalyticsDailyAttributes {
  id: string;
  business_id: string;
  date: Date;
  bookings: number;
  revenue_cents: number;
  cancellations: number;
  no_shows: number;
  review_avg?: number;
  created_at: Date;
}

type AnalyticsDailyCreationAttributes = Optional<AnalyticsDailyAttributes, 'id' | 'bookings' | 'revenue_cents' | 'cancellations' | 'no_shows' | 'created_at'>;

export class AnalyticsDaily extends Model<AnalyticsDailyAttributes, AnalyticsDailyCreationAttributes> implements AnalyticsDailyAttributes {
  declare id: string;
  declare business_id: string;
  declare date: Date;
  declare bookings: number;
  declare revenue_cents: number;
  declare cancellations: number;
  declare no_shows: number;
  declare review_avg?: number;
  declare readonly created_at: Date;
}

export function initAnalyticsDaily(sequelize: Sequelize): typeof AnalyticsDaily {
  AnalyticsDaily.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE',
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      bookings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      revenue_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      cancellations: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      no_shows: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      review_avg: {
        type: DataTypes.DECIMAL,
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
      tableName: 'analytics_daily',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['business_id', 'date'] },
      ],
    }
  );

  return AnalyticsDaily;
}

