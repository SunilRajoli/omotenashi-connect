import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BusinessDocumentAttributes {
  id: string;
  business_id: string;
  type: string;
  url: string;
  status: string;
  uploaded_by?: string;
  verified_by?: string;
  verified_at?: Date;
  created_at: Date;
}

type BusinessDocumentCreationAttributes = Optional<BusinessDocumentAttributes, 'id' | 'status' | 'created_at'>;

export class BusinessDocument extends Model<BusinessDocumentAttributes, BusinessDocumentCreationAttributes> implements BusinessDocumentAttributes {
  declare id: string;
  declare business_id: string;
  declare type: string;
  declare url: string;
  declare status: string;
  declare uploaded_by?: string;
  declare verified_by?: string;
  declare verified_at?: Date;
  declare readonly created_at: Date;
}

export function initBusinessDocument(sequelize: Sequelize): typeof BusinessDocument {
  BusinessDocument.init(
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
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'pending',
      },
      uploaded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      verified_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      verified_at: {
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
      tableName: 'business_documents',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return BusinessDocument;
}

