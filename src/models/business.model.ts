import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum BusinessStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
}

export enum OnboardingStatus {
  INCOMPLETE = 'incomplete',
  PENDING_VERIFICATION = 'pending_verification',
  LIVE = 'live',
}

interface BusinessAttributes {
  id: string;
  owner_id: string;
  vertical_id?: string;
  slug: string;
  display_name_ja?: string;
  display_name_en?: string;
  name_kana?: string;
  description_ja?: string;
  description_en?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  street?: string;
  building?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  timezone: string;
  status: BusinessStatus;
  onboarding_status: OnboardingStatus;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

type BusinessCreationAttributes = Optional<BusinessAttributes, 'id' | 'timezone' | 'status' | 'onboarding_status' | 'created_at' | 'updated_at'>;

export class Business extends Model<BusinessAttributes, BusinessCreationAttributes> implements BusinessAttributes {
  declare id: string;
  declare owner_id: string;
  declare vertical_id?: string;
  declare slug: string;
  declare display_name_ja?: string;
  declare display_name_en?: string;
  declare name_kana?: string;
  declare description_ja?: string;
  declare description_en?: string;
  declare postal_code?: string;
  declare prefecture?: string;
  declare city?: string;
  declare street?: string;
  declare building?: string;
  declare latitude?: number;
  declare longitude?: number;
  declare phone?: string;
  declare email?: string;
  declare timezone: string;
  declare status: BusinessStatus;
  declare onboarding_status: OnboardingStatus;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initBusiness(sequelize: Sequelize): typeof Business {
  Business.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      vertical_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'verticals', key: 'id' },
      },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      display_name_ja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      display_name_en: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      name_kana: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_ja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_en: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      postal_code: {
        type: DataTypes.CHAR(8),
        allowNull: true,
      },
      prefecture: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      street: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      building: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      timezone: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'Asia/Tokyo',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(BusinessStatus)),
        allowNull: false,
        defaultValue: BusinessStatus.PENDING_REVIEW,
      },
      onboarding_status: {
        type: DataTypes.ENUM(...Object.values(OnboardingStatus)),
        allowNull: false,
        defaultValue: OnboardingStatus.INCOMPLETE,
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
      tableName: 'businesses',
      underscored: true,
      timestamps: true,
      paranoid: false,
      indexes: [
        { fields: ['status'] },
        { fields: ['owner_id'] },
        { fields: ['slug'] },
      ],
    }
  );

  return Business;
}

