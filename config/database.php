<?php
/**
 * Madam 3 Kitchen - Database Connection (MariaDB / MySQL PDO)
 * Location: Asoro Bus Stop, Ekhuan Road, Benin City, Edo State, Nigeria
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        try {
            // Production MariaDB / MySQL Connection
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE utf8mb4_unicode_ci"
            ];

            self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            return self::$instance;

        } catch (PDOException $e) {
            error_log("MariaDB/MySQL Connection Notice: " . $e->getMessage());

            // Local sandbox fallback for dev environments
            try {
                $sqlitePath = ROOT_PATH . '/config/madam3_local.sqlite';
                $sqliteDsn = "sqlite:" . $sqlitePath;
                $sqliteOptions = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ];
                self::$instance = new PDO($sqliteDsn, null, null, $sqliteOptions);
                self::$instance->exec("PRAGMA foreign_keys = ON;");
                return self::$instance;
            } catch (Exception $ex) {
                error_log("Fatal Database Error: " . $ex->getMessage());
                die("A technical error occurred while connecting to the database. Please verify your MariaDB/MySQL credentials.");
            }
        }
    }
}
