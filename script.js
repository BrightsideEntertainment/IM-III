let originalData = [];
let chartInstance;

// Daten abrufen
async function fetchData() {
    const url = 'https://etl.mmp.li/Initiative_Vailanstrasse/etl/unload.php';  // API URL

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        originalData = await response.json();

        // Initiales Rendern des Diagramms mit den letzten 7 Tagen
        renderChartForDays(originalData);

    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error.message);
    }
}

// Daten nach Tag gruppieren und summieren
function groupDataByDate(data) {
    const groupedData = {};
    
    data.forEach(entry => {
        const date = entry.datum_tag;  // Verwendet das vollständige Datum als Schlüssel
        if (!groupedData[date]) {
            groupedData[date] = 0;
        }
        groupedData[date] += entry.summe;  // Summiert die Personenanzahl für jeden Tag
    });

    return groupedData;
}

// Diagramm für die letzten 7 Tage rendern
function renderChartForDays(data) {
    // Gruppiere die Daten nach Datum und summiere sie
    const groupedData = groupDataByDate(data);

    // Sortiere die Daten nach Datum und nimm die letzten 7 Tage
    const sortedDates = Object.keys(groupedData).sort().slice(-7);
    const sortedSums = sortedDates.map(date => groupedData[date]);

    // Datumswerte ohne Jahr formatieren und Summen extrahieren
    const labels = sortedDates.map(date => new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }));

    // Diagramm rendern
    renderChart(labels, sortedSums, 'Summe der Personen (links und rechts) in den letzten 7 Tagen');
}

// Diagramm für die letzten 5 Monate rendern
function renderChartForMonths(data) {
    // Daten auf Monate zusammenfassen
    const monthData = {};

    data.forEach(entry => {
        const month = new Date(entry.datum_tag).toLocaleString('de-DE', { month: 'long' });
        if (!monthData[month]) {
            monthData[month] = 0;
        }
        monthData[month] += entry.summe;
    });

    // Nur die letzten 5 Monate auswählen und chronologisch sortieren
    const months = Object.keys(monthData).slice(-5).reverse();
    const sums = months.map(month => monthData[month]);

    // Diagramm rendern
    renderChart(months, sums, 'Summe der Personen (links und rechts) in den letzten 5 Monaten');
}

// Generische Funktion zum Rendern des Diagramms
function renderChart(labels, data, chartLabel) {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Überprüfen, ob bereits ein Diagramm existiert, und zerstören
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: chartLabel,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Funktion zum Wechseln zwischen Tages- und Monatsansicht
function changeView() {
    const filterValue = document.getElementById('view-filter').value;

    if (filterValue === 'month') {
        renderChartForMonths(originalData); // Zeige Monatsansicht
    } else if (filterValue === 'day') {
        renderChartForDays(originalData); // Zeige die letzten 7 Tage
    }
}

// Abruf der Daten und Initialisierung des Diagramms
fetchData();
