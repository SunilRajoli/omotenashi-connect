import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface RefreshTokenAttrs {
  id: string; userId: string; token: string; userAgent?: string|null; ip?: string|null;
  expiresAt: Date; revokedAt?: Date|null; createdAt?: Date;
}
type Creation = Optional<RefreshTokenAttrs, 'id'|'userAgent'|'ip'|'revokedAt'|'createdAt'>;

export class RefreshToken extends Model<RefreshTokenAttrs, Creation> implements RefreshTokenAttrs {
  declare id: string; declare userId: string; declare token: string; declare userAgent: string|null; declare ip: string|null;
  declare expiresAt: Date; declare revokedAt: Date|null; declare createdAt: Date;

  static initModel(sequelize: Sequelize) {
    RefreshToken.init({
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
      token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      userAgent: { type: DataTypes.STRING(1024), allowNull: true, field: 'user_agent' },
      ip: { type: DataTypes.STRING(64), allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
      revokedAt: { type: DataTypes.DATE, allowNull: true, field: 'revoked_at' }
    }, { sequelize, tableName: 'refresh_tokens', underscored: true });
    return RefreshToken;
  }
}
