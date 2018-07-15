-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.1.10-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win32
-- HeidiSQL Version:             9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for smashtracker
DROP DATABASE IF EXISTS `smashtracker`;
CREATE DATABASE IF NOT EXISTS `smashtracker` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `smashtracker`;

-- Dumping structure for table smashtracker.character
DROP TABLE IF EXISTS `character`;
CREATE TABLE IF NOT EXISTS `character` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.character: ~58 rows (approximately)
DELETE FROM `character`;
/*!40000 ALTER TABLE `character` DISABLE KEYS */;
INSERT INTO `character` (`id`, `name`) VALUES
	(55, 'Bayonetta'),
	(4, 'Bowser'),
	(39, 'Bowser Jr.'),
	(26, 'Captain Falcon'),
	(24, 'Charizard'),
	(54, 'Cloud'),
	(43, 'Corrin'),
	(45, 'Dark Pit'),
	(8, 'Diddy Kong'),
	(7, 'Donkey Kong'),
	(5, 'Dr. Mario'),
	(50, 'Duck Hunt'),
	(20, 'Falco'),
	(19, 'Fox'),
	(12, 'Ganondorf'),
	(40, 'Greninja'),
	(31, 'Ike'),
	(22, 'Jigglypuff'),
	(18, 'King Dedede'),
	(16, 'Kirby'),
	(9, 'Link'),
	(47, 'Little Mac'),
	(25, 'Lucario'),
	(28, 'Lucas'),
	(42, 'Lucina'),
	(2, 'Luigi'),
	(1, 'Mario'),
	(29, 'Marth'),
	(51, 'Mega Man'),
	(17, 'Meta Knight'),
	(23, 'Mewtwo'),
	(56, 'Mii Brawler'),
	(58, 'Mii Gunner'),
	(57, 'Mii Swordfighter'),
	(32, 'Mr. Game & Watch'),
	(27, 'Ness'),
	(35, 'Olimar'),
	(52, 'Pac-Man'),
	(44, 'Palutena'),
	(3, 'Peach'),
	(21, 'Pikachu'),
	(33, 'Pit'),
	(36, 'R.O.B.'),
	(41, 'Robin'),
	(38, 'Rosalina & Luma'),
	(30, 'Roy'),
	(53, 'Ryu'),
	(14, 'Samus'),
	(11, 'Sheik'),
	(49, 'Shulk'),
	(37, 'Sonic'),
	(13, 'Toon Link'),
	(46, 'Villager'),
	(34, 'Wario'),
	(48, 'Wii Fit Trainer'),
	(6, 'Yoshi'),
	(10, 'Zelda'),
	(15, 'Zero Suit Samus');
/*!40000 ALTER TABLE `character` ENABLE KEYS */;

-- Dumping structure for table smashtracker.match
DROP TABLE IF EXISTS `match`;
CREATE TABLE IF NOT EXISTS `match` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `stocks` int(10) unsigned DEFAULT NULL,
  `stage_id` int(10) unsigned DEFAULT NULL,
  `match_time` time DEFAULT NULL,
  `match_time_remaining` time DEFAULT NULL,
  `is_team` smallint(1) unsigned DEFAULT '0',
  `author_user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `match_stage_id` (`stage_id`),
  KEY `match_author_user_id` (`author_user_id`),
  CONSTRAINT `match_author_user_id` FOREIGN KEY (`author_user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `match_stage_id` FOREIGN KEY (`stage_id`) REFERENCES `stage` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.match: ~4 rows (approximately)
DELETE FROM `match`;
/*!40000 ALTER TABLE `match` DISABLE KEYS */;
INSERT INTO `match` (`id`, `date`, `stocks`, `stage_id`, `match_time`, `match_time_remaining`, `is_team`, `author_user_id`) VALUES
	(2, '2018-07-14 12:21:50', 3, 1, '00:06:00', '00:02:14', 0, 1),
	(3, '2018-07-14 12:21:50', 3, 1, '00:06:00', '00:02:14', 0, 1),
	(4, '2018-07-14 12:21:50', 3, 1, '00:06:00', '00:02:14', 0, 1),
	(5, '2018-07-14 12:21:50', 3, 1, '00:06:00', '00:02:14', 0, 1);
/*!40000 ALTER TABLE `match` ENABLE KEYS */;

-- Dumping structure for table smashtracker.player
DROP TABLE IF EXISTS `player`;
CREATE TABLE IF NOT EXISTS `player` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `match_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `character_id` int(10) unsigned NOT NULL,
  `team_id` int(10) unsigned DEFAULT NULL,
  `is_winner` smallint(1) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `match_user_character_id` (`character_id`),
  KEY `match_user_match_id` (`match_id`),
  KEY `match_user_team_id` (`team_id`),
  KEY `match_user_user_id` (`user_id`),
  CONSTRAINT `match_user_character_id` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `match_user_match_id` FOREIGN KEY (`match_id`) REFERENCES `match` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `match_user_team_id` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `match_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.player: ~8 rows (approximately)
DELETE FROM `player`;
/*!40000 ALTER TABLE `player` DISABLE KEYS */;
INSERT INTO `player` (`id`, `match_id`, `user_id`, `character_id`, `team_id`, `is_winner`) VALUES
	(1, 2, 1, 1, NULL, 0),
	(2, 2, 2, 2, NULL, 1),
	(3, 3, 1, 1, NULL, 0),
	(4, 3, 2, 2, NULL, 1),
	(5, 4, 1, 1, NULL, 1),
	(6, 4, 2, 2, NULL, 0),
	(7, 5, 1, 1, NULL, 1),
	(8, 5, 2, 2, NULL, 0);
/*!40000 ALTER TABLE `player` ENABLE KEYS */;

-- Dumping structure for table smashtracker.player_data
DROP TABLE IF EXISTS `player_data`;
CREATE TABLE IF NOT EXISTS `player_data` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `player_id` int(10) unsigned NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `match_user_data_match_user_id` (`player_id`),
  CONSTRAINT `match_user_data_match_user_id` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.player_data: ~8 rows (approximately)
DELETE FROM `player_data`;
/*!40000 ALTER TABLE `player_data` DISABLE KEYS */;
INSERT INTO `player_data` (`id`, `player_id`, `key`, `value`) VALUES
	(1, 1, 'stocks', '0'),
	(2, 2, 'stocks', '2'),
	(3, 4, 'stocks', '2'),
	(4, 3, 'stocks', '0'),
	(5, 5, 'stocks', '2'),
	(6, 6, 'stocks', '1'),
	(7, 8, 'stocks', '1'),
	(8, 7, 'stocks', '2'),
	(9, 1, 'hype', '9001');
/*!40000 ALTER TABLE `player_data` ENABLE KEYS */;

-- Dumping structure for table smashtracker.stage
DROP TABLE IF EXISTS `stage`;
CREATE TABLE IF NOT EXISTS `stage` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_omega` tinyint(1) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name_omega` (`name`,`is_omega`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.stage: ~13 rows (approximately)
DELETE FROM `stage`;
/*!40000 ALTER TABLE `stage` DISABLE KEYS */;
INSERT INTO `stage` (`id`, `name`, `is_omega`) VALUES
	(1, 'Battlefield', 0),
	(9, 'Castle Siege', 0),
	(10, 'Delfino Plaza', 0),
	(8, 'Dreamland 64', 0),
	(4, 'Duck Hunt', 0),
	(2, 'Final Destination', 0),
	(11, 'Halberd', 0),
	(6, 'Lylat Cruise', 0),
	(5, 'Miiverse', 0),
	(12, 'Skyloft', 0),
	(7, 'Smashville', 0),
	(3, 'Town and City', 0),
	(13, 'Wuhu Island', 0);
/*!40000 ALTER TABLE `stage` ENABLE KEYS */;

-- Dumping structure for table smashtracker.team
DROP TABLE IF EXISTS `team`;
CREATE TABLE IF NOT EXISTS `team` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.team: ~4 rows (approximately)
DELETE FROM `team`;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` (`id`, `name`) VALUES
	(1, 'red'),
	(2, 'blue'),
	(3, 'green'),
	(4, 'yellow');
/*!40000 ALTER TABLE `team` ENABLE KEYS */;

-- Dumping structure for table smashtracker.user
DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tag` varchar(255) NOT NULL,
  `password` mediumtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tag_UNIQUE` (`tag`)
) ENGINE=InnoDB AUTO_INCREMENT=51627 DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.user: ~4 rows (approximately)
DELETE FROM `user`;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`id`, `tag`, `password`) VALUES
	(1, 'BENNO', '$2b$12$v9RzgZYJS75GGwHnhNdvr.mYL22r.k9eN9VW3PDGlPks9YX.5i2bu'),
	(2, 'WPIT', '$2b$12$iUn5VR3jNtZc.B42KxqEtuU6Cg5/uFoJUc4yjJuylSmEMmFD8Mkkm'),
	(3, 'SILVER', '$2b$12$dRQwn.mbZ/JKKiZ/.nALi.yLEBusVaonreW0PBFynh6b2w3eiouLu'),
	(4, 'Ewoud', '$2b$12$a0JuyruDLnNFahXoTFd3Q.Y.8TrVtLztB9vcGMKybdYa0NthKu0zG');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

-- Dumping structure for table smashtracker.user_character
DROP TABLE IF EXISTS `user_character`;
CREATE TABLE IF NOT EXISTS `user_character` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `character_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `character_id_idx` (`character_id`),
  KEY `user_character_user_id` (`user_id`),
  CONSTRAINT `user_character_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table smashtracker.user_character: ~0 rows (approximately)
DELETE FROM `user_character`;
/*!40000 ALTER TABLE `user_character` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_character` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
