
// 添加method字段
const methodSql = 'ALTER TABLE `dynamic_api2` ADD `method` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL AFTER `content`'
// 给method赋值
const methodUpdateSql = 'UPDATE `dynamic_api2` SET method=`GET`'
