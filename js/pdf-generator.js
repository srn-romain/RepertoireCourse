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
    if (firebase.auth().currentUser && firebase.auth().currentUser.email) {
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

    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.setFont(undefined, 'normal');

    const info = [
        ['Distance', `${race.distance} km`],
        ['Temps', race.time || 'Non renseigné']
    ];

    // Dénivelé positif D+
    if (race.elevation !== undefined && race.elevation !== null && race.elevation !== '') {
        info.splice(1, 0, ['Dénivelé +', `${race.elevation} m D+`]);
    }

    // Dénivelé négatif D-
    if (race.elevationNeg !== undefined && race.elevationNeg !== null && race.elevationNeg !== '') {
        const dPlusIdx = info.findIndex(([l]) => l === 'Dénivelé +');
        info.splice(dPlusIdx >= 0 ? dPlusIdx + 1 : 1, 0, ['Dénivelé -', `${race.elevationNeg} m D-`]);
    }

    if (race.terrain) {
        const terrainFormatted = race.terrain.charAt(0).toUpperCase() + race.terrain.slice(1);
        info.push(['Terrain', terrainFormatted]);
    }

    if (race.price !== undefined && race.price !== null && race.price !== '') {
        info.push(['Prix', `${parseFloat(race.price).toFixed(2)} €`]);
    }

    // Statut à venir — affiché comme information neutre
    if (isUpcoming) {
        info.push(['Statut', 'Course à venir']);
    }

    info.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label} : `, margin, yPos);
        const labelWidth = doc.getTextWidth(`${label} : `);
        doc.setFont(undefined, 'normal');
        doc.text(value, margin + labelWidth, yPos);
        yPos += 7;
    });

    // Lieu avec lien Google Maps intégré
    if (race.location) {
        doc.setFont(undefined, 'bold');
        doc.text('Lieu : ', margin, yPos);
        const labelWidth = doc.getTextWidth('Lieu : ');
        doc.setFont(undefined, 'normal');
        // Le nom du lieu est directement un lien cliquable vers Google Maps
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(race.location)}`;
        doc.setTextColor(37, 99, 235); // Bleu pour indiquer que c'est un lien
        doc.textWithLink(race.location, margin + labelWidth, yPos, { url: googleMapsUrl });
        doc.setTextColor(...textColor); // Remettre la couleur normale
        yPos += 7;
    } else {
        doc.setFont(undefined, 'bold');
        doc.text('Lieu : ', margin, yPos);
        const labelWidth = doc.getTextWidth('Lieu : ');
        doc.setFont(undefined, 'normal');
        doc.text('Non renseigné', margin + labelWidth, yPos);
        yPos += 7;
    }

    // Vitesse moyenne si temps et distance disponibles
    if (race.time && race.distance) {
        const distance = parseFloat(race.distance);
        const timeStr = race.time;
        if (!isNaN(distance) && timeStr) {
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
                const speed = distance / hours;
                const timePerKm = 60 / speed;
                yPos += 3;
                doc.setFont(undefined, 'bold');
                doc.text('Statistiques :', margin, yPos);
                yPos += 7;
                doc.setFont(undefined, 'normal');
                doc.text(`Vitesse moyenne : ${speed.toFixed(2)} km/h`, margin + 5, yPos);
                yPos += 7;
                doc.text(`Temps moyen au km : ${timePerKm.toFixed(2)} min/km`, margin + 5, yPos);
                yPos += 5;
            }
        }
    }

    yPos += 5;

    // ─── SECTION TRIATHLON (solo uniquement) ──────────────────────────────────
    if (race.terrain === 'triathlon' && race.raceFormat !== 'team') {
        const hasSwim = race.swimTime || race.swimDistance;
        const hasBike = race.bikeTime || race.bikeDistance;
        const hasRun = race.runTime || race.distance;

        if (hasSwim || hasBike || hasRun) {
            if (yPos > doc.internal.pageSize.getHeight() - 50) {
                doc.addPage();
                yPos = margin;
            }

            doc.setFontSize(14);
            doc.setTextColor(...primaryColor);
            doc.setFont(undefined, 'bold');
            doc.text('Détails Triathlon', margin, yPos);
            yPos += 8;

            // En-têtes du tableau triathlon
            const triCols = [margin, margin + 55, margin + 95, margin + 135];
            doc.setFontSize(9);
            doc.setFillColor(34, 139, 34);
            doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.text('Sport', triCols[0] + 1, yPos);
            doc.text('Distance', triCols[1], yPos);
            doc.text('Temps', triCols[2], yPos);
            doc.text('Élévation', triCols[3], yPos);
            yPos += 7;

            doc.setFont(undefined, 'normal');
            const triRows = [
                {
                    label: 'Natation',
                    dist: race.swimDistance ? (parseFloat(race.swimDistance) > 999
                        ? `${(parseFloat(race.swimDistance) / 1000).toFixed(2)} km`
                        : `${race.swimDistance} m`) : '—',
                    time: race.swimTime || '—',
                    elev: '—'
                },
                {
                    label: 'Velo',
                    dist: race.bikeDistance ? `${race.bikeDistance} km` : '—',
                    time: race.bikeTime || '—',
                    elev: (() => {
                        const p = race.bikeElevation ? `D+ ${race.bikeElevation}m` : '';
                        const n = race.bikeElevationNeg ? `D- ${race.bikeElevationNeg}m` : '';
                        return [p, n].filter(Boolean).join(' / ') || '—';
                    })()
                },
                {
                    label: 'Course a pied',
                    dist: race.distance ? `${race.distance} km` : '—',
                    time: race.runTime || race.time || '—',
                    elev: (() => {
                        const p = race.elevation ? `D+ ${race.elevation}m` : '';
                        const n = race.elevationNeg ? `D- ${race.elevationNeg}m` : '';
                        return [p, n].filter(Boolean).join(' / ') || '—';
                    })()
                }
            ];

            triRows.forEach((row, i) => {
                const bg = i % 2 === 0 ? [240, 255, 240] : [255, 255, 255];
                doc.setFillColor(...bg);
                doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
                doc.setTextColor(...textColor);
                doc.setFontSize(9);
                doc.text(row.label, triCols[0] + 1, yPos);
                doc.text(row.dist, triCols[1], yPos);
                doc.text(row.time, triCols[2], yPos);
                doc.text(row.elev, triCols[3], yPos);
                yPos += 7;
            });

            // Temps total triathlon
            if (race.time && race.time !== '00:00:00') {
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

        // Helper to parse HH:MM:SS to seconds
        function parseTimeToSeconds(timeStr) {
            if (!timeStr || !/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return 0;
            const [h, m, s] = timeStr.split(':').map(Number);
            return h * 3600 + m * 60 + s;
        }

        // Helper to format seconds to HH:MM:SS
        function formatSecondsToTime(totalSeconds) {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
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

        race.relayLaps.forEach(lap => {
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
            }
        });

        // Collect teammates
        const teammateNames = [...new Set(
            race.relayLaps
                .map(l => l.runner)
                .filter(r => r && r !== 'Moi' && r !== 'Tous ensemble')
        )];

        const teammateStats = {};
        teammateNames.forEach(name => {
            teammateStats[name] = { dist: 0, elev: 0, elevNeg: 0, timeS: 0, count: 0 };
        });

        race.relayLaps.forEach(lap => {
            const isTousEnsemble = lap.runner === 'Tous ensemble';
            const targets = isTousEnsemble ? teammateNames : (lap.runner && lap.runner !== 'Moi' ? [lap.runner] : []);
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
        function drawCard(title, badgeLabel, dist, elev, timeS, count, colors) {
            const cardHeight = 34;
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

            // Stats
            const stats = [
                { label: 'DISTANCE', value: `${dist.toFixed(2)} km` },
                { label: 'D+', value: `${elev} m` },
                { label: 'TEMPS', value: formatSecondsToTime(timeS) },
                { label: 'ALLURE', value: calculateLapPace(dist, timeS) }
            ];

            const colWidth = (cardWidth - 12) / 4;
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

            // Draw Footer Divider
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(0.2);
            doc.line(margin + 6, yPos + 24.5, margin + cardWidth - 6, yPos + 24.5);

            // Draw Footer
            doc.setFont(undefined, 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(...colors.title);
            const footerText = `${count} relais effectué${count > 1 ? 's' : ''}`;
            doc.text(footerText, margin + cardWidth / 2, yPos + 29.5, { align: 'center' });

            yPos += cardHeight + 6; // Move yPos down
        }

        // Draw Section Title for Performances
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.text('Performances des Participants', margin, yPos);
        yPos += 8;

        // Render Owner Card
        drawCard(`Ma performance (${currentUserPseudo})`, 'INDIVIDUEL', userRelayDist, userRelayElev, userRelayTimeS, userRelayCount, ownerColors);

        // Render Teammates Cards
        teammateNames.forEach((name, idx) => {
            const st = teammateStats[name];
            const colors = teammateColorsList[idx % teammateColorsList.length];
            drawCard(name, 'COÉQUIPIER', st.dist, st.elev, st.timeS, st.count, colors);
        });

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
            return s > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
        }

        // Colonnes : #, Coureur, Dist., D+, D-, Temps [, Départ, Arrivée]
        const relCols = hasStartHour
            ? [margin, margin + 10, margin + 30, margin + 60, margin + 80, margin + 104, margin + 128, margin + 158]
            : [margin, margin + 18, margin + 50, margin + 80, margin + 110, margin + 145];

        // En-tête
        doc.setFontSize(9);
        doc.setFillColor(34, 139, 34);
        doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('N°', relCols[0] + 1, yPos);
        doc.text('Coureur', relCols[1], yPos);
        doc.text('Dist. (km)', relCols[2], yPos);
        doc.text('D+ (m)', relCols[3], yPos);
        doc.text('D- (m)', relCols[4], yPos);
        doc.text('Temps', relCols[5], yPos);
        if (hasStartHour) {
            doc.text('Départ', relCols[6], yPos);
            doc.text('Arrivée', relCols[7], yPos);
        }
        yPos += 7;

        let totalDist = 0, totalElev = 0, totalElevNeg = 0;
        let cumulativePdfSeconds = 0;

        race.relayLaps.forEach((lap, i) => {
            if (yPos > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPos = margin;
            }
            const bg = i % 2 === 0 ? [240, 255, 240] : [255, 255, 255];
            doc.setFillColor(...bg);
            doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(...textColor);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);

            const dist = parseFloat(lap.dist) || 0;
            const elev = parseFloat(lap.elev) || 0;
            const elevNeg = parseFloat(lap.elevNeg) || 0;
            const lapSec = (() => {
                if (!lap.time) return 0;
                const parts = lap.time.split(':').map(Number);
                if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
                return 0;
            })();
            const departureStr = hasStartHour ? addTimeToHourPdf(race.hour, cumulativePdfSeconds) : null;
            cumulativePdfSeconds += lapSec;
            const arrivalStr = hasStartHour ? addTimeToHourPdf(race.hour, cumulativePdfSeconds) : null;
            totalDist += dist;
            totalElev += elev;
            totalElevNeg += elevNeg;

            const runnerLabel = lap.runner === 'Tous ensemble' ? 'Tous ens.' : ((lap.runner === 'Moi' || !lap.runner) ? currentUserPseudo : lap.runner);

            doc.text(`${i + 1}`, relCols[0] + 1, yPos);
            doc.text(runnerLabel, relCols[1], yPos);
            doc.text(dist > 0 ? dist.toFixed(2) : '—', relCols[2], yPos);
            doc.text(elev > 0 ? `${elev}` : '—', relCols[3], yPos);
            doc.text(elevNeg > 0 ? `${elevNeg}` : '—', relCols[4], yPos);
            doc.text(lap.time || '—', relCols[5], yPos);
            if (hasStartHour) {
                doc.text(departureStr, relCols[6], yPos);
                doc.text(arrivalStr, relCols[7], yPos);
            }
            yPos += 7;
        });

        // Ligne de totaux
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL', relCols[0] + 1, yPos);
        doc.text('', relCols[1], yPos);
        doc.text(totalDist > 0 ? totalDist.toFixed(2) : '—', relCols[2], yPos);
        doc.text(totalElev > 0 ? `${totalElev}` : '—', relCols[3], yPos);
        doc.text(totalElevNeg > 0 ? `${totalElevNeg}` : '—', relCols[4], yPos);
        doc.text(race.time || '—', relCols[5], yPos);
        if (hasStartHour) {
            doc.text(race.hour, relCols[6], yPos);
            doc.text(addTimeToHourPdf(race.hour, cumulativePdfSeconds), relCols[7], yPos);
        }
        yPos += 10;
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

    // Badges (si authentifié et présents)

    if (typeof window.isAuthenticated === 'function' && window.isAuthenticated() && window.raceBadges && window.raceBadges[race.id]) {
        const badgeKeys = Object.keys(window.raceBadges[race.id]);
        if (badgeKeys.length > 0) {
            const badgesInfoMap = {
                hasRPMile: "RP temps",
                hasMostExpensive: "Course la plus cher",
                hasMostElevation: "Course avec le plus de denivelé",
                hasLongestDistance: "Course la plus longue"
            };

            const badgeNames = badgeKeys.map(key => {
                return badgesInfoMap[key] || key;
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

    // Générer le nom du fichier
    const fileName = `${race.name.replace(/[^a-z0-9]/gi, '_')}_${raceDate.toISOString().split('T')[0]}.pdf`;

    // Sauvegarder le PDF (ou ouvrir dans un nouvel onglet)
    // doc.save(fileName); 
    window.open(doc.output('bloburl'), '_blank');
}

// Exposer la fonction globalement
window.generateRacePdf = generateRacePdf;
