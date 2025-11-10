/**
 * Membership Model
 * Stores membership plans and subscriptions
 */

import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum MembershipType {
  SUBSCRIPTION = 'subscription',
  PACKAGE = 'package',
  PUNCH_CARD = 'punch_card',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

interface MembershipAttributes {
  id: string;
  business_id: string;
  customer_id: string;
  membership_type: MembershipType;
  name: string;
  description?: string;
  price_cents: number;
  billing_cycle?: BillingCycle;
  duration_days?: number; // For packages
  visits_included?: number; // For punch cards
  visits_used: number;
  discount_percentage?: number;
  benefits: Record<string, unknown>;
  status: MembershipStatus;
  start_date: Date;
  end_date?: Date;
  next_billing_date?: Date;
  auto_renew: boolean;
  cancelled_at?: Date;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type MembershipCreationAttributes = Optional<MembershipAttributes, 'id' | 'visits_used' | 'status' | 'auto_renew' | 'benefits' | 'metadata' | 'created_at' | 'updated_at'>;

export class Membership extends Model<MembershipAttributes, MembershipCreationAttributes> implements MembershipAttributes {
  declare id: string;
  declare business_id: string;
  declare customer_id: string;
  declare membership_type: MembershipType;
  declare name: string;
  declare description?: string;
  declare price_cents: number;
  declare billing_cycle?: BillingCycle;
  declare duration_days?: number;
  declare visits_included?: number;
  declare visits_used: number;
  declare discount_percentage?: number;
  declare benefits: Record<string, unknown>;
  declare status: MembershipStatus;
  declare start_date: Date;
  declare end_date?: Date;
  declare next_billing_date?: Date;
  declare auto_renew: boolean;
  declare cancelled_at?: Date;
  declare metadata: Record<string, unknown>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initMembership(sequelize: Sequelize): typeof Membership {
  Membership.init(
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
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE',
      },
      membership_type: {
        type: DataTypes.ENUM(...Object.values(MembershipType)),
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      billing_cycle: {
        type: DataTypes.ENUM(...Object.values(BillingCycle)),
        allowNull: true,
      },
      duration_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
        },
      },
      visits_included: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
        },
      },
      visits_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      discount_percentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      benefits: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MembershipStatus)),
        allowNull: false,
        defaultValue: MembershipStatus.ACTIVE,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      next_billing_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      auto_renew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
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
      tableName: 'memberships',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['business_id'] },
        { fields: ['customer_id'] },
        { fields: ['membership_type'] },
        { fields: ['status'] },
        { fields: ['start_date', 'end_date'] },
        { fields: ['next_billing_date'] },
      ],
    }
  );

  return Membership;
}

