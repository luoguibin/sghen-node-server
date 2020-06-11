
// 添加method字段
const methodSql = 'ALTER TABLE `dynamic_api2` ADD `method` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `content`'
// 给method赋值
const methodUpdateSql = 'UPDATE `dynamic_api2` SET method=`GET`'

// 添加params字段
const paramsSql = 'ALTER TABLE `dynamic_api2` ADD `params` JSON NOT NULL AFTER `content`;'
// 给method赋值
const paramsUpdateSql = 'UPDATE `dynamic_api2` SET params=`{}`'
