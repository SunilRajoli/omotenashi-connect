import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface FeatureFlagAttributes {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percent: number;
  target_user_ids: string[];
  target_business_ids: string[];
  created_at: Date;
  updated_at: Date;
}

type FeatureFlagCreationAttributes = Optional<FeatureFlagAttributes, 'id' | 'is_enabled' | 'rollout_percent' | 'target_user_ids' | 'target_business_ids' | 'created_at' | 'updated_at'>;

export class FeatureFlag extends Model<FeatureFlagAttributes, FeatureFlagCreationAttributes> implements FeatureFlagAttributes {
  declare id: string;
  declare name: string;
  declare description?: string;
  declare is_enabled: boolean;
  declare rollout_percent: number;
  declare target_user_ids: string[];
  declare target_business_ids: string[];
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initFeatureFlag(sequelize: Sequelize): typeof FeatureFlag {
  FeatureFlag.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      rollout_percent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      target_user_ids: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      target_business_ids: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
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
      tableName: 'feature_flags',
      underscored: true,
      timestamps: true,
      paranoid: false,
    }
  );

  return FeatureFlag;
}

