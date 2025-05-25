-- MySQL dump 10.13  Distrib 8.0.36, for Win64
--
-- Host: localhost    Database: teamsync
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `progetto`
--

DROP TABLE IF EXISTS `progetto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progetto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `creato_da` int(11) NOT NULL,
  `data_creazione` datetime DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `scadenza` datetime DEFAULT NULL,
  `stato` enum('attivo','completato') NOT NULL DEFAULT 'attivo',
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `progetto_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progetto`
--

LOCK TABLES `progetto` WRITE;
/*!40000 ALTER TABLE `progetto` DISABLE KEYS */;
INSERT INTO `progetto` VALUES (1,'App E-commerce Mobile','Sviluppo di un\'applicazione mobile per e-commerce con funzionalità avanzate',1,'2025-05-08 11:59:55',4,'2025-08-08 11:59:55','attivo'),(2,'Piattaforma CRM','Sistema di gestione delle relazioni con i clienti',2,'2025-05-08 11:59:55',2,'2025-09-08 11:59:55','completato'),(3,'Restyling Portale Aziendale','Rinnovamento completo del portale aziendale con nuovo design',1,'2025-05-08 11:59:55',6,'2025-07-08 11:59:55','attivo'),(4,'Sistema di Monitoraggio','Implementazione sistema di monitoraggio infrastruttura',3,'2025-05-08 11:59:55',3,'2025-06-08 11:59:55','completato'),(5,'Dashboard Analytics','Dashboard per la visualizzazione dei dati analytics',1,'2025-05-08 11:59:55',1,'2025-07-08 11:59:55','attivo'),(6,'API Gateway','Implementazione di un API Gateway per i servizi aziendali',2,'2025-05-08 11:59:55',2,'2025-08-08 11:59:55','completato'),(7,'App Gestione Magazzino','Applicazione mobile per la gestione del magazzino',1,'2025-05-08 11:59:55',4,'2025-09-08 11:59:55','attivo'),(8,'Testing Automatizzato','Implementazione suite di test automatizzati',3,'2025-05-08 11:59:55',5,'2025-07-08 11:59:55','completato'),(9,'Sistema di Autenticazione','Nuovo sistema di autenticazione e autorizzazione',2,'2025-05-08 11:59:55',2,'2025-08-08 11:59:55','attivo'),(10,'Design System','Creazione di un design system unificato',1,'2025-05-08 11:59:55',6,'2025-10-08 11:59:55','completato');
/*!40000 ALTER TABLE `progetto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_json`
--

DROP TABLE IF EXISTS `task_json`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_json` (
  `id` varchar(255) NOT NULL,
  `projectId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `titolo` varchar(255) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `peso` int(11) NOT NULL,
  `priorita` enum('bassa','media','alta') NOT NULL DEFAULT 'media',
  `scadenza` datetime DEFAULT NULL,
  `colore` varchar(255) DEFAULT NULL,
  `status` enum('da_fare','in_corso','in_revisione','completati') NOT NULL DEFAULT 'da_fare',
  `createdAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `projectId` (`projectId`),
  KEY `userId` (`userId`),
  CONSTRAINT `task_json_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `progetto` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `task_json_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `utente` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_json`
--

LOCK TABLES `task_json` WRITE;
/*!40000 ALTER TABLE `task_json` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_json` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES (1,'Team Sviluppo Frontend','Team dedicato allo sviluppo frontend e UI/UX','2025-05-08 11:59:55','2025-05-08 11:59:55'),(2,'Team Backend','Team dedicato allo sviluppo backend e database','2025-05-08 11:59:55','2025-05-08 11:59:55'),(3,'Team DevOps','Team dedicato all\'infrastruttura e deployment','2025-05-08 11:59:55','2025-05-08 11:59:55'),(4,'Team Mobile','Team dedicato allo sviluppo mobile','2025-05-08 11:59:55','2025-05-08 11:59:55'),(5,'Team QA','Team dedicato al quality assurance e testing','2025-05-08 11:59:55','2025-05-08 11:59:55'),(6,'Team Design','Team dedicato al design e alla user experience','2025-05-08 11:59:55','2025-05-08 11:59:55');
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_utente`
--

DROP TABLE IF EXISTS `team_utente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_utente` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `TeamId` int(11) NOT NULL,
  `UtenteId` int(11) NOT NULL,
  PRIMARY KEY (`TeamId`,`UtenteId`),
  KEY `UtenteId` (`UtenteId`),
  CONSTRAINT `team_utente_ibfk_1` FOREIGN KEY (`TeamId`) REFERENCES `team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `team_utente_ibfk_2` FOREIGN KEY (`UtenteId`) REFERENCES `utente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_utente`
--

LOCK TABLES `team_utente` WRITE;
/*!40000 ALTER TABLE `team_utente` DISABLE KEYS */;
INSERT INTO `team_utente` VALUES ('2025-05-08 11:59:55','2025-05-08 11:59:55',1,1),('2025-05-08 11:59:55','2025-05-08 11:59:55',1,2),('2025-05-08 11:59:55','2025-05-08 11:59:55',1,4),('2025-05-08 11:59:55','2025-05-08 11:59:55',1,5),('2025-05-08 11:59:55','2025-05-08 11:59:55',2,1),('2025-05-08 11:59:55','2025-05-08 11:59:55',2,3),('2025-05-08 11:59:55','2025-05-08 11:59:55',2,5),('2025-05-08 11:59:55','2025-05-08 11:59:55',3,1),('2025-05-08 11:59:55','2025-05-08 11:59:55',3,2),('2025-05-08 11:59:55','2025-05-08 11:59:55',3,6),('2025-05-08 11:59:55','2025-05-08 11:59:55',3,7),('2025-05-08 11:59:55','2025-05-08 11:59:55',4,1),('2025-05-08 11:59:55','2025-05-08 11:59:55',4,7),('2025-05-08 11:59:55','2025-05-08 11:59:55',5,1),('2025-05-08 11:59:55','2025-05-08 11:59:55',5,2),('2025-05-08 11:59:55','2025-05-08 11:59:55',5,6),('2025-05-08 11:59:55','2025-05-08 11:59:55',5,8),('2025-05-08 11:59:55','2025-05-08 11:59:55',6,1),('2025-05-08 11:59:55','2025-05-08 11:59:55',6,4),('2025-05-08 11:59:55','2025-05-08 11:59:55',6,8);
/*!40000 ALTER TABLE `team_utente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utente`
--

DROP TABLE IF EXISTS `utente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` char(64) NOT NULL,
  `ruolo` enum('admin','user') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utente`
--

LOCK TABLES `utente` WRITE;
/*!40000 ALTER TABLE `utente` DISABLE KEYS */;
INSERT INTO `utente` VALUES (1,'Admin','System','admin@mail.com','$2b$10$Sya2QdPK9f5rgmqt3C3NROmP2XS59VI4gf4d57lr2cQC6KZL1HtCC','admin'),(2,'Eros','Marucchi','eros.marucchi@samtrevano.ch','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user'),(3,'Mario','Rossi','mario.rossi@example.com','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user'),(4,'Enea','Corti','enea.corti@samtrevano.ch','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user'),(5,'Jacopo','Faul','jacopo.faul@samtrevano.ch','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user'),(6,'Laura','Bianchi','laura.bianchi@example.com','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user'),(7,'Edoardo','Antonini','edoardo.antonini@samtrevano.ch','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user'),(8,'Alex','Volpe','alex.volpe@samtrevano.ch','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user'),(9,'Giuseppe','Verdi','giuseppe.verdi@example.com','$2b$10$Z7ArdphertAC6OxAdvDUheNZ80CzAodn/nFX3SICZc2LvJX8.eVf.','user');
/*!40000 ALTER TABLE `utente` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-08 16:11:19
