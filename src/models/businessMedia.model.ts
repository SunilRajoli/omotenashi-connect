import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface BusinessMediaAttributes {
  id: string;
  business_id: string;
  type: 'image' | 'video';
  url: string;
  caption_en?: string;
  caption_ja?: string;
  display_order: number;
  is_featured: boolean;
  uploaded_by?: string;
  deleted_at?: Date;
  created_at: Date;
}

type BusinessMediaCreationAttributes = Optional<BusinessMediaAttributes, 'id' | 'display_order' | 'is_featured' | 'created_at'>;

export class BusinessMedia extends Model<BusinessMediaAttributes, BusinessMediaCreationAttributes> implements BusinessMediaAttributes {
  declare id: string;
  declare business_id: string;
  declare type: 'image' | 'video';
  declare url: string;
  declare caption_en?: string;
  declare caption_ja?: string;
  declare display_order: number;
  declare is_featured: boolean;
  declare uploaded_by?: string;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
}

export function initBusinessMedia(sequelize: Sequelize): typeof BusinessMedia {
  BusinessMedia.init(
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
      caption_en: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      caption_ja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      uploaded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
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
    },
    {
      sequelize,
      tableName: 'business_media',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return BusinessMedia;
}

