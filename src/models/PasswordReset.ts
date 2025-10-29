import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface PasswordResetAttrs { id: string; userId: string; token: string; expiresAt: Date; consumedAt?: Date|null; }
type Creation = Optional<PasswordResetAttrs, 'id'|'consumedAt'>;

export class PasswordReset extends Model<PasswordResetAttrs, Creation> implements PasswordResetAttrs {
  declare id: string; declare userId: string; declare token: string; declare expiresAt: Date; declare consumedAt: Date|null;

  static initModel(sequelize: Sequelize) {
    PasswordReset.init({
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
      token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
      consumedAt: { type: DataTypes.DATE, allowNull: true, field: 'consumed_at' }
    }, { sequelize, tableName: 'password_resets', underscored: true });
    return PasswordReset;
  }
}
