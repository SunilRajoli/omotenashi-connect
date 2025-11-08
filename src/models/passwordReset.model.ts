import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface PasswordResetAttributes {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at?: Date;
  created_at: Date;
}

type PasswordResetCreationAttributes = Optional<PasswordResetAttributes, 'id' | 'created_at'>;

export class PasswordReset extends Model<PasswordResetAttributes, PasswordResetCreationAttributes> implements PasswordResetAttributes {
  declare id: string;
  declare user_id: string;
  declare token_hash: string;
  declare expires_at: Date;
  declare used_at?: Date;
  declare readonly created_at: Date;
}

export function initPasswordReset(sequelize: Sequelize): typeof PasswordReset {
  PasswordReset.init(
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
      used_at: {
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
      tableName: 'password_resets',
      underscored: true,
      timestamps: false,
    }
  );

  return PasswordReset;
}