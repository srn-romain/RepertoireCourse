// ====================================================================
// GÉNÉRATION DE PDF POUR LES COURSES
// ====================================================================

/**
 * Fonction pour générer un PDF de la course
 * @param {string} raceId - L'ID de la course
 */
async function generateRacePdf(raceId) {
    // Utiliser window.races pour accéder à la variable globale
    const races = window.races;
    if (!races || races.length === 0) {
        console.error('Aucune course disponible');
        return;
    }

    const race = races.find(r => r.id === raceId);
    if (!race) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Couleurs
    const primaryColor = [34, 139, 34]; // Vert
    const textColor = [55, 65, 81]; // Gris foncé

    // Titre
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text(race.name, margin, yPos);
    yPos += 10;

    // Date
    const raceDate = new Date(race.date);
    const formattedDate = raceDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).replace(/^[a-z]/, c => c.toUpperCase());

    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.setFont(undefined, 'normal');
    doc.text(formattedDate, margin, yPos);
    yPos += 8;

    // Heure si présente
    if (race.hour) {
        doc.text(`Heure : ${race.hour}`, margin, yPos);
        yPos += 8;
    }

    // Email du propriétaire du compte
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.email) {
        doc.setFont(undefined, 'bold');
        doc.text('Par : ', margin, yPos);
        const labelWidth = doc.getTextWidth('Par : ');
        doc.setFont(undefined, 'normal');
        doc.setTextColor(37, 99, 235); // Bleu pour l'email
        doc.text(firebase.auth().currentUser.email, margin + labelWidth, yPos);
        doc.setTextColor(...textColor); // Remettre la couleur normale
        yPos += 8;
    }

    // Statut de la course (passée / à venir) — sans tag visible dans le PDF
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isUpcoming = raceDate >= today;

    yPos += 5;

    // Informations principales
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('Informations de la course', margin, yPos);
    yPos += 8;

    const tableData = [];
    if (race.terrain === 'triathlon' && race.raceFormat === 'team') {
        const relaySport = race.raceRelaySport || 'run';
        let userDistStr = `${race.distance} km`;
        let userElevPlus = (race.elevation !== undefined && race.elevation !== null && race.elevation !== '') ? `${race.elevation} m D+` : null;
        let userElevNeg = (race.elevationNeg !== undefined && race.elevationNeg !== null && race.elevationNeg !== '') ? `${race.elevationNeg} m D-` : null;

        if (relaySport === 'swim') {
            const sM = parseFloat(race.swimDistance);
            userDistStr = !isNaN(sM) && sM > 0 ? (sM > 999 ? `${(sM / 1000).toFixed(2)} km` : `${sM} m`) : `${race.distance} km`;
            userElevPlus = null;
            userElevNeg = null;
        } else if (relaySport === 'bike') {
            const bKm = parseFloat(race.bikeDistance);
            userDistStr = !isNaN(bKm) && bKm > 0 ? `${bKm} km` : `${race.distance} km`;
            userElevPlus = (race.bikeElevation !== undefined && race.bikeElevation !== null && race.bikeElevation !== '') ? `${race.bikeElevation} m D+` : null;
            userElevNeg = (race.bikeElevationNeg !== undefined && race.bikeElevationNeg !== null && race.bikeElevationNeg !== '') ? `${race.bikeElevationNeg} m D-` : null;
        } else if (relaySport === 'run') {
            userElevPlus = (race.runElevation !== undefined && race.runElevation !== null && race.runElevation !== '')
                ? `${race.runElevation} m D+`
                : ((race.elevation !== undefined && race.elevation !== null && race.elevation !== '') ? `${race.elevation} m D+` : null);
            userElevNeg = (race.runElevationNeg !== undefined && race.runElevationNeg !== null && race.runElevationNeg !== '')
                ? `${race.runElevationNeg} m D-`
                : ((race.elevationNeg !== undefined && race.elevationNeg !== null && race.elevationNeg !== '') ? `${race.elevationNeg} m D-` : null);
        }

        tableData.push(['Distance (Moi)', userDistStr]);
        if (userElevPlus) tableData.push(['Dénivelé + (Moi)', userElevPlus]);
        if (userElevNeg) tableData.push(['Dénivelé - (Moi)', userElevNeg]);

        const sKm = (parseFloat(race.swimDistance) || 0) / 1000;
        const bKm = parseFloat(race.bikeDistance) || 0;
        const rKm = parseFloat(race.distance) || 0;
        const totalTeamKm = sKm + bKm + rKm;
        if (totalTeamKm > 0) {
            tableData.push(['Distance (Équipe)', `${totalTeamKm.toFixed(2)} km`]);
        }
        const bDPlus = parseInt(race.bikeElevation) || 0;
        const rDPlus = parseInt(race.runElevation) || (relaySport === 'run' ? (parseInt(race.elevation) || 0) : 0);
        const totalDPlus = bDPlus + rDPlus;
        if (totalDPlus > 0) {
            tableData.push(['Dénivelé + (Équipe)', `${totalDPlus} m D+`]);
        }
        const bDNeg = parseInt(race.bikeElevationNeg) || 0;
        const rDNeg = parseInt(race.runElevationNeg) || (relaySport === 'run' ? (parseInt(race.elevationNeg) || 0) : 0);
        const totalDNeg = bDNeg + rDNeg;
        if (totalDNeg > 0) {
            tableData.push(['Dénivelé - (Équipe)', `${totalDNeg} m D-`]);
        }

        const userTime = relaySport === 'swim' ? race.swimTime : (relaySport === 'bike' ? race.bikeTime : (race.runTime || race.time));
        if (userTime && userTime !== '00:00:00') {
            tableData.push(['Temps (Moi)', userTime]);
            if (race.time && race.time !== '00:00:00' && race.time !== userTime) {
                tableData.push(['Temps (Équipe)', race.time]);
            }
        } else {
            tableData.push(['Temps', race.time || 'Non renseigné']);
        }
    } else {
        tableData.push(['Distance', `${race.distance} km`]);

        if (race.elevation !== undefined && race.elevation !== null && race.elevation !== '') {
            tableData.push(['Dénivelé +', `${race.elevation} m D+`]);
        }

        if (race.elevationNeg !== undefined && race.elevationNeg !== null && race.elevationNeg !== '') {
            tableData.push(['Dénivelé -', `${race.elevationNeg} m D-`]);
        }

        tableData.push(['Temps', race.time || 'Non renseigné']);
    }

    if (race.terrain) {
        const terrainFormatted = race.terrain.charAt(0).toUpperCase() + race.terrain.slice(1);
        tableData.push(['Terrain', terrainFormatted]);
    }

    if (race.price !== undefined && race.price !== null && race.price !== '') {
        tableData.push(['Prix', `${parseFloat(race.price).toFixed(2)} €`]);
    }

    // Prix de l'achat photo (juste en dessous de la ligne prix course)
    const hasPhotoPurchasePrice = race.photoPurchasePrice !== undefined && race.photoPurchasePrice !== null && race.photoPurchasePrice !== '' && !isNaN(parseFloat(race.photoPurchasePrice));
    if (race.photoPurchase === true || hasPhotoPurchasePrice) {
        if (hasPhotoPurchasePrice) {
            tableData.push(['Achat photo', `${parseFloat(race.photoPurchasePrice).toFixed(2)} €`]);
        } else if (race.photoPurchase === true) {
            tableData.push(['Achat photo', 'Oui']);
        }
    }

    if (race.bibNumber) {
        tableData.push(['N° Dossard', String(race.bibNumber)]);
    }

    if (isUpcoming) {
        tableData.push(['Statut', 'Course à venir']);
    }

    if (race.location) {
        tableData.push(['Lieu', race.location]);
    } else {
        tableData.push(['Lieu', 'Non renseigné']);
    }

    const col1Width = 70;
    const col2Width = 100;
    const h1 = 'Information';
    const h2 = 'Détail';

    function drawInfoTableHeader() {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setDrawColor(75, 85, 99);
        doc.setLineWidth(0.4);

        // Col 1
        doc.setFillColor(...primaryColor);
        doc.rect(margin, yPos, col1Width, 9, 'FD');
        doc.setTextColor(255, 255, 255);
        const h1Width = doc.getTextWidth(h1);
        doc.text(h1, margin + (col1Width - h1Width) / 2, yPos + 6);

        // Col 2
        doc.setFillColor(...primaryColor);
        doc.rect(margin + col1Width, yPos, col2Width, 9, 'FD');
        doc.setTextColor(255, 255, 255);
        const h2Width = doc.getTextWidth(h2);
        doc.text(h2, margin + col1Width + (col2Width - h2Width) / 2, yPos + 6);

        yPos += 9;
    }

    drawInfoTableHeader();

    tableData.forEach(([label, value], i) => {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);

        const lines1 = doc.splitTextToSize(label, col1Width - 4);
        const lines2 = doc.splitTextToSize(value, col2Width - 4);

        const maxLines = Math.max(lines1.length, lines2.length);
        const rowHeight = Math.max(8, maxLines * 4.5 + 4);

        // Page break check
        if (yPos + rowHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
            drawInfoTableHeader();
        }

        const bg = i % 2 === 0 ? [240, 253, 244] : [255, 255, 255];

        // Draw cells background and border
        doc.setFillColor(...bg);
        doc.setDrawColor(75, 85, 99);
        doc.setLineWidth(0.4);
        doc.rect(margin, yPos, col1Width, rowHeight, 'FD');

        doc.setFillColor(...bg);
        doc.rect(margin + col1Width, yPos, col2Width, rowHeight, 'FD');

        // Draw Col 1 text (centered)
        doc.setTextColor(...textColor);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        let textY1 = yPos + (rowHeight - (lines1.length - 1) * 4.5) / 2 + 1.0;
        lines1.forEach(line => {
            const lineWidth = doc.getTextWidth(line);
            doc.text(line, margin + (col1Width - lineWidth) / 2, textY1);
            textY1 += 4.5;
        });

        // Draw Col 2 text (centered)
        doc.setFont(undefined, 'normal');
        let textY2 = yPos + (rowHeight - (lines2.length - 1) * 4.5) / 2 + 1.0;
        const isLieu = label === 'Lieu' && value !== 'Non renseigné';

        lines2.forEach(line => {
            const lineWidth = doc.getTextWidth(line);
            const textX = margin + col1Width + (col2Width - lineWidth) / 2;
            if (isLieu) {
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
                doc.setTextColor(37, 99, 235); // Blue link
                doc.textWithLink(line, textX, textY2, { url: googleMapsUrl });
            } else {
                doc.setTextColor(...textColor);
                doc.text(line, textX, textY2);
            }
            textY2 += 4.5;
        });

        yPos += rowHeight;
    });

    yPos += 10;

    // Section Statistiques
    const statsData = [];

    // 1. Déterminer la distance et l'élévation pour les statistiques
    let statsDistance = parseFloat(race.distance);
    let statsElevation = parseFloat(race.elevation);

    if (race.terrain === 'triathlon') {
        if (race.raceFormat === 'team') {
            if (race.raceRelaySport === 'swim') {
                statsDistance = (parseFloat(race.swimDistance) || 0) / 1000;
                statsElevation = 0;
            } else if (race.raceRelaySport === 'bike') {
                statsDistance = parseFloat(race.bikeDistance) || 0;
                statsElevation = parseFloat(race.bikeElevation) || 0;
            } else if (race.raceRelaySport === 'run') {
                statsDistance = parseFloat(race.distance) || 0;
                statsElevation = parseFloat(race.runElevation || race.elevation) || 0;
            }
        } else {
            const swimKm = (parseFloat(race.swimDistance) || 0) / 1000;
            const bikeKm = parseFloat(race.bikeDistance) || 0;
            const runKm = parseFloat(race.distance) || 0;
            statsDistance = swimKm + bikeKm + runKm;
        }
    }

    // 2. Calcul du ratio prix/km
    if (race.price && !isNaN(parseFloat(race.price)) && !isNaN(statsDistance) && statsDistance > 0) {
        const price = parseFloat(race.price);
        const pricePerKm = price / statsDistance;
        statsData.push(['Prix au km', `${pricePerKm.toFixed(2)} €/km`]);

        // Prix au km avec dénivelé (100m D+ = 1km plat)
        if (!isNaN(statsElevation) && statsElevation > 0) {
            const equivalentDistance = statsDistance + (statsElevation / 100);
            const pricePerKmWithElevation = price / equivalentDistance;
            statsData.push(['Prix au km (ft. déniv.)', `${pricePerKmWithElevation.toFixed(3)} €/km`]);
        }
    }

    // 3. Calcul de la vitesse et de la moyenne au km
    const timeForStats = (race.terrain === 'triathlon' && race.raceFormat === 'team')
        ? (race.raceRelaySport === 'swim' ? race.swimTime : (race.raceRelaySport === 'bike' ? race.bikeTime : (race.runTime || race.time)))
        : race.time;

    if (timeForStats && !isNaN(statsDistance) && statsDistance > 0) {
        const timeStr = timeForStats;
        const parts = timeStr.split(':');
        let hours = 0;
        if (parts.length === 3) {
            hours = parseInt(parts[0]) + parseInt(parts[1]) / 60 + parseInt(parts[2]) / 3600;
        } else if (parts.length === 2) {
            hours = parseInt(parts[0]) + parseInt(parts[1]) / 60;
        } else {
            hours = parseInt(parts[0]);
        }
        if (hours > 0) {
            const speed = statsDistance / hours;
            const timePerKm = 60 / speed;
            statsData.push(['Vitesse moyenne', `${speed.toFixed(2)} km/h`]);
            statsData.push(['Moyenne au km', `${timePerKm.toFixed(2)} min/km`]);
            const isSwimRace = (race.terrain === 'triathlon' && race.raceFormat === 'team' && race.raceRelaySport === 'swim') || race.terrain === 'natation' || race.raceRelaySport === 'swim';
            if (isSwimRace) {
                const totalSecs100m = Math.round((timePerKm * 60) / 10);
                const mins100m = Math.floor(totalSecs100m / 60);
                const secs100m = totalSecs100m % 60;
                statsData.push(['Moyenne au 100m', `${mins100m}:${String(secs100m).padStart(2, '0')} min/100m`]);
            }
        }
    }

    if (statsData.length > 0) {
        // Page break check for title
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text('Statistiques de la course', margin, yPos);
        yPos += 8;

        const sh1 = 'Métrique';
        const sh2 = 'Valeur';

        function drawStatsTableHeader() {
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.setDrawColor(75, 85, 99);
            doc.setLineWidth(0.4);

            // Col 1
            doc.setFillColor(...primaryColor);
            doc.rect(margin, yPos, col1Width, 9, 'FD');
            doc.setTextColor(255, 255, 255);
            const sh1Width = doc.getTextWidth(sh1);
            doc.text(sh1, margin + (col1Width - sh1Width) / 2, yPos + 6);

            // Col 2
            doc.setFillColor(...primaryColor);
            doc.rect(margin + col1Width, yPos, col2Width, 9, 'FD');
            doc.setTextColor(255, 255, 255);
            const sh2Width = doc.getTextWidth(sh2);
            doc.text(sh2, margin + col1Width + (col2Width - sh2Width) / 2, yPos + 6);

            yPos += 9;
        }

        drawStatsTableHeader();

        statsData.forEach(([label, value], i) => {
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);

            const lines1 = doc.splitTextToSize(label, col1Width - 4);
            const lines2 = doc.splitTextToSize(value, col2Width - 4);

            const maxLines = Math.max(lines1.length, lines2.length);
            const rowHeight = Math.max(8, maxLines * 4.5 + 4);

            // Page break check for rows
            if (yPos + rowHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
                drawStatsTableHeader();
            }

            const bg = i % 2 === 0 ? [240, 253, 244] : [255, 255, 255];

            // Draw cells background and border
            doc.setFillColor(...bg);
            doc.setDrawColor(75, 85, 99);
            doc.setLineWidth(0.4);
            doc.rect(margin, yPos, col1Width, rowHeight, 'FD');

            doc.setFillColor(...bg);
            doc.rect(margin + col1Width, yPos, col2Width, rowHeight, 'FD');

            // Draw Col 1 text (centered)
            doc.setTextColor(...textColor);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            let textY1 = yPos + (rowHeight - (lines1.length - 1) * 4.5) / 2 + 1.0;
            lines1.forEach(line => {
                const lineWidth = doc.getTextWidth(line);
                doc.text(line, margin + (col1Width - lineWidth) / 2, textY1);
                textY1 += 4.5;
            });

            // Draw Col 2 text (centered)
            doc.setFont(undefined, 'normal');
            let textY2 = yPos + (rowHeight - (lines2.length - 1) * 4.5) / 2 + 1.0;
            lines2.forEach(line => {
                const lineWidth = doc.getTextWidth(line);
                doc.text(line, margin + col1Width + (col2Width - lineWidth) / 2, textY2);
                textY2 += 4.5;
            });

            yPos += rowHeight;
        });

        yPos += 10;
    }

    // ─── SECTION TRIATHLON ────────────────────────────────────────────────────
    if (race.terrain === 'triathlon') {
        const isTeam = race.raceFormat === 'team';
        const relaySport = race.raceRelaySport; // 'swim', 'bike', or 'run'

        // En relai, afficher toutes les disciplines qui ont des données (les nôtres et celles des coéquipiers)
        const hasSwim = (race.swimTime && race.swimTime !== '00:00:00' && race.swimTime !== '—') || (race.swimDistance && parseFloat(race.swimDistance) > 0);
        const hasBike = (race.bikeTime && race.bikeTime !== '00:00:00' && race.bikeTime !== '—') || (race.bikeDistance && parseFloat(race.bikeDistance) > 0) || (race.bikeElevation && !isNaN(parseInt(race.bikeElevation)));
        const hasRun = (race.runTime && race.runTime !== '00:00:00' && race.runTime !== '—') || (race.distance && parseFloat(race.distance) > 0) || (race.runElevation && !isNaN(parseInt(race.runElevation))) || (!isTeam && race.elevation && !isNaN(parseInt(race.elevation)));

        if (hasSwim || hasBike || hasRun) {
            // Helper to parse HH:MM:SS or MM:SS to seconds
            function parseTimeToSeconds(timeStr) {
                if (!timeStr) return 0;
                const parts = timeStr.trim().split(':').map(Number);
                if (parts.some(isNaN)) return 0;
                if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                if (parts.length === 2) return parts[0] * 60 + parts[1];
                if (parts.length === 1) return parts[0];
                return 0;
            }

            // Helper to format seconds to HH:MM:SS
            function formatSecondsToTime(totalSeconds) {
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
            }

            // Helpers for swim pace, bike speed, run pace
            function calculateSwimPace(distMeters, seconds) {
                if (!distMeters || !seconds || distMeters <= 0) return '-';
                const pace = (seconds / 60) / (distMeters / 100);
                const mins = Math.floor(pace);
                const secs = Math.round((pace - mins) * 60);
                return `${mins}:${String(secs).padStart(2, '0')} min/100m`;
            }

            function calculateBikeSpeed(distKm, seconds) {
                if (!distKm || !seconds || distKm <= 0) return '-';
                const speed = distKm / (seconds / 3600);
                return `${speed.toFixed(2)} km/h`;
            }

            function calculateRunPace(distKm, seconds) {
                if (!distKm || !seconds || distKm <= 0) return '-';
                const speed = distKm / (seconds / 3600);
                if (speed <= 0) return '-';
                const timePerKm = 60 / speed;
                return `${timePerKm.toFixed(2)} min/km`;
            }

            // Draw Sport Card Function
            function drawSportCard(title, badgeLabel, stats, colors) {
                const cardHeight = 25;
                const cardWidth = pageWidth - 2 * margin;

                // Page break check
                if (yPos + cardHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                }

                // Draw Background and Border
                doc.setFillColor(...colors.bg);
                doc.setDrawColor(...colors.border);
                doc.setLineWidth(0.4);
                doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'FD');

                // Draw Title
                doc.setFont(undefined, 'bold');
                doc.setFontSize(11);
                doc.setTextColor(...colors.title);
                doc.text(title, margin + 6, yPos + 7);

                // Draw Badge
                doc.setFont(undefined, 'bold');
                doc.setFontSize(8);
                const badgeTextWidth = doc.getTextWidth(badgeLabel);
                const badgeWidth = badgeTextWidth + 6;
                const badgeHeight = 5;
                const badgeX = margin + cardWidth - badgeWidth - 6;
                const badgeY = yPos + 3.5;

                doc.setFillColor(...colors.badgeBg);
                doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
                doc.setTextColor(...colors.badgeText);
                doc.text(badgeLabel, badgeX + 3, badgeY + 3.8);

                // Draw Header Underline
                doc.setDrawColor(...colors.border);
                doc.setLineWidth(0.2);
                doc.line(margin + 6, yPos + 10.5, margin + cardWidth - 6, yPos + 10.5);

                // Stats Columns
                const colWidth = (cardWidth - 12) / stats.length;
                stats.forEach((stat, i) => {
                    const colX = margin + 6 + i * colWidth + colWidth / 2;

                    // Label
                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(...colors.sub);
                    doc.text(stat.label, colX, yPos + 15.5, { align: 'center' });

                    // Value
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(10.5);
                    doc.setTextColor(...colors.title);
                    doc.text(stat.value, colX, yPos + 21, { align: 'center' });
                });

                yPos += cardHeight + 6; // Move yPos down
            }

            // Colors
            const swimColors = {
                bg: [239, 246, 255],      // bg-blue-50
                border: [191, 219, 254],  // border-blue-200
                title: [30, 58, 138],     // text-blue-800
                sub: [37, 99, 235],       // text-blue-600
                badgeBg: [219, 234, 254], // bg-blue-100
                badgeText: [30, 58, 138]  // text-blue-800
            };

            const bikeColors = {
                bg: [255, 247, 237],      // bg-orange-50
                border: [254, 215, 170],  // border-orange-200
                title: [154, 52, 18],     // text-orange-800
                sub: [234, 88, 12],       // text-orange-600
                badgeBg: [254, 215, 170], // bg-orange-100
                badgeText: [154, 52, 18]  // text-orange-800
            };

            const runColors = {
                bg: [240, 253, 244],      // bg-green-50
                border: [187, 247, 208],  // border-green-200
                title: [22, 101, 52],     // text-green-800
                sub: [22, 163, 74],       // text-green-600
                badgeBg: [187, 247, 208], // bg-green-100
                badgeText: [22, 101, 52]  // text-green-800
            };

            // Section Title
            if (yPos > doc.internal.pageSize.getHeight() - 60) {
                doc.addPage();
                yPos = margin;
            }

            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.setFont(undefined, 'bold');
            const sectionTitle = isTeam ? 'Détails Triathlon (Relai)' : 'Détails Triathlon';
            doc.text(sectionTitle, margin, yPos);
            yPos += 8;

            const swimDistVal = parseFloat(race.swimDistance);
            const swimDistStr = race.swimDistance ? (swimDistVal > 999
                ? `${(swimDistVal / 1000).toFixed(2)} km`
                : `${race.swimDistance} m`) : '—';
            const swimTimeStr = race.swimTime || '—';
            const swimSec = parseTimeToSeconds(race.swimTime);
            const swimPace = calculateSwimPace(swimDistVal, swimSec);

            const bikeDistVal = parseFloat(race.bikeDistance);
            const bikeDistStr = race.bikeDistance ? `${race.bikeDistance} km` : '—';
            const bikeTimeStr = race.bikeTime || '—';
            const bikeSec = parseTimeToSeconds(race.bikeTime);
            const bikeSpeed = calculateBikeSpeed(bikeDistVal, bikeSec);
            const bikeElevStr = (() => {
                const p = race.bikeElevation ? `D+ ${race.bikeElevation}m` : '';
                const n = race.bikeElevationNeg ? `D- ${race.bikeElevationNeg}m` : '';
                return [p, n].filter(Boolean).join(' / ') || '—';
            })();

            const runDistVal = parseFloat(race.distance);
            const runDistStr = race.distance ? `${race.distance} km` : '—';
            const runTimeStr = race.runTime || (isTeam && relaySport === 'run' ? race.time : null) || race.time || '—';
            const runSec = parseTimeToSeconds(runTimeStr);
            const runPace = calculateRunPace(runDistVal, runSec);
            const runElevStr = (() => {
                const p = isTeam ? (race.runElevation || (relaySport === 'run' ? race.elevation : null)) : race.elevation;
                const n = isTeam ? (race.runElevationNeg || (relaySport === 'run' ? race.elevationNeg : null)) : race.elevationNeg;
                const pStr = p ? `D+ ${p}m` : '';
                const nStr = n ? `D- ${n}m` : '';
                return [pStr, nStr].filter(Boolean).join(' / ') || '—';
            })();

            // ── Tableau Épreuves de l'équipe (Relais) pour le triathlon en relai
            if (isTeam) {
                if (yPos > doc.internal.pageSize.getHeight() - 55) {
                    doc.addPage();
                    yPos = margin;
                }

                doc.setFontSize(12);
                doc.setTextColor(...primaryColor);
                doc.setFont(undefined, 'bold');
                doc.text("Épreuves de l'équipe (Relais)", margin, yPos);
                yPos += 7;

                const teamHeaders = ['Épreuve', 'Participant', 'Distance', 'Dénivelé', 'Temps'];
                const teamColWidths = [35, 30, 35, 35, 35];

                function drawTriathlonTeamTableHeader() {
                    doc.setFontSize(9.5);
                    doc.setFont(undefined, 'bold');
                    doc.setDrawColor(75, 85, 99);
                    doc.setLineWidth(0.4);

                    let curX = margin;
                    teamHeaders.forEach((th, cIdx) => {
                        doc.setFillColor(...primaryColor);
                        doc.rect(curX, yPos, teamColWidths[cIdx], 8, 'FD');
                        doc.setTextColor(255, 255, 255);
                        const tw = doc.getTextWidth(th);
                        const tx = curX + (teamColWidths[cIdx] - tw) / 2;
                        doc.text(th, tx, yPos + 5.5);
                        curX += teamColWidths[cIdx];
                    });
                    yPos += 8;
                }

                drawTriathlonTeamTableHeader();

                const teamRows = [
                    {
                        sport: 'Natation',
                        participant: relaySport === 'swim' ? 'Moi' : 'Coéquipier',
                        dist: swimDistStr,
                        elev: '—',
                        time: race.swimTime || '—'
                    },
                    {
                        sport: 'Cyclisme',
                        participant: relaySport === 'bike' ? 'Moi' : 'Coéquipier',
                        dist: bikeDistStr,
                        elev: bikeElevStr,
                        time: race.bikeTime || '—'
                    },
                    {
                        sport: 'Course à pied',
                        participant: relaySport === 'run' ? 'Moi' : 'Coéquipier',
                        dist: runDistStr,
                        elev: runElevStr,
                        time: runTimeStr
                    }
                ];

                teamRows.forEach((r, rIdx) => {
                    const rowHeight = 8;
                    if (yPos + rowHeight > doc.internal.pageSize.getHeight() - margin) {
                        doc.addPage();
                        yPos = margin;
                        drawTriathlonTeamTableHeader();
                    }

                    const bg = rIdx % 2 === 0 ? [240, 253, 244] : [255, 255, 255];
                    let curX = margin;
                    const cellVals = [r.sport, r.participant, r.dist, r.elev, r.time];

                    cellVals.forEach((val, cIdx) => {
                        doc.setFillColor(...bg);
                        doc.setDrawColor(75, 85, 99);
                        doc.setLineWidth(0.4);
                        doc.rect(curX, yPos, teamColWidths[cIdx], rowHeight, 'FD');

                        doc.setTextColor(...textColor);
                        doc.setFont(undefined, cIdx === 0 || cIdx === 1 ? 'bold' : 'normal');
                        doc.setFontSize(9);
                        const tw = doc.getTextWidth(val);
                        const tx = curX + (teamColWidths[cIdx] - tw) / 2;
                        doc.text(val, tx, yPos + 5.5);
                        curX += teamColWidths[cIdx];
                    });
                    yPos += rowHeight;
                });

                // Ligne total équipe
                const totalRowHeight = 8;
                if (yPos + totalRowHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                    drawTriathlonTeamTableHeader();
                }

                const totalSwimKm = !isNaN(swimDistVal) ? swimDistVal / 1000 : 0;
                const totalBikeKm = !isNaN(bikeDistVal) ? bikeDistVal : 0;
                const totalRunKm = !isNaN(runDistVal) ? runDistVal : 0;
                const totalTeamDist = totalSwimKm + totalBikeKm + totalRunKm;
                const totalTeamDistText = totalTeamDist > 0 ? `${totalTeamDist.toFixed(2)} km` : '—';

                const bDPlus = parseInt(race.bikeElevation) || 0;
                const rDPlus = parseInt(race.runElevation) || (relaySport === 'run' ? (parseInt(race.elevation) || 0) : 0);
                const totalTeamDPlus = bDPlus + rDPlus;

                const bDMinus = parseInt(race.bikeElevationNeg) || 0;
                const rDMinus = parseInt(race.runElevationNeg) || (relaySport === 'run' ? (parseInt(race.elevationNeg) || 0) : 0);
                const totalTeamDMinus = bDMinus + rDMinus;

                let totalTeamElevText = '—';
                if (totalTeamDPlus > 0 || totalTeamDMinus > 0) {
                    const parts = [];
                    if (totalTeamDPlus > 0) parts.push(`+${totalTeamDPlus}m`);
                    if (totalTeamDMinus > 0) parts.push(`-${totalTeamDMinus}m`);
                    totalTeamElevText = parts.join(' ');
                }

                let totalTeamSeconds = 0;
                if (race.swimTime && race.swimTime !== '—') totalTeamSeconds += parseTimeToSeconds(race.swimTime);
                if (race.bikeTime && race.bikeTime !== '—') totalTeamSeconds += parseTimeToSeconds(race.bikeTime);
                if (runTimeStr && runTimeStr !== '—') totalTeamSeconds += parseTimeToSeconds(runTimeStr);
                const totalTeamTimeText = totalTeamSeconds > 0 ? formatSecondsToTime(totalTeamSeconds) : (race.time && race.time !== '00:00:00' ? race.time : '—');

                let curX = margin;
                const spanColWidth = teamColWidths[0] + teamColWidths[1]; // 65mm
                doc.setFillColor(220, 252, 231);
                doc.setDrawColor(75, 85, 99);
                doc.setLineWidth(0.4);
                doc.rect(curX, yPos, spanColWidth, totalRowHeight, 'FD');

                doc.setTextColor(...primaryColor);
                doc.setFont(undefined, 'bold');
                doc.setFontSize(9);
                const tw0 = doc.getTextWidth('Total Équipe');
                doc.text('Total Équipe', curX + (spanColWidth - tw0) / 2, yPos + 5.5);
                curX += spanColWidth;

                [totalTeamDistText, totalTeamElevText, totalTeamTimeText].forEach((tVal, tIdx) => {
                    const cW = teamColWidths[tIdx + 2];
                    doc.setFillColor(220, 252, 231);
                    doc.setDrawColor(75, 85, 99);
                    doc.setLineWidth(0.4);
                    doc.rect(curX, yPos, cW, totalRowHeight, 'FD');

                    doc.setTextColor(...primaryColor);
                    doc.setFont(undefined, 'bold');
                    doc.setFontSize(9);
                    const tw = doc.getTextWidth(tVal);
                    doc.text(tVal, curX + (cW - tw) / 2, yPos + 5.5);
                    curX += cW;
                });
                yPos += totalRowHeight + 8;
            }

            // 1. Swim Card
            if (hasSwim) {
                const swimStats = [
                    { label: 'DISTANCE', value: swimDistStr },
                    { label: 'TEMPS', value: swimTimeStr },
                    { label: 'ALLURE', value: swimPace }
                ];
                const swimTitle = isTeam ? (relaySport === 'swim' ? 'Natation (Moi)' : 'Natation (Coéquipier)') : 'Natation';
                const swimBadge = isTeam ? (relaySport === 'swim' ? 'MOI' : 'COÉQUIPIER') : 'SPORT 1';
                drawSportCard(swimTitle, swimBadge, swimStats, swimColors);
            }

            // 2. Bike Card
            if (hasBike) {
                const bikeStats = [
                    { label: 'DISTANCE', value: bikeDistStr },
                    { label: 'TEMPS', value: bikeTimeStr },
                    { label: 'DÉNIVELÉ', value: bikeElevStr },
                    { label: 'VITESSE', value: bikeSpeed }
                ];
                const bikeTitle = isTeam ? (relaySport === 'bike' ? 'Cyclisme (Moi)' : 'Cyclisme (Coéquipier)') : 'Cyclisme';
                const bikeBadge = isTeam ? (relaySport === 'bike' ? 'MOI' : 'COÉQUIPIER') : 'SPORT 2';
                drawSportCard(bikeTitle, bikeBadge, bikeStats, bikeColors);
            }

            // 3. Run Card
            if (hasRun) {
                const runStats = [
                    { label: 'DISTANCE', value: runDistStr },
                    { label: 'TEMPS', value: runTimeStr },
                    { label: 'DÉNIVELÉ', value: runElevStr },
                    { label: 'ALLURE', value: runPace }
                ];
                const runTitle = isTeam ? (relaySport === 'run' ? 'Course à pied (Moi)' : 'Course à pied (Coéquipier)') : 'Course à pied';
                const runBadge = isTeam ? (relaySport === 'run' ? 'MOI' : 'COÉQUIPIER') : 'SPORT 3';
                drawSportCard(runTitle, runBadge, runStats, runColors);
            }

            // Temps total triathlon
            if (race.time && race.time !== '00:00:00') {
                if (yPos > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.setFont(undefined, 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...primaryColor);
                doc.text(`Temps total : ${race.time}`, margin, yPos + 2);
                yPos += 9;
            }

            yPos += 5;
        }
    }

    // ─── SECTION RELAI ────────────────────────────────────────────────────────
    if (race.terrain === 'relai' && race.relayLaps && race.relayLaps.length > 0) {
        const currentUserPseudo = window.currentUserPseudo || 'Moi';

        // Helper to parse HH:MM:SS or MM:SS to seconds
        function parseTimeToSeconds(timeStr) {
            if (!timeStr) return 0;
            const parts = timeStr.trim().split(':').map(Number);
            if (parts.some(isNaN)) return 0;
            if (parts.length === 3) {
                return parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                return parts[0] * 60 + parts[1];
            } else if (parts.length === 1) {
                return parts[0];
            }
            return 0;
        }

        // Helper to format seconds to HH:MM:SS
        function formatSecondsToTime(totalSeconds) {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
        }

        // Helper to normalize any time string to HH:MM:SS
        function normalizeTimeToFormatted(timeStr) {
            if (!timeStr || timeStr.trim() === '' || timeStr === '—') return '—';
            const seconds = parseTimeToSeconds(timeStr);
            return formatSecondsToTime(seconds);
        }

        // Helper to calculate pace
        function calculateLapPace(dist, seconds) {
            if (!dist || !seconds || dist <= 0) return '-';
            const speed = dist / (seconds / 3600);
            if (speed <= 0) return '-';
            const timePerKm = 60 / speed;
            return `${timePerKm.toFixed(2)} min/km`;
        }

        // Calculate "Moi" stats
        let userRelayDist = 0;
        let userRelayElev = 0;
        let userRelayElevNeg = 0;
        let userRelayTimeS = 0;
        let userRelayCount = 0;
        let userRelayLaps = [];

        race.relayLaps.forEach((lap, idx) => {
            const d = parseFloat(lap.dist) || 0;
            const e = parseInt(lap.elev) || 0;
            const en = parseInt(lap.elevNeg) || 0;
            const s = parseTimeToSeconds(lap.time);

            if (lap.runner === 'Moi' || !lap.runner || lap.runner === 'Tous ensemble') {
                userRelayDist += d;
                userRelayElev += e;
                userRelayElevNeg += en;
                userRelayTimeS += s;
                userRelayCount++;
                userRelayLaps.push(idx + 1);
            }
        });

        // Collect teammates
        const teammateNames = [...new Set(
            race.relayLaps
                .map(l => l.runner)
                .filter(r => r && r !== 'Moi' && r !== 'Tous ensemble' && r !== 'Personne')
        )];

        const teammateStats = {};
        teammateNames.forEach(name => {
            teammateStats[name] = { dist: 0, elev: 0, elevNeg: 0, timeS: 0, count: 0, laps: [] };
        });

        race.relayLaps.forEach((lap, idx) => {
            const isTousEnsemble = lap.runner === 'Tous ensemble';
            const targets = isTousEnsemble ? teammateNames : (lap.runner && lap.runner !== 'Moi' && lap.runner !== 'Personne' ? [lap.runner] : []);
            const d = parseFloat(lap.dist) || 0;
            const e = parseInt(lap.elev) || 0;
            const en = parseInt(lap.elevNeg) || 0;
            const s = parseTimeToSeconds(lap.time);
            targets.forEach(name => {
                if (teammateStats[name]) {
                    teammateStats[name].dist += d;
                    teammateStats[name].elev += e;
                    teammateStats[name].elevNeg += en;
                    teammateStats[name].timeS += s;
                    teammateStats[name].count++;
                    teammateStats[name].laps.push(idx + 1);
                }
            });
        });

        // Colors configurations
        const ownerColors = {
            bg: [239, 246, 255],      // bg-blue-50
            border: [191, 219, 254],  // border-blue-200
            title: [30, 58, 138],     // text-blue-800
            sub: [37, 99, 235],       // text-blue-600
            badgeBg: [219, 234, 254], // bg-blue-100
            badgeText: [30, 58, 138]  // text-blue-800
        };

        const teammateColorsList = [
            { bg: [255, 247, 237], border: [254, 215, 170], title: [154, 52, 18], sub: [234, 88, 12], badgeBg: [254, 215, 170], badgeText: [154, 52, 18] }, // Orange
            { bg: [245, 243, 255], border: [233, 213, 252], title: [91, 33, 182], sub: [124, 58, 237], badgeBg: [233, 213, 252], badgeText: [91, 33, 182] }, // Violet
            { bg: [255, 241, 242], border: [254, 205, 211], title: [159, 18, 57], sub: [225, 29, 72], badgeBg: [254, 205, 211], badgeText: [159, 18, 57] }, // Rose
            { bg: [240, 253, 250], border: [204, 251, 241], title: [19, 78, 74], sub: [13, 148, 136], badgeBg: [204, 251, 241], badgeText: [19, 78, 74] }, // Teal
            { bg: [254, 252, 232], border: [254, 240, 138], title: [120, 53, 4], sub: [217, 119, 6], badgeBg: [254, 240, 138], badgeText: [120, 53, 4] }, // Amber
            { bg: [236, 254, 255], border: [207, 250, 254], title: [21, 94, 117], sub: [8, 145, 178], badgeBg: [207, 250, 254], badgeText: [21, 94, 117] }  // Cyan
        ];

        // Draw Card Function
        function drawCard(xPos, yCardPos, title, badgeLabel, dist, elev, elevNeg, timeS, count, laps, colors, cardWidth, cardHeight, footerLines, fontSize, lineHeight) {
            // Draw Background and Border
            doc.setFillColor(...colors.bg);
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(0.4);
            doc.roundedRect(xPos, yCardPos, cardWidth, cardHeight, 3, 3, 'FD');

            // Draw Title
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(...colors.title);
            doc.text(title, xPos + 6, yCardPos + 7);

            // Draw Badge
            doc.setFont(undefined, 'bold');
            doc.setFontSize(7.5);
            const badgeTextWidth = doc.getTextWidth(badgeLabel);
            const badgeWidth = badgeTextWidth + 4;
            const badgeHeight = 4.5;
            const badgeX = xPos + cardWidth - badgeWidth - 6;
            const badgeY = yCardPos + 3.5;

            doc.setFillColor(...colors.badgeBg);
            doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
            doc.setTextColor(...colors.badgeText);
            doc.text(badgeLabel, badgeX + 2, badgeY + 3.4);

            // Draw Header Underline
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(0.2);
            doc.line(xPos + 6, yCardPos + 10.5, xPos + cardWidth - 6, yCardPos + 10.5);

            const stats = [
                { label: 'DISTANCE', value: `${dist.toFixed(2)} km` },
                { label: 'DÉNIVELÉ', value: `+${elev}m -${elevNeg}m` },
                { label: 'TEMPS', value: formatSecondsToTime(timeS) },
                { label: 'ALLURE', value: calculateLapPace(dist, timeS) }
            ];

            const colWidth = (cardWidth - 12) / 4;
            stats.forEach((stat, i) => {
                const colX = xPos + 6 + i * colWidth + colWidth / 2;

                // Label
                doc.setFont(undefined, 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(...colors.sub);
                doc.text(stat.label, colX, yCardPos + 15.5, { align: 'center' });

                // Value
                doc.setFont(undefined, 'bold');
                doc.setFontSize(9.5);
                doc.setTextColor(...colors.title);
                doc.text(stat.value, colX, yCardPos + 21, { align: 'center' });
            });

            // Draw Footer Divider
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(0.2);
            doc.line(xPos + 6, yCardPos + 24.5, xPos + cardWidth - 6, yCardPos + 24.5);

            // Draw Footer (avec retour à la ligne automatique et centrage vertical si carte étirée)
            doc.setFont(undefined, 'bold');
            doc.setFontSize(fontSize);
            doc.setTextColor(...colors.title);

            const linesCount = footerLines.length;
            const textBlockHeight = Math.max(0, linesCount - 1) * lineHeight;
            const extraSpace = (cardHeight - 24.5) - (9.5 + textBlockHeight);
            const startY = yCardPos + 29.5 + Math.max(0, extraSpace / 2);

            footerLines.forEach((line, lIdx) => {
                doc.text(line, xPos + cardWidth / 2, startY + lIdx * lineHeight, { align: 'center' });
            });
        }

        // Draw Section Title for Performances
        const pageHeight = doc.internal.pageSize.getHeight();
        if (yPos > pageHeight - 55) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text('Performances des Participants', margin, yPos);
        yPos += 8;

        const participants = [
            {
                title: currentUserPseudo,
                badgeLabel: 'INDIVIDUEL',
                dist: userRelayDist,
                elev: userRelayElev,
                elevNeg: userRelayElevNeg,
                timeS: userRelayTimeS,
                count: userRelayCount,
                laps: userRelayLaps,
                colors: ownerColors
            }
        ];

        teammateNames.forEach((name, idx) => {
            const st = teammateStats[name];
            const colors = teammateColorsList[idx % teammateColorsList.length];
            participants.push({
                title: name,
                badgeLabel: 'COÉQUIPIER',
                dist: st.dist,
                elev: st.elev,
                elevNeg: st.elevNeg,
                timeS: st.timeS,
                count: st.count,
                laps: st.laps,
                colors: colors
            });
        });

        const gap = 4;
        const cardWidth = (pageWidth - 2 * margin - gap) / 2;
        const maxTextWidth = cardWidth - 14;

        // Pré-calculer les lignes du footer et la hauteur requise pour chaque participant
        participants.forEach(p => {
            const lapsList = Array.isArray(p.laps) ? p.laps : [];
            const footerText = lapsList.length > 0
                ? `${p.count} relais effectué${p.count > 1 ? 's' : ''} (${lapsList.join(', ')})`
                : `${p.count} relais effectué${p.count > 1 ? 's' : ''}`;

            const fontSize = lapsList.length > 25 ? 7.5 : 8;
            const lineHeight = fontSize === 7.5 ? 3.2 : 3.5;

            doc.setFont(undefined, 'bold');
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(footerText, maxTextWidth);

            p.footerLines = Array.isArray(lines) ? lines : [lines];
            if (p.footerLines.length === 0) p.footerLines = [footerText];
            p.fontSize = fontSize;
            p.lineHeight = lineHeight;
            p.neededHeight = 34 + Math.max(0, p.footerLines.length - 1) * lineHeight;
        });

        // Découpage et affichage en rangées de 2 participants
        for (let i = 0; i < participants.length; i += 2) {
            const row = participants.slice(i, i + 2);
            const rowHeight = Math.max(...row.map(p => p.neededHeight));

            if (yPos + rowHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }

            const isSingleLast = row.length === 1 && (i + 1 === participants.length);
            row.forEach((p, col) => {
                let xPos;
                if (isSingleLast) {
                    // Centrer le dernier participant s'il est seul sur sa ligne
                    const availableWidth = pageWidth - 2 * margin;
                    xPos = margin + (availableWidth - cardWidth) / 2;
                } else {
                    xPos = margin + col * (cardWidth + gap);
                }

                drawCard(xPos, yPos, p.title, p.badgeLabel, p.dist, p.elev, p.elevNeg, p.timeS, p.count, p.laps, p.colors, cardWidth, rowHeight, p.footerLines, p.fontSize, p.lineHeight);
            });

            yPos += rowHeight + gap;
        }

        yPos += 8; // Petit espace supplémentaire à la fin des cartes des participants

        // Now draw "Segments du Relai" section title and table
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text('Segments du Relai', margin, yPos);
        yPos += 8;

        // Colonnes du tableau relai
        // Afficher les colonnes heure seulement si l'heure de départ est connue ET tous les relais ont un temps renseigné (00:00:00 accepté, vide non)
        const hasStartHour = !!race.hour && race.relayLaps.every(lap => lap.time && lap.time.trim() !== '');
        // Helper : heure de départ + secondes écoulées
        function addTimeToHourPdf(startHour, elapsedSeconds) {
            const [sh, sm] = startHour.split(':').map(Number);
            const totalSec = sh * 3600 + sm * 60 + Math.round(elapsedSeconds);
            const h = Math.floor(totalSec / 3600) % 24;
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            const pad = n => String(n).padStart(2, '0');
            return `${pad(h)}:${pad(m)}:${pad(s)}`;
        }

        const headers = hasStartHour
            ? ['N°', 'Coureur', 'Dist. (km)', 'D+ (m)', 'D- (m)', 'Temps', 'Départ', 'Arrivée']
            : ['N°', 'Coureur', 'Dist. (km)', 'D+ (m)', 'D- (m)', 'Temps'];

        const colWidths = hasStartHour
            ? [10, 30, 22, 18, 18, 22, 25, 25]
            : [12, 50, 26, 26, 26, 30];

        function drawRelayTableHeader() {
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setDrawColor(75, 85, 99);
            doc.setLineWidth(0.4);

            let currentX = margin;
            headers.forEach((header, colIdx) => {
                doc.setFillColor(...primaryColor);
                doc.rect(currentX, yPos, colWidths[colIdx], 9, 'FD');
                doc.setTextColor(255, 255, 255);
                const textWidth = doc.getTextWidth(header);
                const textX = currentX + (colWidths[colIdx] - textWidth) / 2;
                doc.text(header, textX, yPos + 6);
                currentX += colWidths[colIdx];
            });
            yPos += 9;
        }

        drawRelayTableHeader();

        let totalDist = 0, totalElev = 0, totalElevNeg = 0;
        let cumulativePdfSeconds = 0;

        race.relayLaps.forEach((lap, i) => {
            const dist = parseFloat(lap.dist) || 0;
            const elev = parseFloat(lap.elev) || 0;
            const elevNeg = parseFloat(lap.elevNeg) || 0;
            const lapSec = parseTimeToSeconds(lap.time);
            const departureStr = hasStartHour ? addTimeToHourPdf(race.hour, cumulativePdfSeconds) : '—';
            cumulativePdfSeconds += lapSec;
            const arrivalStr = hasStartHour ? addTimeToHourPdf(race.hour, cumulativePdfSeconds) : '—';
            totalDist += dist;
            totalElev += elev;
            totalElevNeg += elevNeg;

            const runnerLabel = lap.runner === 'Tous ensemble' ? 'Tous ens.' : ((lap.runner === 'Moi' || !lap.runner) ? currentUserPseudo : (lap.runner === 'Personne' ? '-' : lap.runner));

            const cellTexts = hasStartHour
                ? [
                    `${i + 1}`,
                    runnerLabel,
                    dist > 0 ? dist.toFixed(2) : '—',
                    elev > 0 ? `${elev}` : '—',
                    elevNeg > 0 ? `${elevNeg}` : '—',
                    normalizeTimeToFormatted(lap.time),
                    departureStr,
                    arrivalStr
                ]
                : [
                    `${i + 1}`,
                    runnerLabel,
                    dist > 0 ? dist.toFixed(2) : '—',
                    elev > 0 ? `${elev}` : '—',
                    elevNeg > 0 ? `${elevNeg}` : '—',
                    normalizeTimeToFormatted(lap.time)
                ];

            // Calculer les lignes pour chaque cellule (wrap)
            const cellLines = [];
            const cellLinesCount = [];
            colWidths.forEach((width, colIdx) => {
                doc.setFont(undefined, 'normal');
                doc.setFontSize(9);
                const lines = doc.splitTextToSize(cellTexts[colIdx], width - 4);
                cellLines.push(lines);
                cellLinesCount.push(lines.length);
            });

            const maxLines = Math.max(...cellLinesCount);
            const rowHeight = Math.max(8, maxLines * 4.5 + 4);

            // Page break check
            if (yPos + rowHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
                drawRelayTableHeader();
            }

            const bg = i % 2 === 0 ? [240, 255, 240] : [255, 255, 255];

            let currentX = margin;
            colWidths.forEach((width, colIdx) => {
                doc.setFillColor(...bg);
                doc.setDrawColor(75, 85, 99);
                doc.setLineWidth(0.4);
                doc.rect(currentX, yPos, width, rowHeight, 'FD');

                doc.setTextColor(55, 65, 81);
                doc.setFont(undefined, 'normal');
                doc.setFontSize(9);

                const lines = cellLines[colIdx];
                let textY = yPos + (rowHeight - (lines.length - 1) * 4.5) / 2 + 1.0;
                lines.forEach(line => {
                    const textWidth = doc.getTextWidth(line);
                    const textX = currentX + (width - textWidth) / 2;
                    doc.text(line, textX, textY);
                    textY += 4.5;
                });

                currentX += width;
            });

            yPos += rowHeight;

            // Ajouter le commentaire/description en dessous de la ligne s'il existe
            if (lap.comment && lap.comment.trim() !== '') {
                const commentText = `Commentaire : ${lap.comment.trim()}`;
                doc.setFont(undefined, 'italic');
                doc.setFontSize(8);
                const splitComment = doc.splitTextToSize(commentText, pageWidth - 2 * margin - 8);
                
                const commentRowHeight = splitComment.length * 4 + 4;
                
                if (yPos + commentRowHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                    drawRelayTableHeader();
                }
                
                doc.setFillColor(...bg);
                doc.setDrawColor(75, 85, 99);
                doc.setLineWidth(0.4);
                doc.rect(margin, yPos, pageWidth - 2 * margin, commentRowHeight, 'FD');
                
                doc.setTextColor(100, 116, 139);
                let commentTextY = yPos + (commentRowHeight - (splitComment.length - 1) * 4) / 2 + 0.5;
                splitComment.forEach(line => {
                    const textWidth = doc.getTextWidth(line);
                    const textX = margin + (pageWidth - 2 * margin - textWidth) / 2;
                    doc.text(line, textX, commentTextY);
                    commentTextY += 4;
                });
                
                yPos += commentRowHeight;
            }
        });

        // Ligne de totaux
        const totalRowHeight = 9;
        if (yPos + totalRowHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
            drawRelayTableHeader();
        }

        let currentX = margin;
        colWidths.forEach((width, colIdx) => {
            doc.setFillColor(220, 252, 231);
            doc.setDrawColor(75, 85, 99);
            doc.setLineWidth(0.4);
            doc.rect(currentX, yPos, width, totalRowHeight, 'FD');

            doc.setFont(undefined, 'bold');
            doc.setTextColor(...primaryColor);
            doc.setFontSize(9);

            let totalText = '';
            if (colIdx === 0) {
                totalText = 'TOTAL';
            } else if (colIdx === 1) {
                totalText = '-';
            } else if (colIdx === 2) {
                totalText = totalDist > 0 ? `${totalDist.toFixed(2)}` : '—';
            } else if (colIdx === 3) {
                totalText = totalElev > 0 ? `${totalElev}` : '—';
            } else if (colIdx === 4) {
                totalText = totalElevNeg > 0 ? `${totalElevNeg}` : '—';
            } else if (colIdx === 5) {
                totalText = normalizeTimeToFormatted(race.time);
            } else if (hasStartHour && (colIdx === 6 || colIdx === 7)) {
                totalText = '-';
            }

            if (totalText) {
                const textWidth = doc.getTextWidth(totalText);
                const textX = currentX + (width - textWidth) / 2;
                doc.text(totalText, textX, yPos + 6);
            }

            currentX += width;
        });
        yPos += totalRowHeight + 10;
    }
    // ─────────────────────────────────────────────────────────────────────────



    // ─── SECTION HYROX ────────────────────────────────────────────────────────
    if (race.terrain === 'hyrox' && race.hyroxLaps && race.hyroxLaps.length > 0) {
        if (yPos > doc.internal.pageSize.getHeight() - 80) {
            doc.addPage();
            yPos = margin;
        }

        const hyroxEvents = [
            '1- Course 1km', 'SkiErg 1000m',
            '2- Course 1km', 'Sled Push 50m',
            '3- Course 1km', 'Sled Pull 50m',
            '4- Course 1km', 'Burpee Broad Jumps 80m',
            '5- Course 1km', 'Rowing 1000m',
            '6- Course 1km', 'Farmers Carry 200m',
            '7- Course 1km', 'Sandbag Lunges 100m',
            '8- Course 1km', 'Wall Balls (75/100 reps)'
        ];

        doc.setFontSize(14);
        doc.setTextColor(194, 65, 12); // Orange foncé pour Hyrox
        doc.setFont(undefined, 'bold');
        doc.text('Détail Hyrox', margin, yPos);
        yPos += 8;

        // En-tête tableau
        const hyrCols = [margin, margin + 110];
        doc.setFontSize(9);
        doc.setFillColor(194, 65, 12);
        doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('Étape', hyrCols[0] + 1, yPos);
        doc.text('Temps', hyrCols[1], yPos);
        yPos += 7;

        hyroxEvents.forEach((eventName, i) => {
            if (yPos > doc.internal.pageSize.getHeight() - 15) {
                doc.addPage();
                yPos = margin;
            }

            const isRun = eventName.startsWith('');  // toutes les lignes
            const isCourse = /^\d+- Course/.test(eventName);

            // Alternance couleur : course en orange clair, exercice en blanc
            const bg = isCourse ? [255, 237, 213] : [255, 251, 235];
            doc.setFillColor(...bg);
            doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');

            doc.setFont(undefined, isCourse ? 'bold' : 'normal');
            doc.setTextColor(isCourse ? 154 : 55, isCourse ? 52 : 65, isCourse ? 18 : 81);
            doc.setFontSize(9);

            const time = race.hyroxLaps[i];
            doc.text(eventName, hyrCols[0] + 1, yPos);
            doc.text(time || '—', hyrCols[1], yPos);
            yPos += 7;
        });

        // Ligne total Hyrox
        if (race.time && race.time !== '00:00:00') {
            doc.setFillColor(254, 215, 170); // Orange moyen pour TOTAL
            doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
            doc.setFont(undefined, 'bold');
            doc.setTextColor(154, 52, 18);
            doc.setFontSize(10);
            doc.text('TEMPS TOTAL', hyrCols[0] + 1, yPos);
            doc.text(race.time, hyrCols[1], yPos);
            yPos += 10;
        }

        yPos += 3;
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ─── SECTION POINTS DE PASSAGE ───────────────────────────────────────────
    const passagePoints = Array.isArray(race.passagePoints) ? race.passagePoints : [];
    const validPassagePoints = passagePoints.filter(point => point && (
        (point.stage !== undefined && point.stage !== null && String(point.stage).trim() !== '') ||
        (point.km !== undefined && point.km !== null && String(point.km).trim() !== '') ||
        (point.rank !== undefined && point.rank !== null && String(point.rank).trim() !== '') ||
        (point.time !== undefined && point.time !== null && String(point.time).trim() !== '')
    ));

    if (validPassagePoints.length > 0) {
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text('Points de passage', margin, yPos);
        yPos += 8;

        const finalRank = Number.parseInt(race.rankPos, 10);
        const hasRankComparison = Number.isFinite(finalRank) && finalRank > 0 && validPassagePoints.some(p => Number.parseInt(p.rank, 10) > 0);

        const pHeaders = hasRankComparison
            ? ['Point de passage', 'Temps', 'Classement', 'Évolution (vs arrivée)']
            : ['Point de passage', 'Temps', 'Classement'];
        const pColWidths = hasRankComparison
            ? [55, 35, 40, 40]
            : [70, 50, 50];

        function drawPassageTableHeader() {
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setDrawColor(75, 85, 99);
            doc.setLineWidth(0.4);

            let curX = margin;
            pHeaders.forEach((h, colIdx) => {
                doc.setFillColor(...primaryColor);
                doc.rect(curX, yPos, pColWidths[colIdx], 9, 'FD');
                doc.setTextColor(255, 255, 255);
                const tw = doc.getTextWidth(h);
                const tx = curX + (pColWidths[colIdx] - tw) / 2;
                doc.text(h, tx, yPos + 6);
                curX += pColWidths[colIdx];
            });
            yPos += 9;
        }

        drawPassageTableHeader();

        validPassagePoints.forEach((point, index) => {
            const kmRaw = point.km !== undefined && point.km !== null && String(point.km).trim() !== ''
                ? String(point.km).replace(',', '.').trim()
                : '';
            const kmVal = kmRaw ? parseFloat(kmRaw) : null;
            const kmText = Number.isFinite(kmVal) ? `${kmVal % 1 === 0 ? kmVal.toFixed(0) : kmVal.toFixed(2)} km` : '';
            let passageLocation = '';
            if (point.stage && kmText) {
                passageLocation = `${point.stage} (${kmText})`;
            } else if (point.stage) {
                passageLocation = String(point.stage);
            } else if (kmText) {
                passageLocation = kmText;
            } else {
                passageLocation = `Point ${index + 1}`;
            }

            const timeText = point.time && String(point.time).trim() ? String(point.time).trim() : '—';

            let rankText = '—';
            if (point.rank !== undefined && point.rank !== null && String(point.rank).trim() !== '') {
                const rVal = String(point.rank).trim();
                if (race.rankTotal && String(race.rankTotal).trim() !== '') {
                    rankText = `${rVal}e / ${String(race.rankTotal).trim()}`;
                } else {
                    rankText = `${rVal}e`;
                }
            }

            const pRank = Number.parseInt(point.rank, 10);
            let evolText = '—';
            let evolColor = textColor;
            if (hasRankComparison) {
                if (Number.isFinite(pRank) && pRank > 0 && Number.isFinite(finalRank) && finalRank > 0) {
                    const diff = pRank - finalRank;
                    if (diff > 0) {
                        evolText = `+${diff} pl. (gagnée${diff > 1 ? 's' : ''})`;
                        evolColor = [22, 101, 52];
                    } else if (diff < 0) {
                        evolText = `-${Math.abs(diff)} pl. (perdue${Math.abs(diff) > 1 ? 's' : ''})`;
                        evolColor = [185, 28, 28];
                    } else {
                        evolText = '= (inchangé)';
                        evolColor = textColor;
                    }
                }
            }

            const cellTexts = hasRankComparison
                ? [passageLocation, timeText, rankText, evolText]
                : [passageLocation, timeText, rankText];

            const cellLines = [];
            const cellLinesCount = [];
            pColWidths.forEach((w, cIdx) => {
                doc.setFont(undefined, 'normal');
                doc.setFontSize(9.5);
                const lines = doc.splitTextToSize(cellTexts[cIdx], w - 4);
                cellLines.push(lines);
                cellLinesCount.push(lines.length);
            });

            const maxLines = Math.max(...cellLinesCount);
            const rowHeight = Math.max(8, maxLines * 4.5 + 4);

            if (yPos + rowHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
                drawPassageTableHeader();
            }

            const bg = index % 2 === 0 ? [240, 253, 244] : [255, 255, 255];
            let curX = margin;
            pColWidths.forEach((w, cIdx) => {
                doc.setFillColor(...bg);
                doc.setDrawColor(75, 85, 99);
                doc.setLineWidth(0.4);
                doc.rect(curX, yPos, w, rowHeight, 'FD');

                if (hasRankComparison && cIdx === 3) {
                    doc.setTextColor(...evolColor);
                    doc.setFont(undefined, 'bold');
                } else if (cIdx === 0) {
                    doc.setTextColor(...textColor);
                    doc.setFont(undefined, 'bold');
                } else {
                    doc.setTextColor(...textColor);
                    doc.setFont(undefined, 'normal');
                }
                doc.setFontSize(9.5);

                const lines = cellLines[cIdx];
                let textY = yPos + (rowHeight - (lines.length - 1) * 4.5) / 2 + 1.0;
                lines.forEach(line => {
                    const tw = doc.getTextWidth(line);
                    const tx = curX + (w - tw) / 2;
                    doc.text(line, tx, textY);
                    textY += 4.5;
                });

                curX += w;
            });

            yPos += rowHeight;
        });

        yPos += 10;
    }

    // Badges (si authentifié et présents)

    if (typeof window.isAuthenticated === 'function' && window.isAuthenticated() && window.raceBadges && window.raceBadges[race.id]) {
        const badgeKeys = Object.keys(window.raceBadges[race.id]);
        if (badgeKeys.length > 0) {
            const badgeNames = badgeKeys.map(key => {
                if (typeof window.getBadgeInfo === 'function') {
                    const info = window.getBadgeInfo(key);
                    if (info) return `${info.levelEmoji || ''} ${info.name}`.trim();
                }
                return key;
            });

            doc.setFont(undefined, 'bold');
            doc.text('Badges :', margin, yPos);
            const labelWidth = doc.getTextWidth('Badges : ');
            doc.setFont(undefined, 'normal');
            doc.text(badgeNames.join(', '), margin + labelWidth, yPos);
            yPos += 10; // Un peu plus d'espace après les badges
        }
    }

    // Notes
    if (race.notes && race.notes.trim() !== '') {
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');

        let notesTitle = 'Notes';
        if (race.terrain) {
            const terrainFormatted = race.terrain.charAt(0).toUpperCase() + race.terrain.slice(1);
            notesTitle = `Note de la course (${terrainFormatted})`;
        }

        doc.text(notesTitle, margin, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.setFont(undefined, 'normal');

        // Extract plain text from HTML and preserve line breaks
        let html = race.notes;
        // Replace <br> with a unique placeholder
        html = html.replace(/<br\s*[\/]?>/gi, '___NEWLINE_PLACEHOLDER___');
        // Replace block closing tags with the same unique placeholder
        html = html.replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>|<\/ol>|<\/ul>/gi, '___NEWLINE_PLACEHOLDER___');

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        let cleanNotes = tempDiv.textContent || tempDiv.innerText || '';

        // Replace placeholders with newlines
        cleanNotes = cleanNotes.replace(/___NEWLINE_PLACEHOLDER___/g, '\n');
        // Normalize 3 or more consecutive newlines to exactly 2 newlines (1 empty line) to avoid excessive spaces
        cleanNotes = cleanNotes.replace(/\n{3,}/g, '\n\n');
        // Trim leading/trailing newlines
        cleanNotes = cleanNotes.trim();

        // Gérer le texte long avec retour à la ligne
        const notesLines = doc.splitTextToSize(cleanNotes, pageWidth - 2 * margin);
        notesLines.forEach(line => {
            if (yPos > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += 7;
        });
        yPos += 5;
    }

    // Liens
    const links = [];
    if (race.website) links.push(['Site web', race.website]);
    if (race.resultUrl) links.push(['Résultats en ligne', race.resultUrl]);
    if (race.gpxUrl) links.push(['Fichier GPX', race.gpxUrl]);

    if (links.length > 0) {
        if (yPos > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            yPos = margin;
        }
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text('Liens', margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(37, 99, 235); // Bleu
        doc.setFont(undefined, 'normal');
        links.forEach(([label, url]) => {
            doc.textWithLink(`${label} : ${url}`, margin, yPos, { url: url });
            yPos += 7;
        });
    }

    // Fonction pour charger une image
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));

            // Si c'est une data URL, on peut la charger directement
            if (src.startsWith('data:')) {
                img.src = src;
            } else {
                // Pour les URLs externes, on peut avoir des problèmes CORS
                // On essaie quand même
                img.src = src;
            }
        });
    }

    // Images (photo et parcours)
    const imagesToAdd = [];
    if (race.photo) imagesToAdd.push({ src: race.photo, label: 'Photo de la course' });
    if (race.parcours) imagesToAdd.push({ src: race.parcours, label: 'Parcours' });

    // Charger et ajouter les images
    if (imagesToAdd.length > 0) {
        for (const { src, label } of imagesToAdd) {
            try {
                if (yPos > doc.internal.pageSize.getHeight() - 100) {
                    doc.addPage();
                    yPos = margin;
                }

                doc.setFontSize(12);
                doc.setTextColor(...primaryColor);
                doc.setFont(undefined, 'bold');
                doc.text(label, margin, yPos);
                yPos += 8;

                // Charger l'image de manière asynchrone
                try {
                    const img = await loadImage(src);

                    // Calculer les dimensions de l'image pour qu'elle s'adapte à la largeur de la page
                    const maxWidth = pageWidth - 2 * margin;
                    const maxHeight = doc.internal.pageSize.getHeight() - yPos - margin - 20;

                    let imgWidth = img.width;
                    let imgHeight = img.height;

                    // Redimensionner si nécessaire
                    if (imgWidth > maxWidth) {
                        const ratio = maxWidth / imgWidth;
                        imgWidth = maxWidth;
                        imgHeight = imgHeight * ratio;
                    }

                    if (imgHeight > maxHeight) {
                        const ratio = maxHeight / imgHeight;
                        imgHeight = maxHeight;
                        imgWidth = imgWidth * ratio;
                    }

                    // Vérifier si on a besoin d'une nouvelle page
                    if (yPos + imgHeight > doc.internal.pageSize.getHeight() - margin) {
                        doc.addPage();
                        yPos = margin;
                        // Recalculer si nécessaire après changement de page
                        if (imgHeight > doc.internal.pageSize.getHeight() - 2 * margin) {
                            const ratio = (doc.internal.pageSize.getHeight() - 2 * margin) / imgHeight;
                            imgHeight = imgHeight * ratio;
                            imgWidth = imgWidth * ratio;
                        }
                    }

                    // Ajouter l'image au PDF
                    doc.addImage(img, 'JPEG', margin, yPos, imgWidth, imgHeight);
                    yPos += imgHeight + 10;

                } catch (imgError) {
                    // Si l'image ne peut pas être chargée (problème CORS par exemple)
                    doc.setFontSize(10);
                    doc.setTextColor(220, 38, 38); // Rouge
                    doc.setFont(undefined, 'normal');
                    doc.text('(Image non disponible - problème de chargement)', margin, yPos);
                    yPos += 7;
                }
            } catch (error) {
                doc.setFontSize(10);
                doc.setTextColor(220, 38, 38);
                doc.setFont(undefined, 'normal');
                doc.text('(Erreur lors du chargement de l\'image)', margin, yPos);
                yPos += 7;
            }
        }
    }

    // Générer le nom du fichier unique (avec horodatage HHMMSS pour unicité dans la même minute)
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const datePart = raceDate.toISOString().split('T')[0];
    const safeRaceName = race.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `course_${safeRaceName}_${datePart}_${timestamp}.pdf`;

    // Sauvegarder le PDF directement pour forcer le nom de téléchargement unique
    doc.setProperties({ title: fileName });
    doc.save(fileName);
    saveUserFlag('pdfDownloaded');
}

// Exposer la fonction globalement
window.generateRacePdf = generateRacePdf;

// ====================================================================
// TÉLÉCHARGEMENT UNIQUEMENT DU TABLEAU DES RELAIS DÉTAILLÉ
// ====================================================================
async function generateRelayTableOnlyPdf(raceId) {
    const races = window.races;
    if (!races || races.length === 0) {
        console.error('Aucune course disponible');
        return;
    }

    const race = races.find(r => r.id === raceId);
    if (!race || !race.relayLaps || race.relayLaps.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    const primaryColor = [34, 139, 34]; // Vert
    const textColor = [55, 65, 81]; // Gris foncé

    // Titre principal
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text(`Détails des Relais - ${race.name}`, margin, yPos);
    yPos += 7;

    // Date et infos générales
    const raceDate = new Date(race.date);
    const formattedDate = raceDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).replace(/^[a-z]/, c => c.toUpperCase());

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont(undefined, 'normal');
    
    // Calculs totaux
    let totalRelayDist = 0, totalRelayElev = 0, totalRelayElevNeg = 0, totalRelayTimeS = 0;
    race.relayLaps.forEach(lap => {
        totalRelayDist += parseFloat(lap.dist) || 0;
        totalRelayElev += parseInt(lap.elev) || 0;
        totalRelayElevNeg += parseInt(lap.elevNeg) || 0;
        totalRelayTimeS += parseTimeToSeconds(lap.time);
    });

    const hasStartHour = !!race.hour && race.relayLaps.every(lap => lap.time && lap.time.trim() !== '');

    let infoStr = `Date : ${formattedDate} | Distance totale : ${totalRelayDist.toFixed(2)} km | D+ : ${totalRelayElev}m | D- : ${totalRelayElevNeg}m | Temps total : ${secondsToTime(totalRelayTimeS)}`;
    if (race.hour) {
        infoStr += ` | Heure de départ : ${race.hour}`;
    }
    doc.text(infoStr, margin, yPos);
    yPos += 10;

    // Colonnes
    const headers = ['N°', 'Relayeur', 'Km', 'Dénivelé (m)', 'Temps', 'Départ', 'Arrivée', 'Commentaires'];
    const colWidths = [10, 35, 26, 26, 22, 24, 24, 100];

    function drawTableHeader() {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setDrawColor(75, 85, 99);
        doc.setLineWidth(0.4);

        let currentX = margin;
        headers.forEach((header, colIdx) => {
            doc.setFillColor(...primaryColor);
            doc.rect(currentX, yPos, colWidths[colIdx], 9, 'FD');
            doc.setTextColor(255, 255, 255);
            const textWidth = doc.getTextWidth(header);
            const textX = currentX + (colWidths[colIdx] - textWidth) / 2;
            doc.text(header, textX, yPos + 6);
            currentX += colWidths[colIdx];
        });
        yPos += 9;
    }

    drawTableHeader();

    // Remplissage du tableau
    let cumulativePdfSeconds = 0;
    const currentUserPseudo = window.currentUserPseudo || 'Moi';

    race.relayLaps.forEach((lap, i) => {
        const isMoi = lap.runner === 'Moi' || !lap.runner;
        const runnerLabel = lap.runner === 'Tous ensemble' ? 'Tous ens.' : (isMoi ? currentUserPseudo : (lap.runner === 'Personne' ? '-' : lap.runner));
        const distStr = lap.dist ? `${parseFloat(lap.dist).toFixed(2)} km` : '—';
        
        const dp = lap.elev ? `+${lap.elev}m` : '';
        const dn = lap.elevNeg ? `-${lap.elevNeg}m` : '';
        const elevStr = [dp, dn].filter(Boolean).join(' ') || '—';

        const lapTime = lap.time || '—';
        const lapSec = parseTimeToSeconds(lap.time);
        
        const departureStr = hasStartHour ? addTimeToHourPdf(race.hour, cumulativePdfSeconds) : '—';
        cumulativePdfSeconds += lapSec;
        const arrivalStr = hasStartHour ? addTimeToHourPdf(race.hour, cumulativePdfSeconds) : '—';
        
        const commentStr = lap.comment || '';

        // Préparer les textes des cellules
        const cellTexts = [
            `${i + 1}`,
            runnerLabel,
            distStr,
            elevStr,
            lapTime,
            departureStr,
            arrivalStr,
            commentStr
        ];

        // Calculer les lignes pour chaque cellule (wrap)
        const cellLines = [];
        const cellLinesCount = [];
        colWidths.forEach((width, colIdx) => {
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            const lines = doc.splitTextToSize(cellTexts[colIdx], width - 4);
            cellLines.push(lines);
            cellLinesCount.push(lines.length);
        });

        // Hauteur de la ligne
        const maxLines = Math.max(...cellLinesCount);
        const rowHeight = Math.max(8, maxLines * 4.5 + 4);

        // Page break check
        if (yPos + rowHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            drawTableHeader();
        }

        // Alternance de couleur de fond
        const bg = i % 2 === 0 ? [240, 253, 244] : [255, 255, 255];

        let currentX = margin;
        colWidths.forEach((width, colIdx) => {
            doc.setFillColor(...bg);
            doc.setDrawColor(75, 85, 99);
            doc.setLineWidth(0.4);
            doc.rect(currentX, yPos, width, rowHeight, 'FD');

            doc.setTextColor(55, 65, 81);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);

            const lines = cellLines[colIdx];
            let textY = yPos + (rowHeight - (lines.length - 1) * 4.5) / 2 + 1.0;
            lines.forEach(line => {
                const textWidth = doc.getTextWidth(line);
                const textX = currentX + (width - textWidth) / 2;
                doc.text(line, textX, textY);
                textY += 4.5;
            });

            currentX += width;
        });

        yPos += rowHeight;
    });

    // Ligne des totaux
    const totalRowHeight = 9;
    if (yPos + totalRowHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        drawTableHeader();
    }

    let currentX = margin;
    colWidths.forEach((width, colIdx) => {
        doc.setFillColor(220, 252, 231);
        doc.setDrawColor(75, 85, 99);
        doc.setLineWidth(0.4);
        doc.rect(currentX, yPos, width, totalRowHeight, 'FD');

        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(9);

        let totalText = '';
        if (colIdx === 0) {
            totalText = 'Total';
        } else if (colIdx === 1) {
            totalText = '-';
        } else if (colIdx === 2) {
            totalText = `${totalRelayDist.toFixed(2)} km`;
        } else if (colIdx === 3) {
            const dp = totalRelayElev > 0 ? `+${totalRelayElev}m` : '';
            const dn = totalRelayElevNeg > 0 ? `-${totalRelayElevNeg}m` : '';
            totalText = [dp, dn].filter(Boolean).join(' ') || '—';
        } else if (colIdx === 4) {
            totalText = secondsToTime(totalRelayTimeS);
        } else if (colIdx === 5 || colIdx === 6 || colIdx === 7) {
            totalText = '-';
        }

        if (totalText) {
            const textWidth = doc.getTextWidth(totalText);
            const textX = currentX + (width - textWidth) / 2;
            doc.text(totalText, textX, yPos + 6);
        }

        currentX += width;
    });

    // Calcul des statistiques individuelles et par coéquipier pour les cartes
    let userRelayDist = 0, userRelayElev = 0, userRelayElevNeg = 0, userRelayTimeS = 0;
    let userRelayCount = 0;
    let userRelayLaps = [];

    race.relayLaps.forEach((lap, idx) => {
        const d = parseFloat(lap.dist) || 0;
        const e = parseInt(lap.elev) || 0;
        const en = parseInt(lap.elevNeg) || 0;
        const s = parseTimeToSeconds(lap.time);

        if (lap.runner === 'Moi' || !lap.runner || lap.runner === 'Tous ensemble') {
            userRelayDist += d;
            userRelayElev += e;
            userRelayElevNeg += en;
            userRelayTimeS += s;
            userRelayCount++;
            userRelayLaps.push(idx + 1);
        }
    });

    const teammateNames = [...new Set(
        race.relayLaps
            .map(l => l.runner)
            .filter(r => r && r !== 'Moi' && r !== 'Tous ensemble' && r !== 'Personne')
    )];

    const teammateStats = {};
    teammateNames.forEach(name => {
        teammateStats[name] = { dist: 0, elev: 0, elevNeg: 0, timeS: 0, count: 0, laps: [] };
    });

    race.relayLaps.forEach((lap, idx) => {
        const isTousEnsemble = lap.runner === 'Tous ensemble';
        const targets = isTousEnsemble ? teammateNames : (lap.runner && lap.runner !== 'Moi' && lap.runner !== 'Personne' ? [lap.runner] : []);
        const d = parseFloat(lap.dist) || 0;
        const e = parseInt(lap.elev) || 0;
        const en = parseInt(lap.elevNeg) || 0;
        const s = parseTimeToSeconds(lap.time);
        targets.forEach(name => {
            if (teammateStats[name]) {
                teammateStats[name].dist += d;
                teammateStats[name].elev += e;
                teammateStats[name].elevNeg += en;
                teammateStats[name].timeS += s;
                teammateStats[name].count++;
                teammateStats[name].laps.push(idx + 1);
            }
        });
    });

    // Configuration des couleurs pour les cartes
    const ownerColors = {
        bg: [239, 246, 255],      // bg-blue-50
        border: [191, 219, 254],  // border-blue-200
        title: [30, 58, 138],     // text-blue-800
        sub: [37, 99, 235],       // text-blue-600
        badgeBg: [219, 234, 254], // bg-blue-100
        badgeText: [30, 58, 138]  // text-blue-800
    };

    const teammateColorsList = [
        { bg: [255, 247, 237], border: [254, 215, 170], title: [154, 52, 18], sub: [234, 88, 12], badgeBg: [254, 215, 170], badgeText: [154, 52, 18] }, // Orange
        { bg: [245, 243, 255], border: [233, 213, 252], title: [91, 33, 182], sub: [124, 58, 237], badgeBg: [233, 213, 252], badgeText: [91, 33, 182] }, // Violet
        { bg: [255, 241, 242], border: [254, 205, 211], title: [159, 18, 57], sub: [225, 29, 72], badgeBg: [254, 205, 211], badgeText: [159, 18, 57] }, // Rose
        { bg: [240, 253, 240], border: [204, 251, 241], title: [19, 78, 74], sub: [13, 148, 136], badgeBg: [204, 251, 241], badgeText: [19, 78, 74] }, // Teal
        { bg: [254, 252, 232], border: [254, 240, 138], title: [120, 53, 4], sub: [217, 119, 6], badgeBg: [254, 240, 138], badgeText: [120, 53, 4] }, // Amber
        { bg: [236, 254, 255], border: [207, 250, 254], title: [21, 94, 117], sub: [8, 145, 178], badgeBg: [207, 250, 254], badgeText: [21, 94, 117] }  // Cyan
    ];

    function calculateLapPace(dist, seconds) {
        if (!dist || !seconds || dist <= 0) return '-';
        const speed = dist / (seconds / 3600);
        if (speed <= 0) return '-';
        const timePerKm = 60 / speed;
        return `${timePerKm.toFixed(2)} min/km`;
    }

    function drawCard(xPos, yCardPos, title, badgeLabel, dist, elev, elevNeg, timeS, count, laps, colors, cardWidth, cardHeight, footerLines, fontSize, lineHeight) {
        doc.setFillColor(...colors.bg);
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.4);
        doc.roundedRect(xPos, yCardPos, cardWidth, cardHeight, 3, 3, 'FD');

        doc.setFont(undefined, 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...colors.title);
        doc.text(title, xPos + 6, yCardPos + 7);

        doc.setFont(undefined, 'bold');
        doc.setFontSize(7.5);
        const badgeTextWidth = doc.getTextWidth(badgeLabel);
        const badgeWidth = badgeTextWidth + 4;
        const badgeHeight = 4.5;
        const badgeX = xPos + cardWidth - badgeWidth - 6;
        const badgeY = yCardPos + 3.5;

        doc.setFillColor(...colors.badgeBg);
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
        doc.setTextColor(...colors.badgeText);
        doc.text(badgeLabel, badgeX + 2, badgeY + 3.4);

        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.2);
        doc.line(xPos + 6, yCardPos + 10.5, xPos + cardWidth - 6, yCardPos + 10.5);

        const stats = [
            { label: 'DISTANCE', value: `${dist.toFixed(2)} km` },
            { label: 'DÉNIVELÉ', value: `+${elev}m -${elevNeg}m` },
            { label: 'TEMPS', value: secondsToTime(timeS) },
            { label: 'ALLURE', value: calculateLapPace(dist, timeS) }
        ];

        const colWidth = (cardWidth - 12) / 4;
        stats.forEach((stat, i) => {
            const colX = xPos + 6 + i * colWidth + colWidth / 2;

            doc.setFont(undefined, 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...colors.sub);
            doc.text(stat.label, colX, yCardPos + 15.5, { align: 'center' });

            doc.setFont(undefined, 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(...colors.title);
            doc.text(stat.value, colX, yCardPos + 21, { align: 'center' });
        });

        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.2);
        doc.line(xPos + 6, yCardPos + 24.5, xPos + cardWidth - 6, yCardPos + 24.5);

        // Draw Footer (avec retour à la ligne automatique et centrage vertical si carte étirée)
        doc.setFont(undefined, 'bold');
        doc.setFontSize(fontSize);
        doc.setTextColor(...colors.title);

        const linesCount = footerLines.length;
        const textBlockHeight = Math.max(0, linesCount - 1) * lineHeight;
        const extraSpace = (cardHeight - 24.5) - (9.5 + textBlockHeight);
        const startY = yCardPos + 29.5 + Math.max(0, extraSpace / 2);

        footerLines.forEach((line, lIdx) => {
            doc.text(line, xPos + cardWidth / 2, startY + lIdx * lineHeight, { align: 'center' });
        });
    }

    // Titre de la section performances
    yPos += totalRowHeight + 10;
    if (yPos > pageHeight - 55) {
        doc.addPage();
        yPos = margin;
    }

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('Performances des Participants', margin, yPos);
    yPos += 8;

    const participants = [
        {
            title: currentUserPseudo,
            badgeLabel: 'INDIVIDUEL',
            dist: userRelayDist,
            elev: userRelayElev,
            elevNeg: userRelayElevNeg,
            timeS: userRelayTimeS,
            count: userRelayCount,
            laps: userRelayLaps,
            colors: ownerColors
        }
    ];

    teammateNames.forEach((name, idx) => {
        const st = teammateStats[name];
        const colors = teammateColorsList[idx % teammateColorsList.length];
        participants.push({
            title: name,
            badgeLabel: 'COÉQUIPIER',
            dist: st.dist,
            elev: st.elev,
            elevNeg: st.elevNeg,
            timeS: st.timeS,
            count: st.count,
            laps: st.laps,
            colors: colors
        });
    });

    const gap = 4;
    const cardWidth = (pageWidth - 2 * margin - gap) / 2;
    const maxTextWidth = cardWidth - 14;

    // Pré-calculer les lignes du footer et la hauteur requise pour chaque participant
    participants.forEach(p => {
        const lapsList = Array.isArray(p.laps) ? p.laps : [];
        const footerText = lapsList.length > 0
            ? `${p.count} relais effectué${p.count > 1 ? 's' : ''} (${lapsList.join(', ')})`
            : `${p.count} relais effectué${p.count > 1 ? 's' : ''}`;

        const fontSize = lapsList.length > 25 ? 7.5 : 8;
        const lineHeight = fontSize === 7.5 ? 3.2 : 3.5;

        doc.setFont(undefined, 'bold');
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(footerText, maxTextWidth);

        p.footerLines = Array.isArray(lines) ? lines : [lines];
        if (p.footerLines.length === 0) p.footerLines = [footerText];
        p.fontSize = fontSize;
        p.lineHeight = lineHeight;
        p.neededHeight = 34 + Math.max(0, p.footerLines.length - 1) * lineHeight;
    });

    // Découpage et affichage en rangées de 2 participants
    for (let i = 0; i < participants.length; i += 2) {
        const row = participants.slice(i, i + 2);
        const rowHeight = Math.max(...row.map(p => p.neededHeight));

        if (yPos + rowHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }

        const isSingleLast = row.length === 1 && (i + 1 === participants.length);
        row.forEach((p, col) => {
            let xPos;
            if (isSingleLast) {
                // Centrer le dernier participant s'il est seul sur sa ligne
                const availableWidth = pageWidth - 2 * margin;
                xPos = margin + (availableWidth - cardWidth) / 2;
            } else {
                xPos = margin + col * (cardWidth + gap);
            }

            drawCard(xPos, yPos, p.title, p.badgeLabel, p.dist, p.elev, p.elevNeg, p.timeS, p.count, p.laps, p.colors, cardWidth, rowHeight, p.footerLines, p.fontSize, p.lineHeight);
        });

        yPos += rowHeight + gap;
    }

    function parseTimeToSeconds(timeStr) {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
        }
        if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
        return parseInt(timeStr, 10) || 0;
    }

    function secondsToTime(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    }

    function addTimeToHourPdf(startHour, elapsedSeconds) {
        if (!startHour) return '';
        const parts = startHour.split(':').map(Number);
        const sh = parts[0] || 0;
        const sm = parts[1] || 0;
        const totalSec = sh * 3600 + sm * 60 + Math.round(elapsedSeconds);
        const h = Math.floor(totalSec / 3600) % 24;
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    // Générer le nom du fichier unique (avec horodatage HHMMSS pour unicité dans la même minute)
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const datePart = raceDate.toISOString().split('T')[0];
    const safeRaceName = race.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `relais_${safeRaceName}_${datePart}_${timestamp}.pdf`;

    // Sauvegarder le PDF directement pour forcer le nom de téléchargement unique
    doc.setProperties({ title: fileName });
    doc.save(fileName);
    saveUserFlag('relayPdfExported');
}

window.generateRelayTableOnlyPdf = generateRelayTableOnlyPdf;
