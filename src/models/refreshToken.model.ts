import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface RefreshTokenAttributes {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, 'id' | 'created_at'>;

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
  declare id: string;
  declare user_id: string;
  declare token_hash: string;
  declare expires_at: Date;
  declare readonly created_at: Date;
}

export function initRefreshToken(sequelize: Sequelize): typeof RefreshToken {
  RefreshToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      token_hash: {
        type: DataTypes.TEXT,
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
      tableName: 'refresh_tokens',
      underscored: true,
      timestamps: false,
      indexes: [
        { fields: ['user_id', 'expires_at'] },
      ],
    }
  );

  return RefreshToken;
}