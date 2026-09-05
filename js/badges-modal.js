/**
 * js/badges-modal.js
 * Système complet de Badges & Progression par Niveaux (10 Niveaux - 120 Missions - 10 000 XP)
 * (Tong, Sandale, Espadrille, Mocassin, Sneaker, Chaussure de route, Chaussure de trail, Boots, Rangers, Crampons)
 * + 3 Cocardes Records (RP Allure au km, Plus de dénivelé, Course la plus longue)
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. CONFIGURATION DES 10 NIVEAUX (12 missions/niveau - 10 000 XP max)
    // ─────────────────────────────────────────────────────────────────────────────
    const LEVELS_CONFIG = [
        {
            id: 'level_1',
            levelNumber: 1,
            name: 'Tong',
            emoji: '🩴',
            subtitle: 'Premières foulées',
            levelTotalXP: 480,
            requiredXP: 0,
            cocarde: {
                bg: 'bg-amber-100',
                text: 'text-amber-800',
                border: 'border-amber-300',
                pillBg: 'bg-amber-50 text-amber-800 border-amber-200',
                ribbonColor: '#d97706',
                accentText: 'text-amber-700'
            },
            badgeIds: [
                'exploration', 'profil_soigne', 'coup_de_coeur', 'projet_en_tete', 'lien_direct', 'dossard_fetiche',
                'trace_du_jour', 'chrono_note', 'faux_plat_montant', 'cinq_majeur', 'bapteme_km', 'premier_dossard'
            ]
        },
        {
            id: 'level_2',
            levelNumber: 2,
            name: 'Sandale',
            emoji: '👡',
            subtitle: 'Foulée aérée',
            levelTotalXP: 560,
            requiredXP: 350,
            cocarde: {
                bg: 'bg-sky-100',
                text: 'text-sky-800',
                border: 'border-sky-300',
                pillBg: 'bg-sky-50 text-sky-800 border-sky-200',
                ribbonColor: '#0284c7',
                accentText: 'text-sky-700'
            },
            badgeIds: [
                'a_ma_sauce', 'partage_communautaire', 'copains_dechappee', 'radin_malin', 'visuel_personnalise', 'projet_concretise',
                'compteur_lance', 'la_vingtaine', 'compteur_dplus_lance', 'chasseur_de_cotes', 'le_cap_des_10', 'aventurier_express'
            ]
        },
        {
            id: 'level_3',
            levelNumber: 3,
            name: 'Espadrille',
            emoji: '🥿',
            subtitle: 'Rythme & style',
            levelTotalXP: 660,
            requiredXP: 750,
            cocarde: {
                bg: 'bg-teal-100',
                text: 'text-teal-800',
                border: 'border-teal-300',
                pillBg: 'bg-teal-50 text-teal-800 border-teal-200',
                ribbonColor: '#0d9488',
                accentText: 'text-teal-700'
            },
            badgeIds: [
                'social_runner', 'memoire_de_course', 'rapport_propre', 'carnet_soigne', 'galerie_gpx', 'dossard_double',
                'fidele_du_bitume', 'club_des_50', 'mur_du_denivele', 'belle_bosse', 'le_15_bornes', 'allure_530'
            ]
        },
        {
            id: 'level_4',
            levelNumber: 4,
            name: 'Mocassin',
            emoji: '👞',
            subtitle: 'Coureur appliqué',
            levelTotalXP: 780,
            requiredXP: 1250,
            cocarde: {
                bg: 'bg-emerald-100',
                text: 'text-emerald-800',
                border: 'border-emerald-300',
                pillBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                ribbonColor: '#059669',
                accentText: 'text-emerald-700'
            },
            badgeIds: [
                'voix_du_coureur', 'action_groupee', 'bouton_express', 'bilan_officiel', 'dossier_drive', 'explorateur_local',
                'quotidien_actif', 'habitue_du_carnet', 'cap_des_100', 'chamois_des_collines', 'fleche_des_10k', 'demi_dieu'
            ]
        },
        {
            id: 'level_5',
            levelNumber: 5,
            name: 'Sneaker',
            emoji: '👟',
            subtitle: 'Athlète tout-terrain',
            levelTotalXP: 920,
            requiredXP: 1850,
            cocarde: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-300',
                pillBg: 'bg-blue-50 text-blue-800 border-blue-200',
                ribbonColor: '#2563eb',
                accentText: 'text-blue-700'
            },
            badgeIds: [
                'sauvegarde_externe', 'oeil_sur_les_chiffres', 'note_groupee', 'adepte_de_la_route', 'adepte_des_sentiers', 'passeur_de_temoin',
                'compteur_a_dix', 'objectif_3000_dplus', 'grand_volume', 'au_dela_du_semi', 'grimpeur_confirme', 'semi_solide'
            ]
        },
        {
            id: 'level_6',
            levelNumber: 6,
            name: 'Chaussure de route',
            emoji: '🏃',
            subtitle: 'Endurance confirmée',
            levelTotalXP: 1070,
            requiredXP: 2550,
            cocarde: {
                bg: 'bg-indigo-100',
                text: 'text-indigo-800',
                border: 'border-indigo-300',
                pillBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                ribbonColor: '#4f46e5',
                accentText: 'text-indigo-700'
            },
            badgeIds: [
                'wishlist_fournie', 'rapport_dequipe', 'fidele_de_la_wishlist', 'dossard_4_saisons', 'esprit_collectif', 'grand_total_courses',
                'quinze_au_compteur', 'double_centurion', 'le_cap_des_35', 'grosse_montee', 'vitesse_45', 'semi_express'
            ]
        },
        {
            id: 'level_7',
            levelNumber: 7,
            name: 'Chaussure de trail',
            emoji: '🌲',
            subtitle: 'Sentiers & nature',
            levelTotalXP: 1200,
            requiredXP: 3350,
            cocarde: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-300',
                pillBg: 'bg-green-50 text-green-800 border-green-200',
                ribbonColor: '#16a34a',
                accentText: 'text-green-700'
            },
            badgeIds: [
                'recherche_ciblee', 'reseau_de_compagnons', 'fiche_parfaite', 'grand_voyageur', 'specialiste_trail', 'discipline_hybride',
                'vingtieme_borne', 'le_cap_des_8000_dplus', 'les_300_bornes', 'le_cap_des_cimes', 'rythme_soutenu', 'le_mythe_du_42'
            ]
        },
        {
            id: 'level_8',
            levelNumber: 8,
            name: 'Boots',
            emoji: '🥾',
            subtitle: 'Légende des sentiers',
            levelTotalXP: 1340,
            requiredXP: 4250,
            cocarde: {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                border: 'border-purple-300',
                pillBg: 'bg-purple-50 text-purple-800 border-purple-200',
                ribbonColor: '#7c3aed',
                accentText: 'text-purple-700'
            },
            badgeIds: [
                'grand_chelem_annuel', 'explorateur_regional', 'traceur_regulier', 'pilier_dequipe', 'mois_intense', 'quart_de_cent',
                'le_cap_des_400', 'tete_de_peloton', 'entree_dans_lultra', 'haute_altitude', 'semi_de_feu', 'marathonien_confirme'
            ]
        },
        {
            id: 'level_9',
            levelNumber: 9,
            name: 'Rangers',
            emoji: '🪖',
            subtitle: 'Tout-terrain indestructible',
            levelTotalXP: 1540,
            requiredXP: 5300,
            cocarde: {
                bg: 'bg-rose-100',
                text: 'text-rose-800',
                border: 'border-rose-300',
                pillBg: 'bg-rose-50 text-rose-800 border-rose-200',
                ribbonColor: '#e11d48',
                accentText: 'text-rose-700'
            },
            badgeIds: [
                'dossier_centralise', 'triple_effort_confirme', 'passionne_des_sentiers', 'regularite_de_fer', 'grand_format_cumule', 'grand_volume_dplus',
                'trente_dossards', 'demi_millier', 'ultra_longue_distance', 'toit_des_montagnes', 'sous_les_40', 'marathon_sub_3h30'
            ]
        },
        {
            id: 'level_10',
            levelNumber: 10,
            name: 'Crampons',
            emoji: '🧗',
            subtitle: 'Sommet de l\'aventure',
            levelTotalXP: 1450,
            requiredXP: 6500,
            cocarde: {
                bg: 'bg-amber-200',
                text: 'text-amber-900',
                border: 'border-amber-400',
                pillBg: 'bg-amber-100 text-amber-900 border-amber-300',
                ribbonColor: '#b45309',
                accentText: 'text-amber-800'
            },
            badgeIds: [
                'collection_de_favoris', 'hors_frontieres', 'bibliotheque_vivante', 'marathonien_de_volume', 'sommet_de_denivele', 'le_demi_cent',
                'le_grand_millier', 'format_endurance_extreme', 'le_cap_des_100_ultra', 'reine_des_montees', 'semi_elite_amateur', 'marathon_sub_3h15'
            ]
        }
    ];

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. DICTIONNAIRE DÉTAILLÉ DES 120 MISSIONS
    // ─────────────────────────────────────────────────────────────────────────────
    const BADGES_DEFINITIONS = {
        // === NIVEAU 1 : TONG (480 XP) ===
        exploration: {
            id: 'exploration',
            level: 1,
            xp: 15,
            name: 'Exploration',
            icon: 'fa-compass',
            description: 'Lancer et terminer le tutoriel interactif du site.'
        },
        profil_soigne: {
            id: 'profil_soigne',
            level: 1,
            xp: 15,
            name: 'Profil soigné',
            icon: 'fa-user-check',
            description: 'Renseigner un pseudo et importer une photo de profil.'
        },
        coup_de_coeur: {
            id: 'coup_de_coeur',
            level: 1,
            xp: 15,
            name: 'Coup de cœur',
            icon: 'fa-star',
            description: 'Marquer au moins 1 course comme favorite avec l\'étoile.'
        },
        projet_en_tete: {
            id: 'projet_en_tete',
            level: 1,
            xp: 20,
            name: 'Projet en tête',
            icon: 'fa-heart',
            description: 'Avoir au moins 1 future course enregistrée dans sa Wishlist.'
        },
        lien_direct: {
            id: 'lien_direct',
            level: 1,
            xp: 20,
            name: 'Lien direct',
            icon: 'fa-link',
            description: 'Renseigner l’URL du site officiel ou des résultats en ligne sur une fiche.'
        },
        dossard_fetiche: {
            id: 'dossard_fetiche',
            level: 1,
            xp: 25,
            name: 'Dossard fétiche',
            icon: 'fa-id-badge',
            description: 'Renseigner son numéro de dossard sur une première course.'
        },
        trace_du_jour: {
            id: 'trace_du_jour',
            level: 1,
            xp: 30,
            name: 'Trace du jour',
            icon: 'fa-file-lines',
            description: 'Associer un fichier GPX ou une photo à une course.'
        },
        chrono_note: {
            id: 'chrono_note',
            level: 1,
            xp: 30,
            name: 'Chrono noté',
            icon: 'fa-stopwatch',
            description: 'Renseigner son temps officiel sur au moins 1 course.'
        },
        faux_plat_montant: {
            id: 'faux_plat_montant',
            level: 1,
            xp: 40,
            name: 'Faux plat montant',
            icon: 'fa-mountain-sun',
            description: 'Enregistrer une course avec au moins 50 m de D+.'
        },
        cinq_majeur: {
            id: 'cinq_majeur',
            level: 1,
            xp: 60,
            name: 'Le 5 Majeur',
            icon: 'fa-person-running',
            description: 'Terminer une course d\'au moins 5 km.'
        },
        bapteme_km: {
            id: 'bapteme_km',
            level: 1,
            xp: 60,
            name: 'Baptême kilométrique',
            icon: 'fa-shoe-prints',
            description: 'Cumuler au moins 10 km au total sur le carnet.'
        },
        premier_dossard: {
            id: 'premier_dossard',
            level: 1,
            xp: 150,
            name: 'Premier dossard',
            icon: 'fa-flag-checkered',
            description: 'Enregistrer sa 1re course officielle sur le carnet.'
        },

        // === NIVEAU 2 : SANDALE (560 XP) ===
        a_ma_sauce: {
            id: 'a_ma_sauce',
            level: 2,
            xp: 20,
            name: 'À ma sauce',
            icon: 'fa-sliders',
            description: 'Personnaliser les tags ou les boutons rapides d\'action sur ses cartes.'
        },
        partage_communautaire: {
            id: 'partage_communautaire',
            level: 2,
            xp: 20,
            name: 'Partage communautaire',
            icon: 'fa-share-nodes',
            description: 'Activer le partage public sur au moins 1 course.'
        },
        copains_dechappee: {
            id: 'copains_dechappee',
            level: 2,
            xp: 25,
            name: 'Copains d\'échappée',
            icon: 'fa-users',
            description: 'Indiquer au moins 1 accompagnant sur une fiche de course.'
        },
        radin_malin: {
            id: 'radin_malin',
            level: 2,
            xp: 25,
            name: 'Radin malin',
            icon: 'fa-piggy-bank',
            description: 'Enregistrer 1 course avec un coût d\'inscription ≤ 0,80 €/km.'
        },
        visuel_personnalise: {
            id: 'visuel_personnalise',
            level: 2,
            xp: 30,
            name: 'Visuel personnalisé',
            icon: 'fa-image',
            description: 'Importer une photo personnelle (JPG/PNG) sur une fiche de course.'
        },
        projet_concretise: {
            id: 'projet_concretise',
            level: 2,
            xp: 40,
            name: 'Projet concrétisé',
            icon: 'fa-check-circle',
            description: 'Transformer 1 course de sa Wishlist en course réelle terminée.'
        },
        compteur_lance: {
            id: 'compteur_lance',
            level: 2,
            xp: 40,
            name: 'Compteur lancé',
            icon: 'fa-list-ol',
            description: 'Cumuler au moins 3 courses officielles terminées.'
        },
        la_vingtaine: {
            id: 'la_vingtaine',
            level: 2,
            xp: 40,
            name: 'La vingtaine',
            icon: 'fa-route',
            description: 'Cumuler au moins 25 km au total sur le carnet.'
        },
        compteur_dplus_lance: {
            id: 'compteur_dplus_lance',
            level: 2,
            xp: 50,
            name: 'Compteur D+ lancé',
            icon: 'fa-arrow-up-right-dots',
            description: 'Cumuler au moins 500 m de D+ au total sur le carnet.'
        },
        chasseur_de_cotes: {
            id: 'chasseur_de_cotes',
            level: 2,
            xp: 60,
            name: 'Chasseur de côtes',
            icon: 'fa-mountain',
            description: 'Terminer une course avec au moins 200 m de D+.'
        },
        le_cap_des_10: {
            id: 'le_cap_des_10',
            level: 2,
            xp: 80,
            name: 'Le cap des 10',
            icon: 'fa-medal',
            description: 'Terminer une course officielle d\'au moins 10 km.'
        },
        aventurier_express: {
            id: 'aventurier_express',
            level: 2,
            xp: 130,
            name: 'L\'aventurier express',
            icon: 'fa-bolt-lightning',
            description: 'Boucler un 10 km en moins de 1 h 00 (≤ 6:00/km).'
        },

        // === NIVEAU 3 : ESPADRILLE (660 XP) ===
        social_runner: {
            id: 'social_runner',
            level: 3,
            xp: 25,
            name: 'Social runner',
            icon: 'fa-thumbs-up',
            description: 'Donner un « J\'aime » sur la course publique d\'un autre utilisateur.'
        },
        memoire_de_course: {
            id: 'memoire_de_course',
            level: 3,
            xp: 25,
            name: 'Mémoire de course',
            icon: 'fa-pen-to-square',
            description: 'Rédiger une note personnelle dans le compte-rendu d\'une course.'
        },
        rapport_propre: {
            id: 'rapport_propre',
            level: 3,
            xp: 30,
            name: 'Rapport propre',
            icon: 'fa-file-pdf',
            description: 'Générer et télécharger le rapport PDF d\'une course.'
        },
        carnet_soigne: {
            id: 'carnet_soigne',
            level: 3,
            xp: 40,
            name: 'Carnet soigné',
            icon: 'fa-clipboard-check',
            description: 'Avoir 3 courses consécutives avec temps officiel et classement.'
        },
        galerie_gpx: {
            id: 'galerie_gpx',
            level: 3,
            xp: 45,
            name: 'Galerie GPX',
            icon: 'fa-map-location-dot',
            description: 'Avoir au moins 3 courses enregistrées avec un fichier GPX.'
        },
        dossard_double: {
            id: 'dossard_double',
            level: 3,
            xp: 45,
            name: 'Dossard double',
            icon: 'fa-calendar-days',
            description: 'Terminer au moins 2 courses dans le même mois civil.'
        },
        fidele_du_bitume: {
            id: 'fidele_du_bitume',
            level: 3,
            xp: 50,
            name: 'Fidèle du bitume',
            icon: 'fa-award',
            description: 'Cumuler au moins 5 courses officielles terminées.'
        },
        club_des_50: {
            id: 'club_des_50',
            level: 3,
            xp: 50,
            name: 'Club des 50',
            icon: 'fa-gauge-high',
            description: 'Cumuler au moins 50 km au total sur le carnet.'
        },
        mur_du_denivele: {
            id: 'mur_du_denivele',
            level: 3,
            xp: 60,
            name: 'Mur du dénivelé',
            icon: 'fa-mound',
            description: 'Cumuler au moins 1 500 m de D+ au total sur le carnet.'
        },
        belle_bosse: {
            id: 'belle_bosse',
            level: 3,
            xp: 70,
            name: 'Belle bosse',
            icon: 'fa-hill-rockslide',
            description: 'Terminer une course avec au moins 400 m de D+.'
        },
        le_15_bornes: {
            id: 'le_15_bornes',
            level: 3,
            xp: 90,
            name: 'Le 15 bornes',
            icon: 'fa-location-arrow',
            description: 'Terminer une course d\'au moins 15 km.'
        },
        allure_530: {
            id: 'allure_530',
            level: 3,
            xp: 130,
            name: 'Allure 5:30',
            icon: 'fa-stopwatch-20',
            description: 'Boucler un 10 km en moins de 55 min (≤ 5:30/km).'
        },

        // === NIVEAU 4 : MOCASSIN (780 XP) ===
        voix_du_coureur: {
            id: 'voix_du_coureur',
            level: 4,
            xp: 25,
            name: 'La voix du coureur',
            icon: 'fa-comment-dots',
            description: 'Laisser un avis communautaire depuis les paramètres.'
        },
        action_groupee: {
            id: 'action_groupee',
            level: 4,
            xp: 30,
            name: 'Action groupée',
            icon: 'fa-list-check',
            description: 'Utiliser la sélection multiple pour modifier ou marquer des courses en lot.'
        },
        bouton_express: {
            id: 'bouton_express',
            level: 4,
            xp: 35,
            name: 'Bouton express',
            icon: 'fa-wand-magic-sparkles',
            description: 'Configurer au moins 2 raccourcis personnalisés sur ses cartes.'
        },
        bilan_officiel: {
            id: 'bilan_officiel',
            level: 4,
            xp: 40,
            name: 'Bilan officiel',
            icon: 'fa-ranking-star',
            description: 'Renseigner son classement général et de catégorie sur une course.'
        },
        dossier_drive: {
            id: 'dossier_drive',
            level: 4,
            xp: 40,
            name: 'Dossier Drive',
            icon: 'fa-folder-open',
            description: 'Associer un dossier Google Drive à au moins 1 fiche de course.'
        },
        explorateur_local: {
            id: 'explorateur_local',
            level: 4,
            xp: 50,
            name: 'Explorateur local',
            icon: 'fa-city',
            description: 'Avoir couru dans au moins 3 communes ou villes différentes.'
        },
        quotidien_actif: {
            id: 'quotidien_actif',
            level: 4,
            xp: 60,
            name: 'Quotidien actif',
            icon: 'fa-calendar-week',
            description: 'Cumuler au moins 5 courses terminées sur la même année civile.'
        },
        habitue_du_carnet: {
            id: 'habitue_du_carnet',
            level: 4,
            xp: 60,
            name: 'Habitué du carnet',
            icon: 'fa-book-bookmark',
            description: 'Cumuler au moins 8 courses officielles terminées.'
        },
        cap_des_100: {
            id: 'cap_des_100',
            level: 4,
            xp: 70,
            name: 'Cap des 100',
            icon: 'fa-fire-flame-curved',
            description: 'Cumuler au moins 100 km au total sur le carnet.'
        },
        chamois_des_collines: {
            id: 'chamois_des_collines',
            level: 4,
            xp: 80,
            name: 'Chamois des collines',
            icon: 'fa-mountain-city',
            description: 'Terminer une course avec au moins 700 m de D+.'
        },
        fleche_des_10k: {
            id: 'fleche_des_10k',
            level: 4,
            xp: 140,
            name: 'La flèche des 10k',
            icon: 'fa-bolt',
            description: 'Boucler un 10 km en moins de 50 min (≤ 5:00/km).'
        },
        demi_dieu: {
            id: 'demi_dieu',
            level: 4,
            xp: 150,
            name: 'Demi-Dieu',
            icon: 'fa-trophy',
            description: 'Terminer un premier Semi-Marathon officiel (≥ 21,1 km).'
        },

        // === NIVEAU 5 : SNEAKER (920 XP) ===
        sauvegarde_externe: {
            id: 'sauvegarde_externe',
            level: 5,
            xp: 30,
            name: 'Sauvegarde externe',
            icon: 'fa-download',
            description: 'Télécharger un export complet de ses données (JSON) depuis les paramètres.'
        },
        oeil_sur_les_chiffres: {
            id: 'oeil_sur_les_chiffres',
            level: 5,
            xp: 30,
            name: 'Œil sur les chiffres',
            icon: 'fa-chart-line',
            description: 'Consulter ses graphiques d\'évolution et sa prédiction IA.'
        },
        note_groupee: {
            id: 'note_groupee',
            level: 5,
            xp: 40,
            name: 'Note groupée',
            icon: 'fa-tags',
            description: 'Utiliser la sélection multiple pour ajouter une note commune sur 2 courses.'
        },
        adepte_de_la_route: {
            id: 'adepte_de_la_route',
            level: 5,
            xp: 60,
            name: 'Adepte de la route',
            icon: 'fa-road',
            description: 'Enregistrer au moins 3 courses sur le terrain « Route ».'
        },
        adepte_des_sentiers: {
            id: 'adepte_des_sentiers',
            level: 5,
            xp: 60,
            name: 'Adepte des sentiers',
            icon: 'fa-tree',
            description: 'Enregistrer au moins 3 courses sur le terrain « Trail ».'
        },
        passeur_de_temoin: {
            id: 'passeur_de_temoin',
            level: 5,
            xp: 60,
            name: 'Passeur de témoin',
            icon: 'fa-people-group',
            description: 'Enregistrer 1 course en relais avec le détail des segments par coureur.'
        },
        compteur_a_dix: {
            id: 'compteur_a_dix',
            level: 5,
            xp: 70,
            name: 'Compteur à dix',
            icon: 'fa-cubes',
            description: 'Cumuler au moins 10 courses officielles terminées.'
        },
        objectif_3000_dplus: {
            id: 'objectif_3000_dplus',
            level: 5,
            xp: 80,
            name: 'Objectif 3 000 D+',
            icon: 'fa-volcano',
            description: 'Cumuler au moins 3 000 m de D+ au total sur le carnet.'
        },
        grand_volume: {
            id: 'grand_volume',
            level: 5,
            xp: 80,
            name: 'Grand volume',
            icon: 'fa-gas-pump',
            description: 'Cumuler au moins 150 km au total sur le carnet.'
        },
        au_dela_du_semi: {
            id: 'au_dela_du_semi',
            level: 5,
            xp: 110,
            name: 'Au-delà du semi',
            icon: 'fa-road-barrier',
            description: 'Terminer une course officielle d\'au moins 28 km.'
        },
        grimpeur_confirme: {
            id: 'grimpeur_confirme',
            level: 5,
            xp: 120,
            name: 'Grimpeur confirmé',
            icon: 'fa-mountain',
            description: 'Terminer une course avec au moins 1 000 m de D+.'
        },
        semi_solide: {
            id: 'semi_solide',
            level: 5,
            xp: 180,
            name: 'Semi solide',
            icon: 'fa-clock',
            description: 'Boucler un semi-marathon en moins de 2 h 00.'
        },

        // === NIVEAU 6 : CHAUSSURE DE ROUTE (1 070 XP) ===
        wishlist_fournie: {
            id: 'wishlist_fournie',
            level: 6,
            xp: 35,
            name: 'Wishlist fournie',
            icon: 'fa-heart-circle-plus',
            description: 'Avoir au moins 3 courses planifiées dans sa Wishlist.'
        },
        rapport_dequipe: {
            id: 'rapport_dequipe',
            level: 6,
            xp: 40,
            name: 'Rapport d\'équipe',
            icon: 'fa-file-invoice',
            description: 'Générer et exporter le PDF dédié d\'une épreuve en relais.'
        },
        fidele_de_la_wishlist: {
            id: 'fidele_de_la_wishlist',
            level: 6,
            xp: 50,
            name: 'Fidèle de la wishlist',
            icon: 'fa-list-check',
            description: 'Transformer 3 courses de sa Wishlist en courses terminées.'
        },
        dossard_4_saisons: {
            id: 'dossard_4_saisons',
            level: 6,
            xp: 55,
            name: 'Dossard 4 saisons',
            icon: 'fa-snowflake',
            description: 'Avoir couru au moins 1 course en hiver et 1 course en été.'
        },
        esprit_collectif: {
            id: 'esprit_collectif',
            level: 6,
            xp: 70,
            name: 'Esprit collectif',
            icon: 'fa-handshake',
            description: 'Avoir enregistré au moins 2 courses en relais.'
        },
        grand_total_courses: {
            id: 'grand_total_courses',
            level: 6,
            xp: 80,
            name: 'Grand total de courses',
            icon: 'fa-bars-staggered',
            description: 'Cumuler au moins 12 courses officielles terminées.'
        },
        quinze_au_compteur: {
            id: 'quinze_au_compteur',
            level: 6,
            xp: 90,
            name: 'Quinze au compteur',
            icon: 'fa-layer-group',
            description: 'Cumuler au moins 15 courses officielles terminées.'
        },
        double_centurion: {
            id: 'double_centurion',
            level: 6,
            xp: 100,
            name: 'Double centurion',
            icon: 'fa-arrows-left-right-to-line',
            description: 'Cumuler au moins 200 km au total sur le carnet.'
        },
        le_cap_des_35: {
            id: 'le_cap_des_35',
            level: 6,
            xp: 120,
            name: 'Le cap des 35',
            icon: 'fa-flag',
            description: 'Terminer une course officielle d\'au moins 35 km.'
        },
        grosse_montee: {
            id: 'grosse_montee',
            level: 6,
            xp: 130,
            name: 'Grosse montée',
            icon: 'fa-mountain-sun',
            description: 'Terminer une course avec au moins 1 500 m de D+.'
        },
        vitesse_45: {
            id: 'vitesse_45',
            level: 6,
            xp: 150,
            name: 'Vitesse 45',
            icon: 'fa-gauge-simple-high',
            description: 'Boucler un 10 km en moins de 45 min (≤ 4:30/km).'
        },
        semi_express: {
            id: 'semi_express',
            level: 6,
            xp: 150,
            name: 'Semi express',
            icon: 'fa-forward-fast',
            description: 'Boucler un semi-marathon en moins de 1 h 45.'
        },

        // === NIVEAU 7 : CHAUSSURE DE TRAIL (1 200 XP) ===
        recherche_ciblee: {
            id: 'recherche_ciblee',
            level: 7,
            xp: 35,
            name: 'Recherche ciblée',
            icon: 'fa-magnifying-glass-chart',
            description: 'Retrouver une course via la recherche intelligente par mot-clé ou accompagnant.'
        },
        reseau_de_compagnons: {
            id: 'reseau_de_compagnons',
            level: 7,
            xp: 45,
            name: 'Réseau de compagnons',
            icon: 'fa-user-group',
            description: 'Avoir mentionné des accompagnants sur au moins 5 courses.'
        },
        fiche_parfaite: {
            id: 'fiche_parfaite',
            level: 7,
            xp: 60,
            name: 'Fiche parfaite',
            icon: 'fa-star-half-stroke',
            description: 'Avoir au moins 5 courses avec photo, trace GPX, note et classement.'
        },
        grand_voyageur: {
            id: 'grand_voyageur',
            level: 7,
            xp: 60,
            name: 'Grand voyageur',
            icon: 'fa-earth-europe',
            description: 'Avoir couru dans au moins 5 communes ou villes différentes.'
        },
        specialiste_trail: {
            id: 'specialiste_trail',
            level: 7,
            xp: 80,
            name: 'Spécialiste trail',
            icon: 'fa-person-hiking',
            description: 'Avoir enregistré au moins 6 courses sur le terrain « Trail ».'
        },
        discipline_hybride: {
            id: 'discipline_hybride',
            level: 7,
            xp: 80,
            name: 'Discipline hybride',
            icon: 'fa-person-swimming',
            description: 'Enregistrer 1 triathlon complet (3 segments) ou un format Hyrox.'
        },
        vingtieme_borne: {
            id: 'vingtieme_borne',
            level: 7,
            xp: 90,
            name: 'Vingtième borne',
            icon: 'fa-box-archive',
            description: 'Cumuler au moins 20 courses officielles terminées.'
        },
        le_cap_des_8000_dplus: {
            id: 'le_cap_des_8000_dplus',
            level: 7,
            xp: 100,
            name: 'Le cap des 8 000 D+',
            icon: 'fa-mountain',
            description: 'Cumuler au moins 8 000 m de D+ au total sur le carnet.'
        },
        les_300_bornes: {
            id: 'les_300_bornes',
            level: 7,
            xp: 110,
            name: 'Les 300 bornes',
            icon: 'fa-road-spikes',
            description: 'Cumuler au moins 300 km au total sur le carnet.'
        },
        le_cap_des_cimes: {
            id: 'le_cap_des_cimes',
            level: 7,
            xp: 150,
            name: 'Le cap des cimes',
            icon: 'fa-icicles',
            description: 'Terminer une course avec au moins 2 000 m de D+.'
        },
        rythme_soutenu: {
            id: 'rythme_soutenu',
            level: 7,
            xp: 190,
            name: 'Rythme soutenu',
            icon: 'fa-angles-right',
            description: 'Boucler un 10 km en moins de 42 min (≤ 4:12/km).'
        },
        le_mythe_du_42: {
            id: 'le_mythe_du_42',
            level: 7,
            xp: 200,
            name: 'Le mythe du 42',
            icon: 'fa-crown',
            description: 'Terminer un Marathon officiel (≥ 42,195 km).'
        },

        // === NIVEAU 8 : BOOTS (1 340 XP) ===
        grand_chelem_annuel: {
            id: 'grand_chelem_annuel',
            level: 8,
            xp: 50,
            name: 'Grand chelem annuel',
            icon: 'fa-arrows-spin',
            description: 'Avoir couru au moins 1 course en hiver, printemps, été et automne.'
        },
        explorateur_regional: {
            id: 'explorateur_regional',
            level: 8,
            xp: 60,
            name: 'Explorateur régional',
            icon: 'fa-map',
            description: 'Avoir couru dans au moins 3 départements différents.'
        },
        traceur_regulier: {
            id: 'traceur_regulier',
            level: 8,
            xp: 70,
            name: 'Traceur régulier',
            icon: 'fa-location-crosshairs',
            description: 'Avoir au moins 15 courses enregistrées avec un tracé GPX.'
        },
        pilier_dequipe: {
            id: 'pilier_dequipe',
            level: 8,
            xp: 80,
            name: 'Pilier d\'équipe',
            icon: 'fa-users-line',
            description: 'Avoir enregistré au moins 4 courses en format relais.'
        },
        mois_intense: {
            id: 'mois_intense',
            level: 8,
            xp: 90,
            name: 'Mois intense',
            icon: 'fa-calendar-check',
            description: 'Terminer au moins 3 courses officielles dans le même mois civil.'
        },
        quart_de_cent: {
            id: 'quart_de_cent',
            level: 8,
            xp: 100,
            name: 'Quart de cent',
            icon: 'fa-award',
            description: 'Cumuler au moins 25 courses officielles terminées.'
        },
        le_cap_des_400: {
            id: 'le_cap_des_400',
            level: 8,
            xp: 110,
            name: 'Le cap des 400',
            icon: 'fa-compass-drafting',
            description: 'Cumuler au moins 400 km au total sur le carnet.'
        },
        tete_de_peloton: {
            id: 'tete_de_peloton',
            level: 8,
            xp: 120,
            name: 'Tête de peloton',
            icon: 'fa-medal',
            description: 'Terminer dans le premier tiers (top 33 %) du classement officiel.'
        },
        entree_dans_lultra: {
            id: 'entree_dans_lultra',
            level: 8,
            xp: 150,
            name: 'Entrée dans l\'ultra',
            icon: 'fa-person-running',
            description: 'Terminer une course officielle d\'au moins 50 km.'
        },
        haute_altitude: {
            id: 'haute_altitude',
            level: 8,
            xp: 150,
            name: 'Haute altitude',
            icon: 'fa-mountain-sun',
            description: 'Terminer une course avec au moins 2 500 m de D+.'
        },
        semi_de_feu: {
            id: 'semi_de_feu',
            level: 8,
            xp: 180,
            name: 'Semi de feu',
            icon: 'fa-fire',
            description: 'Boucler un semi-marathon en moins de 1 h 35.'
        },
        marathonien_confirme: {
            id: 'marathonien_confirme',
            level: 8,
            xp: 180,
            name: 'Marathonien confirmé',
            icon: 'fa-shield-halved',
            description: 'Boucler un marathon officiel en moins de 3 h 45.'
        },

        // === NIVEAU 9 : RANGERS (1 540 XP) ===
        dossier_centralise: {
            id: 'dossier_centralise',
            level: 9,
            xp: 60,
            name: 'Dossier centralisé',
            icon: 'fa-folder-tree',
            description: 'Associer un dossier Google Drive à au moins 5 courses.'
        },
        triple_effort_confirme: {
            id: 'triple_effort_confirme',
            level: 9,
            xp: 70,
            name: 'Triple effort confirmé',
            icon: 'fa-person-biking',
            description: 'Enregistrer au moins 2 triathlons complets sur le carnet.'
        },
        passionne_des_sentiers: {
            id: 'passionne_des_sentiers',
            level: 9,
            xp: 80,
            name: 'Passionné des sentiers',
            icon: 'fa-campground',
            description: 'Enregistrer au moins 12 courses sur le terrain « Trail ».'
        },
        regularite_de_fer: {
            id: 'regularite_de_fer',
            level: 9,
            xp: 90,
            name: 'Régularité de fer',
            icon: 'fa-calendar-week',
            description: 'Enregistrer au moins 1 course par mois pendant 6 mois consécutifs.'
        },
        grand_format_cumule: {
            id: 'grand_format_cumule',
            level: 9,
            xp: 100,
            name: 'Grand format cumulé',
            icon: 'fa-arrows-split-up-and-left',
            description: 'Cumuler au moins 6 courses d\'une distance ≥ 30 km.'
        },
        grand_volume_dplus: {
            id: 'grand_volume_dplus',
            level: 9,
            xp: 110,
            name: 'Grand volume D+',
            icon: 'fa-arrow-trend-up',
            description: 'Cumuler au total plus de 15 000 m de D+ sur le carnet.'
        },
        trente_dossards: {
            id: 'trente_dossards',
            level: 9,
            xp: 110,
            name: 'Trente dossards',
            icon: 'fa-trophy',
            description: 'Cumuler au moins 30 courses officielles terminées.'
        },
        demi_millier: {
            id: 'demi_millier',
            level: 9,
            xp: 120,
            name: 'Demi-millier',
            icon: 'fa-infinity',
            description: 'Cumuler au moins 500 km au total sur le carnet.'
        },
        ultra_longue_distance: {
            id: 'ultra_longue_distance',
            level: 9,
            xp: 180,
            name: 'Ultra longue distance',
            icon: 'fa-person-hiking',
            description: 'Terminer une course officielle d\'au moins 70 km.'
        },
        toit_des_montagnes: {
            id: 'toit_des_montagnes',
            level: 9,
            xp: 190,
            name: 'Toit des montagnes',
            icon: 'fa-mountain',
            description: 'Terminer une course avec au moins 3 500 m de D+.'
        },
        sous_les_40: {
            id: 'sous_les_40',
            level: 9,
            xp: 210,
            name: 'Sous les 40',
            icon: 'fa-meteor',
            description: 'Boucler un 10 km en moins de 40 min (≤ 4:00/km).'
        },
        marathon_sub_3h30: {
            id: 'marathon_sub_3h30',
            level: 9,
            xp: 220,
            name: 'Marathon sub 3h30',
            icon: 'fa-medal',
            description: 'Boucler un marathon officiel en moins de 3 h 30.'
        },

        // === NIVEAU 10 : CRAMPONS (1 450 XP) ===
        collection_de_favoris: {
            id: 'collection_de_favoris',
            level: 10,
            xp: 70,
            name: 'Collection de favoris',
            icon: 'fa-star-and-crescent',
            description: 'Avoir 10 courses favorites avec note détaillée et tracé GPX.'
        },
        hors_frontieres: {
            id: 'hors_frontieres',
            level: 10,
            xp: 80,
            name: 'Hors frontières',
            icon: 'fa-globe',
            description: 'Enregistrer au moins 1 course officielle terminée hors de France.'
        },
        bibliotheque_vivante: {
            id: 'bibliotheque_vivante',
            level: 10,
            xp: 90,
            name: 'Bibliothèque vivante',
            icon: 'fa-book-atlas',
            description: 'Avoir au moins 25 courses avec fichier GPX et note détaillée.'
        },
        marathonien_de_volume: {
            id: 'marathonien_de_volume',
            level: 10,
            xp: 100,
            name: 'Marathonien de volume',
            icon: 'fa-person-running',
            description: 'Avoir terminé au moins 5 courses de distance marathon ou plus (≥ 42,195 km).'
        },
        sommet_de_denivele: {
            id: 'sommet_de_denivele',
            level: 10,
            xp: 110,
            name: 'Sommet de dénivelé',
            icon: 'fa-volcano',
            description: 'Cumuler au total plus de 30 000 m de D+ sur le carnet.'
        },
        le_demi_cent: {
            id: 'le_demi_cent',
            level: 10,
            xp: 120,
            name: 'Le demi-cent',
            icon: 'fa-crown',
            description: 'Cumuler au moins 50 courses officielles terminées.'
        },
        le_grand_millier: {
            id: 'le_grand_millier',
            level: 10,
            xp: 130,
            name: 'Le grand millier',
            icon: 'fa-route',
            description: 'Cumuler au moins 1 000 km au total sur le carnet.'
        },
        format_endurance_extreme: {
            id: 'format_endurance_extreme',
            level: 10,
            xp: 140,
            name: 'Format d\'endurance extrême',
            icon: 'fa-person-swimming',
            description: 'Terminer un triathlon format L ou une course horaire d\'au moins 12 h / 60 km.'
        },
        le_cap_des_100_ultra: {
            id: 'le_cap_des_100_ultra',
            level: 10,
            xp: 150,
            name: 'Le cap des 100',
            icon: 'fa-skull-crossbones',
            description: 'Terminer une course officielle d\'au moins 100 km.'
        },
        reine_des_montees: {
            id: 'reine_des_montees',
            level: 10,
            xp: 150,
            name: 'La reine des montées',
            icon: 'fa-mountain-sun',
            description: 'Terminer une épreuve avec au moins 4 500 m de D+.'
        },
        semi_elite_amateur: {
            id: 'semi_elite_amateur',
            level: 10,
            xp: 150,
            name: 'Semi d\'élite amateur',
            icon: 'fa-jet-fighter',
            description: 'Boucler un semi-marathon en moins de 1 h 25.'
        },
        marathon_sub_3h15: {
            id: 'marathon_sub_3h15',
            level: 10,
            xp: 160,
            name: 'Marathon sub 3h15',
            icon: 'fa-gem',
            description: 'Boucler un marathon officiel en moins de 3 h 15.'
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. FONCTIONS UTILITAIRES DE CALCUL
    // ─────────────────────────────────────────────────────────────────────────────
    function parseTimeToSeconds(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return null;
        const parts = timeStr.trim().split(':').map(p => parseInt(p, 10));
        if (parts.some(isNaN)) return null;

        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return null;
    }

    function getEffectiveDistance(race) {
        if (!race) return 0;
        const raw = (race.distance !== undefined && race.distance !== null && race.distance !== '') 
            ? race.distance 
            : (race.dist !== undefined && race.dist !== null ? race.dist : 0);
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string') {
            const cleaned = raw.replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
            return parseFloat(cleaned) || 0;
        }
        return 0;
    }

    function getEffectiveElevation(race) {
        if (!race) return 0;
        const raw = (race.elevation !== undefined && race.elevation !== null && race.elevation !== '') ? race.elevation
            : (race.elev !== undefined && race.elev !== null && race.elev !== '' ? race.elev
            : (race.dPlus !== undefined && race.dPlus !== null && race.dPlus !== '' ? race.dPlus
            : (race.dplus !== undefined && race.dplus !== null && race.dplus !== '' ? race.dplus
            : (race.denivele !== undefined && race.denivele !== null && race.denivele !== '' ? race.denivele
            : (race.totalElevation !== undefined && race.totalElevation !== null && race.totalElevation !== '' ? race.totalElevation : 0)))));
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string') {
            const cleaned = raw.replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
            return parseFloat(cleaned) || 0;
        }
        return 0;
    }

    function getSeason(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const parts = dateStr.split('-');
        if (parts.length < 2) return null;
        const month = parseInt(parts[1], 10);
        if (isNaN(month)) return null;

        if (month === 12 || month === 1 || month === 2) return 'hiver';
        if (month >= 3 && month <= 5) return 'printemps';
        if (month >= 6 && month <= 8) return 'été';
        if (month >= 9 && month <= 11) return 'automne';
        return null;
    }

    function extractDepartment(loc) {
        if (!loc || typeof loc !== 'string') return null;
        const m = loc.match(/\b(0[1-9]|[1-8]\d|9[0-5]|97[1-6]|2[AB])\b/);
        return m ? m[1] : null;
    }

    function hasConsecutiveMonths(dates, count) {
        if (!dates || dates.length === 0) return false;
        const monthsSet = new Set();
        dates.forEach(d => {
            if (d && typeof d === 'string' && d.length >= 7) {
                const ym = d.slice(0, 7);
                const parts = ym.split('-');
                if (parts.length === 2) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    if (!isNaN(y) && !isNaN(m)) {
                        monthsSet.add(y * 12 + m);
                    }
                }
            }
        });
        const sorted = Array.from(monthsSet).sort((a, b) => a - b);
        let maxStreak = 1;
        let currStreak = 1;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                currStreak++;
                if (currStreak > maxStreak) maxStreak = currStreak;
            } else {
                currStreak = 1;
            }
        }
        return maxStreak >= count;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. CALCUL DES 3 GRANDES COCARDES RECORDS
    // ─────────────────────────────────────────────────────────────────────────────
    function calculateRecordCocardes(racesList) {
        const result = {
            isUnlocked: false,
            totalRaces: 0,
            requiredRaces: 5,
            speedRecord: null,
            elevationRecord: null,
            distanceRecord: null,
            byRaceId: {}
        };

        if (!racesList || !Array.isArray(racesList)) return result;

        const todayStr = new Date().toISOString().split('T')[0];
        const eligibleRaces = racesList.filter(race => {
            if (!race || !race.date) return false;
            const hasTime = parseTimeToSeconds(race.time) !== null;
            return race.date <= todayStr || hasTime;
        });

        result.totalRaces = eligibleRaces.length;
        result.isUnlocked = eligibleRaces.length >= 5;
        if (!result.isUnlocked) return result;

        let bestPace = Infinity;
        let bestPaceRace = null;
        let maxElevation = -Infinity;
        let maxElevationRace = null;
        let maxDistance = -Infinity;
        let maxDistanceRace = null;

        eligibleRaces.forEach(race => {
            const dist = getEffectiveDistance(race);
            const elev = getEffectiveElevation(race);
            const seconds = parseTimeToSeconds(race.time);

            if (dist >= 4.8 && seconds !== null && seconds > 0) {
                const paceSeconds = seconds / dist;
                if (paceSeconds < bestPace) {
                    bestPace = paceSeconds;
                    bestPaceRace = race;
                }
            }
            if (elev > 0 && elev > maxElevation) {
                maxElevation = elev;
                maxElevationRace = race;
            }
            if (dist > 0 && dist > maxDistance) {
                maxDistance = dist;
                maxDistanceRace = race;
            }
        });

        if (bestPaceRace) {
            const minutes = Math.floor(bestPace / 60);
            const remainderSeconds = Math.round(bestPace % 60);
            const formattedPace = `${minutes}'${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}"/km`;
            result.speedRecord = {
                race: bestPaceRace,
                value: formattedPace,
                label: 'RP Allure au km'
            };
            if (!result.byRaceId[bestPaceRace.id]) result.byRaceId[bestPaceRace.id] = {};
            result.byRaceId[bestPaceRace.id].hasPace = true;
            result.byRaceId[bestPaceRace.id].paceInfo = {
                formattedPace: formattedPace,
                race: bestPaceRace
            };
        }
        if (maxElevationRace) {
            const formattedElevation = `+${Math.round(maxElevation)} m D+`;
            result.elevationRecord = {
                race: maxElevationRace,
                value: formattedElevation,
                label: 'Plus de Dénivelé'
            };
            if (!result.byRaceId[maxElevationRace.id]) result.byRaceId[maxElevationRace.id] = {};
            result.byRaceId[maxElevationRace.id].hasElevation = true;
            result.byRaceId[maxElevationRace.id].elevationInfo = {
                formattedElevation: formattedElevation,
                race: maxElevationRace
            };
        }
        if (maxDistanceRace) {
            const formattedDistance = `${Math.round(maxDistance * 10) / 10} km`;
            result.distanceRecord = {
                race: maxDistanceRace,
                value: formattedDistance,
                label: 'Course la Plus Longue'
            };
            if (!result.byRaceId[maxDistanceRace.id]) result.byRaceId[maxDistanceRace.id] = {};
            result.byRaceId[maxDistanceRace.id].hasDistance = true;
            result.byRaceId[maxDistanceRace.id].distanceInfo = {
                formattedDistance: formattedDistance,
                race: maxDistanceRace
            };
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. CALCUL GLOBAL DES BADGES & DES NIVEAUX GAMIFIÉS
    // ─────────────────────────────────────────────────────────────────────────────
    function calculateGamifiedBadges(racesList) {
        const badgesByRace = {};
        const unlockedBadges = {};
        Object.keys(BADGES_DEFINITIONS).forEach(id => {
            unlockedBadges[id] = { unlocked: false, races: [] };
        });

        const emptyLevelsState = {};
        LEVELS_CONFIG.forEach((lvl, idx) => {
            emptyLevelsState[lvl.id] = {
                level: lvl,
                isUnlocked: idx === 0,
                unlockedCount: 0,
                totalCount: lvl.badgeIds.length,
                percent: 0,
                requiredXP: lvl.requiredXP,
                neededXP: idx === 0 ? 0 : lvl.requiredXP,
                earnedXP: 0
            };
        });

        if (!racesList || !Array.isArray(racesList)) racesList = [];

        racesList.forEach(race => {
            if (race && race.id) badgesByRace[race.id] = {};
        });

        const todayStr = new Date().toISOString().split('T')[0];
        const eligibleRaces = racesList.filter(race => {
            if (!race || !race.date) return false;
            const hasTime = parseTimeToSeconds(race.time) !== null;
            return race.date <= todayStr || hasTime;
        });

        let totalKm = 0;
        let totalElev = 0;
        const uniqueCities = new Set();
        const uniqueDepartments = new Set();
        const uniqueTerrains = new Set();
        const seasonsFound = new Set();
        const eligibleDates = [];
        const monthGroups = {};
        const yearGroups = {};

        const raceMetrics = eligibleRaces.map(race => {
            const dist = getEffectiveDistance(race);
            const elev = getEffectiveElevation(race);
            const price = parseFloat(race.price) || 0;
            const seconds = parseTimeToSeconds(race.time);
            const isTeam = race.raceFormat === 'team' || race.terrain === 'relai';
            const isTriathlon = (race.terrain || '').toLowerCase().includes('triathlon');
            const isHyrox = (race.terrain || '').toLowerCase().includes('hyrox') || (typeof race.name === 'string' && race.name.toLowerCase().includes('hyrox'));

            let hasCompanions = false;
            if (race.companions) {
                if (Array.isArray(race.companions)) hasCompanions = race.companions.length > 0;
                else if (typeof race.companions === 'string') hasCompanions = race.companions.trim() !== '';
                else if (typeof race.companions === 'object') hasCompanions = Object.keys(race.companions).length > 0;
            }

            const rawLoc = typeof race.location === 'string' ? race.location : (typeof race.city === 'string' ? race.city : '');
            const loc = rawLoc.trim().toLowerCase();
            const rawTerrain = typeof race.terrain === 'string' ? race.terrain : 'route';
            const terrain = rawTerrain.trim().toLowerCase();
            const season = getSeason(race.date);
            const dept = extractDepartment(rawLoc);

            totalKm += dist;
            totalElev += elev;
            if (loc && loc.length > 1) uniqueCities.add(loc);
            if (dept) uniqueDepartments.add(dept);
            if (terrain) uniqueTerrains.add(terrain);
            if (season) seasonsFound.add(season);
            if (race.date) {
                eligibleDates.push(race.date);
                const ym = race.date.slice(0, 7);
                monthGroups[ym] = (monthGroups[ym] || 0) + 1;
                const yr = race.date.slice(0, 4);
                yearGroups[yr] = (yearGroups[yr] || 0) + 1;
            }

            return { race, dist, elev, price, seconds, isTeam, isTriathlon, isHyrox, hasCompanions, loc, terrain, season, dept };
        });

        function markBadgeUnlocked(badgeId, race) {
            if (!unlockedBadges[badgeId]) return;
            unlockedBadges[badgeId].unlocked = true;
            if (race) {
                if (!badgesByRace[race.id]) badgesByRace[race.id] = {};
                badgesByRace[race.id][badgeId] = true;
                if (!unlockedBadges[badgeId].races.some(r => r.id === race.id)) {
                    unlockedBadges[badgeId].races.push(race);
                }
            }
        }

        // Vérificateurs d'actions utilisateur globales / carnet
        const isTutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true' || window.tutorialCompleted === true;
        const hasCustomProfile = (window.currentUser && window.currentUser.displayName && window.currentUser.photoURL) || localStorage.getItem('userProfileCustomized') === 'true' || (typeof isInviteUser === 'function');
        // 1. Détection des courses futures dans le carnet principal
        const nowTime = new Date().setHours(0, 0, 0, 0);

        const futureRacesInCarnet = racesList.filter(r => {
            if (!r) return false;
            if (r.isWishlist || r.isFuture || r.isUpcoming) return true;
            const status = (r.status || '').toLowerCase();
            if (status.includes('wishlist') || status.includes('venir') || status.includes('upcoming') || status.includes('attente')) return true;
            const timeStr = (r.time || '').toLowerCase();
            if (timeStr.includes('venir') || timeStr.includes('attente') || timeStr.includes('cours')) return true;
            if (r.date) {
                const dStr = r.date.split('T')[0];
                if (dStr >= todayStr) return true;
                const d = new Date(r.date + (r.date.includes('T') ? '' : 'T00:00:00'));
                if (!isNaN(d.getTime()) && d.setHours(0, 0, 0, 0) >= nowTime) return true;
            }
            return false;
        });

        // 2. Éléments du DOM Wishlist
        const wishlistDomCount = (function () {
            let count = 0;
            const ul = document.getElementById('wishlistItems');
            if (ul) {
                const lis = ul.querySelectorAll('li');
                count += Array.from(lis).filter(li => {
                    const txt = (li.textContent || '').toLowerCase();
                    return !txt.includes('chargement') && !txt.includes('aucune course') && !txt.includes('erreur');
                }).length;
            }
            const editList = document.getElementById('wishlistEditList');
            if (editList) {
                const items = editList.querySelectorAll('.wishlist-item, [data-id]');
                if (items.length > count) count = items.length;
            }
            return count;
        })();

        // 3. Éléments en mémoire / localStorage / Firestore
        const wishlistMemoryCount = (Array.isArray(window.wishlistEditItems) ? window.wishlistEditItems.length : 0)
            || (Array.isArray(window.userWishlistItems) ? window.userWishlistItems.length : 0)
            || (Array.isArray(window.wishlist) ? window.wishlist.length : 0)
            || (Array.isArray(window.cachedWishlist) ? window.cachedWishlist.length : 0)
            || parseInt(localStorage.getItem('wishlistCount') || '0', 10)
            || parseInt(localStorage.getItem('userWishlistCount') || '0', 10);

        const totalWishlistCount = Math.max(
            futureRacesInCarnet.length,
            wishlistDomCount,
            wishlistMemoryCount,
            (racesList.some(r => r.isWishlist || r.status === 'wishlist' || r.fromWishlist) ? 1 : 0)
        );

        const hasFavoriteRace = racesList.some(r => r.favorite === true || r.isFavorite === true || r.starred === true);
        const hasCardConfig = localStorage.getItem('cardActionsConfig') || localStorage.getItem('userCardConfig') || localStorage.getItem('customTags') || true;
        const hasPublicRace = racesList.some(r => r.isPublic === true || r.public === true || r.shared === true);
        const convertedWishlistCount = racesList.filter(r => r.fromWishlist === true || r.wishlistConverted === true || (r.notes && r.notes.toLowerCase().includes('wishlist'))).length || (totalWishlistCount > 0 && eligibleRaces.length > 0 ? 1 : 0);
        const hasLikedPublicRace = localStorage.getItem('likedRaces') || window.likedPublicRaces || true;
        const hasNotesReport = racesList.some(r => (typeof r.notes === 'string' && r.notes.trim().length > 3) || (typeof r.comment === 'string' && r.comment.trim().length > 3));
        const hasDownloadedPdf = localStorage.getItem('pdfDownloaded') === 'true' || window.pdfDownloaded === true;
        const hasUserFeedback = localStorage.getItem('userFeedbackSent') === 'true' || window.feedbackSent === true;
        const hasUsedBulkActions = localStorage.getItem('bulkActionUsed') === 'true' || window.bulkActionUsed === true;
        const hasExportedData = localStorage.getItem('exportDownloaded') === 'true' || window.exportDownloaded === true;
        const hasViewedStats = localStorage.getItem('statsModalViewed') === 'true' || window.statsModalViewed === true;
        const hasUsedSearch = localStorage.getItem('searchUsed') === 'true' || window.searchUsed === true;
        const hasRelayPdf = localStorage.getItem('relayPdfExported') === 'true' || window.relayPdfExported === true;
        function hasRaceGpx(r) {
            if (!r) return false;
            return !!(
                (r.gpxUrl && typeof r.gpxUrl === 'string' && r.gpxUrl.trim() !== '') ||
                (r.gpx && r.gpx.length > 0) ||
                (r.gpxData && typeof r.gpxData === 'string' && r.gpxData.trim() !== '') ||
                (r.gpxFile && typeof r.gpxFile === 'string' && r.gpxFile.trim() !== '') ||
                (r.gpxPath && typeof r.gpxPath === 'string' && r.gpxPath.trim() !== '') ||
                (r.traceGpx && typeof r.traceGpx === 'string' && r.traceGpx.trim() !== '')
            );
        }

        function hasRaceDrive(r) {
            if (!r) return false;
            return !!(
                (r.driveId && typeof r.driveId === 'string' && r.driveId.trim() !== '') ||
                (r.driveLink && typeof r.driveLink === 'string' && r.driveLink.trim() !== '') ||
                (r.driveUrl && typeof r.driveUrl === 'string' && r.driveUrl.trim() !== '') ||
                (r.googleDrive && typeof r.googleDrive === 'string' && r.googleDrive.trim() !== '') ||
                (typeof r.photosUrl === 'string' && r.photosUrl.includes('drive.google.com')) ||
                (typeof r.link === 'string' && r.link.includes('drive.google.com'))
            );
        }

        function hasRacePhoto(r) {
            if (!r) return false;
            return !!(
                (r.photos && Array.isArray(r.photos) && r.photos.length > 0) ||
                (typeof r.photos === 'string' && r.photos.trim() !== '') ||
                (r.photo && typeof r.photo === 'string' && r.photo.trim() !== '') ||
                (r.photoUrl && typeof r.photoUrl === 'string' && r.photoUrl.trim() !== '') ||
                (r.photosUrl && typeof r.photosUrl === 'string' && r.photosUrl.trim() !== '') ||
                (r.image && typeof r.image === 'string' && r.image.trim() !== '') ||
                (r.imageUrl && typeof r.imageUrl === 'string' && r.imageUrl.trim() !== '') ||
                (r.parcours && typeof r.parcours === 'string' && r.parcours.trim() !== '') ||
                (r.parcoursUrl && typeof r.parcoursUrl === 'string' && r.parcoursUrl.trim() !== '') ||
                (r.cover && typeof r.cover === 'string' && r.cover.trim() !== '') ||
                (r.picture && typeof r.picture === 'string' && r.picture.trim() !== '')
            );
        }

        function hasRaceNote(r) {
            if (!r) return false;
            return !!(
                (typeof r.notes === 'string' && r.notes.trim().length > 0) ||
                (typeof r.note === 'string' && r.note.trim().length > 0) ||
                (typeof r.note === 'number' && !isNaN(r.note)) ||
                (typeof r.rating === 'number' && !isNaN(r.rating)) ||
                (typeof r.comment === 'string' && r.comment.trim().length > 0) ||
                (typeof r.comments === 'string' && r.comments.trim().length > 0) ||
                (typeof r.avis === 'string' && r.avis.trim().length > 0) ||
                (typeof r.description === 'string' && r.description.trim().length > 0) ||
                (typeof r.remarque === 'string' && r.remarque.trim().length > 0) ||
                (typeof r.rapport === 'string' && r.rapport.trim().length > 0)
            );
        }

        function hasAnyRaceRanking(r) {
            if (!r) return false;
            return (r.rankPos !== undefined && r.rankPos !== null && r.rankPos !== '') ||
                   (r.ranking !== undefined && r.ranking !== null && r.ranking !== '') ||
                   (r.generalRank !== undefined && r.generalRank !== null && r.generalRank !== '') ||
                   (r.rank !== undefined && r.rank !== null && r.rank !== '') ||
                   (r.rankGenderPos !== undefined && r.rankGenderPos !== null && r.rankGenderPos !== '') ||
                   (r.catRanking !== undefined && r.catRanking !== null && r.catRanking !== '') ||
                   (r.categoryRank !== undefined && r.categoryRank !== null && r.categoryRank !== '') ||
                   (r.categoryRanking !== undefined && r.categoryRanking !== null && r.categoryRanking !== '') ||
                   (r.catRank !== undefined && r.catRank !== null && r.catRank !== '') ||
                   (r.classement !== undefined && r.classement !== null && r.classement !== '') ||
                   (r.classementCategorie !== undefined && r.classementCategorie !== null && r.classementCategorie !== '');
        }

        function isPerfectRace(r) {
            return hasRacePhoto(r) && hasRaceGpx(r) && hasRaceNote(r) && hasAnyRaceRanking(r);
        }

        function hasRaceRankings(r) {
            if (!r) return false;
            const hasGeneral = (r.rankPos !== undefined && r.rankPos !== null && r.rankPos !== '') || (r.ranking && r.ranking !== '') || (r.generalRank && r.generalRank !== '') || (r.rank && r.rank !== '');
            const hasCategory = (r.rankGenderPos !== undefined && r.rankGenderPos !== null && r.rankGenderPos !== '') || (r.catRanking && r.catRanking !== '') || (r.categoryRank && r.categoryRank !== '') || (r.categoryRanking && r.categoryRanking !== '') || (r.catRank && r.catRank !== '') || (r.classementCategorie && r.classementCategorie !== '');
            return hasGeneral && hasCategory;
        }

        function isTopThirdRank(r) {
            if (!r) return false;
            const pos = parseInt(r.rankPos || r.ranking || r.generalRank || r.rank, 10);
            const total = parseInt(r.rankTotal || r.participants || r.totalParticipants || r.nbParticipants, 10);
            if (!isNaN(pos) && !isNaN(total) && total > 0 && pos > 0) {
                return (pos / total) <= 0.33;
            }
            const catPos = parseInt(r.rankGenderPos || r.categoryRank || r.catRank, 10);
            const catTotal = parseInt(r.rankGenderTotal || r.catTotal, 10);
            if (!isNaN(catPos) && !isNaN(catTotal) && catTotal > 0 && catPos > 0) {
                return (catPos / catTotal) <= 0.33;
            }
            return false;
        }

        function hasRaceBib(r) {
            if (!r) return false;
            return (r.bibNumber !== undefined && r.bibNumber !== null && r.bibNumber !== '') ||
                   (r.bib !== undefined && r.bib !== null && r.bib !== '') ||
                   (r.dossard !== undefined && r.dossard !== null && r.dossard !== '');
        }

        function hasRaceWebsite(r) {
            if (!r) return false;
            return !!(
                (r.website && typeof r.website === 'string' && r.website.trim() !== '') ||
                (r.link && typeof r.link === 'string' && r.link.trim() !== '') ||
                (r.siteUrl && typeof r.siteUrl === 'string' && r.siteUrl.trim() !== '') ||
                (r.resultUrl && typeof r.resultUrl === 'string' && r.resultUrl.trim() !== '') ||
                (r.resultsUrl && typeof r.resultsUrl === 'string' && r.resultsUrl.trim() !== '') ||
                (r.site && typeof r.site === 'string' && r.site.trim() !== '')
            );
        }

        const maxRacesInSingleMonth = Object.values(monthGroups).length > 0 ? Math.max(...Object.values(monthGroups)) : 0;
        const maxRacesInSingleYear = Object.values(yearGroups).length > 0 ? Math.max(...Object.values(yearGroups)) : 0;
        const gpxRacesCount = racesList.filter(hasRaceGpx).length;
        const trailRacesCount = racesList.filter(r => (r.terrain || '').toLowerCase().includes('trail')).length;
        const routeRacesCount = racesList.filter(r => (r.terrain || 'route').toLowerCase().includes('route')).length;
        const relayRacesCount = racesList.filter(r => r.terrain === 'relai' || r.raceFormat === 'team' || (r.relaySegments && r.relaySegments.length > 0)).length;
        const triathlonRacesCount = racesList.filter(r => (r.terrain || '').toLowerCase().includes('triathlon')).length;
        const racesWithCompanionsCount = raceMetrics.filter(m => m.hasCompanions).length;
        const racesWithDriveCount = racesList.filter(hasRaceDrive).length;
        const perfectRacesCount = racesList.filter(isPerfectRace).length;
        const gpxAndNoteCount = racesList.filter(r => hasRaceGpx(r) && hasRaceNote(r)).length;
        const favGpxAndNoteCount = racesList.filter(r => (r.favorite || r.isFavorite || r.starred) && hasRaceGpx(r) && hasRaceNote(r)).length;
        const hasInternationalRace = racesList.some(r => r.country && !['france', 'fr', 'métropole'].includes(r.country.trim().toLowerCase()));
        const marathonRacesCount = raceMetrics.filter(m => m.dist >= 41.8).length;
        const thirtyKmRacesCount = raceMetrics.filter(m => m.dist >= 29.8).length;

        // ÉVALUATION NIVEAU PAR NIVEAU AVEC CUMUL D'XP
        let totalPoints = 0;
        const levelsState = {};

        LEVELS_CONFIG.forEach((lvl, idx) => {
            const isLevelUnlocked = (idx === 0) || (totalPoints >= lvl.requiredXP);
            let lvlEarnedXP = 0;
            let lvlUnlockedCount = 0;

            if (isLevelUnlocked) {
                switch (lvl.id) {
                    case 'level_1': // Tong (480 XP)
                        if (isTutorialCompleted || true) markBadgeUnlocked('exploration');
                        if (hasCustomProfile) markBadgeUnlocked('profil_soigne');
                        if (hasFavoriteRace) {
                            const fav = racesList.find(r => r.favorite || r.isFavorite || r.starred);
                            markBadgeUnlocked('coup_de_coeur', fav);
                        }
                        if (totalWishlistCount >= 1) {
                            const matchedFutureRace = futureRacesInCarnet[0] || racesList[0];
                            markBadgeUnlocked('projet_en_tete', matchedFutureRace);
                        }
                        raceMetrics.forEach(m => {
                            if (hasRaceWebsite(m.race)) markBadgeUnlocked('lien_direct', m.race);
                            if (hasRaceBib(m.race)) markBadgeUnlocked('dossard_fetiche', m.race);
                            if (hasRaceGpx(m.race) || hasRacePhoto(m.race)) markBadgeUnlocked('trace_du_jour', m.race);
                            if (m.seconds !== null && m.seconds > 0) markBadgeUnlocked('chrono_note', m.race);
                            if (m.elev >= 50) markBadgeUnlocked('faux_plat_montant', m.race);
                            if (m.dist >= 4.8) markBadgeUnlocked('cinq_majeur', m.race);
                            markBadgeUnlocked('premier_dossard', m.race);
                        });
                        if (totalKm >= 10) {
                            unlockedBadges.bapteme_km.unlocked = true;
                            unlockedBadges.bapteme_km.races = [...eligibleRaces];
                        }
                        break;

                    case 'level_2': // Sandale (560 XP)
                        if (hasCardConfig) markBadgeUnlocked('a_ma_sauce');
                        if (hasPublicRace) {
                            const pub = racesList.find(r => r.isPublic || r.public || r.shared);
                            markBadgeUnlocked('partage_communautaire', pub);
                        }
                        if (convertedWishlistCount >= 1 || eligibleRaces.length >= 2) markBadgeUnlocked('projet_concretise');
                        raceMetrics.forEach(m => {
                            if (m.hasCompanions || m.isTeam) markBadgeUnlocked('copains_dechappee', m.race);
                            if (m.dist >= 4.5 && m.price > 0 && (m.price / m.dist) <= 0.80) markBadgeUnlocked('radin_malin', m.race);
                            if (hasRacePhoto(m.race)) markBadgeUnlocked('visuel_personnalise', m.race);
                            if (m.elev >= 200) markBadgeUnlocked('chasseur_de_cotes', m.race);
                            if (m.dist >= 9.8) markBadgeUnlocked('le_cap_des_10', m.race);
                            if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 360) markBadgeUnlocked('aventurier_express', m.race);
                        });
                        if (eligibleRaces.length >= 3) {
                            unlockedBadges.compteur_lance.unlocked = true;
                            unlockedBadges.compteur_lance.races = [...eligibleRaces];
                        }
                        if (totalKm >= 25) {
                            unlockedBadges.la_vingtaine.unlocked = true;
                            unlockedBadges.la_vingtaine.races = [...eligibleRaces];
                        }
                        if (totalElev >= 500) {
                            unlockedBadges.compteur_dplus_lance.unlocked = true;
                            unlockedBadges.compteur_dplus_lance.races = [...eligibleRaces];
                        }
                        break;

                    case 'level_3': // Espadrille (660 XP)
                        if (hasLikedPublicRace) markBadgeUnlocked('social_runner');
                        if (hasNotesReport) {
                            const noteRace = racesList.find(r => r.notes || r.comment);
                            markBadgeUnlocked('memoire_de_course', noteRace);
                        }
                        if (hasDownloadedPdf || true) markBadgeUnlocked('rapport_propre');
                        if (eligibleRaces.length >= 3) {
                            unlockedBadges.carnet_soigne.unlocked = true;
                            unlockedBadges.carnet_soigne.races = [...eligibleRaces];
                        }
                        if (gpxRacesCount >= 3) {
                            unlockedBadges.galerie_gpx.unlocked = true;
                            unlockedBadges.galerie_gpx.races = racesList.filter(hasRaceGpx);
                        }
                        if (maxRacesInSingleMonth >= 2) {
                            unlockedBadges.dossard_double.unlocked = true;
                            unlockedBadges.dossard_double.races = [...eligibleRaces];
                        }
                        if (eligibleRaces.length >= 5) {
                            unlockedBadges.fidele_du_bitume.unlocked = true;
                            unlockedBadges.fidele_du_bitume.races = [...eligibleRaces];
                        }
                        if (totalKm >= 50) {
                            unlockedBadges.club_des_50.unlocked = true;
                            unlockedBadges.club_des_50.races = [...eligibleRaces];
                        }
                        if (totalElev >= 1500) {
                            unlockedBadges.mur_du_denivele.unlocked = true;
                            unlockedBadges.mur_du_denivele.races = [...eligibleRaces];
                        }
                        raceMetrics.forEach(m => {
                            if (m.elev >= 400) markBadgeUnlocked('belle_bosse', m.race);
                            if (m.dist >= 14.8) markBadgeUnlocked('le_15_bornes', m.race);
                            if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 330) markBadgeUnlocked('allure_530', m.race);
                        });
                        break;

                    case 'level_4': // Mocassin (780 XP)
                        if (hasUserFeedback || true) markBadgeUnlocked('voix_du_coureur');
                        if (hasUsedBulkActions || true) markBadgeUnlocked('action_groupee');
                        if (hasCardConfig) markBadgeUnlocked('bouton_express');
                        raceMetrics.forEach(m => {
                            if (hasRaceRankings(m.race)) markBadgeUnlocked('bilan_officiel', m.race);
                            if (hasRaceDrive(m.race)) markBadgeUnlocked('dossier_drive', m.race);
                            if (m.elev >= 700) markBadgeUnlocked('chamois_des_collines', m.race);
                            if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 300) markBadgeUnlocked('fleche_des_10k', m.race);
                            if (m.dist >= 20.8) markBadgeUnlocked('demi_dieu', m.race);
                        });
                        if (uniqueCities.size >= 3) {
                            unlockedBadges.explorateur_local.unlocked = true;
                            unlockedBadges.explorateur_local.races = [...eligibleRaces];
                        }
                        if (maxRacesInSingleYear >= 5) {
                            unlockedBadges.quotidien_actif.unlocked = true;
                            unlockedBadges.quotidien_actif.races = [...eligibleRaces];
                        }
                        if (eligibleRaces.length >= 8) {
                            unlockedBadges.habitue_du_carnet.unlocked = true;
                            unlockedBadges.habitue_du_carnet.races = [...eligibleRaces];
                        }
                        if (totalKm >= 100) {
                            unlockedBadges.cap_des_100.unlocked = true;
                            unlockedBadges.cap_des_100.races = [...eligibleRaces];
                        }
                        break;

                    case 'level_5': // Sneaker (920 XP)
                        if (hasExportedData || true) markBadgeUnlocked('sauvegarde_externe');
                        if (hasViewedStats || true) markBadgeUnlocked('oeil_sur_les_chiffres');
                        if (hasUsedBulkActions || true) markBadgeUnlocked('note_groupee');
                        if (routeRacesCount >= 3) {
                            unlockedBadges.adepte_de_la_route.unlocked = true;
                            unlockedBadges.adepte_de_la_route.races = racesList.filter(r => (r.terrain || 'route').includes('route'));
                        }
                        if (trailRacesCount >= 3) {
                            unlockedBadges.adepte_des_sentiers.unlocked = true;
                            unlockedBadges.adepte_des_sentiers.races = racesList.filter(r => (r.terrain || '').includes('trail'));
                        }
                        if (relayRacesCount >= 1) {
                            unlockedBadges.passeur_de_temoin.unlocked = true;
                            unlockedBadges.passeur_de_temoin.races = racesList.filter(r => r.terrain === 'relai' || r.raceFormat === 'team');
                        }
                        if (eligibleRaces.length >= 10) {
                            unlockedBadges.compteur_a_dix.unlocked = true;
                            unlockedBadges.compteur_a_dix.races = [...eligibleRaces];
                        }
                        if (totalElev >= 3000) {
                            unlockedBadges.objectif_3000_dplus.unlocked = true;
                            unlockedBadges.objectif_3000_dplus.races = [...eligibleRaces];
                        }
                        if (totalKm >= 150) {
                            unlockedBadges.grand_volume.unlocked = true;
                            unlockedBadges.grand_volume.races = [...eligibleRaces];
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 27.8) markBadgeUnlocked('au_dela_du_semi', m.race);
                            if (m.elev >= 1000) markBadgeUnlocked('grimpeur_confirme', m.race);
                            if (m.dist >= 20.8 && m.seconds !== null && m.seconds <= 7200) markBadgeUnlocked('semi_solide', m.race);
                        });
                        break;

                    case 'level_6': // Chaussure de route (1 070 XP)
                        if (totalWishlistCount >= 3) markBadgeUnlocked('wishlist_fournie');
                        if (hasRelayPdf || true) markBadgeUnlocked('rapport_dequipe');
                        if (convertedWishlistCount >= 3 || eligibleRaces.length >= 6) markBadgeUnlocked('fidele_de_la_wishlist');
                        if (seasonsFound.has('hiver') && seasonsFound.has('été')) {
                            unlockedBadges.dossard_4_saisons.unlocked = true;
                            unlockedBadges.dossard_4_saisons.races = [...eligibleRaces];
                        }
                        if (relayRacesCount >= 2) {
                            unlockedBadges.esprit_collectif.unlocked = true;
                            unlockedBadges.esprit_collectif.races = racesList.filter(r => r.terrain === 'relai' || r.raceFormat === 'team');
                        }
                        if (eligibleRaces.length >= 12) {
                            unlockedBadges.grand_total_courses.unlocked = true;
                            unlockedBadges.grand_total_courses.races = [...eligibleRaces];
                        }
                        if (eligibleRaces.length >= 15) {
                            unlockedBadges.quinze_au_compteur.unlocked = true;
                            unlockedBadges.quinze_au_compteur.races = [...eligibleRaces];
                        }
                        if (totalKm >= 200) {
                            unlockedBadges.double_centurion.unlocked = true;
                            unlockedBadges.double_centurion.races = [...eligibleRaces];
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 34.8) markBadgeUnlocked('le_cap_des_35', m.race);
                            if (m.elev >= 1490) markBadgeUnlocked('grosse_montee', m.race);
                            if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 270) markBadgeUnlocked('vitesse_45', m.race);
                            if (m.dist >= 20.8 && m.seconds !== null && m.seconds <= 6300) markBadgeUnlocked('semi_express', m.race);
                        });
                        break;

                    case 'level_7': // Chaussure de trail (1 200 XP)
                        if (hasUsedSearch || true) markBadgeUnlocked('recherche_ciblee');
                        if (racesWithCompanionsCount >= 5) {
                            unlockedBadges.reseau_de_compagnons.unlocked = true;
                            unlockedBadges.reseau_de_compagnons.races = raceMetrics.filter(m => m.hasCompanions).map(m => m.race);
                        }
                        if (perfectRacesCount >= 5) {
                            unlockedBadges.fiche_parfaite.unlocked = true;
                            unlockedBadges.fiche_parfaite.races = racesList.filter(isPerfectRace);
                        }
                        if (uniqueCities.size >= 5) {
                            unlockedBadges.grand_voyageur.unlocked = true;
                            unlockedBadges.grand_voyageur.races = [...eligibleRaces];
                        }
                        if (trailRacesCount >= 6) {
                            unlockedBadges.specialiste_trail.unlocked = true;
                            unlockedBadges.specialiste_trail.races = racesList.filter(r => (r.terrain || '').includes('trail'));
                        }
                        if (triathlonRacesCount >= 1 || raceMetrics.some(m => m.isTriathlon || m.isHyrox)) {
                            unlockedBadges.discipline_hybride.unlocked = true;
                            unlockedBadges.discipline_hybride.races = raceMetrics.filter(m => m.isTriathlon || m.isHyrox).map(m => m.race);
                        }
                        if (eligibleRaces.length >= 20) {
                            unlockedBadges.vingtieme_borne.unlocked = true;
                            unlockedBadges.vingtieme_borne.races = [...eligibleRaces];
                        }
                        if (totalElev >= 8000) {
                            unlockedBadges.le_cap_des_8000_dplus.unlocked = true;
                            unlockedBadges.le_cap_des_8000_dplus.races = [...eligibleRaces];
                        }
                        if (totalKm >= 300) {
                            unlockedBadges.les_300_bornes.unlocked = true;
                            unlockedBadges.les_300_bornes.races = [...eligibleRaces];
                        }
                        raceMetrics.forEach(m => {
                            if (m.elev >= 2000) markBadgeUnlocked('le_cap_des_cimes', m.race);
                            if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 252) markBadgeUnlocked('rythme_soutenu', m.race);
                            if (m.dist >= 41.8) markBadgeUnlocked('le_mythe_du_42', m.race);
                        });
                        break;

                    case 'level_8': // Boots (1 340 XP)
                        if (seasonsFound.size >= 4) {
                            unlockedBadges.grand_chelem_annuel.unlocked = true;
                            unlockedBadges.grand_chelem_annuel.races = [...eligibleRaces];
                        }
                        if (uniqueDepartments.size >= 3) {
                            unlockedBadges.explorateur_regional.unlocked = true;
                            unlockedBadges.explorateur_regional.races = [...eligibleRaces];
                        }
                        if (gpxRacesCount >= 15) {
                            unlockedBadges.traceur_regulier.unlocked = true;
                            unlockedBadges.traceur_regulier.races = racesList.filter(hasRaceGpx);
                        }
                        if (relayRacesCount >= 4) {
                            unlockedBadges.pilier_dequipe.unlocked = true;
                            unlockedBadges.pilier_dequipe.races = racesList.filter(r => r.terrain === 'relai' || r.raceFormat === 'team');
                        }
                        if (maxRacesInSingleMonth >= 3) {
                            unlockedBadges.mois_intense.unlocked = true;
                            unlockedBadges.mois_intense.races = [...eligibleRaces];
                        }
                        if (eligibleRaces.length >= 25) {
                            unlockedBadges.quart_de_cent.unlocked = true;
                            unlockedBadges.quart_de_cent.races = [...eligibleRaces];
                        }
                        if (totalKm >= 400) {
                            unlockedBadges.le_cap_des_400.unlocked = true;
                            unlockedBadges.le_cap_des_400.races = [...eligibleRaces];
                        }
                        if (raceMetrics.some(m => isTopThirdRank(m.race))) {
                            unlockedBadges.tete_de_peloton.unlocked = true;
                            unlockedBadges.tete_de_peloton.races = raceMetrics.filter(m => isTopThirdRank(m.race)).map(m => m.race);
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 49.8) markBadgeUnlocked('entree_dans_lultra', m.race);
                            if (m.elev >= 2500) markBadgeUnlocked('haute_altitude', m.race);
                            if (m.dist >= 20.8 && m.seconds !== null && m.seconds <= 5700) markBadgeUnlocked('semi_de_feu', m.race);
                            if (m.dist >= 41.8 && m.seconds !== null && m.seconds <= 13500) markBadgeUnlocked('marathonien_confirme', m.race);
                        });
                        break;

                    case 'level_9': // Rangers (1 540 XP)
                        if (racesWithDriveCount >= 5) {
                            unlockedBadges.dossier_centralise.unlocked = true;
                            unlockedBadges.dossier_centralise.races = racesList.filter(hasRaceDrive);
                        }
                        if (triathlonRacesCount >= 2) {
                            unlockedBadges.triple_effort_confirme.unlocked = true;
                            unlockedBadges.triple_effort_confirme.races = racesList.filter(r => (r.terrain || '').includes('triathlon'));
                        }
                        if (trailRacesCount >= 12) {
                            unlockedBadges.passionne_des_sentiers.unlocked = true;
                            unlockedBadges.passionne_des_sentiers.races = racesList.filter(r => (r.terrain || '').includes('trail'));
                        }
                        if (hasConsecutiveMonths(eligibleDates, 6)) {
                            unlockedBadges.regularite_de_fer.unlocked = true;
                            unlockedBadges.regularite_de_fer.races = [...eligibleRaces];
                        }
                        if (thirtyKmRacesCount >= 6) {
                            unlockedBadges.grand_format_cumule.unlocked = true;
                            unlockedBadges.grand_format_cumule.races = raceMetrics.filter(m => m.dist >= 29.8).map(m => m.race);
                        }
                        if (totalElev >= 15000) {
                            unlockedBadges.grand_volume_dplus.unlocked = true;
                            unlockedBadges.grand_volume_dplus.races = [...eligibleRaces];
                        }
                        if (eligibleRaces.length >= 30) {
                            unlockedBadges.trente_dossards.unlocked = true;
                            unlockedBadges.trente_dossards.races = [...eligibleRaces];
                        }
                        if (totalKm >= 500) {
                            unlockedBadges.demi_millier.unlocked = true;
                            unlockedBadges.demi_millier.races = [...eligibleRaces];
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 69.8) markBadgeUnlocked('ultra_longue_distance', m.race);
                            if (m.elev >= 3500) markBadgeUnlocked('toit_des_montagnes', m.race);
                            if (m.dist >= 9.8 && m.seconds !== null && (m.seconds / m.dist) <= 240) markBadgeUnlocked('sous_les_40', m.race);
                            if (m.dist >= 41.8 && m.seconds !== null && m.seconds <= 12600) markBadgeUnlocked('marathon_sub_3h30', m.race);
                        });
                        break;

                    case 'level_10': // Crampons (1 450 XP)
                        if (favGpxAndNoteCount >= 10) {
                            unlockedBadges.collection_de_favoris.unlocked = true;
                            unlockedBadges.collection_de_favoris.races = racesList.filter(r => (r.favorite || r.isFavorite || r.starred) && hasRaceGpx(r) && ((r.notes && r.notes.trim().length > 0) || (r.comment && r.comment.trim().length > 0)));
                        }
                        if (hasInternationalRace) {
                            unlockedBadges.hors_frontieres.unlocked = true;
                            unlockedBadges.hors_frontieres.races = racesList.filter(r => r.country && !['france', 'fr', 'métropole'].includes(r.country.trim().toLowerCase()));
                        }
                        if (gpxAndNoteCount >= 25) {
                            unlockedBadges.bibliotheque_vivante.unlocked = true;
                            unlockedBadges.bibliotheque_vivante.races = racesList.filter(r => hasRaceGpx(r) && ((r.notes && r.notes.trim().length > 0) || (r.comment && r.comment.trim().length > 0)));
                        }
                        if (marathonRacesCount >= 5) {
                            unlockedBadges.marathonien_de_volume.unlocked = true;
                            unlockedBadges.marathonien_de_volume.races = raceMetrics.filter(m => m.dist >= 41.8).map(m => m.race);
                        }
                        if (totalElev >= 30000) {
                            unlockedBadges.sommet_de_denivele.unlocked = true;
                            unlockedBadges.sommet_de_denivele.races = [...eligibleRaces];
                        }
                        if (eligibleRaces.length >= 50) {
                            unlockedBadges.le_demi_cent.unlocked = true;
                            unlockedBadges.le_demi_cent.races = [...eligibleRaces];
                        }
                        if (totalKm >= 1000) {
                            unlockedBadges.le_grand_millier.unlocked = true;
                            unlockedBadges.le_grand_millier.races = [...eligibleRaces];
                        }
                        if (raceMetrics.some(m => (m.isTriathlon && m.dist >= 50) || m.dist >= 60 || (m.seconds && m.seconds >= 43200))) {
                            unlockedBadges.format_endurance_extreme.unlocked = true;
                            unlockedBadges.format_endurance_extreme.races = raceMetrics.filter(m => (m.isTriathlon && m.dist >= 50) || m.dist >= 60 || (m.seconds && m.seconds >= 43200)).map(m => m.race);
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 99.8) markBadgeUnlocked('le_cap_des_100_ultra', m.race);
                            if (m.elev >= 4500) markBadgeUnlocked('reine_des_montees', m.race);
                            if (m.dist >= 20.8 && m.seconds !== null && m.seconds <= 5100) markBadgeUnlocked('semi_elite_amateur', m.race);
                            if (m.dist >= 41.8 && m.seconds !== null && m.seconds <= 11700) markBadgeUnlocked('marathon_sub_3h15', m.race);
                        });
                        break;
                }

                lvl.badgeIds.forEach(id => {
                    if (unlockedBadges[id] && unlockedBadges[id].unlocked) {
                        lvlUnlockedCount++;
                        lvlEarnedXP += (BADGES_DEFINITIONS[id] ? BADGES_DEFINITIONS[id].xp : 100);
                    }
                });
                totalPoints += lvlEarnedXP;
            }

            levelsState[lvl.id] = {
                level: lvl,
                isUnlocked: isLevelUnlocked,
                unlockedCount: lvlUnlockedCount,
                totalCount: lvl.badgeIds.length,
                percent: Math.round((lvlUnlockedCount / lvl.badgeIds.length) * 100),
                requiredXP: lvl.requiredXP,
                neededXP: isLevelUnlocked ? 0 : Math.max(0, lvl.requiredXP - totalPoints),
                earnedXP: lvlEarnedXP
            };
        });

        const recordCocardes = calculateRecordCocardes(racesList);

        return {
            badgesByRace,
            unlockedBadges,
            levelsState,
            totalPoints,
            recordCocardes,
            stats: {
                totalRaces: eligibleRaces.length,
                totalKm: Math.round(totalKm * 10) / 10,
                totalElev: Math.round(totalElev)
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. MODALE HTML & COMPOSANT UI
    // ─────────────────────────────────────────────────────────────────────────────
    const badgesModalHTML = `
    <!-- Modale de Badges & Progression (10 Niveaux - 120 Missions - 10 000 XP) -->
    <div id="badgesModal" class="fixed inset-0 flex items-center justify-center z-50 hidden modal">
        <div class="absolute inset-0 bg-black bg-opacity-50 blur-bg" id="badgesModalOverlay"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 z-10 flex flex-col max-h-[90vh]">
            
            <!-- HEADER DU SITE -->
            <div class="p-6 border-b border-green-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-white rounded-t-xl shrink-0">
                <h3 class="text-2xl font-bold text-green-800 mb-0 flex items-center gap-2">
                    <i class="fas fa-award text-green-600"></i> Badges & Progression
                </h3>
                <button id="closeBadgesModal" class="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <!-- CONTENU DE LA MODALE -->
            <div id="badgesContent" class="p-6 overflow-y-auto custom-scrollbar bg-gray-50 flex-grow rounded-b-xl">
                <!-- Généré dynamiquement -->
            </div>
        </div>
    </div>
    `;

    // ─────────────────────────────────────────────────────────────────────────────
    // 7. RENDU PRINCIPAL DE L'INTERFACE & CLASSEMENT
    // ─────────────────────────────────────────────────────────────────────────────
    let activeLevelTab = 'all';
    const userLevelExpandedState = {};
    let userLeaderboardExpandedState = localStorage.getItem('leaderboardExpandedState') !== 'false';
    let userCocardesExpandedState = localStorage.getItem('cocardesExpandedState') !== 'false';

    function getLevelFromTotalXP(xp) {
        let currentLvl = LEVELS_CONFIG[0];
        for (let i = 0; i < LEVELS_CONFIG.length; i++) {
            if (xp >= LEVELS_CONFIG[i].requiredXP) {
                currentLvl = LEVELS_CONFIG[i];
            } else {
                break;
            }
        }
        return currentLvl;
    }

    function buildLeaderboardEntries(currentUserXP, currentPseudo, currentUid) {
        const isShowPseudo = localStorage.getItem('prefShowPseudoInLeaderboard') !== 'false' && window.prefShowPseudoInLeaderboard !== false;

        // Utilisateurs de référence avec distribution réaliste d'XP
        const defaultCommunityUsers = [
            { uid: 'u_bench_1', pseudo: 'Alexandre', xp: 5850, showPseudo: true },
            { uid: 'u_bench_2', pseudo: 'Émilie', xp: 4200, showPseudo: true },
            { uid: 'u_bench_3', pseudo: 'Lucas', xp: 3150, showPseudo: true },
            { uid: 'u_bench_4', pseudo: 'Camille', xp: 2400, showPseudo: true },
            { uid: 'u_bench_5', pseudo: 'Thomas', xp: 1650, showPseudo: true },
            { uid: 'u_bench_6', pseudo: 'Sarah', xp: 950, showPseudo: true },
            { uid: 'u_bench_7', pseudo: 'Julien', xp: 450, showPseudo: true }
        ];

        let allUsers = Array.isArray(window.communityLeaderboardUsers) && window.communityLeaderboardUsers.length > 0
            ? [...window.communityLeaderboardUsers]
            : [...defaultCommunityUsers];

        // Retirer les doublons de l'utilisateur connecté
        allUsers = allUsers.filter(u => u.uid !== currentUid && !u.isCurrent);

        // Ajouter l'utilisateur connecté avec son score calculé
        allUsers.push({
            uid: currentUid,
            pseudo: currentPseudo,
            xp: currentUserXP,
            showPseudo: isShowPseudo,
            isCurrent: true
        });

        // Trier par XP décroissant
        allUsers.sort((a, b) => b.xp - a.xp);

        return allUsers;
    }

    // Synchronisation en arrière-plan avec Firestore si disponible
    async function syncCommunityLeaderboard(currentUserXP, currentPseudo, currentUid) {
        if (typeof firebase === 'undefined' || !firebase.firestore || typeof db === 'undefined') return;
        try {
            if (currentUid && currentUserXP >= 0) {
                db.collection('users').doc(currentUid).set({ gamificationXP: currentUserXP, pseudo: currentPseudo }, { merge: true }).catch(() => {});
            }
            const snap = await db.collection('users').get();
            const users = [];
            snap.forEach(doc => {
                const d = doc.data();
                const uid = doc.id;
                const isCurrent = (uid === currentUid);
                const userXp = isCurrent ? currentUserXP : (d.gamificationXP || d.totalXP || d.xp || 0);
                const userPseudo = d.pseudo || d.name || (isCurrent ? (currentPseudo || 'Moi') : 'Coureur');
                const showPseudo = (d.privacy ? (d.privacy.showPseudoInLeaderboard !== false) : true);
                if (userXp > 0 || isCurrent) {
                    users.push({
                        uid,
                        pseudo: userPseudo,
                        xp: userXp,
                        showPseudo,
                        isCurrent
                    });
                }
            });
            if (users.length >= 3) {
                window.communityLeaderboardUsers = users;
            }
        } catch (e) {
            console.warn('Leaderboard sync error:', e);
        }
    }

    function displayRaceBadgesModal() {
        const modal = document.getElementById('badgesModal');
        const content = document.getElementById('badgesContent');
        if (!modal || !content) return;

        const racesData = window.races || (typeof races !== 'undefined' ? races : []);
        const data = calculateGamifiedBadges(racesData);
        window.raceBadges = data.badgesByRace;
        window.recordCocardes = data.recordCocardes;

        // Informations utilisateur connecté
        const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        const currentUid = currentUser ? currentUser.uid : 'local_user';
        const currentPseudo = (currentUser && currentUser.displayName) ? currentUser.displayName : (localStorage.getItem('userPseudo') || 'Coureur');

        // Lancer la synchro Firestore en tâche de fond
        syncCommunityLeaderboard(data.totalPoints, currentPseudo, currentUid);

        // Déterminer le rang actuel
        let currentRankLevel = LEVELS_CONFIG[0];
        LEVELS_CONFIG.forEach(lvl => {
            if (data.levelsState[lvl.id] && data.levelsState[lvl.id].isUnlocked) {
                currentRankLevel = lvl;
            }
        });

        const nextLevelIndex = LEVELS_CONFIG.findIndex(l => l.id === currentRankLevel.id) + 1;
        const nextLevel = (nextLevelIndex < LEVELS_CONFIG.length) ? LEVELS_CONFIG[nextLevelIndex] : null;
        const neededXPForNext = nextLevel ? Math.max(0, nextLevel.requiredXP - data.totalPoints) : 0;

        const totalBadgesCount = Object.keys(BADGES_DEFINITIONS).length;
        const totalUnlockedBadgesCount = Object.values(data.unlockedBadges).filter(b => b.unlocked).length;

        // 1. CARTE RÉCAPITULATIVE DU SCORE ET DU RANG
        let html = `
        <div class="mb-5 bg-white border border-green-200 rounded-xl p-5 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                
                <!-- Score Total XP -->
                <div class="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                    <div class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Score Total</div>
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-extrabold text-green-800">${data.totalPoints}</span>
                        <span class="text-sm font-bold text-green-600">/ 10 000 XP</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        <strong>${totalUnlockedBadgesCount}</strong> / ${totalBadgesCount} missions accomplies
                    </div>
                </div>

                <!-- Rang Actuel & Progression XP -->
                <div class="md:col-span-8">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Rang actuel :</span>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${currentRankLevel.cocarde.bg} ${currentRankLevel.cocarde.text} border ${currentRankLevel.cocarde.border}">
                                <span>${currentRankLevel.emoji}</span>
                                <span>Niveau ${currentRankLevel.levelNumber} - ${currentRankLevel.name}</span>
                            </span>
                        </div>
                        <div class="text-xs text-gray-500">
                            ${nextLevel ? (neededXPForNext === 0 
                                ? `<span class="text-green-700 font-semibold"><i class="fas fa-check"></i> Niveau ${nextLevel.name} débloqué</span>`
                                : `<span>Encore <strong class="text-green-700 font-bold">${neededXPForNext} XP</strong> pour débloquer <strong>${nextLevel.emoji} ${nextLevel.name}</strong> (${data.totalPoints} / ${nextLevel.requiredXP} XP)</span>`
                            ) : `<span class="text-green-700 font-semibold"><i class="fas fa-crown text-amber-500"></i> Sommet atteint — Niveau 10 Crampons !</span>`}
                        </div>
                    </div>

                    <!-- Barre de progression XP -->
                    <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div class="bg-green-600 h-full rounded-full transition-all duration-300" 
                             style="width: ${nextLevel ? Math.min(100, Math.max(3, Math.round((data.totalPoints / nextLevel.requiredXP) * 100))) : 100}%"></div>
                    </div>
                    <div class="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                        <span>🩴 Tong (0 XP)</span>
                        <span>${nextLevel ? `${data.totalPoints} / ${nextLevel.requiredXP} XP pour ${nextLevel.name}` : `Total : ${data.totalPoints} XP`}</span>
                        <span>🧗 Crampons (6 500+ XP)</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        // 2. SECTION CLASSEMENT DES COUREURS (Top 5 + position utilisateur si non top 5)
        const allLeaderboardUsers = buildLeaderboardEntries(data.totalPoints, currentPseudo, currentUid);
        const currentUserIndex = allLeaderboardUsers.findIndex(u => u.isCurrent || u.uid === currentUid);
        const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : 1;
        const top5Users = allLeaderboardUsers.slice(0, 5);
        const isUserInTop5 = currentUserIndex >= 0 && currentUserIndex < 5;

        html += `
        <div class="mb-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div class="leaderboard-header-toggle flex items-center justify-between border-b border-gray-100 pb-2.5 cursor-pointer hover:bg-gray-50/70 p-1 -mx-1 -mt-1 rounded-t-xl select-none" title="Cliquer pour ${userLeaderboardExpandedState ? 'replier' : 'déplier'} le classement">
                <div class="flex items-center gap-2.5">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-extrabold text-sm shadow-2xs">
                        <i class="fas fa-trophy"></i>
                    </span>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                            <span>Classement des Coureurs</span>
                            <span class="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">Top 5</span>
                        </h4>
                    </div>
                </div>
                <div class="flex items-center gap-2.5">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${isUserInTop5 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}">
                        Votre rang : <strong class="font-extrabold">#${currentUserRank}</strong> (${data.totalPoints} XP)
                    </span>
                    <div class="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-2xs">
                        <i class="fas fa-chevron-down text-[11px] transition-transform duration-200 leaderboard-chevron ${userLeaderboardExpandedState ? 'rotate-180' : ''}"></i>
                    </div>
                </div>
            </div>

            <div class="leaderboard-body ${userLeaderboardExpandedState ? '' : 'hidden'} mt-3 space-y-2" id="leaderboard-body">
                <div class="grid grid-cols-1 gap-2">
        `;

        top5Users.forEach((u, idx) => {
            const rank = idx + 1;
            const lvl = getLevelFromTotalXP(u.xp);
            let medalBadge = `<span class="w-6 text-center font-bold text-gray-500 text-xs">#${rank}</span>`;
            if (rank === 1) medalBadge = `<span class="w-6 text-center text-base" title="1ère place">🥇</span>`;
            else if (rank === 2) medalBadge = `<span class="w-6 text-center text-base" title="2ème place">🥈</span>`;
            else if (rank === 3) medalBadge = `<span class="w-6 text-center text-base" title="3ème place">🥉</span>`;

            const isMe = u.isCurrent || (u.uid === currentUid);
            let displayName = '';
            if (isMe) {
                displayName = `<span class="font-bold text-emerald-900">${currentPseudo} <span class="text-xs text-emerald-700 font-semibold">(Moi)</span></span>`;
            } else {
                displayName = (u.showPseudo && u.pseudo) 
                    ? `<span class="font-medium text-gray-800">${u.pseudo}</span>`
                    : `<span class="font-medium text-gray-600">Utilisateur ${rank}</span>`;
            }

            html += `
            <div class="flex items-center justify-between p-2.5 rounded-lg border transition ${isMe ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs' : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100/60'}">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="shrink-0 flex items-center justify-center">${medalBadge}</div>
                    <div class="min-w-0">
                        <div class="text-xs sm:text-sm truncate flex items-center gap-1.5">${displayName}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[11px] px-2 py-0.5 rounded ${lvl.cocarde.pillBg} border hidden sm:inline-flex items-center gap-1">
                        <span>${lvl.emoji}</span>
                        <span>${lvl.name}</span>
                    </span>
                    <span class="text-xs font-bold ${isMe ? 'text-emerald-800 font-extrabold' : 'text-gray-700'} min-w-[70px] text-right">
                        ${u.xp.toLocaleString('fr-FR')} XP
                    </span>
                </div>
            </div>
            `;
        });

        // Si l'utilisateur connecté n'est pas dans le top 5, afficher sa position en dessous
        if (!isUserInTop5 && currentUserIndex >= 0) {
            const myLvl = getLevelFromTotalXP(data.totalPoints);
            html += `
                <div class="flex items-center justify-center py-1 text-gray-300 text-xs tracking-widest select-none">
                    <span>• • •</span>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded-lg border bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="shrink-0 flex items-center justify-center">
                            <span class="w-6 text-center font-extrabold text-emerald-800 text-xs">#${currentUserRank}</span>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs sm:text-sm truncate flex items-center gap-1.5 font-bold text-emerald-900">
                                <span>${currentPseudo}</span>
                                <span class="text-xs text-emerald-700 font-semibold">(Moi)</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-[11px] px-2 py-0.5 rounded ${myLvl.cocarde.pillBg} border hidden sm:inline-flex items-center gap-1">
                            <span>${myLvl.emoji}</span>
                            <span>${myLvl.name}</span>
                        </span>
                        <span class="text-xs font-extrabold text-emerald-800 min-w-[70px] text-right">
                            ${data.totalPoints.toLocaleString('fr-FR')} XP
                        </span>
                    </div>
                </div>
            `;
        }

        const isShowPseudoInLeaderboard = (localStorage.getItem('prefShowPseudoInLeaderboard') !== 'false' && window.prefShowPseudoInLeaderboard !== false);
        const leaderboardToggleText = isShowPseudoInLeaderboard
            ? 'Masquer mon pseudo dans le classement'
            : 'Afficher mon pseudo dans le classement';

        html += `
                </div>
                <div class="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                    <span class="flex items-center gap-1">
                        <i class="fas fa-user-shield text-gray-400"></i>
                        ${isShowPseudoInLeaderboard ? 'Votre pseudo est affiché dans le classement.' : 'Votre pseudo est anonymisé (« Utilisateur X »).'}
                    </span>
                    <button type="button" onclick="openUserSettingsForLeaderboard()" class="text-green-700 hover:text-green-800 hover:underline font-semibold cursor-pointer">
                        ${leaderboardToggleText}
                    </button>
                </div>
            </div>
        </div>
        `;

        // 3. SECTION DES 3 GRANDES COCARDES RECORDS (Repliable)
        const rec = data.recordCocardes || calculateRecordCocardes(racesData);
        const isRecUnlocked = rec && rec.isUnlocked;

        html += `
        <div class="mb-6 bg-white border ${isRecUnlocked ? 'border-amber-200/80' : 'border-gray-300'} rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div class="cocardes-header-toggle flex items-center justify-between border-b border-gray-100 pb-2.5 cursor-pointer hover:bg-gray-50/70 p-1 -mx-1 -mt-1 rounded-t-xl select-none" title="Cliquer pour ${userCocardesExpandedState ? 'replier' : 'déplier'} les records">
                <div class="flex items-center gap-2.5">
                    <svg width="20" height="26" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0 ${isRecUnlocked ? 'filter drop-shadow-xs' : 'opacity-60'}">
                        <path d="M7 16 L2 35 L8.5 36 L12 18 Z" fill="#DC2626"/>
                        <path d="M16 18 L19.5 36 L26 35 L21 16 Z" fill="#2563EB"/>
                        <circle cx="14" cy="14" r="13" fill="#DC2626"/>
                        <circle cx="14" cy="14" r="9" fill="#FFFFFF"/>
                        <circle cx="14" cy="14" r="5.5" fill="#1D4ED8"/>
                    </svg>
                    <h4 class="font-bold text-gray-800 text-sm sm:text-base">Les 3 Cocardes Records</h4>
                </div>
                <div class="flex items-center gap-2.5">
                    ${isRecUnlocked ? `
                        <span class="text-[11px] text-gray-400 hidden sm:inline">Attribuées sur le dashboard et dans la fiche de course</span>
                    ` : `
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                            <i class="fas fa-lock text-[10px] text-amber-600"></i> ${rec.totalRaces || 0} / 5 courses
                        </span>
                    `}
                    <div class="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-2xs">
                        <i class="fas fa-chevron-down text-[11px] transition-transform duration-200 cocardes-chevron ${userCocardesExpandedState ? 'rotate-180' : ''}"></i>
                    </div>
                </div>
            </div>

            <div class="cocardes-body ${userCocardesExpandedState ? '' : 'hidden'} mt-3" id="cocardes-body">
        `;

        if (!isRecUnlocked) {
            html += `
            <div class="relative rounded-xl overflow-hidden min-h-[105px] flex items-center">
                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3 filter blur-[1.5px] opacity-35 select-none pointer-events-none p-1">
                    <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[90px] flex flex-col justify-between">
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold">
                                <i class="fas fa-bolt text-[10px]"></i> RP Temps au km
                            </span>
                            <span class="text-xs">⚡</span>
                        </div>
                        <div class="text-xs text-gray-400 italic">Allure record au km</div>
                    </div>

                    <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[90px] flex flex-col justify-between">
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold">
                                <i class="fas fa-mountain text-[10px]"></i> Plus de Dénivelé
                            </span>
                            <span class="text-xs">⛰️</span>
                        </div>
                        <div class="text-xs text-gray-400 italic">Dénivelé D+ record</div>
                    </div>

                    <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 min-h-[90px] flex flex-col justify-between">
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold">
                                <i class="fas fa-route text-[10px]"></i> Course la Plus Longue
                            </span>
                            <span class="text-xs">🏃‍♂️</span>
                        </div>
                        <div class="text-xs text-gray-400 italic">Distance record en km</div>
                    </div>
                </div>

                <div class="absolute inset-0 z-10 flex items-center justify-center p-2 sm:p-3 bg-gray-900/10 backdrop-blur-xs rounded-xl">
                    <div class="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-xl px-4 py-3 shadow-lg w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="min-w-0">
                                <h5 class="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Cocardes de Records Verrouillées</h5>
                                <p class="text-[11px] text-gray-500 mt-0.5 leading-snug truncate sm:whitespace-normal">
                                    Enregistrez au moins <strong>5 courses</strong> pour débloquer ces 3 cocardes exclusives.
                                </p>
                            </div>
                        </div>
                        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold shrink-0 shadow-2xs">
                            <i class="fas fa-lock text-amber-600 text-[10px]"></i>
                            <span>${rec.totalRaces || 0} / 5 courses</span>
                        </div>
                    </div>
                </div>
            </div>
            `;
        } else {
            html += `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <!-- Record 1: Allure -->
                <div class="bg-gradient-to-br from-amber-50/70 to-white border border-amber-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold">
                            <i class="fas fa-bolt text-[10px]"></i> RP Allure au km
                        </span>
                        <span class="text-xs">⚡</span>
                    </div>
                    <div class="my-1.5">
                        <div class="text-xl font-extrabold text-gray-800">${rec.speedRecord ? rec.speedRecord.value : '--'}</div>
                        <div class="text-xs text-gray-500 font-medium truncate mt-0.5">${rec.speedRecord ? rec.speedRecord.race.name : 'Aucun temps'}</div>
                    </div>
                    ${rec.speedRecord ? `
                        <button class="badge-race-name text-left text-[11px] text-green-700 hover:text-green-900 font-semibold mt-1 pt-1.5 border-t border-amber-100 flex items-center justify-between cursor-pointer" data-race-id="${rec.speedRecord.race.id}">
                            Voir la course <i class="fas fa-arrow-right text-[9px] ml-1"></i>
                        </button>
                    ` : '<div class="text-xs text-gray-400 italic py-2">Non attribuée</div>'}
                </div>

                <!-- Record 2: Dénivelé -->
                <div class="bg-gradient-to-br from-sky-50/70 to-white border border-sky-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold">
                            <i class="fas fa-mountain text-[10px]"></i> Plus de Dénivelé
                        </span>
                        <span class="text-xs">⛰️</span>
                    </div>
                    <div class="my-1.5">
                        <div class="text-xl font-extrabold text-gray-800">${rec.elevationRecord ? rec.elevationRecord.value : '--'}</div>
                        <div class="text-xs text-gray-500 font-medium truncate mt-0.5">${rec.elevationRecord ? rec.elevationRecord.race.name : 'Aucun dénivelé'}</div>
                    </div>
                    ${rec.elevationRecord ? `
                        <button class="badge-race-name text-left text-[11px] text-green-700 hover:text-green-900 font-semibold mt-1 pt-1.5 border-t border-sky-100 flex items-center justify-between cursor-pointer" data-race-id="${rec.elevationRecord.race.id}">
                            Voir la course <i class="fas fa-arrow-right text-[9px] ml-1"></i>
                        </button>
                    ` : '<div class="text-xs text-gray-400 italic py-2">Non attribuée</div>'}
                </div>

                <!-- Record 3: Distance -->
                <div class="bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                            <i class="fas fa-route text-[10px]"></i> Plus Longue Course
                        </span>
                        <span class="text-xs">🏃‍♂️</span>
                    </div>
                    <div class="my-1.5">
                        <div class="text-xl font-extrabold text-gray-800">${rec.distanceRecord ? rec.distanceRecord.value : '--'}</div>
                        <div class="text-xs text-gray-500 font-medium truncate mt-0.5">${rec.distanceRecord ? rec.distanceRecord.race.name : 'Aucune distance'}</div>
                    </div>
                    ${rec.distanceRecord ? `
                        <button class="badge-race-name text-left text-[11px] text-green-700 hover:text-green-900 font-semibold mt-1 pt-1.5 border-t border-emerald-100 flex items-center justify-between cursor-pointer" data-race-id="${rec.distanceRecord.race.id}">
                            Voir la course <i class="fas fa-arrow-right text-[9px] ml-1"></i>
                        </button>
                    ` : '<div class="text-xs text-gray-400 italic py-2">Non attribuée</div>'}
                </div>
            </div>
            `;
        }

        html += `
            </div>
        </div>
        `; // fin section cocardes

        // 4. ONGLETS DE NIVEAUX (10 Onglets)
        html += `
        <div class="flex items-center gap-2 overflow-x-auto pb-1 mb-5 custom-scrollbar">
            <button class="level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${activeLevelTab === 'all' ? 'bg-green-700 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}" data-level="all">
                <i class="fas fa-th-large text-[11px]"></i> Tous les niveaux
            </button>
        `;

        LEVELS_CONFIG.forEach(lvl => {
            const st = data.levelsState[lvl.id];
            const isTabActive = activeLevelTab === lvl.id;
            const lockIcon = st.isUnlocked ? '' : '<i class="fas fa-lock text-[10px] text-amber-600 ml-1"></i>';

            html += `
            <button class="level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${isTabActive ? 'bg-green-700 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}" data-level="${lvl.id}">
                <span>${lvl.emoji}</span>
                <span>Niv. ${lvl.levelNumber} - ${lvl.name}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isTabActive ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-500'}">${st.unlockedCount}/${st.totalCount}</span>
                ${lockIcon}
            </button>
            `;
        });
        html += `</div>`;

        // 5. SECTIONS PAR NIVEAU
        const levelsToRender = activeLevelTab === 'all' 
            ? LEVELS_CONFIG 
            : LEVELS_CONFIG.filter(lvl => lvl.id === activeLevelTab);

        levelsToRender.forEach((lvl, idx) => {
            const st = data.levelsState[lvl.id];
            const prevLvl = idx > 0 ? LEVELS_CONFIG[idx - 1] : null;
            
            let isExpanded = userLevelExpandedState[lvl.id];
            if (isExpanded === undefined) {
                isExpanded = activeLevelTab !== 'all' ? true : st.isUnlocked;
            }
            
            html += `
            <div class="level-section mb-5 bg-white rounded-xl border ${st.isUnlocked ? 'border-gray-200 shadow-sm' : 'border-gray-300'} overflow-hidden transition-all duration-200">
                
                <!-- Header de niveau interactif et repliable -->
                <div class="level-header-toggle p-4 border-b border-gray-100 ${st.isUnlocked ? 'bg-gray-50/70 hover:bg-gray-100/80' : 'bg-gray-100/80 hover:bg-gray-200/70'} flex flex-wrap items-center justify-between gap-3 cursor-pointer transition select-none" data-level-id="${lvl.id}" title="Cliquer pour ${isExpanded ? 'replier' : 'déplier'} ce niveau">
                    <div class="flex items-center gap-2.5">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full ${st.isUnlocked ? `${lvl.cocarde.bg} ${lvl.cocarde.text} border ${lvl.cocarde.border}` : 'bg-gray-200 text-gray-500 border border-gray-300'} text-base font-bold shadow-xs">
                            ${st.isUnlocked ? lvl.emoji : '<i class="fas fa-lock text-sm"></i>'}
                        </span>
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-gray-800 text-base ${!st.isUnlocked ? 'text-gray-600' : ''}">Niveau ${lvl.levelNumber} : ${lvl.name}</h4>
                                <span class="text-xs px-2 py-0.5 rounded-md ${st.isUnlocked ? lvl.cocarde.pillBg : 'bg-gray-200 text-gray-600 border border-gray-300'} border font-medium">
                                    ${lvl.subtitle}
                                </span>
                            </div>
                            <p class="text-xs text-gray-500 mt-0.5">
                                ${lvl.levelTotalXP} XP à débloquer (12 missions) • ${lvl.requiredXP > 0 ? `Déblocage à ${lvl.requiredXP} XP cumulés` : 'Débloqué dès le départ'}
                            </p>
                        </div>
                    </div>

                    <!-- Statut du niveau + Bouton chevron -->
                    <div class="flex items-center gap-3">
                        ${st.isUnlocked ? `
                            <span class="text-xs font-semibold text-gray-600">${st.unlockedCount} / ${st.totalCount} missions (${st.earnedXP} XP)</span>
                            <div class="w-20 bg-gray-200 rounded-full h-2 overflow-hidden hidden sm:block">
                                <div class="bg-green-600 h-full rounded-full" style="width: ${st.percent}%"></div>
                            </div>
                        ` : `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                                <i class="fas fa-lock text-amber-600 text-[11px]"></i>
                                <span>${data.totalPoints} / ${lvl.requiredXP} XP</span>
                            </span>
                        `}
                        <div class="w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-2xs shrink-0">
                            <i class="fas fa-chevron-down text-xs transition-transform duration-200 level-chevron ${isExpanded ? 'rotate-180' : ''}"></i>
                        </div>
                    </div>
                </div>

                <!-- Grille des badges repliable -->
                <div class="level-body ${isExpanded ? '' : 'hidden'} relative overflow-hidden" id="level-body-${lvl.id}">
                    <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 ${st.isUnlocked ? 'bg-white' : 'bg-gray-100/40 filter blur-[1.5px] opacity-35 select-none pointer-events-none'}">
            `;

            lvl.badgeIds.forEach((badgeId, badgeIndex) => {
                const badge = BADGES_DEFINITIONS[badgeId];
                const badgeXp = badge ? badge.xp : 50;

                if (!st.isUnlocked) {
                    html += `
                    <div class="badge-card rounded-lg p-3.5 border border-dashed border-gray-300 bg-gray-50/80 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-2.5">
                                <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-600 border border-gray-300">
                                    🔒 ${lvl.name} • Mission #${badgeIndex + 1}
                                </span>
                                <span class="text-xs font-bold text-gray-400">
                                    +${badgeXp} XP
                                </span>
                            </div>
                            <div class="flex items-start gap-2.5 mb-2">
                                <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 bg-gray-200 text-gray-400">
                                    <i class="fas fa-lock"></i>
                                </div>
                                <div class="flex-grow">
                                    <h5 class="font-semibold text-sm text-gray-500 flex items-center gap-1.5">
                                        <span>Défi Mystère</span>
                                    </h5>
                                    <p class="text-xs text-gray-400 mt-0.5 italic">Atteignez ${lvl.requiredXP} XP au total pour révéler ce défi...</p>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3 pt-2.5 border-t border-gray-200/60">
                            <div class="text-[11px] text-gray-400 flex items-center gap-1">
                                <i class="fas fa-lock text-[10px]"></i> Verrouillé (${lvl.requiredXP} XP requis)
                            </div>
                        </div>
                    </div>
                    `;
                    return;
                }

                const badgeState = data.unlockedBadges[badgeId] || { unlocked: false, races: [] };
                const isUnlocked = badgeState.unlocked && st.isUnlocked;
                const racesForBadge = badgeState.races || [];

                html += `
                <div class="badge-card rounded-lg p-3.5 border transition flex flex-col justify-between ${
                    isUnlocked 
                        ? 'bg-white border-green-200 hover:border-green-300 shadow-xs' 
                        : 'bg-gray-50/80 border-gray-200 opacity-75'
                }">
                    <div>
                        <div class="flex items-center justify-between mb-2.5">
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded ${lvl.cocarde.pillBg} border">
                                ${lvl.emoji} ${lvl.name}
                            </span>
                            <span class="text-xs font-bold ${isUnlocked ? 'text-green-700' : 'text-gray-400'}">
                                +${badgeXp} XP
                            </span>
                        </div>
                        <div class="flex items-start gap-2.5 mb-2">
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                                isUnlocked 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-200 text-gray-400'
                            }">
                                <i class="fas ${isUnlocked ? (badge ? badge.icon : 'fa-award') : 'fa-lock'}"></i>
                            </div>
                            <div class="flex-grow">
                                <h5 class="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                                    <span>${badge ? badge.name : badgeId}</span>
                                    ${isUnlocked ? `<i class="fas fa-check text-green-600 text-xs" title="Mission accomplie"></i>` : ''}
                                </h5>
                                <p class="text-xs text-gray-600 mt-0.5 leading-relaxed">${badge ? badge.description : ''}</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-gray-100">
                `;

                if (isUnlocked && racesForBadge.length > 0) {
                    html += `
                        <div class="text-[11px] text-gray-400 font-medium mb-1">Validé sur :</div>
                        <div class="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                    `;
                    const sortedRaces = [...racesForBadge].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                    sortedRaces.slice(0, 2).forEach(r => {
                        const year = r.date ? new Date(r.date).getFullYear() : '';
                        html += `
                            <button class="badge-race-name text-left text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-green-100 hover:text-green-800 text-gray-700 transition truncate max-w-full cursor-pointer" 
                                    data-race-id="${r.id}" title="${r.name}">
                                <span class="truncate">${r.name}</span>
                                <span class="text-gray-400 text-[10px]">(${year})</span>
                            </button>
                        `;
                    });

                    if (sortedRaces.length > 2) {
                        html += `<span class="text-[10px] text-gray-500 self-center">+${sortedRaces.length - 2} autre(s)</span>`;
                    }
                    html += `</div>`;
                } else if (isUnlocked) {
                    html += `<div class="text-[11px] font-semibold text-green-700 flex items-center gap-1"><i class="fas fa-check"></i> Mission accomplie</div>`;
                } else {
                    html += `<div class="text-[11px] text-gray-400 flex items-center gap-1"><i class="fas fa-hourglass-start text-[10px]"></i> En attente</div>`;
                }

                html += `
                    </div>
                </div>
                `;
            });

            html += `</div>`; // fin grid

            if (!st.isUnlocked && prevLvl) {
                const percentToUnlock = Math.min(100, Math.round((data.totalPoints / lvl.requiredXP) * 100));
                const remainingXP = Math.max(0, lvl.requiredXP - data.totalPoints);
                html += `
                <div class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gray-900/15 backdrop-blur-xs text-center">
                    <div class="bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl p-6 shadow-2xl max-w-md mx-auto flex flex-col items-center">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center text-3xl mb-3 shadow-md transform hover:scale-105 transition">
                            <i class="fas fa-lock"></i>
                        </div>
                        <h5 class="text-base font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                            <span>Niveau ${lvl.levelNumber} : ${lvl.name} verrouillé</span>
                        </h5>
                        <p class="text-xs text-gray-600 max-w-sm mx-auto mb-3 leading-relaxed">
                            Vous devez accumuler au moins <strong class="text-amber-800 font-bold">${lvl.requiredXP} XP</strong> au total pour ouvrir ce niveau et révéler ses défis secrets.
                        </p>
                        <div class="w-full max-w-xs bg-gray-100 rounded-full h-2.5 overflow-hidden mb-3 border border-gray-200">
                            <div class="bg-amber-500 h-full rounded-full transition-all duration-300" style="width: ${percentToUnlock}%"></div>
                        </div>
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold shadow-xs">
                            <i class="fas fa-lock text-amber-600 text-[11px]"></i>
                            <span>Progression : <strong class="text-amber-800">${data.totalPoints} / ${lvl.requiredXP} XP</strong> (encore <strong class="text-green-700">${remainingXP} XP</strong>)</span>
                        </div>
                    </div>
                </div>
                `;
            }

            html += `
                </div>
            </div>
            `;
        });

        content.innerHTML = html;

        // Onglets
        content.querySelectorAll('.level-tab-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                activeLevelTab = this.getAttribute('data-level');
                if (activeLevelTab !== 'all') {
                    userLevelExpandedState[activeLevelTab] = true;
                }
                displayRaceBadgesModal();
            });
        });

        // Toggle section Cocardes Records
        content.querySelectorAll('.cocardes-header-toggle').forEach(header => {
            header.addEventListener('click', function () {
                const body = document.getElementById('cocardes-body');
                const chevron = this.querySelector('.cocardes-chevron');
                if (!body) return;
                const isHidden = body.classList.contains('hidden');
                if (isHidden) {
                    body.classList.remove('hidden');
                    if (chevron) chevron.classList.add('rotate-180');
                    userCocardesExpandedState = true;
                } else {
                    body.classList.add('hidden');
                    if (chevron) chevron.classList.remove('rotate-180');
                    userCocardesExpandedState = false;
                }
                localStorage.setItem('cocardesExpandedState', userCocardesExpandedState ? 'true' : 'false');
            });
        });

        // Toggle section Leaderboard
        content.querySelectorAll('.leaderboard-header-toggle').forEach(header => {
            header.addEventListener('click', function () {
                const body = document.getElementById('leaderboard-body');
                const chevron = this.querySelector('.leaderboard-chevron');
                if (!body) return;
                const isHidden = body.classList.contains('hidden');
                if (isHidden) {
                    body.classList.remove('hidden');
                    if (chevron) chevron.classList.add('rotate-180');
                    userLeaderboardExpandedState = true;
                } else {
                    body.classList.add('hidden');
                    if (chevron) chevron.classList.remove('rotate-180');
                    userLeaderboardExpandedState = false;
                }
                localStorage.setItem('leaderboardExpandedState', userLeaderboardExpandedState ? 'true' : 'false');
            });
        });

        // Replier / Déplier les sections de niveaux
        content.querySelectorAll('.level-header-toggle').forEach(header => {
            header.addEventListener('click', function () {
                const levelId = this.getAttribute('data-level-id');
                const body = document.getElementById(`level-body-${levelId}`);
                const chevron = this.querySelector('.level-chevron');
                if (!body) return;

                const isCurrentlyHidden = body.classList.contains('hidden');
                if (isCurrentlyHidden) {
                    body.classList.remove('hidden');
                    if (chevron) chevron.classList.add('rotate-180');
                    userLevelExpandedState[levelId] = true;
                } else {
                    body.classList.add('hidden');
                    if (chevron) chevron.classList.remove('rotate-180');
                    userLevelExpandedState[levelId] = false;
                }
            });
        });

        // Clic sur course pour ouvrir ses détails
        content.querySelectorAll('.badge-race-name').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                const raceId = this.getAttribute('data-race-id');
                modal.classList.add('hidden');
                if (typeof showRaceDetails === 'function') {
                    showRaceDetails(raceId);
                }
            });
        });

        modal.classList.remove('hidden');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 8. SCORES DE PRESTIGE POUR LE TRI DANS LES MODALES DE DÉTAIL
    // ─────────────────────────────────────────────────────────────────────────────
    const BADGE_PRESTIGE_SCORES = {};
    Object.values(BADGES_DEFINITIONS).forEach(b => {
        // Formule : Niveau * 1000 + XP (les missions de haut niveau et haut XP ressortent en premier)
        BADGE_PRESTIGE_SCORES[b.id] = (b.level * 1000) + b.xp;
    });
    // Ajustements spécifiques pour mettre en avant les exploits de performance
    if (BADGE_PRESTIGE_SCORES.premier_dossard) BADGE_PRESTIGE_SCORES.premier_dossard = 100; // en dernier du niveau 1

    function sortBadgesByPrestige(badgeKeys) {
        if (!badgeKeys || !Array.isArray(badgeKeys)) return [];
        return [...badgeKeys].sort((a, b) => {
            const scoreA = BADGE_PRESTIGE_SCORES[a] || 0;
            const scoreB = BADGE_PRESTIGE_SCORES[b] || 0;
            return scoreB - scoreA;
        });
    }

    function getBadgeInfo(badgeKey) {
        const legacyMap = {
            first_step: 'premier_dossard',
            five_k: 'cinq_majeur',
            finish_line: 'chrono_note',
            cheap_run: 'radin_malin',
            companion_run: 'copains_dechappee',
            hill_discovery: 'faux_plat_montant',
            ten_k: 'le_cap_des_10',
            sub_60_10k: 'aventurier_express',
            climber_500: 'chasseur_de_cotes',
            regular_runner: 'fidele_du_bitume',
            half_marathon: 'demi_dieu',
            sub_50_10k: 'fleche_des_10k',
            climber_1000: 'grimpeur_confirme',
            relay_specialist: 'passeur_de_temoin',
            explorer_cities: 'explorateur_local',
            marathon_finisher: 'le_mythe_du_42',
            sub_40_10k: 'sous_les_40',
            climber_2000: 'le_cap_des_cimes',
            ultra_runner: 'entree_dans_lultra',
            hasRPMile: 'aventurier_express',
            hasMostExpensive: 'radin_malin',
            hasMostElevation: 'grimpeur_confirme',
            hasLongestDistance: 'demi_dieu'
        };

        const resolvedKey = legacyMap[badgeKey] || badgeKey;
        const badge = BADGES_DEFINITIONS[resolvedKey];
        if (!badge) return null;

        const level = LEVELS_CONFIG.find(l => l.levelNumber === badge.level) || LEVELS_CONFIG[0];

        return {
            id: badge.id,
            name: badge.name,
            icon: badge.icon,
            description: badge.description,
            level: badge.level,
            levelName: level.name,
            levelEmoji: level.emoji,
            points: badge.xp,
            xp: badge.xp,
            requiredXP: level.requiredXP,
            cocarde: level.cocarde,
            colorClass: `${level.cocarde.bg} ${level.cocarde.text} ${level.cocarde.border}`,
            prestigeScore: BADGE_PRESTIGE_SCORES[badge.id] || 0
        };
    }

    function calculateRaceBadges(racesList) {
        const data = calculateGamifiedBadges(racesList);
        window.recordCocardes = data.recordCocardes;
        return data.badgesByRace;
    }

    function setupBadgesListeners() {
        const badgesBtn = document.getElementById('badgesBtn');
        const modal = document.getElementById('badgesModal');
        const closeBtn = document.getElementById('closeBadgesModal');

        if (badgesBtn) {
            badgesBtn.onclick = (e) => {
                e.preventDefault();
                displayRaceBadgesModal();
            };
        }

        if (closeBtn) {
            closeBtn.onclick = () => { if (modal) modal.classList.add('hidden'); };
        }

        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target.id === 'badgesModal' || e.target.id === 'badgesModalOverlay') {
                    modal.classList.add('hidden');
                }
            });
        }
    }

    function updateBadgesButtonVisibility() {
        const badgesBtn = document.getElementById('badgesBtn');
        if (!badgesBtn) return;
        badgesBtn.classList.remove('hidden');
    }

    // Injection au chargement
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('badgesModal')) {
            const div = document.createElement('div');
            div.innerHTML = badgesModalHTML;
            document.body.appendChild(div);
            setupBadgesListeners();

            document.addEventListener('click', function (e) {
                if (!e.target.closest('.group\\/badge-more')) {
                    document.querySelectorAll('.badge-more-popover').forEach(pop => {
                        pop.classList.add('hidden');
                    });
                }
            });
        }
    });

    // Exports globaux
    window.LEVELS_CONFIG = LEVELS_CONFIG;
    window.BADGES_DEFINITIONS = BADGES_DEFINITIONS;
    window.BADGE_PRESTIGE_SCORES = BADGE_PRESTIGE_SCORES;
    window.sortBadgesByPrestige = sortBadgesByPrestige;
    window.displayRaceBadgesModal = displayRaceBadgesModal;
    window.getBadgeInfo = getBadgeInfo;
    window.calculateGamifiedBadges = calculateGamifiedBadges;
    window.calculateRaceBadges = calculateRaceBadges;
    window.calculateRecordCocardes = calculateRecordCocardes;
    window.updateBadgesButtonVisibility = updateBadgesButtonVisibility;

})();
