<?php
require_once 'config.php'; // Enthält deine Datenbank-Konfiguration

function fetchVadianstrasseData() {
    $url = "https://daten.stadt.sg.ch/api/explore/v2.1/catalog/datasets/fussganger-stgaller-innenstadt-vadianstrasse/records?order_by=datum_tag%20DESC&limit=20";

    // Initialisiert eine cURL-Sitzung
    $ch = curl_init($url);

    // Setzt Optionen
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Führt die cURL-Sitzung aus und erhält den Inhalt
    $response = curl_exec($ch);

    // Schließt die cURL-Sitzung
    curl_close($ch);

    // Dekodiert die JSON-Antwort und gibt die Daten zurück
    return json_decode($response, true);
}

// Daten aus der API abrufen
$data = fetchVadianstrasseData();

// Datenbankverbindung herstellen
try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// SQL-Anweisung vorbereiten, um die benötigten Daten einzufügen
$sql = "INSERT INTO Initiative_Vailanstrasse (datum_tag, wochentag, data_right, data_left, summe) 
        VALUES (:datum_tag, :wochentag, :data_right, :data_left, :summe)";
$stmt = $pdo->prepare($sql);

// Jede Fußgängerdatensatz in die Datenbank einfügen
foreach ($data['results'] as $record) {
    if (isset($record['datum_tag']) && isset($record['wochentag']) && isset($record['data_right']) && isset($record['data_left']) && isset($record['summe'])) {
        $stmt->execute([
            ':datum_tag' => $record['datum_tag'],
            ':wochentag' => $record['wochentag'],
            ':data_right' => $record['data_right'],
            ':data_left' => $record['data_left'],
            ':summe' => $record['summe']
        ]);
    } else {
        echo "Skipping record due to missing data.\n";
    }
}

echo "Data successfully inserted into the database.";

?>
