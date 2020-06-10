const validatorMap = {
  id: function (v) {
    if (!v) {
      return false
    }
    return /^[0-9A-Za-z]+$/.test(v)
  },
  offset: function (v) {
    if (!v) {
      return false
    }
    return /^[0-9]+$/.test(v)
  },
  limit: function (v) {
    if (!v) {
      return false
    }
    return /^[0-9]+$/.test(v)
  }

  // name: function (v) {
  //   return true
  // },
  // comment: function (v) {
  //   return true
  // },
  // content: function (v) {
  //   return true
  // },
  // method: function (v) {
  //   return true
  // },
  // status: function (v) {
  //   return true
  // },
  // userId: function (v) {
  //   return true
  // },
  // suffixPath: function (v) {
  //   return true
  // }
}

const formatQuery = function (query) {
  if (!query) {
    return
  }
  if (query.offset) {
    query.offset = parseInt(query.offset)
  }
  if (query.limit) {
    query.limit = parseInt(query.limit)
  }
}

module.exports = class {
  /*
    dynamic_api:
    id              bigint(20)
    name            varchar(200)
    comment         varchar(200)
    content         mediumtext
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
    this.status = 0
    this.userId = 0
    this.count = 0
    this.timeCreate = ''
    this.timeUpdate = ''

    this.sqlEntities = []
  }

  setValues (object = {}) {
    for (const key in object) {
      if (this[key] !== undefined && (typeof this[key] === 'number' || typeof this[key] === 'string')) {
        this[key] = object[key]
      }
    }
  }

  validateProperties () {
    const errors = []
    if (!this.name) {
      errors.push({ key: 'name', value: '' })
    }
    if (!this.content) {
      errors.push({ key: 'content', value: '' })
    }
    if (!this.method) {
      errors.push({ key: 'method', value: '' })
    }
    try {
      const arr = JSON.parse(this.content)
      if (!arr.length) {
        errors.push({ key: 'content', value: '' })
      } else {
        if (!arr[0].key || !arr[0].sql) {
          errors.push({ key: 'content', value: '' })
        }
      }
    } catch (err) {
      errors.push({ key: 'content', value: '' })
    }
    if (!this.suffixPath) {
      errors.push({ key: 'suffixPath', value: '' })
    }

    return errors.length > 0 ? errors : null
  }

  getFormatQueryParams (query) {
    formatQuery(query)
    return this.sqlEntities.map(o => {
      return o.orderKeys.map(key => {
        return query[key]
      })
    })
  }

  validateSqlEntities (query) {
    const errors = []
    this.sqlEntities.forEach(o => {
      o.orderKeys.forEach(key => {
        if (!validatorMap[key]) {
          errors.push({ key, value: query[key], msg: '该字段未定义校验器' })
        } else if (!validatorMap[key](query[key])) {
          errors.push({ key, value: query[key] })
        }
      })
    })

    if (errors.length > 0) {
      return { errors }
    }

    return { queryParams: this.getFormatQueryParams(query) }
  }

  build () {
    // 收集每条虚拟sql实体
    const sqlEntities = JSON.parse(this.content.replace(/\n/g, '')) || []
    const reg = /\$\{[0-9a-zA-Z_]{1,}\}/g

    sqlEntities.forEach(o => {
      // o.key o.sql
      o.originSql = o.sql.replace(reg, '?').trim()
      o.orderKeys = (o.sql.match(reg) || []).map(v => {
        return v.substring(2, v.length - 1)
      })
    })

    this.sqlEntities = sqlEntities
  }
}
