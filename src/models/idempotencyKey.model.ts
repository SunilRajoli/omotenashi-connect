import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface IdempotencyKeyAttributes {
  id: string;
  scope: string;
  request_hash: string;
  status: string;
  response_json?: Record<string, unknown>;
  expires_at: Date;
  created_at: Date;
}

type IdempotencyKeyCreationAttributes = Optional<IdempotencyKeyAttributes, 'id' | 'created_at'>;

export class IdempotencyKey extends Model<IdempotencyKeyAttributes, IdempotencyKeyCreationAttributes> implements IdempotencyKeyAttributes {
  declare id: string;
  declare scope: string;
  declare request_hash: string;
  declare status: string;
  declare response_json?: Record<string, any>;
  declare expires_at: Date;
  declare readonly created_at: Date;
}

export function initIdempotencyKey(sequelize: Sequelize): typeof IdempotencyKey {
  IdempotencyKey.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      scope: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      request_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      response_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'idempotency_keys',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return IdempotencyKey;
}

