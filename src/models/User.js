// src/models/User.js

const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  uuid: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    defaultValue: DataTypes.UUIDV4,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: "Invalid email format" },
      notNull: { msg: "Email is required" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        len: {
            args: [6,100],
            msg: "Password must be at least 6 characters",
        }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user'
  }
},{
     tableName: "users",
     timestamps: true,
     hooks: {
        beforeCreate: async(user) =>{
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        },
        beforeUpdate: async(user) => {
            if(user.changed('password') && user.password){
               user.password = await bcrypt.hash(user.password, 10); 
            }
        }
     }
});

module.exports = User;