-- MySQL dump 10.13  Distrib 8.4.9, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: ticketing2026
-- ------------------------------------------------------
-- Server version	8.4.10

/*!50503 SET NAMES utf8mb4 */;

--
-- Dumping data for table `Pais`
--

INSERT INTO `Pais` VALUES
	('ARG','Argentina'),
	('BRA','Brasil'),
	('ENG','Inglaterra'),
	('ESP','España'),
	('FRA','Francia'),
	('GER','Alemania'),
	('MEX','México'),
	('URU','Uruguay'),
	('USA','Estados Unidos');

--
-- Dumping data for table `TipoDocumento`
--
INSERT INTO `TipoDocumento` VALUES
	(1, 'Cédula de Identidad'),
	(2, 'Pasaporte'),
	(3, 'DNI'),
	(4, 'Cédula de Extranjería'),
	(5, 'Tarjeta de Identidad');

--
-- Dumping data for table `Direccion`
--

INSERT INTO `Direccion` VALUES (1,'URU','18 de Julio','Montevideo','11000');

--
-- Dumping data for table `Documento`
--

INSERT INTO `Documento` VALUES
	(1,'12345678','ARG'),
	(3,'11223344','ESP'),
	(3,'55667788','MEX'),
	(1,'87654321','URU'),
	(1,'12345678','URU');

--
-- Dumping data for table `Equipo`
--

INSERT INTO `Equipo` VALUES
	('Argentina','ARG'),
	('Brasil','BRA'),
	('Inglaterra','ENG'),
	('España','ESP'),
	('Francia','FRA'),
	('Alemania','GER'),
	('México','MEX'),
	('Uruguay','URU');

--
-- Dumping data for table `Estadio`
--

INSERT INTO `Estadio` VALUES
	('Estadio Akron','MEX'),
	('Estadio Azteca','MEX'),
	('Estadio BBVA','MEX'),
	('SoFi Stadium','USA');

--
-- Dumping data for table `Sector`
--

INSERT INTO `Sector` VALUES
	(1,'Estadio Azteca','A',8000),
	(2,'Estadio Azteca','B',12000),
	(3,'Estadio Azteca','C',16000),
	(4,'Estadio Azteca','D',16000),
	(5,'Estadio BBVA','A',6000),
	(6,'Estadio BBVA','B',8000),
	(7,'SoFi Stadium','A',10000),
	(8,'SoFi Stadium','E',15000),
	(9,'SoFi Stadium','F',20000),
	(10,'Estadio Akron','B',10000),
	(11,'Estadio Akron','C',15000),
	(12,'Estadio Akron','G',17000);

--
-- Dumping data for table `Evento`
--

INSERT INTO `Evento` VALUES
	(1,'2026-07-12 19:00:00','Ciudad de México','Estadio Azteca','Argentina','Brasil','ARG','BRA'),
	(2,'2026-07-08 16:30:00','Monterrey','Estadio BBVA','Uruguay','Francia','URU','FRA'),
	(3,'2026-07-15 21:00:00','Los Angeles','SoFi Stadium','España','Alemania','ESP','GER'),
	(4,'2026-07-10 20:45:00','Guadalajara','Estadio Akron','México','Inglaterra','MEX','ENG');

--
-- Dumping data for table `EventoHabilitaSector`
--

INSERT INTO `EventoHabilitaSector` (`id_evento`, `id_sector`, `nombre_estadio`, `precio`) VALUES
	(1,1,'Estadio Azteca',150.00),
	(1,2,'Estadio Azteca',120.00),
	(1,3,'Estadio Azteca',80.00),
	(1,4,'Estadio Azteca',60.00),
	(2,5,'Estadio BBVA',100.00),
	(2,6,'Estadio BBVA',70.00),
	(3,7,'SoFi Stadium',200.00),
	(3,8,'SoFi Stadium',150.00),
	(3,9,'SoFi Stadium',90.00),
	(4,10,'Estadio Akron',110.00),
	(4,11,'Estadio Akron',75.00),
	(4,12,'Estadio Akron',55.00);

--
-- Dumping data for table `Usuario`
--

INSERT INTO `Usuario` VALUES
	('test@example.com','Usuario Test','b460b1982188f11d175f60ed670027e1afdd16558919fe47023ecd38329e0b7f',1,'12345678','URU',1,'URU'), -- Contra hola123
	('test1@example.com','Usuario Test 1','b460b1982188f11d175f60ed670027e1afdd16558919fe47023ecd38329e0b7f',1,'87654321','URU',1,'URU'); -- Contra hola123

--
-- Dumping data for table `UsuarioGeneral`
--

INSERT INTO `UsuarioGeneral` VALUES
	('test@example.com','VERIFICADO','2026-06-26 07:58:22'),
	('test1@example.com','VERIFICADO','2026-06-26 07:58:22');
