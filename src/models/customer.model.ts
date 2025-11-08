import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

interface CustomerAttributes {
  id: string;
  business_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferences_json: Record<string, unknown>;
  no_show_count: number;
  deleted_at?: Date;
  created_at: Date;
}

type CustomerCreationAttributes = Optional<CustomerAttributes, 'id' | 'preferences_json' | 'no_show_count' | 'created_at'>;

export class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  declare id: string;
  declare business_id: string;
  declare user_id?: string;
  declare name?: string;
  declare email?: string;
  declare phone?: string;
  declare preferences_json: Record<string, any>;
  declare no_show_count: number;
  declare deleted_at?: Date;
  declare readonly created_at: Date;
}

export function initCustomer(sequelize: Sequelize): typeof Customer {
  Customer.init(
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      preferences_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      no_show_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      tableName: 'customers',
      underscored: true,
      timestamps: false,
      paranoid: false,
    }
  );

  return Customer;
}

