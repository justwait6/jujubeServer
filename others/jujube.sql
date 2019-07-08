CREATE SCHEMA `jujube` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin ;
use `jujube`;

CREATE TABLE `user` (
  `uid` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uname` VARCHAR(20) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `email` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE INDEX `uid_UNIQUE` (`uid` ASC),
  UNIQUE INDEX `uname_UNIQUE` (`uname` ASC));

