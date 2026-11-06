/**
 * rgpd-modal.js
 * Politique de Confidentialité et RGPD — Carnet de Courses
 * Conforme au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés
 */

(function () {
    'use strict';

    const RGPD_MODAL_HTML = `
<div id="rgpdModal"
     class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-start justify-center p-4 z-[9999] hidden overflow-y-auto"
     role="dialog" aria-modal="true" aria-labelledby="rgpdModalTitle">

    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 flex flex-col">

        <!-- En-tête -->
        <div class="bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-shield-alt text-green-600 text-lg"></i>
                </div>
                <div>
                    <h2 id="rgpdModalTitle" class="text-lg font-bold text-gray-900">Politique de Confidentialité</h2>
                    <p class="text-xs text-gray-400">Carnet de Courses — Dernière mise à jour : 5 mars 2026</p>
                </div>
            </div>
            <button id="closeRgpdModal"
                    class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    aria-label="Fermer">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- Contenu scrollable -->
        <div class="px-6 py-6 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-6">

            <!-- Intro -->
            <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                <p class="text-green-800 font-medium">
                    <i class="fas fa-info-circle mr-2"></i>
                    La présente politique de confidentialité décrit la manière dont <strong>Carnet de Courses</strong>
                    collecte, utilise et protège vos données personnelles, conformément au
                    <strong>Règlement Général sur la Protection des Données (RGPD)</strong> — Règlement (UE) 2016/679 —
                    et à la <strong>Loi Informatique et Libertés n° 78-17</strong>.
                </p>
            </div>

            <!-- 1. Responsable du traitement -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                    Responsable du traitement
                </h3>
                <div class="bg-gray-50 rounded-lg p-4 space-y-1">
                    <p><strong>Application :</strong> Carnet de Courses</p>
                    <p><strong>Site web :</strong> <a href="https://macollectiondecourses.web.app/" target="_blank" class="text-green-700 underline">https://macollectiondecourses.web.app/</a></p>
                    <p><strong>Contact :</strong> Via le formulaire de contact disponible sur la page d'accueil</p>
                    <p class="text-xs text-gray-500 mt-2">
                        Le responsable du traitement est la personne physique qui gère et développe l'application
                        à titre personnel dans le cadre d'un projet non commercial.
                    </p>
                </div>
            </section>

            <!-- 2. Données collectées -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                    Données personnelles collectées
                </h3>
                <p class="mb-3">Lors de l'utilisation de l'application, les données suivantes sont collectées :</p>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs border-collapse">
                        <thead>
                            <tr class="bg-green-600 text-white">
                                <th class="text-left p-2 rounded-tl-lg">Donnée</th>
                                <th class="text-left p-2">Source</th>
                                <th class="text-left p-2 rounded-tr-lg">Finalité</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="p-2 font-medium">Adresse e-mail</td>
                                <td class="p-2">Formulaire d'inscription</td>
                                <td class="p-2">Authentification, identification du compte</td>
                            </tr>
                            <tr class="border-b border-gray-100 bg-gray-50 hover:bg-gray-100">
                                <td class="p-2 font-medium">Pseudo</td>
                                <td class="p-2">Formulaire d'inscription</td>
                                <td class="p-2">Affichage du profil, personnalisation</td>
                            </tr>
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="p-2 font-medium">Photo de profil</td>
                                <td class="p-2">Téléversement volontaire</td>
                                <td class="p-2">Personnalisation de l'avatar</td>
                            </tr>
                            <tr class="border-b border-gray-100 bg-gray-50 hover:bg-gray-100">
                                <td class="p-2 font-medium">Données de courses</td>
                                <td class="p-2">Saisie manuelle</td>
                                <td class="p-2">Suivi sportif, statistiques personnelles</td>
                            </tr>
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="p-2 font-medium">Wishlist de courses</td>
                                <td class="p-2">Saisie manuelle</td>
                                <td class="p-2">Planification et organisation</td>
                            </tr>
                            <tr class="border-b border-gray-100 bg-gray-50 hover:bg-gray-100">
                                <td class="p-2 font-medium">Préférences d'affichage</td>
                                <td class="p-2">Paramètres utilisateur</td>
                                <td class="p-2">Personnalisation de l'interface</td>
                            </tr>
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="p-2 font-medium">Date/heure de connexion</td>
                                <td class="p-2">Automatique (Firebase)</td>
                                <td class="p-2">Sécurité, anti-fraude</td>
                            </tr>
                            <tr class="bg-gray-50 hover:bg-gray-100">
                                <td class="p-2 font-medium">UID Firebase</td>
                                <td class="p-2">Automatique (Firebase)</td>
                                <td class="p-2">Identification technique du compte</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="mt-3 text-xs text-gray-500">
                    <i class="fas fa-exclamation-circle mr-1 text-amber-500"></i>
                    Les données de courses (nom, distance, temps, notes, photos) sont des données que vous saisissez
                    volontairement. Elles peuvent contenir des informations personnelles si vous choisissez d'en inclure.
                </p>
            </section>

            <!-- 3. Bases légales -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                    Bases légales des traitements (Art. 6 RGPD)
                </h3>
                <div class="space-y-2">
                    <div class="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <i class="fas fa-file-contract text-blue-500 mt-0.5 flex-shrink-0"></i>
                        <div>
                            <p class="font-medium text-blue-800 text-xs">Exécution du contrat (Art. 6.1.b)</p>
                            <p class="text-blue-700 text-xs mt-0.5">Création et gestion du compte, stockage des données de courses dans votre espace personnel.</p>
                        </div>
                    </div>
                    <div class="flex gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <i class="fas fa-hand-paper text-purple-500 mt-0.5 flex-shrink-0"></i>
                        <div>
                            <p class="font-medium text-purple-800 text-xs">Consentement (Art. 6.1.a)</p>
                            <p class="text-purple-700 text-xs mt-0.5">Photo de profil, partage public d'un carnet de courses, affichage de votre pseudo sur votre carnet public.</p>
                        </div>
                    </div>
                    <div class="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <i class="fas fa-balance-scale text-amber-500 mt-0.5 flex-shrink-0"></i>
                        <div>
                            <p class="font-medium text-amber-800 text-xs">Intérêt légitime (Art. 6.1.f)</p>
                            <p class="text-amber-700 text-xs mt-0.5">Journalisation de la date de dernière connexion pour la sécurité et la détection d'accès non autorisés.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. Sous-traitants -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
                    Sous-traitants et transferts de données
                </h3>
                <p class="mb-3 text-xs">Vos données sont hébergées et traitées par les sous-traitants suivants :</p>
                <div class="space-y-2">
                    <div class="p-3 border border-gray-200 rounded-lg">
                        <div class="flex items-center gap-2 mb-1">
                            <i class="fab fa-google text-red-500"></i>
                            <span class="font-semibold text-gray-800">Google Firebase (Google LLC)</span>
                            <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">USA — Clauses contractuelles types</span>
                        </div>
                        <p class="text-xs text-gray-600">Authentification (Firebase Auth), stockage des données (Cloud Firestore), hébergement.</p>
                        <a href="https://firebase.google.com/support/privacy" target="_blank" class="text-xs text-green-600 underline">Politique de confidentialité Firebase →</a>
                    </div>
                    <div class="p-3 border border-gray-200 rounded-lg">
                        <div class="flex items-center gap-2 mb-1">
                            <i class="fab fa-github text-gray-800"></i>
                            <span class="font-semibold text-gray-800">GitHub Pages (Microsoft Corporation)</span>
                            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">USA — Clauses contractuelles types</span>
                        </div>
                        <p class="text-xs text-gray-600">Hébergement statique du site web (fichiers HTML, CSS, JS). GitHub peut collecter des métadonnées de navigation.</p>
                        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" class="text-xs text-green-600 underline">Politique de confidentialité GitHub →</a>
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                    <i class="fas fa-globe mr-1"></i>
                    Ces transferts vers des pays tiers (États-Unis) sont encadrés par les
                    <strong>Clauses Contractuelles Types (CCT)</strong> adoptées par la Commission européenne,
                    assurant un niveau de protection adéquat conformément à l'Art. 46 RGPD.
                </p>
            </section>

            <!-- 5. Durée de conservation -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">5</span>
                    Durée de conservation des données
                </h3>
                <div class="space-y-2 text-xs">
                    <div class="flex gap-3 items-start">
                        <i class="fas fa-clock text-green-500 mt-0.5 flex-shrink-0"></i>
                        <p><strong>Données du compte (email, pseudo, préférences) :</strong> Conservées jusqu'à la suppression du compte par l'utilisateur.</p>
                    </div>
                    <div class="flex gap-3 items-start">
                        <i class="fas fa-clock text-green-500 mt-0.5 flex-shrink-0"></i>
                        <p><strong>Données de courses et wishlist :</strong> Conservées jusqu'à suppression manuelle par l'utilisateur ou suppression du compte.</p>
                    </div>
                    <div class="flex gap-3 items-start">
                        <i class="fas fa-clock text-green-500 mt-0.5 flex-shrink-0"></i>
                        <p><strong>Photo de profil :</strong> Conservée jusqu'à remplacement ou suppression volontaire.</p>
                    </div>
                    <div class="flex gap-3 items-start">
                        <i class="fas fa-clock text-amber-500 mt-0.5 flex-shrink-0"></i>
                        <p><strong>Logs de connexion (lastLogin) :</strong> Mis à jour à chaque connexion — pas d'historique conservé.</p>
                    </div>
                    <div class="flex gap-3 items-start">
                        <i class="fas fa-trash text-red-400 mt-0.5 flex-shrink-0"></i>
                        <p><strong>Après suppression du compte :</strong> Toutes vos données personnelles sont effacées
                         de Firestore. Aucune archive ou copie de sauvegarde n'est conservée après suppression.</p>
                    </div>
                </div>
            </section>

            <!-- 6. Vos droits -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">6</span>
                    Vos droits (Art. 15 à 22 RGPD)
                </h3>
                <p class="mb-3 text-xs">Conformément au RGPD, vous disposez des droits suivants :</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 text-xs flex items-center gap-1 mb-1">
                            <i class="fas fa-eye text-green-500"></i> Droit d'accès (Art. 15)
                        </p>
                        <p class="text-xs text-gray-600">Consulter toutes vos données via votre dashboard de course.</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 text-xs flex items-center gap-1 mb-1">
                            <i class="fas fa-edit text-blue-500"></i> Droit de rectification (Art. 16)
                        </p>
                        <p class="text-xs text-gray-600">Modifier vos données à tout moment depuis votre tableau de bord (pseudo, courses, etc.).</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 text-xs flex items-center gap-1 mb-1">
                            <i class="fas fa-trash-alt text-red-500"></i> Droit à l'effacement (Art. 17)
                        </p>
                        <p class="text-xs text-gray-600">Supprimer votre compte et toutes vos données via Paramètres → Supprimer mon compte.</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 text-xs flex items-center gap-1 mb-1">
                            <i class="fas fa-download text-purple-500"></i> Droit à la portabilité (Art. 20)
                        </p>
                        <p class="text-xs text-gray-600">Exporter vos données de courses au format JSON via l'icône téléchargement du tableau de bord.</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 text-xs flex items-center gap-1 mb-1">
                            <i class="fas fa-pause-circle text-amber-500"></i> Droit à la limitation (Art. 18)
                        </p>
                        <p class="text-xs text-gray-600">Demander via le formulaire la suspension temporaire du traitement de vos données en nous contactant.</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 text-xs flex items-center gap-1 mb-1">
                            <i class="fas fa-hand-paper text-orange-500"></i> Droit d'opposition (Art. 21)
                        </p>
                        <p class="text-xs text-gray-600">Vous opposer à certains traitements fondés sur l'intérêt légitime en nous contactant.</p>
                    </div>
                </div>
                <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <i class="fas fa-gavel mr-1"></i>
                    Vous disposez également du droit d'introduire une réclamation auprès de la
                    <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :
                    <a href="https://www.cnil.fr" target="_blank" class="underline">www.cnil.fr</a> — 3, Place de Fontenoy, 75007 Paris.
                </div>
                <p class="mt-2 text-xs text-gray-500">
                    Pour exercer vos droits (sauf ceux accessibles directement dans l'application), contactez-nous
                    via le <strong>formulaire disponible sur la page d'accueil</strong>. Nous répondrons dans un délai de
                    <strong>30 jours</strong> conformément à l'Art. 12 RGPD.
                </p>
            </section>

            <!-- 7. Cookies -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">7</span>
                    Cookies et données de session
                </h3>
                <div class="space-y-2 text-xs">
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 mb-1"><i class="fas fa-cookie-bite text-amber-500 mr-1"></i>Cookies d'authentification Firebase</p>
                        <p class="text-gray-600">Firebase Auth utilise des cookies et le stockage local (<code>localStorage</code>) pour maintenir votre session de connexion. Ces cookies sont <strong>strictement nécessaires</strong> au fonctionnement du service et ne requièrent pas de consentement préalable (Art. 5.3 de la directive ePrivacy).</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-semibold text-gray-800 mb-1"><i class="fas fa-database text-blue-500 mr-1"></i>sessionStorage</p>
                        <p class="text-gray-600">Le niveau d'accès (compte standard ou invité) est stocké temporairement dans <code>sessionStorage</code>. Ces données sont effacées automatiquement à la fermeture de l'onglet.</p>
                    </div>
                    <p class="text-gray-500">
                        <i class="fas fa-ban mr-1 text-green-500"></i>
                        L'application <strong>n'utilise aucun cookie publicitaire, analytique ou de tracking</strong> tiers.
                    </p>
                </div>
            </section>

            <!-- 8. Sécurité -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">8</span>
                    Sécurité des données
                </h3>
                <div class="text-xs space-y-2 text-gray-600">
                    <p><i class="fas fa-lock text-green-500 mr-1"></i><strong>Chiffrement en transit :</strong> Toutes les communications entre votre navigateur et Firebase utilisent le protocole HTTPS/TLS.</p>
                    <p><i class="fas fa-shield-alt text-green-500 mr-1"></i><strong>Accès cloisonné :</strong> Chaque utilisateur ne peut accéder qu'à ses propres données grâce aux règles de sécurité Firestore basées sur l'authentification (UID Firebase).</p>
                    <p><i class="fas fa-key text-green-500 mr-1"></i><strong>Mots de passe :</strong> Les mots de passe ne sont jamais stockés en clair - ils sont gérés exclusivement par Firebase Authentication qui les hache selon les standards de l'industrie.</p>
                    <p><i class="fas fa-user-shield text-green-500 mr-1"></i><strong>Suppression sécurisée :</strong> La suppression du compte nécessite une reconnexion récente (moins de 5 minutes) pour prévenir les suppressions accidentelles ou malveillantes.</p>
                </div>
            </section>

            <!-- 9. Mineurs -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">9</span>
                    Données des mineurs
                </h3>
                <p class="text-xs text-gray-600">
                    L'application n'est pas destinée aux personnes âgées de moins de <strong>15 ans</strong>
                    (âge du consentement numérique en France, Art. 45 de la Loi Informatique et Libertés modifiée).
                    Si vous êtes mineur(e), vous devez obtenir le consentement d'un parent ou tuteur légal
                    avant de créer un compte. Si nous apprenons qu'un mineur a fourni des données sans ce consentement,
                    nous supprimerons ces données dans les meilleurs délais.
                </p>
            </section>

            <!-- 10. Modifications -->
            <section>
                <h3 class="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold">10</span>
                    Modifications de la politique
                </h3>
                <p class="text-xs text-gray-600">
                    Nous nous réservons le droit de modifier cette politique pour refléter des évolutions
                    légales ou fonctionnelles. La date de dernière mise à jour est indiquée en haut et en bas de ce 
                    document.
                </p>
            </section>

        </div>

        <!-- Pied de modale -->
        <div class="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50 rounded-b-2xl">
            <p class="text-xs text-gray-400">
                <i class="fas fa-calendar-alt mr-1"></i>Version du 5 mars 2026 - RGPD (UE) 2016/679
            </p>
            <button id="closeRgpdModalBtn"
                    class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition shadow-sm">
                J'ai compris
            </button>
        </div>
    </div>
</div>
`;

    // ─── Injection dans le DOM ───────────────────────────────────────────────
    function inject() {
        if (document.getElementById('rgpdModal')) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = RGPD_MODAL_HTML;
        document.body.appendChild(wrapper.firstElementChild);
        bindEvents();
    }

    // ─── Gestion des événements ──────────────────────────────────────────────
    function bindEvents() {
        const modal = document.getElementById('rgpdModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeRgpdModal');
        const closeBottom = document.getElementById('closeRgpdModalBtn');

        const close = () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', close);
        if (closeBottom) closeBottom.addEventListener('click', close);

        // Clic sur le fond = fermeture
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        // Touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });
    }

    // ─── API publique ────────────────────────────────────────────────────────
    window.openRgpdModal = function () {
        const modal = document.getElementById('rgpdModal');
        if (!modal) { inject(); }
        const m = document.getElementById('rgpdModal');
        if (m) {
            m.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeRgpdModal = function () {
        const modal = document.getElementById('rgpdModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    };

    // ─── Init ────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

})();
