const _ = require('lodash')

const enums = {
  'STATUS': {
    AWAITING_CONTACT: 'AWAITING_CONTACT',
    FINISHED: 'FINISHED',
    WAITING: 'WAITING',
    NOT_INTERESTED: 'NOT_INTERESTED'
  }
}

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    brand: DataTypes.STRING,
    model: DataTypes.STRING,
    variant: DataTypes.STRING,
    leasingPeriod: DataTypes.INTEGER,
    kilometers: DataTypes.INTEGER,
    color: DataTypes.STRING,
    profession: DataTypes.STRING,
    equipment: DataTypes.ARRAY(DataTypes.STRING),
    downPayment: DataTypes.INTEGER,
    monthlyPrice: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    companyName: DataTypes.STRING,
    numberOfEmployees: DataTypes.INTEGER,
    companyIndustry: DataTypes.STRING,
    cvr: DataTypes.INTEGER,
    addressStreet: DataTypes.STRING,
    addressZipcode: DataTypes.STRING,
    addressCity: DataTypes.STRING,
    newsletter: DataTypes.BOOLEAN,
    message: DataTypes.TEXT,
    comments: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM(_.values(enums.STATUS)),
      defaultValue: enums.STATUS.AWAITING_CONTACT
    }
  })

  return Order
}