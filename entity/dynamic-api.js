module.exports = class {
  /*
    dynamic_api:
    1     id              bigint(20)
    2     name            varchar(200)
    3     comment         varchar(200)
    4     content         mediumtext
    5     status          int(11)
    6     time_create     timestamp
    7     time_update     timestamp
    8     user_id         bigint(20)
    9     suffix_path     varchar(100)
    10    count           int(11)
  */

  constructor (id, name, content, suffixPath) {
    this.id = id || 0
    this.name = name || ''
    this.content = content || ''
    this.suffixPath = suffixPath || ''

    this.comment = ''
    this.status = 0
    this.userId = 0
    this.count = 0
    this.timeCreate = ''
    this.timeUpdate = ''
  }

  setValues (object = {}) {
    for (const key in object) {
      if (this[key] !== undefined && (typeof this[key] === 'number' || typeof this[key] === 'string')) {
        this[key] = object[key]
      }
    }
  }

  validate () {
    if (!this.name) {
      return false
    }
    if (!this.content) {
      return false
    }
    if (!this.suffixPath) {
      return false
    }
    return true
  }

  build () {
    // 收集每条虚拟sql实体
    const sqlEntities = []
    const reg = /\$\{[0-9a-zA-Z_]{1,}\}/g
    const sqls = this.content.split('$$$').replace(/\n/g, '')
    sqls.forEach(v => {
      sqlEntities.push({
        originSql: v.replace(reg, '?').trim(),
        orderKeys: (v.match(reg) || []).map(v => {
          return v.substring(2, v.length - 1)
        })
      })
    })

    this.sqlEntities = sqlEntities
  }
}
