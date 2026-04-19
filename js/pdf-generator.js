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
        const relCols = [margin, margin + 18, margin + 50, margin + 80, margin + 110, margin + 145];

        // En-tête
        doc.setFontSize(9);
        doc.setFillColor(34, 139, 34);
        doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text('N°', relCols[0] + 1, yPos);
        doc.text('Dist. (km)', relCols[1], yPos);
        doc.text('D+ (m)', relCols[2], yPos);
        doc.text('D- (m)', relCols[3], yPos);
        doc.text('Temps', relCols[4], yPos);
        yPos += 7;

        let totalDist = 0, totalElev = 0, totalElevNeg = 0;

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
            totalDist += dist;
            totalElev += elev;
            totalElevNeg += elevNeg;

            doc.text(`${i + 1}`, relCols[0] + 1, yPos);
            doc.text(dist > 0 ? dist.toFixed(2) : '—', relCols[1], yPos);
            doc.text(elev > 0 ? `${elev}` : '—', relCols[2], yPos);
            doc.text(elevNeg > 0 ? `${elevNeg}` : '—', relCols[3], yPos);
            doc.text(lap.time || '—', relCols[4], yPos);
            yPos += 7;
        });

        // Ligne de totaux
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL', relCols[0] + 1, yPos);
        doc.text(totalDist > 0 ? totalDist.toFixed(2) : '—', relCols[1], yPos);
        doc.text(totalElev > 0 ? `${totalElev}` : '—', relCols[2], yPos);
        doc.text(totalElevNeg > 0 ? `${totalElevNeg}` : '—', relCols[3], yPos);
        doc.text(race.time || '—', relCols[4], yPos);
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
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = race.notes.replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/p>|<\/div>/gi, '\n');
        const cleanNotes = tempDiv.textContent || tempDiv.innerText || '';

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
