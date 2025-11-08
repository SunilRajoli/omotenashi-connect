import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum ResourceType {
  STAFF = 'staff',
  ROOM = 'room',
  TABLE = 'table',
  TRAINER = 'trainer',
}

interface ResourceAttributes {
  id: string;
  business_id: string;
  type: ResourceType;
  name: string;
  capacity: number;
  attributes_json: Record<string, unknown>;
  is_active: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

type ResourceCreationAttributes = Optional<ResourceAttributes, 'id' | 'capacity' | 'attributes_json' | 'is_active' | 'created_at' | 'updated_at'>;

export class Resource extends Model<ResourceAttributes, ResourceCreationAttributes> implements ResourceAttributes {
  declare id: string;
  declare business_id: string;
  declare type: ResourceType;
  declare name: string;
  declare capacity: number;
  declare attributes_json: Record<string, unknown>;
  declare is_active: boolean;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

export function initResource(sequelize: Sequelize): typeof Resource {
  Resource.init(
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
        type: DataTypes.ENUM(...Object.values(ResourceType)),
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      attributes_json: {
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
      tableName: 'resources',
      underscored: true,
      timestamps: true,
      paranoid: false,
    }
  );

  return Resource;
}

