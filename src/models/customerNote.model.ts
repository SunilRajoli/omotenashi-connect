import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export enum NoteType {
  ALLERGY = 'allergy',
  PREFERENCE = 'preference',
  RESTRICTION = 'restriction',
  SPECIAL_NEED = 'special_need',
}

interface CustomerNoteAttributes {
  id: string;
  customer_id: string;
  note_type: NoteType;
  note: string;
  created_by?: string;
  created_at: Date;
}

type CustomerNoteCreationAttributes = Optional<CustomerNoteAttributes, 'id' | 'created_at'>;

export class CustomerNote extends Model<CustomerNoteAttributes, CustomerNoteCreationAttributes> implements CustomerNoteAttributes {
  declare id: string;
  declare customer_id: string;
  declare note_type: NoteType;
  declare note: string;
  declare created_by?: string;
  declare readonly created_at: Date;
}

export function initCustomerNote(sequelize: Sequelize): typeof CustomerNote {
  CustomerNote.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE',
      },
      note_type: {
        type: DataTypes.ENUM(...Object.values(NoteType)),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'customer_notes',
      underscored: true,
      timestamps: false,
      paranoid: false,
      indexes: [
        { fields: ['customer_id'] },
      ],
    }
  );

  return CustomerNote;
}

