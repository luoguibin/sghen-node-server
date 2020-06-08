const content = 'SELECT * FROM user LIMIT ${limit} OFFSET ${offset}'

const VirtualKeys = content.match(/\$\{[0-9a-zA-Z_]{1,}\}/g)
console.log(VirtualKeys)

const keys = VirtualKeys.map(v => {
  return v.substring(2, v.length - 1)
})
console.log(keys)
