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
                'compteur_lance', 'la_vingtaine', 'compteur_dplus_lance', 'chasseur_de_cotes', 'le_cap_des_10', 'duo_support'
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
                'fidele_du_bitume', 'club_des_50', 'mur_du_denivele', 'belle_bosse', 'le_15_bornes', 'course_nocturne'
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
                'quotidien_actif', 'habitue_du_carnet', 'cap_des_100', 'chamois_des_collines', 'double_soutien', 'demi_dieu'
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
                'compteur_a_dix', 'objectif_3000_dplus', 'grand_volume', 'au_dela_du_semi', 'grimpeur_confirme', 'defi_longue_duree'
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
                'quinze_au_compteur', 'double_centurion', 'le_cap_des_35', 'grosse_montee', 'peloton_dami', 'debrief_detaille'
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
                'vingtieme_borne', 'le_cap_des_8000_dplus', 'les_300_bornes', 'le_cap_des_cimes', 'communaute_active', 'le_mythe_du_42'
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
                'le_cap_des_400', 'tete_de_peloton', 'entree_dans_lultra', 'haute_altitude', 'tribu_en_course', 'tour_de_france_des_courses'
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
                'trente_dossards', 'demi_millier', 'ultra_longue_distance', 'toit_des_montagnes', 'triple_epreuve_5h', 'arsenal_complet'
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
                'le_grand_millier', 'format_endurance_extreme', 'le_cap_des_100_ultra', 'reine_des_montees', 'garde_des_souvenirs', 'grand_explorateur_mondial'
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
            description: 'Enregistrer 1 course avec un coût d\'inscription ≤ 1 €/km.'
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
        duo_support: {
            id: 'duo_support',
            level: 2,
            xp: 130,
            name: 'Duo en or',
            icon: 'fa-people-arrows',
            description: 'Avoir couru avec au moins 1 accompagnant regardant (spectateur) et 1 accompagnant coureur.'
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
        course_nocturne: {
            id: 'course_nocturne',
            level: 3,
            xp: 130,
            name: 'Oiseau de nuit',
            icon: 'fa-moon',
            description: 'Courir ou prendre un départ de course ou de relais entre 00h00 et 06h00 du matin.'
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
        double_soutien: {
            id: 'double_soutien',
            level: 4,
            xp: 140,
            name: 'Fan-club au complet',
            icon: 'fa-users-viewfinder',
            description: 'Avoir couru avec au moins 2 accompagnants regardants et 2 accompagnants coureurs.'
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
        defi_longue_duree: {
            id: 'defi_longue_duree',
            level: 5,
            xp: 180,
            name: 'Course au long cours',
            icon: 'fa-hourglass-end',
            description: 'Terminer une épreuve dont la durée totale dépasse 5 heures (solo, relais ou triathlon).'
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
        peloton_dami: {
            id: 'peloton_dami',
            level: 6,
            xp: 150,
            name: 'Peloton d\'amis',
            icon: 'fa-users-rays',
            description: 'Avoir couru avec au moins 5 accompagnants au total sur une même course.'
        },
        debrief_detaille: {
            id: 'debrief_detaille',
            level: 6,
            xp: 150,
            name: 'Plume du coureur',
            icon: 'fa-feather-pointed',
            description: 'Avoir rédigé des débriefings ou notes personnelles sur au moins 3 courses différentes.'
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
        communaute_active: {
            id: 'communaute_active',
            level: 7,
            xp: 190,
            name: 'Liaison publique',
            icon: 'fa-share-nodes',
            description: 'Ajouter à sa Wishlist au moins 1 course depuis le répertoire public et donner au moins 1 « J\'aime ».'
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
        tribu_en_course: {
            id: 'tribu_en_course',
            level: 8,
            xp: 180,
            name: 'Grande tribu',
            icon: 'fa-people-group',
            description: 'Avoir couru avec au moins 10 accompagnants au total sur une même course.'
        },
        tour_de_france_des_courses: {
            id: 'tour_de_france_des_courses',
            level: 8,
            xp: 180,
            name: 'Tour de France des courses',
            icon: 'fa-route',
            description: 'Avoir couru dans au moins 5 départements français différents.'
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
        triple_epreuve_5h: {
            id: 'triple_epreuve_5h',
            level: 9,
            xp: 210,
            name: 'Maître de l\'endurance 5h',
            icon: 'fa-stopwatch-20',
            description: 'Avoir terminé au moins 2 épreuves d\'une durée supérieure à 5 heures.'
        },
        arsenal_complet: {
            id: 'arsenal_complet',
            level: 9,
            xp: 220,
            name: 'Carnet ultra-équipé',
            icon: 'fa-toolbox',
            description: 'Avoir au moins 5 courses complètes réunissant tous les éléments : photo, trace GPX, note, classement et lien Drive.'
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
            icon: 'fa-earth-americas',
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
        garde_des_souvenirs: {
            id: 'garde_des_souvenirs',
            level: 10,
            xp: 150,
            name: 'Archives vivantes',
            icon: 'fa-camera-retro',
            description: 'Avoir au moins 15 courses avec photos souvenirs et traces GPX associées.'
        },
        grand_explorateur_mondial: {
            id: 'grand_explorateur_mondial',
            level: 10,
            xp: 160,
            name: 'Globe-trotteur',
            icon: 'fa-globe',
            description: 'Avoir couru dans au moins 2 pays différents ou dans 10 départements distincts.'
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

    // Dictionnaire des départements français et des principales villes / préfectures
    const DEPARTMENTS_MAP = {
        // Départements officiels (noms normalisés sans accents ni tirets)
        'ain': '01', 'aisne': '02', 'allier': '03', 'alpes de haute provence': '04', 'hautes alpes': '05',
        'alpes maritimes': '06', 'ardeche': '07', 'ardennes': '08', 'ariege': '09', 'aube': '10',
        'aude': '11', 'aveyron': '12', 'bouches du rhone': '13', 'calvados': '14', 'cantal': '15',
        'charente': '16', 'charente maritime': '17', 'cher': '18', 'correze': '19', 'corse du sud': '2A',
        'haute corse': '2B', 'corse': '2A', 'cote d or': '21', 'cotes d armor': '22', 'creuse': '23',
        'dordogne': '24', 'doubs': '25', 'drome': '26', 'eure': '27', 'eure et loir': '28',
        'finistere': '29', 'gard': '30', 'haute garonne': '31', 'gers': '32', 'gironde': '33',
        'herault': '34', 'ille et vilaine': '35', 'indre': '36', 'indre et loire': '37', 'isere': '38',
        'jura': '39', 'landes': '40', 'loir et cher': '41', 'loire': '42', 'haute loire': '43',
        'loire atlantique': '44', 'loiret': '45', 'lot': '46', 'lot et garonne': '47', 'lozere': '48',
        'maine et loire': '49', 'manche': '50', 'marne': '51', 'haute marne': '52',
        'meurthe et moselle': '54', 'meuse': '55', 'morbihan': '56', 'moselle': '57', 'nievre': '58',
        'nord': '59', 'oise': '60', 'orne': '61', 'pas de calais': '62', 'puy de dome': '63',
        'pyrenees atlantiques': '64', 'hautes pyrenees': '65', 'pyrenees orientales': '66', 'bas rhin': '67',
        'haut rhin': '68', 'rhone': '69', 'haute saone': '70', 'saone et loire': '71', 'sarthe': '72',
        'savoie': '73', 'haute savoie': '74', 'paris': '75', 'seine maritime': '76', 'seine et marne': '77',
        'yvelines': '78', 'deux sevres': '79', 'somme': '80', 'tarn': '81', 'tarn et garonne': '82',
        'var': '83', 'vaucluse': '84', 'vendee': '85', 'haute vienne': '87',
        'vosges': '88', 'yonne': '89', 'territoire de belfort': '90', 'essonne': '91', 'hauts de seine': '92',
        'seine saint denis': '93', 'val de marne': '94', 'val d oise': '95', 'guadeloupe': '971',
        'martinique': '972', 'guyane': '973', 'la reunion': '974', 'reunion': '974', 'mayotte': '976',

        // Villes, préfectures et hauts lieux de course
        'marseille': '13', 'aix en provence': '13', 'arles': '13', 'salon de provence': '13', 'cassis': '13', 'la ciotat': '13', 'aubagne': '13', 'istres': '13', 'martigues': '13',
        'lyon': '69', 'villeurbanne': '69', 'venissieux': '69', 'caluire': '69', 'saint priest': '69', 'vaulx en velin': '69',
        'toulouse': '31', 'colomiers': '31', 'tournefeuille': '31', 'blagnac': '31', 'muret': '31',
        'nice': '06', 'cannes': '06', 'antibes': '06', 'menton': '06', 'grasse': '06', 'cagnes sur mer': '06', 'mandelieu': '06',
        'nantes': '44', 'saint nazaire': '44', 'saint herblain': '44', 'reze': '44', 'pornic': '44', 'la baule': '44', 'guerande': '44', 'clisson': '44',
        'strasbourg': '67', 'haguenau': '67', 'schiltigheim': '67', 'illkirch': '67', 'saverne': '67', 'selestat': '67',
        'montpellier': '34', 'beziers': '34', 'sete': '34', 'agde': '34', 'lunel': '34', 'frontignan': '34', 'castelnau le lez': '34',
        'bordeaux': '33', 'merignac': '33', 'pessac': '33', 'talence': '33', 'villenave': '33', 'arcachon': '33', 'libourne': '33',
        'lille': '59', 'roubaix': '59', 'tourcoing': '59', 'dunkerque': '59', 'villeneuve d ascq': '59', 'valenciennes': '59', 'douai': '59', 'cambrai': '59',
        'rennes': '35', 'saint malo': '35', 'fougeres': '35', 'vitre': '35', 'dinard': '35',
        'reims': '51', 'chalons en champagne': '51', 'epernay': '51',
        'toulon': '83', 'la seyne sur mer': '83', 'hyeres': '83', 'frejus': '83', 'saint raphael': '83', 'saint tropez': '83', 'draguignan': '83',
        'saint etienne': '42', 'roanne': '42', 'saint chamond': '42', 'firminy': '42',
        'le havre': '76', 'rouen': '76', 'dieppe': '76', 'fecamp': '76', 'etretat': '76',
        'grenoble': '38', 'saint martin d heres': '38', 'echirolles': '38', 'vienne': '38', 'bourgoin jallieu': '38', 'voiron': '38', 'chamrousse': '38', 'l alpe d huez': '38', 'alpe d huez': '38', 'les deux alpes': '38',
        'dijon': '21', 'beaune': '21', 'chenove': '21',
        'angers': '49', 'cholet': '49', 'saumur': '49',
        'nimes': '30', 'ales': '30', 'bagnols sur ceze': '30', 'uzes': '30',
        'le mans': '72', 'la fleche': '72',
        'brest': '29', 'quimper': '29', 'concarneau': '29', 'morlaix': '29', 'crozon': '29', 'douarnenez': '29',
        'tours': '37', 'joue les tours': '37', 'amboise': '37', 'chinon': '37',
        'amiens': '80', 'abbeville': '80',
        'limoges': '87', 'saint junien': '87',
        'annecy': '74', 'chamonix': '74', 'morzine': '74', 'la clusaz': '74', 'megeve': '74', 'thonon les bains': '74', 'evian': '74', 'annemasse': '74', 'cluses': '74', 'sallanches': '74', 'saint gervais': '74', 'avoriaz': '74', 'le grand bornand': '74',
        'chambery': '73', 'aix les bains': '73', 'albertville': '73', 'val d isere': '73', 'tignes': '73', 'courchevel': '73', 'meribel': '73', 'les arcs': '73', 'la plagne': '73', 'val thorens': '73', 'modane': '73', 'saint jean de maurienne': '73',
        'perpignan': '66', 'canet en roussillon': '66', 'font romeu': '66', 'argeles sur mer': '66', 'collioure': '66',
        'boulogne billancourt': '92', 'nanterre': '92', 'courbevoie': '92', 'colombes': '92', 'asnieres sur seine': '92', 'rueil malmaison': '92', 'issy les moulineaux': '92', 'levallois perret': '92', 'antony': '92', 'neuilly sur seine': '92', 'clichy': '92',
        'metz': '57', 'thionville': '57', 'montigny les metz': '57', 'forbach': '57', 'sarreguemines': '57',
        'besancon': '25', 'montbeliard': '25', 'pontarlier': '25',
        'orleans': '45', 'fleury les aubrais': '45', 'olivet': '45', 'montargis': '45',
        'saint denis': '93', 'montreuil': '93', 'aubervilliers': '93', 'aulnay sous bois': '93', 'drancy': '93', 'noisy le grand': '93', 'pantin': '93', 'bondy': '93', 'epinay sur seine': '93',
        'argenteuil': '95', 'sarcelles': '95', 'cergy': '95', 'garges les gonesse': '95', 'franconville': '95', 'pontoise': '95', 'bezons': '95',
        'mulhouse': '68', 'colmar': '68', 'saint louis': '68',
        'caen': '14', 'herouville saint clair': '14', 'lisieux': '14', 'deauville': '14', 'cabourg': '14', 'honfleur': '14',
        'nancy': '54', 'vandoeuvre les nancy': '54', 'luneville': '54', 'toul': '54',
        'saint paul': '974', 'saint denis reunion': '974', 'saint pierre': '974', 'le tampon': '974', 'saint andre': '974', 'saint louis reunion': '974', 'le port': '974', 'cilaos': '974', 'salazie': '974',
        'avignon': '84', 'orange': '84', 'carpentras': '84', 'cavaillon': '84',
        'poitiers': '86', 'chatellerault': '86',
        'creteil': '94', 'vitry sur seine': '94', 'champigny sur marne': '94', 'saint maur des fosses': '94', 'ivry sur seine': '94', 'villejuif': '94', 'fontenay sous bois': '94', 'vincennes': '94', 'maisons alfort': '94',
        'versailles': '78', 'sartrouville': '78', 'mantes la jolie': '78', 'saint germain en laye': '78', 'poissy': '78', 'conflans sainte honorine': '78', 'plaisir': '78', 'rambouillet': '78',
        'pau': '64', 'bayonne': '64', 'anglet': '64', 'biarritz': '64', 'saint jean de luz': '64', 'hendaye': '64',
        'calais': '62', 'boulogne sur mer': '62', 'arras': '62', 'lens': '62', 'lievin': '62', 'le touquet': '62',
        'bourges': '18', 'vierzon': '18',
        'la rochelle': '17', 'saintes': '17', 'rochefort': '17', 'royan': '17', 'ile de re': '17', 'ile d oleron': '17',
        'valence': '26', 'montelimar': '26', 'romans sur isere': '26',
        'ajaccio': '2A', 'porto vecchio': '2A', 'propriano': '2A', 'bonifacio': '2A',
        'bastia': '2B', 'calvi': '2B', 'corte': '2B', 'ile rousse': '2B',
        'troyes': '10', 'romilly sur seine': '10',
        'niort': '79', 'bressuire': '79', 'parthenay': '79',
        'lorient': '56', 'vannes': '56', 'lanester': '56', 'ploemeur': '56', 'auray': '56', 'pontivy': '56', 'quiberon': '56',
        'montauban': '82', 'castelsarrasin': '82',
        'saint quentin': '02', 'soissons': '02', 'laon': '02',
        'saint brieuc': '22', 'lannion': '22', 'ploufragan': '22', 'dinan': '22', 'guingamp': '22',
        'cherbourg': '50', 'saint lo': '50', 'granville': '50', 'coutances': '50', 'avranches': '50', 'mont saint michel': '50',
        'evry': '91', 'corbeil essonnes': '91', 'massy': '91', 'savigny sur orge': '91', 'sainte genevieve des bois': '91', 'palaiseau': '91', 'athis mons': '91',
        'meaux': '77', 'chelles': '77', 'melun': '77', 'pontault combault': '77', 'savigny le temple': '77', 'fontainebleau': '77',
        'beauvais': '60', 'compiegne': '60', 'creil': '60', 'senlis': '60', 'chantilly': '60',
        'laval': '53', 'mayenne': '53', 'chateau gontier': '53',
        'chartres': '28', 'dreux': '28', 'chateaudun': '28',
        'blois': '41', 'romorantin': '41', 'vendome': '41',
        'chateauroux': '36', 'issoudun': '36',
        'albi': '81', 'castres': '81', 'gaillac': '81',
        'tarbes': '65', 'lourdes': '65', 'saint lary': '65', 'cauterets': '65', 'bagneres de bigorre': '65', 'gavarnie': '65',
        'rodez': '12', 'millau': '12', 'villefranche de rouergue': '12',
        'aurillac': '15', 'saint flour': '15',
        'mende': '48', 'marvejols': '48',
        'cahors': '46', 'figeac': '46',
        'agen': '47', 'villeneuve sur lot': '47', 'marmande': '47',
        'auch': '32', 'condom': '32', 'fleurance': '32',
        'mont de marsan': '40', 'dax': '40', 'biscarrosse': '40', 'hossegor': '40', 'capbreton': '40',
        'perigueux': '24', 'bergerac': '24', 'sarlat': '24',
        'angouleme': '16', 'cognac': '16',
        'gueret': '23', 'aubusson': '23',
        'tulle': '19', 'brive la gaillarde': '19', 'brive': '19', 'ussel': '19',
        'moulins': '03', 'vichy': '03', 'montlucon': '03',
        'le puy en velay': '43', 'monistrol': '43', 'yssingeaux': '43',
        'nevers': '58', 'cosne cours sur loire': '58',
        'auxerre': '89', 'sens': '89', 'joigny': '89',
        'macon': '71', 'chalon sur saone': '71', 'autun': '71', 'le creusot': '71', 'montceau les mines': '71',
        'vesoul': '70', 'lure': '70', 'luxeuil': '70',
        'lons le saunier': '39', 'dole': '39', 'saint claude': '39', 'les rousses': '39',
        'belfort': '90', 'delle': '90',
        'gap': '05', 'briancon': '05', 'embrun': '05', 'serre chevalier': '05',
        'digne les bains': '04', 'manosque': '04', 'sisteron': '04',
        'charleville mezieres': '08', 'sedan': '08', 'revin': '08',
        'chaumont': '52', 'saint dizier': '52', 'langres': '52',
        'bar le duc': '55', 'verdun': '55', 'commercy': '55',
        'epinal': '88', 'saint die des vosges': '88', 'gerardmer': '88', 'la bresse': '88', 'remiremont': '88',
        'alencon': '61', 'flers': '61', 'argentan': '61',
        'evreux': '27', 'vernon': '27', 'louviers': '27',
        'monaco': '98'
    };

    function normalizeLocationStr(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function extractDepartment(locOrRace) {
        if (!locOrRace) return null;

        // 1. Si c'est un objet course ou une chaîne, on inspecte toutes les propriétés potentielles
        const textCandidates = [];
        if (typeof locOrRace === 'object') {
            const r = locOrRace;
            if (r.department) textCandidates.push(String(r.department));
            if (r.dept) textCandidates.push(String(r.dept));
            if (r.departement) textCandidates.push(String(r.departement));
            if (r.postalCode) textCandidates.push(String(r.postalCode));
            if (r.codePostal) textCandidates.push(String(r.codePostal));
            if (r.cp) textCandidates.push(String(r.cp));
            if (r.zip) textCandidates.push(String(r.zip));
            if (r.zipCode) textCandidates.push(String(r.zipCode));
            if (r.location) textCandidates.push(String(r.location));
            if (r.city) textCandidates.push(String(r.city));
            if (r.ville) textCandidates.push(String(r.ville));
            if (r.place) textCandidates.push(String(r.place));
            if (r.lieu) textCandidates.push(String(r.lieu));
            if (r.region) textCandidates.push(String(r.region));
            if (r.name) textCandidates.push(String(r.name));
        } else if (typeof locOrRace === 'string' || typeof locOrRace === 'number') {
            textCandidates.push(String(locOrRace));
        }

        if (textCandidates.length === 0) return null;

        for (let raw of textCandidates) {
            if (!raw || typeof raw !== 'string') continue;
            const str = raw.trim();
            if (!str) continue;

            // Détection si c'est directement un numéro pur (ex: "75", "6", "2A", "2B", "974")
            const pureMatch = str.match(/^(0[1-9]|[1-8]\d|9[0-5]|97[1-6]|2[ABab]|[1-9])$/i);
            if (pureMatch) {
                const val = pureMatch[1].toUpperCase();
                return val.length === 1 ? '0' + val : val;
            }

            // Code postal français à 5 chiffres (ex: 75012, 69002, 33000, 20167, 97400)
            const cpMatch = str.match(/\b(0[1-9]|[1-8]\d|9[0-5]|97[1-6]|20)\d{3}\b/);
            if (cpMatch) {
                const prefix = cpMatch[1];
                if (prefix === '20') {
                    const fullCp = cpMatch[0];
                    const num = parseInt(fullCp, 10);
                    return (num >= 20000 && num <= 20199) ? '2A' : '2B';
                }
                return prefix;
            }

            // Département entre parenthèses, crochets ou après mention dept (ex: "(75)", "dept 33", "[06]")
            const deptExplicitMatch = str.match(/(?:[\(\[\{,\/\s-]|\b)(?:dept|dpt|d[eé]partement|d[eé]p\.?)?\s*(0[1-9]|[1-8]\d|9[0-5]|97[1-6]|2[ABab])(?:[\)\]\},.\/\s-]|\b)/i);
            if (deptExplicitMatch) {
                return deptExplicitMatch[1].toUpperCase();
            }

            // Normalisation pour recherche textuelle (villes et départements en toutes lettres)
            const norm = normalizeLocationStr(str);
            if (!norm) continue;

            // Recherche exacte dans le dictionnaire
            if (DEPARTMENTS_MAP[norm]) {
                return DEPARTMENTS_MAP[norm];
            }

            // Recherche des mots clés du dictionnaire dans le texte normalisé
            const words = norm.split(' ');
            for (let word of words) {
                if (word.length >= 3 && DEPARTMENTS_MAP[word]) {
                    return DEPARTMENTS_MAP[word];
                }
            }

            // Test des clés composées (ex: "haute savoie", "saint malo", "aix en provence")
            const dictKeys = Object.keys(DEPARTMENTS_MAP);
            for (let key of dictKeys) {
                if (key.includes(' ') && norm.includes(key)) {
                    return DEPARTMENTS_MAP[key];
                }
            }
        }

        return null;
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
    // 5. METADATA DE VALIDATION DES MISSIONS & CALCUL GLOBAL
    // ─────────────────────────────────────────────────────────────────────────────
    function formatBadgeUnlockDate(isoString) {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return '';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} à ${hours}h${minutes}`;
        } catch (e) {
            return '';
        }
    }
    window.formatBadgeUnlockDate = formatBadgeUnlockDate;

    function getStoredBadgesMetadata() {
        if (window.unlockedBadgesMetadata && typeof window.unlockedBadgesMetadata === 'object' && Object.keys(window.unlockedBadgesMetadata).length > 0) {
            return window.unlockedBadgesMetadata;
        }
        const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        const storageKey = 'unlockedBadgesMetadata_' + (currentUser ? currentUser.uid : 'local_user');
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                window.unlockedBadgesMetadata = JSON.parse(stored) || {};
                return window.unlockedBadgesMetadata;
            }
        } catch (e) {}
        window.unlockedBadgesMetadata = window.unlockedBadgesMetadata || {};
        return window.unlockedBadgesMetadata;
    }

    function syncBadgesMetadataToFirestore(metadataMap) {
        try {
            const fbUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
            if (!fbUser || !fbUser.uid || typeof db === 'undefined') return;
            
            const payload = {};
            Object.entries(metadataMap).forEach(([badgeId, meta]) => {
                if (meta && meta.unlockedAt) {
                    payload[`badgesMetadata.${badgeId}`] = meta;
                }
            });
            if (Object.keys(payload).length > 0) {
                db.collection('users').doc(fbUser.uid).set(payload, { merge: true })
                    .catch(e => console.warn('[Badges] Firestore sync badgesMetadata error:', e));
            }
        } catch (e) {
            console.warn('[Badges] syncBadgesMetadataToFirestore error:', e);
        }
    }

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

            const rawLoc = typeof race.location === 'string' ? race.location : (typeof race.city === 'string' ? race.city : (typeof race.place === 'string' ? race.place : ''));
            const loc = normalizeLocationStr(rawLoc);
            const rawTerrain = typeof race.terrain === 'string' ? race.terrain : 'route';
            const terrain = rawTerrain.trim().toLowerCase();
            const season = getSeason(race.date);
            const dept = extractDepartment(race);

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
        
        // Profil soigné : doit obligatoirement avoir un pseudo valide ET une vraie photo de profil importée (pas un avatar par défaut)
        const userPseudoVal = window.currentUserPseudo || localStorage.getItem('userPseudo') || (window.currentUser && (window.currentUser.displayName || window.currentUser.pseudo)) || '';
        const hasValidPseudo = typeof userPseudoVal === 'string' && userPseudoVal.trim().length > 0 && !['utilisateur', 'user', 'invité', 'invite'].includes(userPseudoVal.trim().toLowerCase());
        const userPhotoVal = window.currentUserPhoto || (window.currentUser && window.currentUser.photoURL) || localStorage.getItem('userCustomPhoto') || '';
        const hasCustomPhoto = typeof userPhotoVal === 'string' && userPhotoVal.trim().length > 0 && !userPhotoVal.includes('ui-avatars.com') && !userPhotoVal.includes('default-avatar');
        const hasCustomProfile = hasValidPseudo && hasCustomPhoto;

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
                const d = new Date(r.date + (r.date.includes('T') ? '' : 'T00:00:00'));
                if (!isNaN(d.getTime()) && d.setHours(0, 0, 0, 0) > nowTime) return true;
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

        // Seuls les vrais éléments wishlist (DOM, mémoire ou flag isWishlist) sont comptabilisés
        const totalWishlistCount = Math.max(
            wishlistDomCount,
            wishlistMemoryCount,
            (racesList.some(r => r.isWishlist || r.status === 'wishlist') ? 1 : 0)
        );

        const hasFavoriteRace = racesList.some(r => r.favorite === true || r.isFavorite === true || r.starred === true);
        const hasCardConfig = localStorage.getItem('hasConfiguredCards') === 'true' || localStorage.getItem('cardActionsConfig') === 'true' || window.hasConfiguredCards === true;
        const isAccountPublicSetting = (typeof window.prefAccountPublicRaces !== 'undefined')
            ? (window.prefAccountPublicRaces === true)
            : (localStorage.getItem('prefAccountPublicRaces') !== 'false');
        const hasPublicRace = (isAccountPublicSetting && racesList.length > 0) || racesList.some(r => r.isPublic === true);
        const convertedWishlistCount = racesList.filter(r => r.fromWishlist === true || r.wishlistConverted === true || (r.notes && r.notes.toLowerCase().includes('wishlist'))).length;
        const hasLikedPublicRace = localStorage.getItem('hasLikedPublicRace') === 'true' || localStorage.getItem('userLikedPublicRace') === 'true' || localStorage.getItem('likedRaces') === 'true' || window.hasLikedPublicRace === true;
        const hasCopiedPublicWishlist = localStorage.getItem('hasCopiedPublicWishlist') === 'true' || localStorage.getItem('wishlistFromPublic') === 'true' || window.hasCopiedPublicWishlist === true || racesList.some(r => r.fromWishlist === true || r.wishlistConverted === true || (r.notes && r.notes.toLowerCase().includes('wishlist')));
        const hasNotesReport = racesList.some(r => (typeof r.notes === 'string' && r.notes.trim().length > 3) || (typeof r.comment === 'string' && r.comment.trim().length > 3));
        const hasDownloadedPdf = localStorage.getItem('pdfDownloaded') === 'true' || window.pdfDownloaded === true;
        const hasUserFeedback = localStorage.getItem('userFeedbackSent') === 'true' || window.userFeedbackSent === true || window.feedbackSent === true;
        const hasUsedBulkActions = localStorage.getItem('bulkActionUsed') === 'true' || window.bulkActionUsed === true;
        const hasUsedBulkNotes = localStorage.getItem('bulkNoteUsed') === 'true' || window.bulkNoteUsed === true;
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

        function getRaceCompanionStats(race) {
            if (!race || !race.companions) return { runners: 0, spectators: 0, total: 0 };
            let comps = [];
            if (Array.isArray(race.companions)) comps = race.companions;
            else if (typeof race.companions === 'string' && race.companions.trim() !== '') {
                comps = race.companions.split(',').map(s => s.trim()).filter(Boolean);
            } else if (typeof race.companions === 'object') {
                comps = Object.values(race.companions);
            }
            let runners = 0;
            let spectators = 0;
            comps.forEach(c => {
                if (typeof c === 'object' && c !== null) {
                    const type = (c.type || 'runner').toLowerCase();
                    if (type === 'spectator' || type === 'regardant' || type === 'supporter') {
                        spectators++;
                    } else {
                        runners++;
                    }
                } else if (typeof c === 'string' && c.trim() !== '') {
                    runners++;
                }
            });
            return { runners, spectators, total: runners + spectators };
        }

        function isNightRace(race) {
            if (!race) return false;
            if (race.hour && typeof race.hour === 'string') {
                const parts = race.hour.trim().split(':');
                if (parts.length >= 2) {
                    const h = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10) || 0;
                    if (h >= 0 && h < 6) return true;
                    if (h === 6 && m === 0) return true;
                }
            }
            if ((race.terrain === 'relai' || race.raceFormat === 'team') && Array.isArray(race.relayLaps) && race.hour) {
                const parts = race.hour.trim().split(':');
                if (parts.length >= 2) {
                    const startH = parseInt(parts[0], 10);
                    const startM = parseInt(parts[1], 10) || 0;
                    let cumSec = startH * 3600 + startM * 60;
                    for (let i = 0; i < race.relayLaps.length; i++) {
                        const lap = race.relayLaps[i];
                        const lapSec = parseTimeToSeconds(lap.time) || 0;
                        const lapStartSec = cumSec % 86400;
                        cumSec += lapSec;
                        const lapEndSec = cumSec % 86400;
                        const isUserLap = (lap.isUser !== false && (lap.isUser === true || lap.runner === race.userPseudo || lap.runner === 'Moi'));
                        if (isUserLap) {
                            const startH = lapStartSec / 3600;
                            const endH = lapEndSec / 3600;
                            if (startH <= 6 || endH <= 6 || (lapStartSec > 18 * 3600 && cumSec >= 86400)) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        function getRaceTotalDurationSeconds(race) {
            if (!race) return 0;
            if ((race.terrain === 'relai' || race.raceFormat === 'team') && Array.isArray(race.relayLaps) && race.relayLaps.length > 0) {
                let totalS = 0;
                race.relayLaps.forEach(lap => {
                    const s = parseTimeToSeconds(lap.time);
                    if (s && s > 0) totalS += s;
                });
                if (totalS > 0) return totalS;
            }
            if ((race.terrain || '').toLowerCase().includes('triathlon')) {
                let triTotal = 0;
                const swim = parseTimeToSeconds(race.swimTime || race.triSwimTime);
                const t1 = parseTimeToSeconds(race.t1Time || race.triT1Time);
                const bike = parseTimeToSeconds(race.bikeTime || race.triBikeTime);
                const t2 = parseTimeToSeconds(race.t2Time || race.triT2Time);
                const run = parseTimeToSeconds(race.runTime || race.triRunTime);
                if (swim) triTotal += swim;
                if (t1) triTotal += t1;
                if (bike) triTotal += bike;
                if (t2) triTotal += t2;
                if (run) triTotal += run;
                if (triTotal > 0) return triTotal;
            }
            return parseTimeToSeconds(race.time || race.duration || race.chrono) || 0;
        }

        function isForeignCountryRace(race) {
            if (!race) return false;
            if (race.isInternational === true) return true;
            if (race.country && typeof race.country === 'string') {
                const c = race.country.trim().toLowerCase();
                if (c !== '' && !['france', 'fr', 'métropole', 'metropole', 'hexagone', 'française', 'dom-tom', 'guadeloupe', 'martinique', 'réunion', 'reunion', 'mayotte', 'guyane'].includes(c)) {
                    return true;
                }
            }
            const loc = ((race.location || '') + ' ' + (race.city || '') + ' ' + (race.country || '')).toLowerCase();
            const foreignKeywords = [
                'suisse', 'switzerland', 'belgique', 'belgium', 'espagne', 'spain', 'italie', 'italy', 'allemagne', 'germany',
                'portugal', 'royaume-uni', 'angleterre', 'uk', 'united kingdom', 'london', 'londres', 'maroc', 'morocco',
                'etats-unis', 'usa', 'united states', 'new york', 'boston', 'chicago', 'canada', 'quebec', 'montreal',
                'luxembourg', 'pays-bas', 'netherlands', 'amsterdam', 'autriche', 'austria', 'monaco', 'andorre', 'andorra', 'japon', 'tokyo'
            ];
            return foreignKeywords.some(k => loc.includes(k));
        }

        function isUltraCompleteRace(r) {
            return hasRacePhoto(r) && hasRaceGpx(r) && hasRaceNote(r) && hasAnyRaceRanking(r) && hasRaceDrive(r);
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
        const hasInternationalRace = racesList.some(isForeignCountryRace);
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
                        if (isTutorialCompleted) markBadgeUnlocked('exploration');
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
                        });
                        if (eligibleRaces.length > 0) {
                            const sortedByDate = [...eligibleRaces].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
                            markBadgeUnlocked('premier_dossard', sortedByDate[0]);
                        }
                        if (totalKm >= 10) {
                            unlockedBadges.bapteme_km.unlocked = true;
                            unlockedBadges.bapteme_km.races = [...eligibleRaces];
                        }
                        break;

                    case 'level_2': // Sandale (560 XP)
                        if (hasCardConfig) markBadgeUnlocked('a_ma_sauce');
                        if (hasPublicRace) {
                            const pub = racesList[0];
                            markBadgeUnlocked('partage_communautaire', pub);
                        }
                        if (convertedWishlistCount >= 1) markBadgeUnlocked('projet_concretise');
                        raceMetrics.forEach(m => {
                            if (m.hasCompanions || m.isTeam) markBadgeUnlocked('copains_dechappee', m.race);
                            if (m.dist >= 4.5 && m.price > 0 && (m.price / m.dist) <= 1.00) markBadgeUnlocked('radin_malin', m.race);
                            if (hasRacePhoto(m.race)) markBadgeUnlocked('visuel_personnalise', m.race);
                            if (m.elev >= 200) markBadgeUnlocked('chasseur_de_cotes', m.race);
                            if (m.dist >= 9.8) markBadgeUnlocked('le_cap_des_10', m.race);
                            const stats = getRaceCompanionStats(m.race);
                            if (stats.runners >= 1 && stats.spectators >= 1) markBadgeUnlocked('duo_support', m.race);
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
                        if (hasDownloadedPdf) markBadgeUnlocked('rapport_propre');
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
                            if (isNightRace(m.race)) markBadgeUnlocked('course_nocturne', m.race);
                        });
                        break;

                    case 'level_4': // Mocassin (780 XP)
                        if (hasUserFeedback) markBadgeUnlocked('voix_du_coureur');
                        if (hasUsedBulkActions) markBadgeUnlocked('action_groupee');
                        if (hasCardConfig) markBadgeUnlocked('bouton_express');
                        raceMetrics.forEach(m => {
                            if (hasRaceRankings(m.race)) markBadgeUnlocked('bilan_officiel', m.race);
                            if (hasRaceDrive(m.race)) markBadgeUnlocked('dossier_drive', m.race);
                            if (m.elev >= 700) markBadgeUnlocked('chamois_des_collines', m.race);
                            const stats = getRaceCompanionStats(m.race);
                            if (stats.runners >= 2 && stats.spectators >= 2) markBadgeUnlocked('double_soutien', m.race);
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
                        if (hasExportedData) markBadgeUnlocked('sauvegarde_externe');
                        if (hasViewedStats) markBadgeUnlocked('oeil_sur_les_chiffres');
                        if (hasUsedBulkNotes) markBadgeUnlocked('note_groupee');
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
                            if (getRaceTotalDurationSeconds(m.race) >= 5 * 3600) markBadgeUnlocked('defi_longue_duree', m.race);
                        });
                        break;

                    case 'level_6': // Chaussure de route (1 070 XP)
                        if (totalWishlistCount >= 3) markBadgeUnlocked('wishlist_fournie');
                        if (hasRelayPdf) markBadgeUnlocked('rapport_dequipe');
                        if (convertedWishlistCount >= 3) markBadgeUnlocked('fidele_de_la_wishlist');
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
                        {
                            const racesWithNotes = racesList.filter(hasRaceNote);
                            if (racesWithNotes.length >= 3) {
                                unlockedBadges.debrief_detaille.unlocked = true;
                                unlockedBadges.debrief_detaille.races = racesWithNotes;
                            }
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 34.8) markBadgeUnlocked('le_cap_des_35', m.race);
                            if (m.elev >= 1490) markBadgeUnlocked('grosse_montee', m.race);
                            const stats = getRaceCompanionStats(m.race);
                            if (stats.total >= 5) markBadgeUnlocked('peloton_dami', m.race);
                        });
                        break;

                    case 'level_7': // Chaussure de trail (1 200 XP)
                        if (hasUsedSearch) markBadgeUnlocked('recherche_ciblee');
                        if (hasLikedPublicRace && hasCopiedPublicWishlist) markBadgeUnlocked('communaute_active');
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
                            if (m.dist >= 41.8) markBadgeUnlocked('le_mythe_du_42', m.race);
                        });
                        break;

                    case 'level_8': // Boots (1 340 XP)
                        if (seasonsFound.size >= 4) {
                            unlockedBadges.grand_chelem_annuel.unlocked = true;
                            unlockedBadges.grand_chelem_annuel.races = [...eligibleRaces];
                        }
                        if (uniqueDepartments.size >= 3 || uniqueCities.size >= 3) {
                            unlockedBadges.explorateur_regional.unlocked = true;
                            unlockedBadges.explorateur_regional.races = [...eligibleRaces];
                        }
                        if (uniqueDepartments.size >= 5) {
                            unlockedBadges.tour_de_france_des_courses.unlocked = true;
                            unlockedBadges.tour_de_france_des_courses.races = [...eligibleRaces];
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
                            const stats = getRaceCompanionStats(m.race);
                            if (stats.total >= 10) markBadgeUnlocked('tribu_en_course', m.race);
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
                        {
                            const fiveHourRaces = racesList.filter(r => getRaceTotalDurationSeconds(r) >= 5 * 3600);
                            if (fiveHourRaces.length >= 3) {
                                unlockedBadges.triple_epreuve_5h.unlocked = true;
                                unlockedBadges.triple_epreuve_5h.races = fiveHourRaces;
                            }
                        }
                        {
                            const ultraCompleteRaces = racesList.filter(isUltraCompleteRace);
                            if (ultraCompleteRaces.length >= 5) {
                                unlockedBadges.arsenal_complet.unlocked = true;
                                unlockedBadges.arsenal_complet.races = ultraCompleteRaces;
                            }
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 69.8) markBadgeUnlocked('ultra_longue_distance', m.race);
                            if (m.elev >= 3500) markBadgeUnlocked('toit_des_montagnes', m.race);
                        });
                        break;

                    case 'level_10': // Crampons (1 450 XP)
                        if (favGpxAndNoteCount >= 10) {
                            unlockedBadges.collection_de_favoris.unlocked = true;
                            unlockedBadges.collection_de_favoris.races = racesList.filter(r => (r.favorite || r.isFavorite || r.starred) && hasRaceGpx(r) && hasRaceNote(r));
                        }
                        if (hasInternationalRace) {
                            unlockedBadges.hors_frontieres.unlocked = true;
                            unlockedBadges.hors_frontieres.races = racesList.filter(isForeignCountryRace);
                        }
                        if (gpxAndNoteCount >= 25) {
                            unlockedBadges.bibliotheque_vivante.unlocked = true;
                            unlockedBadges.bibliotheque_vivante.races = racesList.filter(r => hasRaceGpx(r) && hasRaceNote(r));
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
                        {
                            const photoAndGpxRaces = racesList.filter(r => hasRacePhoto(r) && hasRaceGpx(r));
                            if (photoAndGpxRaces.length >= 15) {
                                unlockedBadges.garde_des_souvenirs.unlocked = true;
                                unlockedBadges.garde_des_souvenirs.races = photoAndGpxRaces;
                            }
                        }
                        {
                            const foreignRaces = racesList.filter(isForeignCountryRace);
                            const totalCountries = new Set(racesList.map(r => (r.country || 'france').trim().toLowerCase())).size;
                            if (foreignRaces.length >= 2 || totalCountries >= 2 || uniqueDepartments.size >= 10) {
                                unlockedBadges.grand_explorateur_mondial.unlocked = true;
                                unlockedBadges.grand_explorateur_mondial.races = [...eligibleRaces];
                            }
                        }
                        raceMetrics.forEach(m => {
                            if (m.dist >= 99.8) markBadgeUnlocked('le_cap_des_100_ultra', m.race);
                            if (m.elev >= 4500) markBadgeUnlocked('reine_des_montees', m.race);
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

        // Gestion et synchronisation des metadata de validation (date et heure de déblocage)
        const badgesMetadata = getStoredBadgesMetadata();
        const newMetadataToSync = {};
        let metadataChanged = false;

        Object.keys(BADGES_DEFINITIONS).forEach(id => {
            if (unlockedBadges[id] && unlockedBadges[id].unlocked) {
                let meta = badgesMetadata[id];
                if (!meta || !meta.unlockedAt) {
                    meta = { unlockedAt: new Date().toISOString() };
                    badgesMetadata[id] = meta;
                    newMetadataToSync[id] = meta;
                    metadataChanged = true;
                }
                unlockedBadges[id].unlockedAt = meta.unlockedAt;
                unlockedBadges[id].metadata = meta;
            }
        });

        if (metadataChanged) {
            window.unlockedBadgesMetadata = badgesMetadata;
            const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
            const storageKey = 'unlockedBadgesMetadata_' + (currentUser ? currentUser.uid : 'local_user');
            try {
                localStorage.setItem(storageKey, JSON.stringify(badgesMetadata));
            } catch (e) {}
            if (Object.keys(newMetadataToSync).length > 0) {
                syncBadgesMetadataToFirestore(newMetadataToSync);
            }
        }

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
    <div id="badgesModal" class="fixed inset-0 flex items-center justify-center z-[60] hidden modal">
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
    let activeBadgeStatusFilter = 'all'; // 'all', 'unlocked', 'locked'
    let currentBadgeSearchQuery = '';
    const userLevelExpandedState = {};
    let userLeaderboardExpandedState = localStorage.getItem('leaderboardExpandedState') !== 'false';
    let userCocardesExpandedState = localStorage.getItem('cocardesExpandedState') !== 'false';

    function normalizeBadgeSearchText(text) {
        if (!text) return '';
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/œ/g, 'oe')
            .replace(/æ/g, 'ae')
            .trim();
    }

    function escapeBadgeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

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
        const isShowPseudo = (localStorage.getItem('prefShowPseudoInLeaderboard') !== 'false' && window.prefShowPseudoInLeaderboard !== false);

        let allUsers = Array.isArray(window.communityLeaderboardUsers)
            ? [...window.communityLeaderboardUsers]
            : [];

        // Retirer les doublons de l'utilisateur connecté s'il est déjà présent
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

    function renderLeaderboardRowsHTML(currentUserXP, currentPseudo, currentUid) {
        const allUsers = buildLeaderboardEntries(currentUserXP, currentPseudo, currentUid);
        const top5Users = allUsers.slice(0, 5);
        const currentUserIndex = allUsers.findIndex(u => u.isCurrent || u.uid === currentUid);
        const currentUserRank = currentUserIndex >= 0 ? (currentUserIndex + 1) : 1;
        const isUserInTop5 = currentUserIndex >= 0 && currentUserIndex < 5;

        let rowsHtml = '<div class="grid grid-cols-1 gap-2">';
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

            rowsHtml += `
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

        // Si l'utilisateur connecté n'est pas dans le top 5, afficher sa position, l'utilisateur au-dessus et l'écart d'XP
        if (!isUserInTop5 && currentUserIndex >= 0) {
            const userAbove = allUsers[currentUserIndex - 1];
            const myLvl = getLevelFromTotalXP(currentUserXP);

            // Si l'utilisateur au-dessus n'est pas déjà affiché dans le Top 5 (rang > 6)
            if (currentUserRank > 6 && userAbove) {
                const aboveRank = currentUserRank - 1;
                const abovePseudo = (userAbove.showPseudo && userAbove.pseudo) ? userAbove.pseudo : ('Utilisateur ' + aboveRank);
                const aboveLvl = getLevelFromTotalXP(userAbove.xp);

                rowsHtml += `
                <div class="flex items-center justify-center py-1 text-gray-300 text-xs tracking-widest select-none">
                    <span>• • •</span>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded-lg border bg-gray-50/80 border-gray-200">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="shrink-0 flex items-center justify-center">
                            <span class="w-6 text-center font-bold text-gray-500 text-xs">#${aboveRank}</span>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs sm:text-sm truncate font-medium text-gray-800">
                                <span>${abovePseudo}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-[11px] px-2 py-0.5 rounded ${aboveLvl.cocarde.pillBg} border hidden sm:inline-flex items-center gap-1">
                            <span>${aboveLvl.emoji}</span>
                            <span>${aboveLvl.name}</span>
                        </span>
                        <span class="text-xs font-bold text-gray-700 min-w-[70px] text-right">
                            ${userAbove.xp.toLocaleString('fr-FR')} XP
                        </span>
                    </div>
                </div>
                `;
            } else if (currentUserRank === 6) {
                rowsHtml += `
                <div class="flex items-center justify-center py-0.5 text-gray-300 text-xs tracking-widest select-none">
                    <span>• • •</span>
                </div>
                `;
            }

            rowsHtml += `
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
                        ${currentUserXP.toLocaleString('fr-FR')} XP
                    </span>
                </div>
            </div>
            `;

            // Bloc de stimulation / Prochaine cible pour inciter l'utilisateur à gagner de l'XP
            if (userAbove) {
                const aboveRank = currentUserRank - 1;
                const abovePseudo = (userAbove.showPseudo && userAbove.pseudo) ? userAbove.pseudo : ('Utilisateur ' + aboveRank);
                const xpDiff = Math.max(0, userAbove.xp - currentUserXP);
                const xpNeeded = xpDiff > 0 ? (xpDiff.toLocaleString('fr-FR') + ' XP') : '1 XP';

                rowsHtml += `
                <div class="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs shadow-2xs">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 text-sm shadow-2xs border border-amber-300/60">
                            <i class="fas fa-crosshairs animate-pulse"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="text-[11px] text-amber-800 font-semibold uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                                <span>Prochaine cible à dépasser</span>
                                <span class="bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded text-[10px] font-bold">#${aboveRank}</span>
                            </div>
                            <div class="text-xs text-gray-800 mt-0.5 truncate">
                                <strong class="text-amber-950 font-bold">${abovePseudo}</strong> est devant vous avec <strong class="text-gray-900 font-bold">${userAbove.xp.toLocaleString('fr-FR')} XP</strong>
                            </div>
                        </div>
                    </div>
                    <div class="shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-1 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
                        <div class="text-[10px] font-semibold text-amber-800">Écart à combler</div>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500 text-white font-extrabold text-xs shadow-xs">
                            <i class="fas fa-bolt text-[10px]"></i> +${xpNeeded}
                        </span>
                    </div>
                </div>
                `;
            }
        } else if (isUserInTop5 && currentUserIndex > 0) {
            // Utilisateur dans le Top 5 (mais pas 1er) : petit encouragement pour atteindre la place supérieure
            const userAbove = allUsers[currentUserIndex - 1];
            if (userAbove) {
                const aboveRank = currentUserRank - 1;
                const abovePseudo = (userAbove.showPseudo && userAbove.pseudo) ? userAbove.pseudo : ('Utilisateur ' + aboveRank);
                const xpDiff = Math.max(0, userAbove.xp - currentUserXP);
                const xpNeeded = xpDiff > 0 ? (xpDiff.toLocaleString('fr-FR') + ' XP') : '1 XP';

                rowsHtml += `
                <div class="mt-2 p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-2 min-w-0">
                        <i class="fas fa-arrow-trend-up text-emerald-600 shrink-0"></i>
                        <span class="truncate text-gray-700 text-[11px]">
                            Plus que <strong class="text-emerald-800 font-bold">+${xpNeeded}</strong> pour dépasser <strong class="text-gray-900">${abovePseudo}</strong> (#${aboveRank}) !
                        </span>
                    </div>
                    <span class="shrink-0 text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Objectif #${aboveRank}
                    </span>
                </div>
                `;
            }
        }
        rowsHtml += '</div>';

        return { rowsHtml, currentUserRank, isUserInTop5 };
    }

    // Synchronisation en arrière-plan avec Firestore (données réelles)
    async function syncCommunityLeaderboard(currentUserXP, currentPseudo, currentUid) {
        if (typeof firebase === 'undefined' || !firebase.firestore || typeof db === 'undefined') return;
        try {
            const effectivePseudo = window.currentUserPseudo || currentPseudo || localStorage.getItem('userPseudo');
            if (currentUid && currentUserXP >= 0) {
                const updatePayload = { gamificationXP: currentUserXP };
                if (effectivePseudo) updatePayload.pseudo = effectivePseudo;
                await db.collection('users').doc(currentUid).set(updatePayload, { merge: true }).catch(() => {});
            }
            const snap = await db.collection('users').get();
            const users = [];
            snap.forEach(doc => {
                const d = doc.data();
                const uid = doc.id;
                const isCurrent = (uid === currentUid);
                const userXp = isCurrent ? currentUserXP : (d.gamificationXP || d.totalXP || d.xp || 0);
                const userPseudo = isCurrent 
                    ? (effectivePseudo || d.pseudo || d.name || 'Moi') 
                    : (d.pseudo || d.name || 'Coureur');
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
            window.communityLeaderboardUsers = users;

            // Rafraîchir en direct si la modale est ouverte
            const rowsContainer = document.getElementById('leaderboard-rows-wrapper');
            const rankBadge = document.getElementById('leaderboard-rank-badge');
            if (rowsContainer) {
                const computed = renderLeaderboardRowsHTML(currentUserXP, currentPseudo, currentUid);
                rowsContainer.innerHTML = computed.rowsHtml;
                if (rankBadge) {
                    rankBadge.innerHTML = `Votre rang : <strong class="font-extrabold">#${computed.currentUserRank}</strong> (${currentUserXP.toLocaleString('fr-FR')} XP)`;
                    rankBadge.className = `text-xs font-semibold px-2.5 py-1 rounded-full ${computed.isUserInTop5 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`;
                }
            }
        } catch (e) {
            console.warn('Leaderboard sync error:', e);
        }
    }

    async function toggleLeaderboardPseudo() {
        const currentlyShown = (localStorage.getItem('prefShowPseudoInLeaderboard') !== 'false' && window.prefShowPseudoInLeaderboard !== false);
        const newShown = !currentlyShown;

        // 1. Mettre à jour l'état local
        localStorage.setItem('prefShowPseudoInLeaderboard', newShown ? 'true' : 'false');
        window.prefShowPseudoInLeaderboard = newShown;

        // 2. Mettre à jour le statut et le bouton dans la modale
        const statusEl = document.getElementById('leaderboard-privacy-status');
        const btnEl = document.getElementById('btnToggleLeaderboardPseudo');
        const rowsWrapper = document.getElementById('leaderboard-rows-wrapper');

        if (statusEl) {
            statusEl.className = `flex items-center gap-1.5 transition-colors duration-200 ${newShown ? 'text-gray-600' : 'text-amber-700 font-medium'}`;
            statusEl.innerHTML = `
                <i class="fas ${newShown ? 'fa-eye text-emerald-600' : 'fa-eye-slash text-amber-500'}"></i>
                <span>${newShown ? 'Votre pseudo est actuellement visible par la communauté.' : 'Votre pseudo est actuellement masqué dans le classement.'}</span>
            `;
        }

        if (btnEl) {
            btnEl.innerHTML = `
                <i class="fas ${newShown ? 'fa-user-slash' : 'fa-user-check'} text-xs"></i>
                <span>${newShown ? 'Masquer mon pseudo dans le classement' : 'Afficher mon pseudo dans le classement'}</span>
            `;
        }

        // 3. Rafraîchir les lignes du classement
        if (rowsWrapper && window._lastBadgesData) {
            const currentPseudo = window._lastCurrentPseudo || window.currentUserPseudo || localStorage.getItem('userPseudo') || 'Moi';
            const currentUid = window._lastCurrentUid || ((typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) ? firebase.auth().currentUser.uid : null);
            const updatedLeaderboard = renderLeaderboardRowsHTML(window._lastBadgesData.totalPoints, currentPseudo, currentUid);
            rowsWrapper.innerHTML = updatedLeaderboard.rowsHtml;

            const rankBadge = document.getElementById('leaderboard-rank-badge');
            if (rankBadge) {
                rankBadge.className = `text-xs font-semibold px-2.5 py-1 rounded-full ${updatedLeaderboard.isUserInTop5 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`;
                rankBadge.innerHTML = `Votre rang : <strong class="font-extrabold">#${updatedLeaderboard.currentUserRank}</strong> (${window._lastBadgesData.totalPoints.toLocaleString('fr-FR')} XP)`;
            }
        }

        // 4. Sauvegarder dans Firestore pour l'utilisateur
        const user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        if (user && typeof db !== 'undefined') {
            try {
                await db.collection('users').doc(user.uid).set({
                    privacy: {
                        showPseudoInLeaderboard: newShown
                    }
                }, { merge: true });
            } catch (err) {
                console.error("Erreur mise à jour confidentialité classement :", err);
            }
        }
    }

    window.toggleLeaderboardPseudo = toggleLeaderboardPseudo;

    function displayRaceBadgesModal() {
        if (window.isSelectionMode) return;
        ensureBadgesModalInDom();
        const modal = document.getElementById('badgesModal');
        const content = document.getElementById('badgesContent');
        if (!modal || !content) return;

        function getAllUserRaces() {
            if (window.allUserRaces && Array.isArray(window.allUserRaces) && window.allUserRaces.length > 0) {
                return window.allUserRaces;
            }
            if (window.originalRaces && Array.isArray(window.originalRaces) && window.originalRaces.length > 0) {
                return window.originalRaces;
            }
            if (typeof races !== 'undefined' && Array.isArray(races) && races.length > 0) {
                return races;
            }
            if (window.races && Array.isArray(window.races)) {
                return window.races;
            }
            return [];
        }

        const racesData = getAllUserRaces();
        const data = calculateGamifiedBadges(racesData);
        window.recordCocardes = data.recordCocardes;
        window.raceBadges = getCocardesBadgesByRace(data.recordCocardes);

        // Informations utilisateur connecté
        const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        const currentUid = currentUser ? currentUser.uid : 'local_user';
        const currentPseudo = window.currentUserPseudo || localStorage.getItem('userPseudo') || (currentUser ? currentUser.displayName : null) || 'Coureur';

        // Lancer la synchro Firestore en tâche de fond pour mettre à jour et récupérer les vrais utilisateurs
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
        <div class="mb-5 bg-white border border-green-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-center">
                
                <!-- Score Total XP -->
                <div class="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 md:pr-4 flex md:block items-center justify-between">
                    <div>
                        <div class="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5 sm:mb-1">Score Total</div>
                        <div class="flex items-baseline gap-1.5">
                            <span class="text-2xl sm:text-3xl font-extrabold text-green-800">${data.totalPoints.toLocaleString('fr-FR')}</span>
                            <span class="text-xs sm:text-sm font-bold text-green-600">/ 10 000 XP</span>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500 md:mt-1 text-right md:text-left">
                        <strong class="text-gray-800">${totalUnlockedBadgesCount}</strong> / ${totalBadgesCount} missions
                    </div>
                </div>

                <!-- Rang Actuel & Progression XP -->
                <div class="md:col-span-8">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Rang :</span>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${currentRankLevel.cocarde.bg} ${currentRankLevel.cocarde.text} border ${currentRankLevel.cocarde.border}">
                                <span>${currentRankLevel.emoji}</span>
                                <span>Niv. ${currentRankLevel.levelNumber} - ${currentRankLevel.name}</span>
                            </span>
                        </div>
                        <div class="text-xs text-gray-500 leading-tight">
                            ${nextLevel ? (neededXPForNext === 0 
                                ? `<span class="text-green-700 font-semibold"><i class="fas fa-check"></i> Palier ${nextLevel.name} débloqué !</span>`
                                : `<span>Encore <strong class="text-green-700 font-bold">${neededXPForNext.toLocaleString('fr-FR')} XP</strong> pour <strong class="text-gray-800">${nextLevel.emoji} ${nextLevel.name}</strong></span>`
                            ) : `<span class="text-green-700 font-semibold"><i class="fas fa-crown text-amber-500"></i> Sommet atteint — Niveau 10 Crampons !</span>`}
                        </div>
                    </div>

                    <!-- Barre de progression XP -->
                    <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div class="bg-green-600 h-full rounded-full transition-all duration-300" 
                             style="width: ${nextLevel ? Math.min(100, Math.max(3, Math.round((data.totalPoints / nextLevel.requiredXP) * 100))) : 100}%"></div>
                    </div>

                    <!-- Fil d'Ariane & repères de niveau responsive -->
                    <div class="flex items-center justify-between mt-1.5 text-[10px] sm:text-[11px] text-gray-400">
                        <span class="shrink-0 flex items-center gap-1 font-medium">
                            <span>🩴</span>
                            <span class="hidden sm:inline">Tong</span>
                            <span>(0 XP)</span>
                        </span>
                        
                        <span class="px-2 text-center truncate font-medium text-gray-600">
                            <strong class="text-green-800 font-bold">${data.totalPoints.toLocaleString('fr-FR')}</strong> / ${nextLevel ? `${nextLevel.requiredXP.toLocaleString('fr-FR')} XP` : '10 000 XP'}
                            ${nextLevel ? `<span class="hidden md:inline text-gray-400"> pour ${nextLevel.name}</span>` : ''}
                        </span>

                        <span class="shrink-0 flex items-center gap-1 font-medium">
                            <span>🧗</span>
                            <span class="hidden sm:inline">Crampons</span>
                            <span>(6 500+ XP)</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Stocker pour le rafraîchissement dynamique du classement
        window._lastBadgesData = data;
        window._lastCurrentPseudo = currentPseudo;
        window._lastCurrentUid = currentUid;

        // 2. SECTION DU CLASSEMENT DES VRAIS UTILISATEURS (Repliable)
        const userLeaderboardExpandedState = localStorage.getItem('leaderboardExpandedState') !== 'false';
        const initialLeaderboard = renderLeaderboardRowsHTML(data.totalPoints, currentPseudo, currentUid);

        const isShowPseudoInLeaderboard = (localStorage.getItem('prefShowPseudoInLeaderboard') !== 'false' && window.prefShowPseudoInLeaderboard !== false);
        const leaderboardToggleText = isShowPseudoInLeaderboard
            ? 'Masquer mon pseudo dans le classement'
            : 'Afficher mon pseudo dans le classement';

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
                    <span id="leaderboard-rank-badge" class="text-xs font-semibold px-2.5 py-1 rounded-full ${initialLeaderboard.isUserInTop5 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}">
                        Votre rang : <strong class="font-extrabold">#${initialLeaderboard.currentUserRank}</strong> (${data.totalPoints.toLocaleString('fr-FR')} XP)
                    </span>
                    <div class="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-2xs">
                        <i class="fas fa-chevron-down text-[11px] transition-transform duration-200 leaderboard-chevron ${userLeaderboardExpandedState ? 'rotate-180' : ''}"></i>
                    </div>
                </div>
            </div>

            <div class="leaderboard-body ${userLeaderboardExpandedState ? '' : 'hidden'} mt-3 space-y-2" id="leaderboard-body">
                <div id="leaderboard-rows-wrapper">
                    ${initialLeaderboard.rowsHtml}
                </div>
                <div class="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span id="leaderboard-privacy-status" class="flex items-center gap-1.5 transition-colors duration-200 ${isShowPseudoInLeaderboard ? 'text-gray-600' : 'text-amber-700 font-medium'}">
                        <i class="fas ${isShowPseudoInLeaderboard ? 'fa-eye text-emerald-600' : 'fa-eye-slash text-amber-500'}"></i>
                        <span>${isShowPseudoInLeaderboard ? 'Votre pseudo est actuellement visible par la communauté.' : 'Votre pseudo est actuellement masqué dans le classement.'}</span>
                    </span>
                    <button type="button" id="btnToggleLeaderboardPseudo" onclick="toggleLeaderboardPseudo()" class="text-green-700 hover:text-green-800 hover:underline font-semibold cursor-pointer flex items-center gap-1">
                        <i class="fas ${isShowPseudoInLeaderboard ? 'fa-user-slash' : 'fa-user-check'} text-xs"></i>
                        <span>${leaderboardToggleText}</span>
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

        // 4. BARRE DE RECHERCHE, FILTRES ET ONGLETS (Non fixe lors du scroll)
        html += `
        <div class="mb-5">
            <!-- Barre de recherche & filtres rapides d'état -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-2.5">
                <!-- Champ de recherche avec icône et bouton vider -->
                <div class="relative flex-grow">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                        <i class="fas fa-search text-xs"></i>
                    </span>
                    <input type="text" 
                           id="badgeSearchInput" 
                           value="${escapeBadgeHtml(currentBadgeSearchQuery)}"
                           placeholder="Rechercher une mission (ex: marathon, trail, 10k, dénivelé, photo, allure...)" 
                           autocomplete="off" 
                           spellcheck="false"
                           class="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white hover:border-emerald-400 focus:border-emerald-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition placeholder-gray-400 text-gray-800">
                    <button type="button" 
                            id="clearBadgeSearchBtn" 
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-700 ${currentBadgeSearchQuery ? '' : 'hidden'} cursor-pointer transition" 
                            title="Effacer la recherche">
                        <i class="fas fa-times-circle text-sm"></i>
                    </button>
                </div>

                <!-- Filtres d'état rapides -->
                <div class="flex items-center gap-1 shrink-0 bg-gray-200/70 p-1 rounded-xl self-start sm:self-auto" id="badgeStatusFilters">
                    <button type="button" data-status-filter="all" class="badge-status-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${activeBadgeStatusFilter === 'all' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-gray-600 hover:text-emerald-900'}">
                        Toutes
                    </button>
                    <button type="button" data-status-filter="unlocked" class="badge-status-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${activeBadgeStatusFilter === 'unlocked' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-gray-600 hover:text-emerald-900'}">
                        <i class="fas fa-check-circle text-emerald-600 text-[10px] mr-1"></i>Débloquées
                    </button>
                    <button type="button" data-status-filter="locked" class="badge-status-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${activeBadgeStatusFilter === 'locked' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-gray-600 hover:text-emerald-900'}">
                        <i class="fas fa-hourglass-half text-amber-600 text-[10px] mr-1"></i>À débloquer
                    </button>
                </div>
            </div>

            <!-- Résumé / compteur dynamique de recherche -->
            <div id="badgeSearchSummary" class="hidden text-xs text-gray-600 flex items-center justify-between mb-2 px-1">
                <div class="flex items-center gap-1.5" id="badgeSearchSummaryText"></div>
                <button type="button" id="resetBadgeFiltersBtn" class="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer text-[11px] flex items-center gap-1">
                    <i class="fas fa-undo-alt text-[9px]"></i> Réinitialiser
                </button>
            </div>

            <!-- Onglets de niveaux (10 Onglets) -->
            <div id="level-tabs-container" class="level-tabs-container flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar" style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain;">
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
                <span class="badge-count-pill text-[10px] px-1.5 py-0.2 rounded-full ${isTabActive ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-500'}">${st.unlockedCount}/${st.totalCount}</span>
                ${lockIcon}
            </button>
            `;
        });
        html += `
            </div>
        </div>`;

        // 5. CONTENEUR DYNAMIQUE DES SECTIONS DE NIVEAU
        function renderLevelSections() {
            let sectionsHtml = '';

            LEVELS_CONFIG.forEach((lvl, idx) => {
                const st = data.levelsState[lvl.id];
                const prevLvl = idx > 0 ? LEVELS_CONFIG[idx - 1] : null;
                
                const isCompleted = st.unlockedCount >= st.totalCount;
                let isExpanded = userLevelExpandedState[lvl.id];
                if (isExpanded === undefined) {
                    isExpanded = activeLevelTab !== 'all' ? true : (st.isUnlocked && !isCompleted);
                }
                
                sectionsHtml += `
                <div class="level-section mb-5 bg-white rounded-xl border ${st.isUnlocked ? 'border-gray-200 shadow-sm' : 'border-gray-300'} overflow-hidden transition-all duration-200"
                     data-level-id="${lvl.id}"
                     data-level-number="${lvl.levelNumber}"
                     data-level-name="${escapeBadgeHtml(lvl.name)}"
                     data-level-unlocked="${st.isUnlocked ? 'true' : 'false'}"
                     data-level-completed="${isCompleted ? 'true' : 'false'}">
                    
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
                        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 level-cards-grid ${st.isUnlocked ? 'bg-white' : 'bg-gray-100/40 filter blur-[1.5px] opacity-35 select-none pointer-events-none'}">
                `;

                lvl.badgeIds.forEach((badgeId, badgeIndex) => {
                    const badge = BADGES_DEFINITIONS[badgeId];
                    const badgeXp = badge ? badge.xp : 50;

                    if (!st.isUnlocked) {
                        sectionsHtml += `
                        <div class="badge-card rounded-lg p-3.5 border border-dashed border-gray-300 bg-gray-50/80 flex flex-col justify-between"
                             data-badge-id="${badgeId}"
                             data-badge-name="Défi Mystère"
                             data-badge-desc="Atteignez ${lvl.requiredXP} XP au total pour révéler ce défi..."
                             data-badge-status="locked"
                             data-badge-xp="${badgeXp}"
                             data-level-id="${lvl.id}"
                             data-level-name="${escapeBadgeHtml(lvl.name)}">
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
                                        <p class="text-xs text-gray-400 mt-0.5 italic">
                                            <span>Atteignez ${lvl.requiredXP} XP au total pour révéler ce défi...</span>
                                        </p>
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

                    const CUMULATIVE_MILESTONE_BADGES = new Set([
                        'bapteme_km', 'la_vingtaine', 'club_des_50', 'cap_des_100', 'les_300_bornes', 'le_cap_des_400', 'demi_millier', 'le_grand_millier',
                        'compteur_lance', 'compteur_dplus_lance', 'carnet_soigne', 'fidele_du_bitume', 'habitue_du_carnet', 'compteur_a_dix',
                        'quinze_au_compteur', 'grand_total_courses', 'vingtieme_borne', 'quart_de_cent', 'trente_dossards', 'le_demi_cent',
                        'objectif_3000_dplus', 'le_cap_des_8000_dplus', 'grand_volume_dplus', 'sommet_de_denivele', 'mur_du_denivele', 'explorateur_local',
                        'quotidien_actif', 'dossard_4_saisons', 'grand_voyageur', 'grand_chelem_annuel', 'explorateur_regional', 'mois_intense', 'regularite_de_fer',
                        'tour_de_france_des_courses', 'grand_explorateur_mondial'
                    ]);

                    const isCumulativeMilestone = CUMULATIVE_MILESTONE_BADGES.has(badgeId);

                    sectionsHtml += `
                    <div class="badge-card relative z-10 hover:z-30 focus-within:z-30 rounded-lg p-3.5 border transition flex flex-col justify-between ${
                        isUnlocked 
                            ? 'bg-white border-green-200 hover:border-green-300 shadow-xs' 
                            : 'bg-gray-50/80 border-gray-200 opacity-75'
                    }"
                         data-badge-id="${badgeId}"
                         data-badge-name="${escapeBadgeHtml(badge ? badge.name : badgeId)}"
                         data-badge-desc="${escapeBadgeHtml(badge ? badge.description : '')}"
                         data-badge-status="${isUnlocked ? 'unlocked' : 'locked'}"
                         data-badge-xp="${badgeXp}"
                         data-level-id="${lvl.id}"
                         data-level-name="${escapeBadgeHtml(lvl.name)}">
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

                    if (isUnlocked && isCumulativeMilestone) {
                        sectionsHtml += `
                            <div class="text-[11px] font-semibold text-green-700 flex items-center gap-1.5">
                                <i class="fas fa-check-circle text-green-600"></i>
                                <span>Validé sur l'ensemble de vos courses</span>
                            </div>
                        `;
                    } else if (isUnlocked && racesForBadge.length > 0) {
                        const sortedRaces = [...racesForBadge].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                        const visibleRaces = sortedRaces.slice(0, 2);
                        const remainingRaces = sortedRaces.slice(2);

                        let racesButtonsHtml = visibleRaces.map(r => {
                            const year = r.date ? new Date(r.date).getFullYear() : '';
                            return `
                                <button class="badge-race-name text-left text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-green-100 hover:text-green-800 text-gray-700 transition truncate max-w-[130px] cursor-pointer" 
                                        data-race-id="${r.id}" title="${r.name}">
                                    <span class="truncate">${r.name}</span>
                                    <span class="text-gray-400 text-[10px]">(${year})</span>
                                </button>
                            `;
                        }).join('');

                        if (remainingRaces.length > 0) {
                            const remainingCount = remainingRaces.length;
                            const remainingListHtml = remainingRaces.map(r => {
                                const year = r.date ? new Date(r.date).getFullYear() : '';
                                return `
                                    <button class="badge-race-name w-full text-left text-[11px] p-1.5 rounded-lg hover:bg-green-50 hover:text-green-900 text-gray-700 transition flex items-center justify-between gap-1 cursor-pointer border border-transparent hover:border-green-200" 
                                            data-race-id="${r.id}" title="${r.name}">
                                        <span class="truncate font-medium">${r.name}</span>
                                        <span class="text-gray-400 text-[10px] shrink-0 font-normal">(${year})</span>
                                    </button>
                                `;
                            }).join('');

                            racesButtonsHtml += `
                                <div class="relative inline-block group/badge-more">
                                    <button type="button" class="badge-more-races-btn text-[10px] text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition shadow-2xs">
                                        <span>+${remainingCount} autre${remainingCount > 1 ? 's' : ''}</span>
                                        <i class="fas fa-chevron-down text-[8px] transition-transform duration-200"></i>
                                    </button>
                                    <div class="badge-more-popover hidden absolute bottom-full left-0 mb-2 bg-white border border-green-200 shadow-xl rounded-xl p-2.5 z-[150] w-64 max-w-[85vw]">
                                        <div class="text-[10px] text-gray-400 mb-1.5 border-b border-gray-100 pb-1 font-bold uppercase tracking-wider flex items-center justify-between">
                                            <span>Autres courses validées (${remainingCount})</span>
                                        </div>
                                        <div class="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                            ${remainingListHtml}
                                        </div>
                                        <div class="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b border-r border-green-200 transform rotate-45"></div>
                                    </div>
                                </div>
                            `;
                        }

                        sectionsHtml += `
                            <div class="text-[11px] text-gray-400 font-medium mb-1">Validé sur :</div>
                            <div class="flex flex-wrap items-center gap-1">
                                ${racesButtonsHtml}
                            </div>
                        `;
                    } else if (isUnlocked) {
                        sectionsHtml += `<div class="text-[11px] font-semibold text-green-700 flex items-center gap-1"><i class="fas fa-check"></i> Mission accomplie</div>`;
                    } else {
                        sectionsHtml += `<div class="text-[11px] text-gray-400 flex items-center gap-1"><i class="fas fa-hourglass-start text-[10px]"></i> En attente</div>`;
                    }

                    // Metadata discrète : Date et heure de validation
                    if (isUnlocked) {
                        const badgeUnlockedAt = badgeState.unlockedAt || (window.unlockedBadgesMetadata && window.unlockedBadgesMetadata[badgeId] && window.unlockedBadgesMetadata[badgeId].unlockedAt);
                        if (badgeUnlockedAt) {
                            const formattedDateStr = formatBadgeUnlockDate(badgeUnlockedAt);
                            if (formattedDateStr) {
                                sectionsHtml += `
                                    <div class="mt-2 pt-1.5 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-400 font-normal select-none" title="Validé le ${formattedDateStr}">
                                        <i class="far fa-clock text-gray-400 text-[9px]"></i>
                                        <span>Validé le ${formattedDateStr}</span>
                                    </div>
                                `;
                            }
                        }
                    }

                    sectionsHtml += `
                        </div>
                    </div>
                    `;
                });

                sectionsHtml += `</div>`; // fin grid

                if (!st.isUnlocked && prevLvl) {
                    const percentToUnlock = Math.min(100, Math.round((data.totalPoints / lvl.requiredXP) * 100));
                    const remainingXP = Math.max(0, lvl.requiredXP - data.totalPoints);
                    sectionsHtml += `
                    <div class="level-lock-overlay absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gray-900/15 backdrop-blur-xs text-center">
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

                sectionsHtml += `
                    </div>
                </div>
                `;
            });
            return sectionsHtml;
        }

        html += `<div id="levels-sections-container">${renderLevelSections()}</div>`;

        content.innerHTML = html;

        // Attacher les écouteurs sur les sections de niveau
        function attachLevelSectionsListeners(container) {
            if (!container) return;

            // Replier / Déplier les sections de niveaux
            container.querySelectorAll('.level-header-toggle').forEach(header => {
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
        }

        attachLevelSectionsListeners(document.getElementById('levels-sections-container'));

        // Filtrage en direct des missions et des niveaux
        function applyBadgeFilters() {
            const searchInput = document.getElementById('badgeSearchInput');
            const clearBtn = document.getElementById('clearBadgeSearchBtn');
            const summaryEl = document.getElementById('badgeSearchSummary');
            const summaryText = document.getElementById('badgeSearchSummaryText');
            const sectionsContainer = document.getElementById('levels-sections-container');
            if (!sectionsContainer) return;

            const rawQuery = searchInput ? searchInput.value : currentBadgeSearchQuery;
            currentBadgeSearchQuery = rawQuery;
            const query = normalizeBadgeSearchText(rawQuery);
            const hasQuery = query.length > 0;

            if (clearBtn) {
                if (hasQuery) {
                    clearBtn.classList.remove('hidden');
                } else {
                    clearBtn.classList.add('hidden');
                }
            }

            const sections = sectionsContainer.querySelectorAll('.level-section');
            let totalMatches = 0;

            sections.forEach(section => {
                const levelId = section.getAttribute('data-level-id');
                const isLevelUnlocked = section.getAttribute('data-level-unlocked') === 'true';
                const levelBody = document.getElementById(`level-body-${levelId}`);
                const chevron = section.querySelector('.level-chevron');
                const lockOverlay = section.querySelector('.level-lock-overlay');
                const cardsGrid = section.querySelector('.level-cards-grid');

                // Filtre d'onglet : si un onglet spécifique est actif (et pas 'all')
                const tabMatches = (activeLevelTab === 'all' || activeLevelTab === levelId);
                if (!tabMatches) {
                    section.classList.add('hidden');
                    return;
                }

                const cards = section.querySelectorAll('.badge-card');
                let levelMatchesCount = 0;

                cards.forEach(card => {
                    const cardName = card.getAttribute('data-badge-name') || '';
                    const cardDesc = card.getAttribute('data-badge-desc') || '';
                    const cardStatus = card.getAttribute('data-badge-status') || '';
                    const cardXp = card.getAttribute('data-badge-xp') || '';
                    const cardLvlName = card.getAttribute('data-level-name') || '';

                    // Filtre d'état
                    const statusMatches = (activeBadgeStatusFilter === 'all') || (activeBadgeStatusFilter === cardStatus);

                    // Filtre de recherche texte
                    let queryMatches = true;
                    if (hasQuery) {
                        const normName = normalizeBadgeSearchText(cardName);
                        const normDesc = normalizeBadgeSearchText(cardDesc);
                        const normLvl = normalizeBadgeSearchText(cardLvlName);
                        queryMatches = normName.includes(query) || 
                                       normDesc.includes(query) || 
                                       cardXp.includes(query) || 
                                       normLvl.includes(query);
                    }

                    if (statusMatches && queryMatches) {
                        card.classList.remove('hidden');
                        card.style.display = '';
                        levelMatchesCount++;
                        totalMatches++;
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                });

                if (levelMatchesCount > 0) {
                    section.classList.remove('hidden');

                    if (hasQuery) {
                        // Déplier automatiquement pour afficher les résultats
                        if (levelBody) levelBody.classList.remove('hidden');
                        if (chevron) chevron.classList.add('rotate-180');
                    } else {
                        // Rétablir l'état normal replié/déplié
                        const isCompleted = section.getAttribute('data-level-completed') === 'true';
                        let isExpanded = userLevelExpandedState[levelId];
                        if (isExpanded === undefined) {
                            isExpanded = (activeLevelTab !== 'all') ? true : (isLevelUnlocked && !isCompleted);
                        }
                        if (levelBody) {
                            if (isExpanded) {
                                levelBody.classList.remove('hidden');
                                if (chevron) chevron.classList.add('rotate-180');
                            } else {
                                levelBody.classList.add('hidden');
                                if (chevron) chevron.classList.remove('rotate-180');
                            }
                        }
                    }
                } else {
                    // Aucune carte correspondante dans ce niveau
                    if (hasQuery || activeBadgeStatusFilter !== 'all') {
                        section.classList.add('hidden');
                    } else {
                        section.classList.remove('hidden');
                    }
                }
            });

            // Affichage du bandeau de résumé
            if (summaryEl && summaryText) {
                if (hasQuery || activeBadgeStatusFilter !== 'all') {
                    summaryEl.classList.remove('hidden');
                    let text = `<span><strong class="font-extrabold text-emerald-800">${totalMatches}</strong> mission${totalMatches > 1 ? 's' : ''}`;
                    if (hasQuery) {
                        text += ` trouvée${totalMatches > 1 ? 's' : ''} pour « <span class="font-bold text-gray-800">${escapeBadgeHtml(rawQuery)}</span> »`;
                    }
                    if (activeBadgeStatusFilter === 'unlocked') {
                        text += ` <span class="text-emerald-700 font-semibold">(débloquées uniquement)</span>`;
                    } else if (activeBadgeStatusFilter === 'locked') {
                        text += ` <span class="text-amber-700 font-semibold">(à débloquer uniquement)</span>`;
                    }
                    if (activeLevelTab !== 'all') {
                        const curLvlCfg = LEVELS_CONFIG.find(l => l.id === activeLevelTab);
                        if (curLvlCfg) {
                            text += ` dans <em>Niveau ${curLvlCfg.levelNumber} (${curLvlCfg.name})</em>`;
                        }
                    }
                    text += `</span>`;
                    summaryText.innerHTML = text;
                } else {
                    summaryEl.classList.add('hidden');
                }
            }

            // Message aucun résultat
            let noResultsEl = document.getElementById('badgesSearchNoResults');
            if (totalMatches === 0 && (hasQuery || activeBadgeStatusFilter !== 'all')) {
                if (!noResultsEl) {
                    noResultsEl = document.createElement('div');
                    noResultsEl.id = 'badgesSearchNoResults';
                    noResultsEl.className = 'p-8 text-center bg-white border border-dashed border-gray-300 rounded-xl my-4 shadow-2xs';
                    sectionsContainer.appendChild(noResultsEl);
                }
                noResultsEl.innerHTML = `
                    <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-3 shadow-2xs">
                        <i class="fas fa-search"></i>
                    </div>
                    <h4 class="font-bold text-gray-800 text-base mb-1">Aucune mission correspondante</h4>
                    <p class="text-xs text-gray-500 max-w-md mx-auto mb-3">
                        ${hasQuery ? `Aucune mission ne correspond à « <strong class="text-emerald-800">${escapeBadgeHtml(rawQuery)}</strong> ».` : 'Aucune mission ne correspond à ce filtre.'}
                        Vérifiez l'orthographe ou essayez un mot-clé plus générique (ex : marathon, trail, dénivelé, photo, ami...).
                    </p>
                    <button type="button" id="btnResetSearchNoResults" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5">
                        <i class="fas fa-undo-alt text-[10px]"></i> Réinitialiser la recherche
                    </button>
                `;
                const resetBtnNoRes = document.getElementById('btnResetSearchNoResults');
                if (resetBtnNoRes) {
                    resetBtnNoRes.onclick = resetAllBadgeFilters;
                }
                noResultsEl.classList.remove('hidden');
            } else if (noResultsEl) {
                noResultsEl.classList.add('hidden');
            }
        }

        function resetAllBadgeFilters() {
            const searchInput = document.getElementById('badgeSearchInput');
            if (searchInput) searchInput.value = '';
            currentBadgeSearchQuery = '';
            activeBadgeStatusFilter = 'all';

            content.querySelectorAll('.badge-status-filter-btn').forEach(b => {
                const f = b.getAttribute('data-status-filter');
                if (f === 'all') {
                    b.className = 'badge-status-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer bg-white text-emerald-900 shadow-2xs';
                } else {
                    b.className = 'badge-status-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-gray-600 hover:text-emerald-900';
                }
            });

            applyBadgeFilters();
        }

        // Centrer automatiquement et élégamment l'onglet actif dans la barre horizontale sans reset
        function scrollActiveLevelTabToCenter(isInstant = false) {
            const tabsContainer = document.getElementById('level-tabs-container');
            if (!tabsContainer) return;
            const activeBtn = tabsContainer.querySelector(`.level-tab-btn[data-level="${activeLevelTab}"]`);
            if (activeBtn) {
                const containerWidth = tabsContainer.clientWidth;
                const btnOffsetLeft = activeBtn.offsetLeft;
                const btnWidth = activeBtn.offsetWidth;
                const targetScrollLeft = btnOffsetLeft - (containerWidth / 2) + (btnWidth / 2);
                
                if (isInstant) {
                    tabsContainer.scrollLeft = Math.max(0, targetScrollLeft);
                } else {
                    tabsContainer.scrollTo({
                        left: Math.max(0, targetScrollLeft),
                        behavior: 'smooth'
                    });
                }
            }
        }

        // Bascule d'onglet fluide sans destruction du DOM parent ni reset de scroll
        function switchLevelTab(newLevelId) {
            activeLevelTab = newLevelId;
            if (activeLevelTab !== 'all') {
                userLevelExpandedState[activeLevelTab] = true;
            }

            const tabsContainer = document.getElementById('level-tabs-container');
            if (tabsContainer) {
                tabsContainer.querySelectorAll('.level-tab-btn').forEach(btn => {
                    const btnLevel = btn.getAttribute('data-level');
                    const isTabActive = btnLevel === activeLevelTab;
                    const countPill = btn.querySelector('.badge-count-pill');
                    if (isTabActive) {
                        btn.className = 'level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer bg-green-700 text-white shadow-sm';
                        if (countPill) {
                            countPill.className = 'badge-count-pill text-[10px] px-1.5 py-0.2 rounded-full bg-green-800 text-white';
                        }
                    } else {
                        btn.className = 'level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer bg-white text-gray-600 hover:bg-gray-100 border border-gray-200';
                        if (countPill) {
                            countPill.className = 'badge-count-pill text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-500';
                        }
                    }
                });
            }

            applyBadgeFilters();
            scrollActiveLevelTabToCenter(false);
        }

        // Gestion des clics sur onglets
        content.querySelectorAll('.level-tab-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const targetLevel = this.getAttribute('data-level');
                switchLevelTab(targetLevel);
            });
        });

        // Écouteurs de la barre de recherche
        const searchInput = document.getElementById('badgeSearchInput');
        const clearBtn = document.getElementById('clearBadgeSearchBtn');
        const resetBtn = document.getElementById('resetBadgeFiltersBtn');

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                const val = this.value.trim();
                // Si l'utilisateur commence à chercher et n'est pas sur "Tous les niveaux", basculer sur "all"
                if (val && activeLevelTab !== 'all') {
                    activeLevelTab = 'all';
                    const tabsContainer = document.getElementById('level-tabs-container');
                    if (tabsContainer) {
                        tabsContainer.querySelectorAll('.level-tab-btn').forEach(btn => {
                            const btnLevel = btn.getAttribute('data-level');
                            const isTabActive = btnLevel === 'all';
                            const countPill = btn.querySelector('.badge-count-pill');
                            if (isTabActive) {
                                btn.className = 'level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer bg-green-700 text-white shadow-sm';
                                if (countPill) countPill.className = 'badge-count-pill text-[10px] px-1.5 py-0.2 rounded-full bg-green-800 text-white';
                            } else {
                                btn.className = 'level-tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer bg-white text-gray-600 hover:bg-gray-100 border border-gray-200';
                                if (countPill) countPill.className = 'badge-count-pill text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-500';
                            }
                        });
                    }
                }
                applyBadgeFilters();
            });

            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    if (this.value) {
                        e.stopPropagation();
                        this.value = '';
                        applyBadgeFilters();
                    }
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                applyBadgeFilters();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                resetAllBadgeFilters();
                if (searchInput) searchInput.focus();
            });
        }

        // Écouteurs filtres d'état (Toutes / Débloquées / À débloquer)
        content.querySelectorAll('.badge-status-filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                activeBadgeStatusFilter = this.getAttribute('data-status-filter') || 'all';
                content.querySelectorAll('.badge-status-filter-btn').forEach(b => {
                    if (b === btn) {
                        b.className = 'badge-status-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer bg-white text-emerald-900 shadow-2xs';
                    } else {
                        b.className = 'badge-status-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-gray-600 hover:text-emerald-900';
                    }
                });
                applyBadgeFilters();
            });
        });

        // Appliquer immédiatement les filtres (restauration d'état ou initial)
        applyBadgeFilters();

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

        // Centrage instantané à l'ouverture initiale de la modale (aucun effet de rebond depuis le début)
        scrollActiveLevelTabToCenter(true);
        requestAnimationFrame(() => scrollActiveLevelTabToCenter(true));

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

        if (badgeKey === 'record_pace') {
            return {
                id: 'record_pace',
                name: 'RP Allure / Temps',
                icon: 'fa-bolt',
                description: 'Record personnel d\'allure / temps',
                level: 1,
                levelEmoji: '⚡',
                cocarde: { pillBg: 'bg-amber-50 text-amber-900 border-amber-300' }
            };
        }
        if (badgeKey === 'record_distance') {
            return {
                id: 'record_distance',
                name: 'Plus Grande Distance',
                icon: 'fa-running',
                description: 'Record de distance (course la plus longue)',
                level: 1,
                levelEmoji: '🏃‍♂️',
                cocarde: { pillBg: 'bg-blue-50 text-blue-900 border-blue-300' }
            };
        }
        if (badgeKey === 'record_elevation') {
            return {
                id: 'record_elevation',
                name: 'Plus de Dénivelé',
                icon: 'fa-mountain',
                description: 'Record de dénivelé positif (D+)',
                level: 1,
                levelEmoji: '⛰️',
                cocarde: { pillBg: 'bg-emerald-50 text-emerald-900 border-emerald-300' }
            };
        }

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

    function getCocardesBadgesByRace(recordCocardes) {
        const result = {};
        if (!recordCocardes || !recordCocardes.byRaceId) return result;
        Object.keys(recordCocardes.byRaceId).forEach(raceId => {
            const info = recordCocardes.byRaceId[raceId];
            const badges = {};
            if (info.hasPace) {
                badges['record_pace'] = {
                    id: 'record_pace',
                    name: 'RP Allure',
                    value: info.paceInfo ? info.paceInfo.formattedPace : '',
                    icon: 'fa-bolt',
                    emoji: '⚡',
                    pillBg: 'bg-amber-50 text-amber-900 border-amber-300',
                    description: `Record personnel d'allure (${info.paceInfo ? info.paceInfo.formattedPace : ''})`
                };
            }
            if (info.hasDistance) {
                badges['record_distance'] = {
                    id: 'record_distance',
                    name: 'Plus Grande Distance',
                    value: info.distanceInfo ? info.distanceInfo.formattedDistance : '',
                    icon: 'fa-running',
                    emoji: '🏃‍♂️',
                    pillBg: 'bg-blue-50 text-blue-900 border-blue-300',
                    description: `Course la plus longue (${info.distanceInfo ? info.distanceInfo.formattedDistance : ''})`
                };
            }
            if (info.hasElevation) {
                badges['record_elevation'] = {
                    id: 'record_elevation',
                    name: 'Plus de Dénivelé',
                    value: info.elevationInfo ? info.elevationInfo.formattedElevation : '',
                    icon: 'fa-mountain',
                    emoji: '⛰️',
                    pillBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
                    description: `Plus grand dénivelé positif (${info.elevationInfo ? info.elevationInfo.formattedElevation : ''})`
                };
            }
            if (Object.keys(badges).length > 0) {
                result[raceId] = badges;
            }
        });
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 8.5. DÉTECTION DES MISSIONS VALIDÉES, TOASTERS & MISE EN RELIEF
    // ─────────────────────────────────────────────────────────────────────────────
    function showMissionUnlockedToast(badgeId, badgeDef) {
        const badgeName = badgeDef.name || badgeId;
        const badgeXp = badgeDef.xp || 50;

        const htmlContent = `
            <div class="flex flex-col gap-1 pr-1">
                <div class="flex items-center gap-1.5 font-bold text-gray-900 text-xs sm:text-sm">
                    <span>🎉 Mission validée !</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300 shadow-2xs">+${badgeXp} XP</span>
                </div>
                <div class="text-xs text-gray-700 font-medium">« ${escapeBadgeHtml(badgeName)} »</div>
                <div class="mt-1.5">
                    <button type="button" 
                            onclick="if(typeof window.highlightBadgeInModal==='function') window.highlightBadgeInModal('${badgeId}');" 
                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer transform hover:scale-105 active:scale-95">
                        <i class="fas fa-award text-[11px]"></i>
                        <span>Voir la mission</span>
                    </button>
                </div>
            </div>
        `;

        if (typeof window.showToast === 'function') {
            // Durée de 8 secondes avec pause au survol et bouton ✕
            window.showToast(htmlContent, 'success', 8000);
        }
    }

    const BADGES_SESSION_START_TIME = window.__badgesSessionStartTime || (window.__badgesSessionStartTime = Date.now());

    function checkAndNotifyNewBadges(data) {
        if (!data || !data.unlockedBadges) return;

        // Obtenir la liste actuelle des badges réellement débloqués (badge débloqué ET niveau débloqué)
        const currentUnlockedIds = [];
        Object.entries(data.unlockedBadges).forEach(([badgeId, badgeInfo]) => {
            if (!badgeInfo || !badgeInfo.unlocked) return;
            const badgeDef = BADGES_DEFINITIONS[badgeId];
            if (!badgeDef) return;
            const levelId = 'level_' + badgeDef.level;
            const isLevelUnlocked = data.levelsState[levelId] && data.levelsState[levelId].isUnlocked;
            if (isLevelUnlocked) {
                currentUnlockedIds.push(badgeId);
            }
        });

        // Récupérer l'utilisateur courant et les clés de stockage
        const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        const uid = currentUser ? currentUser.uid : 'local_user';
        const storageKey = 'knownUnlockedBadges_' + uid;
        const storedRaw = localStorage.getItem(storageKey);

        let knownIds = [];
        try {
            if (storedRaw !== null) {
                knownIds = JSON.parse(storedRaw) || [];
            }
        } catch (e) {
            knownIds = [];
        }

        // Récupérer également les badges déjà validés depuis les métadonnées (Firestore & localStorage)
        const badgesMetadata = (window.unlockedBadgesMetadata && typeof window.unlockedBadgesMetadata === 'object')
            ? window.unlockedBadgesMetadata
            : (function() {
                try {
                    const rawMeta = localStorage.getItem('unlockedBadgesMetadata_' + uid);
                    return rawMeta ? JSON.parse(rawMeta) : {};
                } catch(e) { return {}; }
            })();

        const knownSet = new Set(knownIds);

        // Tous les badges qui ont une date de validation historique antérieure au début de cette session sont considérés comme déjà connus
        Object.entries(badgesMetadata).forEach(([bId, meta]) => {
            if (meta && meta.unlockedAt) {
                const unlockTime = new Date(meta.unlockedAt).getTime();
                // Si la validation date d'une session précédente (plus de 3 secondes avant le début de session)
                if (unlockTime < BADGES_SESSION_START_TIME - 3000) {
                    knownSet.add(bId);
                }
            }
        });

        // Si la liste actuelle est vide (ex: courses pas encore chargées), ne pas écraser les badges connus
        if (currentUnlockedIds.length === 0) {
            return;
        }

        // Détection des missions véritablement nouvellement débloquées (jamais vues auparavant)
        const newBadges = currentUnlockedIds.filter(id => {
            if (knownSet.has(id)) return false;
            // Vérifier via les métadonnées : si le badge a été validé bien avant cette session, c'est un historique
            const meta = badgesMetadata[id];
            if (meta && meta.unlockedAt) {
                const unlockTime = new Date(meta.unlockedAt).getTime();
                if (unlockTime < BADGES_SESSION_START_TIME - 3000) {
                    return false; // Badge historique déjà validé lors d'une session antérieure
                }
            }
            return true;
        });

        // Mettre à jour le stockage avec l'ensemble des badges actuels pour ne plus les re-notifier
        currentUnlockedIds.forEach(id => knownSet.add(id));
        try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(knownSet)));
        } catch (e) {}

        if (newBadges.length === 0) return;

        // 1. Jet de confettis qui traverse l'écran (au moins 3s, max 10s au total)
        const confettiDuration = Math.min(10, Math.max(3, 3 + (newBadges.length - 1) * 2));
        if (typeof window.launchMissionConfetti === 'function') {
            window.launchMissionConfetti(confettiDuration);
        }

        // 2. Afficher un toaster pour chaque mission validée
        newBadges.forEach((badgeId, idx) => {
            const badgeDef = BADGES_DEFINITIONS[badgeId] || { name: badgeId, xp: 50 };
            setTimeout(() => {
                showMissionUnlockedToast(badgeId, badgeDef);
            }, idx * 450);
        });
    }

    function highlightBadgeInModal(badgeId) {
        if (!badgeId) return;

        // 1. Trouver la définition du badge et son niveau
        const badgeDef = BADGES_DEFINITIONS[badgeId];
        const lvl = badgeDef ? LEVELS_CONFIG.find(l => l.badgeIds && l.badgeIds.includes(badgeId)) : null;

        // 2. Si un niveau spécifique est trouvé, s'assurer qu'il sera déplié
        if (lvl) {
            userLevelExpandedState[lvl.id] = true;
            activeLevelTab = 'all';
        }

        // 3. Fermer les toasts et ouvrir la modale
        if (typeof window.dismissAllToasts === 'function') {
            window.dismissAllToasts();
        }
        displayRaceBadgesModal();

        // 4. Si la barre de recherche masquait ce badge, la vider
        const searchInput = document.getElementById('badgeSearchInput');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            if (typeof applyBadgeFilters === 'function') {
                applyBadgeFilters();
            }
        }

        // 5. Attendre le rendu et faire défiler vers la carte
        setTimeout(() => {
            const levelBody = lvl ? document.getElementById(`level-body-${lvl.id}`) : null;
            if (levelBody && levelBody.classList.contains('hidden')) {
                levelBody.classList.remove('hidden');
                const chevron = document.querySelector(`.level-header-toggle[data-level-id="${lvl.id}"] .level-chevron`);
                if (chevron) chevron.classList.add('rotate-180');
            }

            const card = document.querySelector(`.badge-card[data-badge-id="${badgeId}"]`);
            if (!card) return;

            // Défilement fluide vers la carte au centre de l'écran
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Mise en relief visuelle (halo émeraude, échelle, macaron festif)
            const originalTransform = card.style.transform;
            const originalTransition = card.style.transition;
            const originalBoxShadow = card.style.boxShadow;
            const originalBorderColor = card.style.borderColor;

            card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 0 0 4px var(--color-emerald-500, #10B981), 0 20px 25px -5px rgba(var(--color-emerald-500-rgb, 16, 185, 129), 0.4)';
            card.style.borderColor = 'var(--color-emerald-500, #10B981)';
            card.style.zIndex = '50';

            // Macaron animé temporaire
            let pill = card.querySelector('.badge-highlight-pill');
            if (!pill) {
                pill = document.createElement('span');
                pill.className = 'badge-highlight-pill animate-bounce absolute -top-3 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] shadow-lg border border-white z-50';
                pill.innerHTML = '🎉 DÉBLOQUÉ !';
                card.appendChild(pill);
            }

            // Retour progressif à l'état normal après 4,5 secondes
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.transform = originalTransform || '';
                card.style.boxShadow = originalBoxShadow || '';
                card.style.borderColor = originalBorderColor || '';
                card.style.zIndex = '';
                if (pill && pill.parentNode) {
                    pill.remove();
                }
            }, 4500);
        }, 150);
    }

    function checkBadgesForNewUnlocks() {
        const racesData = (window.allUserRaces && window.allUserRaces.length > 0)
            ? window.allUserRaces
            : (window.races || []);
        const data = calculateGamifiedBadges(racesData);
        checkAndNotifyNewBadges(data);
        return data;
    }

    function calculateRaceBadges(racesList) {
        const data = calculateGamifiedBadges(racesList);
        window.recordCocardes = data.recordCocardes;
        const cocardesBadges = getCocardesBadgesByRace(data.recordCocardes);
        window.raceBadges = cocardesBadges;

        // Détection et célébration automatique des missions validées
        checkAndNotifyNewBadges(data);

        // Mise à jour automatique des XP en base de données Firestore dès la connexion / chargement des courses
        try {
            const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
            if (currentUser && currentUser.uid) {
                const currentPseudo = window.currentUserPseudo || localStorage.getItem('userPseudo') || (currentUser ? currentUser.displayName : null) || 'Coureur';
                syncCommunityLeaderboard(data.totalPoints, currentPseudo, currentUser.uid);
            }
        } catch (e) {
            console.warn('Auto-sync XP on load error:', e);
        }

        return cocardesBadges;
    }

    function setupBadgesListeners() {
        const badgesBtn = document.getElementById('badgesBtn');
        const modal = document.getElementById('badgesModal');
        const closeBtn = document.getElementById('closeBadgesModal');

        if (badgesBtn && !badgesBtn.dataset.listenerAttached) {
            badgesBtn.dataset.listenerAttached = 'true';
            badgesBtn.onclick = (e) => {
                e.preventDefault();
                if (window.isSelectionMode) return;
                displayRaceBadgesModal();
            };
        }

        if (closeBtn && !closeBtn.dataset.listenerAttached) {
            closeBtn.dataset.listenerAttached = 'true';
            closeBtn.onclick = () => { if (modal) modal.classList.add('hidden'); };
        }

        if (modal && !modal.dataset.listenersAttached) {
            modal.dataset.listenersAttached = 'true';

            // Fermeture au clic sur l'arrière-plan
            modal.addEventListener('click', function (e) {
                if (e.target.id === 'badgesModal' || e.target.id === 'badgesModalOverlay') {
                    modal.classList.add('hidden');
                }
            });

            // Raccourci clavier pour focus la recherche quand la modale est visible (/ ou Ctrl+F / Cmd+F)
            document.addEventListener('keydown', function (e) {
                const badgesModal = document.getElementById('badgesModal');
                if (!badgesModal || badgesModal.classList.contains('hidden')) return;

                const isSlash = (e.key === '/' || e.key === '?') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
                const isFind = (e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F');

                if (isSlash || isFind) {
                    const searchInput = document.getElementById('badgeSearchInput');
                    if (searchInput) {
                        e.preventDefault();
                        searchInput.focus();
                        searchInput.select();
                    }
                }
            });

            // Gestion de l'ouverture/fermeture des popovers "+ X autres" dans les missions (Délégation unique)
            modal.addEventListener('click', function (e) {
                const moreBtn = e.target.closest('.badge-more-races-btn');
                if (moreBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const container = moreBtn.closest('.group\\/badge-more');
                    const popover = container ? container.querySelector('.badge-more-popover') : null;
                    const chevron = moreBtn.querySelector('.fa-chevron-down');

                    // Fermer tous les autres popovers ouverts
                    modal.querySelectorAll('.badge-more-popover').forEach(p => {
                        if (p !== popover) p.classList.add('hidden');
                    });
                    modal.querySelectorAll('.badge-more-races-btn .fa-chevron-down').forEach(ch => {
                        if (ch !== chevron) ch.classList.remove('rotate-180');
                    });

                    if (popover) {
                        const isHidden = popover.classList.contains('hidden');
                        if (isHidden) {
                            popover.classList.remove('hidden');
                            if (chevron) chevron.classList.add('rotate-180');
                        } else {
                            popover.classList.add('hidden');
                            if (chevron) chevron.classList.remove('rotate-180');
                        }
                    }
                    return;
                }

                if (!e.target.closest('.group\\/badge-more')) {
                    modal.querySelectorAll('.badge-more-popover').forEach(p => p.classList.add('hidden'));
                    modal.querySelectorAll('.badge-more-races-btn .fa-chevron-down').forEach(ch => ch.classList.remove('rotate-180'));
                }
            });

            // Clic sur 'Voir la course' (Cocardes records) ou sur une course liée à un badge pour ouvrir ses détails (Délégation unique)
            modal.addEventListener('click', function (e) {
                const btn = e.target.closest('.badge-race-name');
                if (btn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const raceId = btn.getAttribute('data-race-id');
                    if (raceId) {
                        modal.classList.add('hidden');
                        if (typeof showRaceDetails === 'function') {
                            showRaceDetails(raceId);
                        } else if (typeof window.showRaceDetails === 'function') {
                            window.showRaceDetails(raceId);
                        }
                    }
                }
            });
        }
    }

    function ensureBadgesModalInDom() {
        if (!document.getElementById('badgesModal')) {
            const div = document.createElement('div');
            div.innerHTML = badgesModalHTML;
            document.body.appendChild(div);
        }
        setupBadgesListeners();
    }

    function updateBadgesButtonVisibility() {
        const badgesBtn = document.getElementById('badgesBtn');
        if (!badgesBtn) return;
        badgesBtn.classList.remove('hidden');
    }

    // Injection au chargement
    document.addEventListener('DOMContentLoaded', () => {
        ensureBadgesModalInDom();

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.group\\/badge-more')) {
                document.querySelectorAll('.badge-more-popover').forEach(pop => {
                    pop.classList.add('hidden');
                });
                document.querySelectorAll('.badge-more-races-btn .fa-chevron-down').forEach(ch => {
                    ch.classList.remove('rotate-180');
                });
            }
        });
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
    window.highlightBadgeInModal = highlightBadgeInModal;
    window.checkBadgesForNewUnlocks = checkBadgesForNewUnlocks;
    window.toggleLeaderboardPseudo = toggleLeaderboardPseudo;

})();
