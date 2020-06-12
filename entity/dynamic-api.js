const paramUtil = require('../utils/param')

module.exports = class {
  /*
    dynamic_api:
    id              bigint(20)
    name            varchar(200)
    comment         varchar(200)
    content         json
    params          json
    method          varchar(10)
    status          int(11)
    time_create     timestamp
    time_update     timestamp
    user_id         bigint(20)
    suffix_path     varchar(100)
    count           int(11)
  */

  constructor (id, name, content, suffixPath) {
    this.id = id || 0
    this.name = name || ''
    this.content = content || ''
    this.suffixPath = suffixPath || ''

    this.comment = ''
    this.method = ''
    this.params = ''
    this.status = 0
    this.userId = 0
    this.count = 0
    this.timeCreate = ''
    this.timeUpdate = ''

    // 非sql字段属性
    this.sqls = []
    this.sqlParams = {}
  }

  /**
   * @description 第一步：设置参数
   * @param {*} object 基础类型参数对象
   */
  setValues (object = {}) {
    for (const key in object) {
      if (this[key] !== undefined && (typeof this[key] === 'number' || typeof this[key] === 'string')) {
        this[key] = object[key]
      }
    }
  }

  /**
   * @description 第二步：校验本API对象的SQL字段参数
   */
  validateProperties () {
    const errors = []
    if (!paramUtil.STRING(this.name)) {
      errors.push({ key: 'name', value: '' })
    }
    if (!paramUtil.STRING(this.content)) {
      errors.push({ key: 'content', value: '' })
    }
    if (!paramUtil.STRING(this.method)) {
      errors.push({ key: 'method', value: '' })
    }
    if (!paramUtil.STRING(this.suffixPath)) {
      errors.push({ key: 'suffixPath', value: '' })
    }

    const contentJson = paramUtil.JSON(this.content)
    if (!contentJson) {
      errors.push({ key: 'content', value: '' })
    } if (!contentJson.length === 0) {
      errors.push({ key: 'content', value: '' })
    } else if (!contentJson[0].key || !contentJson[0].sql) {
      errors.push({ key: 'content', value: '' })
    }

    const paramsJson = paramUtil.JSON(this.params)
    if (!paramsJson) {
      errors.push({ key: 'params', value: '' })
    }

    return errors.length > 0 ? errors : null
  }

  /**
   * @description 第三布：构建非本对象中非SQL字段属性
   */
  build () {
    // 收集每条虚拟sql实体
    const reg = /\$\{[0-9a-zA-Z_]{1,}\}/g
    const sqls = JSON.parse(this.content.replace(/\n/g, ''))
    sqls.forEach(o => {
      // o.key o.sql
      o.execSql = o.sql.replace(reg, '?').trim()
      o.orderKeys = (o.sql.match(reg) || []).map(v => {
        return v.substring(2, v.length - 1)
      })
    })

    this.sqls = sqls
    this.sqlParams = paramUtil.JSON(this.params) || {}
  }

  /**
   * @description 满足三个步骤后，可以获取API的顺序参数列表
   */
  validateSqlEntities (query) {
    const errors = []
    const sqlParams = this.sqlParams
    this.sqls.forEach(o => {
      o.orderKeys.forEach(key => {
        const validator = paramUtil[sqlParams[key].type]
        // console.log(key, query[key], validator ? validator((query[key])) : '')
        if (!validator) {
          errors.push({ key, value: query[key], msg: '该字段未定义校验器' })
        } else if (validator(query[key]) === null) {
          errors.push({ key, value: query[key] })
        }
      })
    })

    if (errors.length > 0) {
      return { errors }
    }

    return { queryParams: this.getFormatQueryParams(query) }
  }

  getFormatQueryParams (query) {
    const sqlParams = this.sqlParams
    return this.sqls.map(o => {
      return o.orderKeys.map(key => {
        return paramUtil[sqlParams[key].type](query[key])
      })
    })
  }
}
