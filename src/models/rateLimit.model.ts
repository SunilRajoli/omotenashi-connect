import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface RateLimitAttributes {
  id: string;
  key: string;
  count: number;
  window_start: Date;
  expires_at: Date;
  created_at: Date;
}

type RateLimitCreationAttributes = Optional<RateLimitAttributes, 'id' | 'count' | 'created_at'>;

export class RateLimit extends Model<RateLimitAttributes, RateLimitCreationAttributes> implements RateLimitAttributes {
  declare id: string;
  declare key: string;
  declare count: number;
  declare window_start: Date;
  declare expires_at: Date;
  declare readonly created_at: Date;
}

export function initRateLimit(sequelize: Sequelize): typeof RateLimit {
  RateLimit.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      window_start: {
        type: DataTypes.DATE,
        allowNull: false,
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
      tableName: 'rate_limits',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['key', 'expires_at'] },
      ],
    }
  );

  return RateLimit;
}

