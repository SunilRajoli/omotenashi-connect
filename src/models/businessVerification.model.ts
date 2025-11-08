import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

interface BusinessVerificationAttributes {
  id: string;
  business_id: string;
  status: VerificationStatus;
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
}

type BusinessVerificationCreationAttributes = Optional<BusinessVerificationAttributes, 'id' | 'status' | 'created_at'>;

export class BusinessVerification extends Model<BusinessVerificationAttributes, BusinessVerificationCreationAttributes> implements BusinessVerificationAttributes {
  declare id: string;
  declare business_id: string;
  declare status: VerificationStatus;
  declare notes?: string;
  declare reviewed_by?: string;
  declare reviewed_at?: Date;
  declare readonly created_at: Date;
}

export function initBusinessVerification(sequelize: Sequelize): typeof BusinessVerification {
  BusinessVerification.init(
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
      status: {
        type: DataTypes.ENUM(...Object.values(VerificationStatus)),
        allowNull: false,
        defaultValue: VerificationStatus.PENDING,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      reviewed_at: {
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
      tableName: 'business_verifications',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return BusinessVerification;
}

