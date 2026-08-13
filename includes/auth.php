<?php
/**
 * Madam 3 Kitchen - Authentication & Authorization Module
 */

require_once __DIR__ . '/../config/database.php';

function isLoggedIn(): bool {
    return !empty($_SESSION['user_id']);
}

function isAdmin(): bool {
    return !empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

function getCurrentUser(): ?array {
    if (!isLoggedIn()) return null;
    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT id, name, email, phone, whatsapp, address, landmark, role FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}

function requireAuth(): void {
    if (!isLoggedIn()) {
        $_SESSION['redirect_url'] = $_SERVER['REQUEST_URI'];
        header("Location: login.php");
        exit;
    }
}

function requireAdmin(): void {
    if (!isAdmin()) {
        $_SESSION['admin_redirect'] = $_SERVER['REQUEST_URI'];
        header("Location: login.php");
        exit;
    }
}

function hashPassword(string $password): string {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword(string $password, string $hash): bool {
    return password_verify($password, $hash);
}

function logoutUser(): void {
    unset($_SESSION['user_id'], $_SESSION['user_name'], $_SESSION['user_phone']);
    session_destroy();
}

function logoutAdmin(): void {
    unset($_SESSION['admin_logged_in'], $_SESSION['admin_id'], $_SESSION['admin_name']);
}
