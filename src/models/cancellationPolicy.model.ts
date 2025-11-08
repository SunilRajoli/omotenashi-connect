import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface CancellationPolicyAttributes {
  id: string;
  business_id: string;
  name: string;
  hours_before: number;
  penalty_percent: number;
  is_default: boolean;
  deleted_at?: Date;
  created_at: Date;
}

type CancellationPolicyCreationAttributes = Optional<CancellationPolicyAttributes, 'id' | 'is_default' | 'created_at'>;

export class CancellationPolicy extends Model<CancellationPolicyAttributes, CancellationPolicyCreationAttributes> implements CancellationPolicyAttributes {
  declare id: string;
  declare business_id: string;
  declare name: string;
  declare hours_before: number;
  declare penalty_percent: number;
  declare is_default: boolean;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
}

export function initCancellationPolicy(sequelize: Sequelize): typeof CancellationPolicy {
  CancellationPolicy.init(
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
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      hours_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      penalty_percent: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: 'cancellation_policies',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return CancellationPolicy;
}

