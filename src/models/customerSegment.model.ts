import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum SegmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

interface CustomerSegmentAttributes {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  filter_rules_json: Record<string, unknown>; // Rules to match customers
  status: SegmentStatus;
  customer_count?: number; // Cached count (updated periodically)
  last_calculated_at?: Date;
  created_by?: string; // User ID who created the segment
  created_at: Date;
  updated_at: Date;
}

type CustomerSegmentCreationAttributes = Optional<CustomerSegmentAttributes, 'id' | 'status' | 'customer_count' | 'created_at' | 'updated_at'>;

export class CustomerSegment extends Model<CustomerSegmentAttributes, CustomerSegmentCreationAttributes> implements CustomerSegmentAttributes {
  declare id: string;
  declare business_id: string;
  declare name: string;
  declare description?: string;
  declare filter_rules_json: Record<string, unknown>;
  declare status: SegmentStatus;
  declare customer_count?: number;
  declare last_calculated_at?: Date;
  declare created_by?: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initCustomerSegment(sequelize: Sequelize): typeof CustomerSegment {
  CustomerSegment.init(
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
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      filter_rules_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SegmentStatus)),
        allowNull: false,
        defaultValue: SegmentStatus.ACTIVE,
      },
      customer_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      last_calculated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'customer_segments',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['business_id'] },
        { fields: ['business_id', 'status'] },
      ],
    }
  );

  return CustomerSegment;
}

