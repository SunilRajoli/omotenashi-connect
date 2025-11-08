import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface EmailVerificationAttributes {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  verified_at?: Date;
  created_at: Date;
}

type EmailVerificationCreationAttributes = Optional<EmailVerificationAttributes, 'id' | 'created_at'>;

export class EmailVerification extends Model<EmailVerificationAttributes, EmailVerificationCreationAttributes> implements EmailVerificationAttributes {
  declare id: string;
  declare user_id: string;
  declare token_hash: string;
  declare expires_at: Date;
  declare verified_at?: Date;
  declare readonly created_at: Date;
}

export function initEmailVerification(sequelize: Sequelize): typeof EmailVerification {
  EmailVerification.init(
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
      tableName: 'email_verifications',
      underscored: true,
      timestamps: false,
    }
  );

  return EmailVerification;
}