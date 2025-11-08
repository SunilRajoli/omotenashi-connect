import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface ServiceResourceAttributes {
  id: string;
  service_id: string;
  resource_id: string;
  is_required: boolean;
  created_at: Date;
}

type ServiceResourceCreationAttributes = Optional<ServiceResourceAttributes, 'id' | 'is_required' | 'created_at'>;

export class ServiceResource extends Model<ServiceResourceAttributes, ServiceResourceCreationAttributes> implements ServiceResourceAttributes {
  declare id: string;
  declare service_id: string;
  declare resource_id: string;
  declare is_required: boolean;
  declare readonly created_at: Date;
}

export function initServiceResource(sequelize: Sequelize): typeof ServiceResource {
  ServiceResource.init(
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
      resource_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'resources', key: 'id' },
        onDelete: 'CASCADE',
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'service_resources',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['service_id'] },
        { fields: ['resource_id'] },
      ],
    }
  );

  return ServiceResource;
}

