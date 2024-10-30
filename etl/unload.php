<?php

require_once 'config.php';


header('Content-Type: application/json');

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 1000000; // Standardmäßig die letzten 10 Datensätze, falls kein Limit angegeben ist

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Bereite die Abfrage vor, um die gewünschten Felder aus deiner Datenstruktur abzurufen
    $stmt = $pdo->prepare("SELECT datum_tag, wochentag, data_right, data_left, summe FROM Initiative_Vailanstrasse ORDER BY datum_tag DESC LIMIT :limit");
    
    // Binde das 'limit' Parameter korrekt
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    // Führe die Abfrage aus und hole die Ergebnisse ab
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Gib die Ergebnisse als JSON aus
    echo json_encode($results);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>