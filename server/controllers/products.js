const _ = require('lodash')
const Sentry = require('@sentry/node')

const logger = require('../lib/logger')
const exceptions = require('../lib/exceptions')
const products = require('../service').products
const SequelizeEmptyResultError = require('../models').Sequelize
  .EmptyResultError

module.exports = {
  createProduct: (req, res) => {
    return products
      .sanitize(req.body)
      .then(params => products.create(params))
      .then(newProduct => products.fullResForOne(newProduct))
      .then(output =>
        res.status(201).send(simpleRes('Successfully Created Product', output))
      )
      .catch(exceptions.InvalidInputError, err =>
        res.status(400).send(invalidInputRes(0, err.errors))
      )
      .catch(err => {
        logger.error(err)
        Sentry.captureException(err)
        return res.status(500).send()
      })
  },
  listProducts: (req, res) => {
    const limit = req.swagger.params.limit.value
    const offset = req.swagger.params.offset.value

    const options = {
      model: req.swagger.params.model.value,
      oVariant: req.swagger.params.oVariant.value,
      year: req.swagger.params.year.value,
      acquisitionCost: req.swagger.params.acquisitionCost.value,
      status: req.swagger.params.status.value,
      limit,
      offset
    }

    const sortBy = []
    const sortParams = JSON.parse(req.swagger.params.sortby.value)
    if (sortParams.option && sortParams.direction) {
      if (sortParams.option === 'price') {
        sortParams.option = 'acquisition_cost'
      }
      sortBy.push([ sortParams.option, sortParams.direction ])
    } else {
      sortBy.push(['id', 'ASC'])
    }

    const parsedEvents = []
    let searchResult = []
    return products
      .search(options, sortBy)
      .then(result => {
        searchResult = result
        const promises = []
        _.forEach(searchResult.objects, product => {
          promises.push(
            products.fullRes(product).then(data => {
              parsedEvents.push(data)
            })
          )
        })
        return Promise.all(promises)
      })
      .then(() =>
        res
          .status(200)
          .send(searchRes(parsedEvents, searchResult.count, offset, limit, sortParams))
      )
      .catch(SequelizeEmptyResultError, () => res.status(404).send())
      .catch(err => {
        logger.error(err)
        Sentry.captureException(err)
        return res.status(500).send(err)
      })
  },
  getProduct: (req, res) => {
    logger.info('Getting a product')
    const id = req.swagger.params.productId.value
    return products
      .get(id, { rejectOnEmpty: true })
      .then(product => products.fullResForOne(product))
      .then(data =>
        res.status(200).send(simpleRes('Successfully Retrieved Product', data))
      )
      .catch(SequelizeEmptyResultError, () => res.status(404).send())
      .catch(err => {
        logger.error(err)
        Sentry.captureException(err)
        res.status(500).send()
      })
  },
  modifyProduct: (req, res) => {
    logger.info('Modifying a product')
    const id = req.swagger.params.productId.value

    return products
      .sanitize(req.body)
      .then(input => products.modify(id, input))
      .then(prod => products.fullResForOne(prod))
      .then(data =>
        res.status(201).send(simpleRes('Successfully Modified Product', data))
      )
      .catch(exceptions.InvalidInputError, err =>
        res.status(400).send(invalidInputRes(0, err.errors))
      )
      .catch(SequelizeEmptyResultError, () => res.status(404).send())
      .catch(err => {
        logger.error(err)
        Sentry.captureException(err)
        return res.status(500).send()
      })
  },
  deleteProduct: (req, res) => {
    logger.info('Deleting a product')
    const productId = req.swagger.params.productId.value
    let response = {}
    return products
      .get(productId, { rejectOnEmpty: true })
      .then(product => products.fullResForOne(product))
      .then(data => {
        response = data
        return products.delete(productId)
      })
      .then(() =>
        res
          .status(200)
          .send(simpleRes('Successfully Deleted Product', response))
      )
      .catch(SequelizeEmptyResultError, () => res.status(404).send())
      .catch(err => {
        logger.error(err)
        Sentry.captureException(err)
        res.status(500).send()
      })
  }
}

const searchRes = (datas, total, offset, limit, sortBy) => ({
  message: total > 0 ? `Found ${total} result(s)` : 'No results found',
  total: total,
  offset: offset,
  limit: limit,
  results: _.orderBy(datas, [sortBy.option], [sortBy.direction])
})

const invalidInputRes = (code, err) => ({
  status: 400,
  code: code,
  message: 'Invalid Input(s)',
  errors: err
})

const simpleRes = (message, data) => ({
  message: message,
  data: data
})
