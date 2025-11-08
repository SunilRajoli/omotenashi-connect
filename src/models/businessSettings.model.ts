import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BusinessSettingsAttributes {
  id: string;
  business_id: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  default_locale: string;
  domain?: string;
  theme_json: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

type BusinessSettingsCreationAttributes = Optional<BusinessSettingsAttributes, 'id' | 'default_locale' | 'theme_json' | 'created_at' | 'updated_at'>;

export class BusinessSettings extends Model<BusinessSettingsAttributes, BusinessSettingsCreationAttributes> implements BusinessSettingsAttributes {
  declare id: string;
  declare business_id: string;
  declare logo_url?: string;
  declare primary_color?: string;
  declare secondary_color?: string;
  declare font_family?: string;
  declare default_locale: string;
  declare domain?: string;
  declare theme_json: Record<string, any>;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initBusinessSettings(sequelize: Sequelize): typeof BusinessSettings {
  BusinessSettings.init(
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
      logo_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      primary_color: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      secondary_color: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      font_family: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      default_locale: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'ja',
      },
      domain: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      theme_json: {
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
      tableName: 'business_settings',
      underscored: true,
      timestamps: true,
      paranoid: false,
    }
  );

  return BusinessSettings;
}

