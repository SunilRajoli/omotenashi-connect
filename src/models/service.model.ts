import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface ServiceAttributes {
  id: string;
  business_id: string;
  category?: string;
  name_en: string;
  name_ja?: string;
  description_en?: string;
  description_ja?: string;
  duration_minutes?: number;
  price_cents?: number;
  buffer_before: number;
  buffer_after: number;
  policy_id?: string;
  metadata: Record<string, unknown>;
  is_active: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

type ServiceCreationAttributes = Optional<ServiceAttributes, 'id' | 'buffer_before' | 'buffer_after' | 'metadata' | 'is_active' | 'created_at' | 'updated_at'>;

export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  declare id: string;
  declare business_id: string;
  declare category?: string;
  declare name_en: string;
  declare name_ja?: string;
  declare description_en?: string;
  declare description_ja?: string;
  declare duration_minutes?: number;
  declare price_cents?: number;
  declare buffer_before: number;
  declare buffer_after: number;
  declare policy_id?: string;
  declare metadata: Record<string, any>;
  declare is_active: boolean;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initService(sequelize: Sequelize): typeof Service {
  Service.init(
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
      category: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      name_en: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name_ja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_en: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_ja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      price_cents: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      buffer_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      buffer_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      policy_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'cancellation_policies', key: 'id' },
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'services',
      underscored: true,
      timestamps: true,
      paranoid: false,
    }
  );

  return Service;
}

