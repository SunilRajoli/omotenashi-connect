/**
 * Pricing Rule Model
 * Stores dynamic pricing rules for services based on time slots, days, and seasons
 */

import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum PricingModifierType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum PricingPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

interface PricingRuleAttributes {
  id: string;
  service_id: string;
  name: string;
  day_of_week?: number[]; // 0-6 (Sunday-Saturday), null = all days
  start_time?: string; // HH:mm format (e.g., "18:00")
  end_time?: string; // HH:mm format (e.g., "22:00")
  start_date?: Date; // For seasonal pricing
  end_date?: Date; // For seasonal pricing
  price_modifier: number; // Percentage: +20, -15, or fixed amount in cents
  modifier_type: PricingModifierType;
  priority: PricingPriority;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type PricingRuleCreationAttributes = Optional<PricingRuleAttributes, 'id' | 'is_active' | 'priority' | 'metadata' | 'created_at' | 'updated_at'>;

export class PricingRule extends Model<PricingRuleAttributes, PricingRuleCreationAttributes> implements PricingRuleAttributes {
  declare id: string;
  declare service_id: string;
  declare name: string;
  declare day_of_week?: number[];
  declare start_time?: string;
  declare end_time?: string;
  declare start_date?: Date;
  declare end_date?: Date;
  declare price_modifier: number;
  declare modifier_type: PricingModifierType;
  declare priority: PricingPriority;
  declare is_active: boolean;
  declare metadata: Record<string, unknown>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initPricingRule(sequelize: Sequelize): typeof PricingRule {
  PricingRule.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'services', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      day_of_week: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        validate: {
          isValidDay(value: number[] | null) {
            if (value) {
              for (const day of value) {
                if (day < 0 || day > 6) {
                  throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
                }
              }
            }
          },
        },
      },
      start_time: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isValidTime(value: string | null) {
            if (value && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
              throw new Error('Time must be in HH:mm format');
            }
          },
        },
      },
      end_time: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isValidTime(value: string | null) {
            if (value && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
              throw new Error('Time must be in HH:mm format');
            }
          },
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      price_modifier: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      modifier_type: {
        type: DataTypes.ENUM(...Object.values(PricingModifierType)),
        allowNull: false,
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: PricingPriority.MEDIUM,
        validate: {
          min: 1,
          max: 4,
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: 'pricing_rules',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['service_id'] },
        { fields: ['is_active'] },
        { fields: ['priority'] },
        { fields: ['start_date', 'end_date'] },
      ],
    }
  );

  return PricingRule;
}

