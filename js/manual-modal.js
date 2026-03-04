/**
 * js/manual-modal.js
 * Externalized manual modal
 */

const manualModalHTML = `
    <!-- Manuel Modal (Style Dashboard) -->
    <div id="manualModal" class="fixed inset-0 flex items-center justify-center z-50 hidden modal">
        <div class="absolute inset-0 bg-black bg-opacity-50 blur-bg"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 z-10 flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div
                class="p-6 border-b border-green-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-white rounded-t-xl shrink-0">
                <h3 class="text-2xl font-bold text-green-800 mb-0 flex items-center gap-2">
                    <i class="fas fa-book-open"></i> Manuel Utilisateur
                </h3>
                <button onclick="closeModal('manualModal')" class="text-gray-400 hover:text-gray-600 transition">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <!-- Content -->
            <div class="p-8 overflow-y-auto custom-scrollbar">
                <!-- Intro -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-info-circle text-green-600"></i> Introduction
                    </h4>
                    <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-4">
                        <p class="text-gray-700 leading-relaxed">
                            <strong class="text-green-800">Carnet de Courses</strong> est votre compagnon idéal pour
                            centraliser, analyser et partager vos performances sportives.
                            Que vous soyez coureur débutant ou confirmé, cette application vous aide à suivre votre
                            progression et à atteindre vos objectifs.
                        </p>
                    </div>
                </section>

                <!-- Connexion -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-sign-in-alt text-green-600"></i> Connexion
                    </h4>
                    <div>
                        <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-green-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-user-plus text-green-600"></i> Compte Personnel
                            </h5>
                            <p class="text-sm text-gray-600 mb-2">Créez votre compte avec email et mot de passe pour
                                des
                                fonctionnalités complètes :</p>
                            <ul class="text-sm text-gray-600 space-y-1 ml-4">
                                <li>✓ Sauvegarde cloud sécurisée</li>
                                <li>✓ Synchronisation multi-appareils</li>
                                <li>✓ Données privées par défaut</li>
                                <li>✓ Export et sauvegarde</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Interface principale -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-desktop text-green-600"></i> Interface Principale
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm">
                        <img src="img/app_generale.png" alt="Interface générale" class="w-full h-auto">
                        <div class="p-4 bg-gray-50">
                            <p class="text-sm text-gray-600">
                                <strong>Vue d'ensemble :</strong> L'interface principale affiche votre tableau de
                                bord
                                avec statistiques, graphiques et liste de courses.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Gestion des courses -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-running text-green-600"></i> Gestion des Courses
                    </h4>

                    <div class="space-y-4">
                        <!-- Ajouter une course -->
                        <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-green-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-plus-circle text-green-600"></i> Ajouter une Course
                            </h5>
                            <p class="text-sm text-gray-600 mb-2">Cliquez sur le bouton <span
                                    class="px-2 py-1 bg-green-600 text-white text-xs rounded-full">+ Nouvelle
                                    Course</span> en haut du tableau de bord.</p>
                            <div class="bg-gray-50 rounded p-3 mt-2">
                                <p class="text-xs font-semibold text-gray-700 mb-2">Informations disponibles :</p>
                                <div class="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>• Nom de la course <span class="text-red-500">*</span></div>
                                    <div>• Date <span class="text-red-500">*</span></div>
                                    <div>• Distance (km) <span class="text-red-500">*</span></div>
                                    <div>• Dénivelé positif D+ (m)</div>
                                    <div>• Dénivelé négatif D- (m)</div>
                                    <div>• Temps de course</div>
                                    <div>• Lieu / Ville</div>
                                    <div>• Photo (JPG, PNG)</div>
                                    <div>• Image automatique (Web/Nom)</div>
                                    <div>• Fichier GPX</div>
                                    <div>• Notes personnelles</div>
                                    <div>• Statut favori</div>
                                    <div>• Partage public</div>
                                    <div>• Accompagnants</div>
                                    <div>• Lien site de la course</div>
                                    <div>• Lien résultats en ligne</div>
                                </div>
                            </div>
                        </div>

                        <!-- Modifier/Supprimer -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                                <h5 class="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    <i class="fas fa-edit text-blue-600"></i> Modifier
                                </h5>
                                <p class="text-sm text-gray-600">Cliquez sur l'icône <i
                                        class="fas fa-pencil-alt text-blue-600"></i> dans une carte de course pour
                                    modifier ses informations.</p>
                            </div>
                            <div class="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
                                <h5 class="font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <i class="fas fa-trash text-red-600"></i> Supprimer
                                </h5>
                                <p class="text-sm text-gray-600">Cliquez sur l'icône <i
                                        class="fas fa-trash text-red-600"></i> et confirmez la suppression
                                    définitive.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Liens & Boutons d'accès rapide -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-link text-green-600"></i> Liens & Boutons d'accès rapide
                    </h4>
                    <div class="bg-white border border-orange-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Dans la fiche détail d'une course, jusqu'à 3 boutons peuvent apparaître si les liens correspondants sont renseignés dans le formulaire :</p>
                        <ul class="space-y-3 text-sm text-gray-600">
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-blue-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-external-link-alt mr-1.5"></i>Site</span>
                                <span><strong class="text-gray-800">Voir le site de la course</strong> — s'affiche si le champ <em>Lien site de la course</em> est renseigné.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-orange-500 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-trophy mr-1.5"></i>Résultats</span>
                                <span><strong class="text-gray-800">Voir les résultats en ligne</strong> — s'affiche si le champ <em>Lien résultats de la course</em> est renseigné. Accès direct au classement officiel.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-green-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-route mr-1.5"></i>GPX</span>
                                <span><strong class="text-gray-800">Voir le GPX</strong> — s'affiche si un lien GPX est renseigné.</span>
                            </li>
                        </ul>
                        <p class="text-xs text-gray-400 italic mt-3">💡 Ces boutons sont visibles uniquement dans la modale de détail d'une course.</p>
                    </div>
                </section>

                <!-- Triathlon & Relais -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-swimmer text-green-600"></i> Spécial : Triathlon & Relais
                    </h4>
                    <div class="bg-white border border-blue-100 rounded-lg p-4 shadow-sm space-y-4">

                        <!-- Triathlon -->
                        <div>
                            <h5 class="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                🏊‍♂️🚴‍♂️🏃‍♂️ Triathlon
                            </h5>
                            <p class="text-sm text-gray-600 mb-2">En sélectionnant le type "Triathlon", détaillez
                                chaque
                                épreuve :</p>
                            <ul class="text-xs text-gray-600 ml-4 space-y-1">
                                <li>• <strong>Natation :</strong> Distance (m) et Temps</li>
                                <li>• <strong>Vélo :</strong> Distance (km), D+ (m), D- (m) et Temps</li>
                                <li>• <strong>Course à pied :</strong> Distance (km), D+ (m), D- (m) et Temps</li>
                                <li class="text-xs text-blue-400 italic">💡 Les totaux D+ et D- sont calculés automatiquement à partir des segments vélo et CAP.</li>
                            </ul>
                        </div>

                        <hr class="border-blue-100">

                        <!-- Relais -->
                        <div>
                            <h5 class="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-users"></i> Courses en Relais
                            </h5>
                            <p class="text-sm text-gray-600 mb-2">Gérez les courses d'équipe avec précision :</p>
                            <ul class="text-xs text-gray-600 ml-4 space-y-1">
                                <li>• <strong>Relais Classique :</strong> Utilisez le "Tableau de Relais" pour
                                    ajouter chaque segment avec sa <strong>distance</strong>, son <strong>D+</strong>, son <strong>D-</strong> et son <strong>temps</strong>. Les totaux sont calculés automatiquement.</li>
                                <li>• <strong>Triathlon en Relais :</strong> Sélectionnez "En équipe (Relais)" puis
                                    choisissez votre discipline (Nageur, Cycliste ou Coureur) pour n'enregistrer que
                                    votre partie.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Statistiques -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-chart-line text-green-600"></i> Statistiques & Analyses
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm">
                        <img src="img/stat.png" alt="Statistiques" class="w-full h-auto">
                        <div class="p-4 bg-gray-50">
                            <p class="text-sm text-gray-600 mb-3">
                                <strong>Graphiques interactifs :</strong> Visualisez votre progression avec
                                plusieurs
                                types de graphiques.
                            </p>
                            <div class="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>📊 Distance par mois/année</div>
                                <div>⛰️ Dénivelé D+ cumulé</div>
                                <div>📉 Dénivelé D- cumulé</div>
                                <div>📈 Évolution du nombre de courses</div>
                                <div>🏃 Vitesse moyenne par période</div>
                                <div>🏆 Records D+ et D- par course</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Badges -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-award text-green-600"></i> Badges & Succès
                    </h4>
                    <div class="bg-white border border-purple-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-2">Débloquez des badges spéciaux pour célébrer vos
                            exploits
                            (Record Vitesse, Max Dénivelé, etc.).</p>
                        <div class="grid grid-cols-2 gap-2 text-xs text-purple-800 mb-3">
                            <div class="bg-purple-50 p-2 rounded flex items-center gap-2"><i class="fas fa-bolt"></i>
                                Record Vitesse</div>
                            <div class="bg-purple-50 p-2 rounded flex items-center gap-2"><i
                                    class="fas fa-mountain"></i> Max Dénivelé</div>
                            <div class="bg-purple-50 p-2 rounded flex items-center gap-2"><i
                                    class="fas fa-euro-sign"></i> Course la + chère</div>
                            <div class="bg-purple-50 p-2 rounded flex items-center gap-2"><i class="fas fa-route"></i>
                                Plus Longue Distance</div>
                        </div>
                        <p class="text-xs text-gray-500 italic">Note : Le bouton "Badges" apparaît sur votre tableau
                            de
                            bord automatiquement dès que vous obtenez votre premier badge.</p>
                    </div>
                </section>

                <!-- Recherche avancée -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-search text-green-600"></i> Recherche Avancée
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Filtrez vos courses selon plusieurs critères
                            simultanés :
                        </p>
                        <div class="grid md:grid-cols-3 gap-3">
                            <div class="bg-green-50 p-3 rounded">
                                <p class="font-semibold text-green-800 text-sm mb-1">📅 Par Date</p>
                                <p class="text-xs text-gray-600">Année, mois, période personnalisée</p>
                            </div>
                            <div class="bg-blue-50 p-3 rounded">
                                <p class="font-semibold text-blue-800 text-sm mb-1">📏 Par Distance</p>
                                <p class="text-xs text-gray-600">5km, 10km, semi, marathon, ultra</p>
                            </div>
                            <div class="bg-purple-50 p-3 rounded">
                                <p class="font-semibold text-purple-800 text-sm mb-1">📍 Par Lieu</p>
                                <p class="text-xs text-gray-600">Ville, région, pays</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Wishlist -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-heart text-green-600"></i> Wishlist
                    </h4>
                    <div class="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Planifiez vos courses futures et suivez leur
                            réalisation :
                        </p>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span>Ajoutez des courses à votre liste de souhaits</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span>Cochez-les une fois réalisées</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span>Suivez votre progression d'objectifs</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <!-- Interactions -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-heart text-green-600"></i> Interactions Sociales
                    </h4>
                    <div class="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Encouragez les autres coureurs et créez du lien !</p>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Aimer :</strong> Cliquez sur le cœur <i
                                        class="fas fa-heart text-red-500"></i> pour féliciter une
                                    performance.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Voir les "J'aime" :</strong> Cliquez sur le compteur de "J'aime" pour
                                    voir
                                    la liste des personnes qui ont aimé la course.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
                                <span><strong>Confidentialité :</strong> Vous pouvez <strong>masquer le nombre de
                                        J'aime</strong> sur VOS courses dans les paramètres de compte (visible
                                    uniquement par vous).</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <!-- Paramètres -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-cog text-green-600"></i> Paramètres du Compte
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Accédez aux paramètres via l'icône <i
                                class="fas fa-cog text-gray-600"></i> dans le bandeau de connexion (ou "Compte" sur
                            mobile). Vous y trouverez :</p>

                        <div class="space-y-3">
                            <!-- Profil -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-user-edit text-green-600"></i> Profil & Photo</p>
                                <p class="text-xs text-gray-600 mb-2">Personnalisez votre identité sur la plateforme.</p>
                                <ul class="text-[10px] text-gray-500 list-disc ml-4 space-y-1">
                                    <li><strong>Pseudo :</strong> Changez votre nom d'affichage public.</li>
                                    <li><strong>Photo de profil :</strong> Importez une image (max 600 Ko) pour personnaliser votre compte. La photo est stockée de manière sécurisée et s'affiche sur vos courses publiques.</li>
                                    <li><strong>Avatar par défaut :</strong> Si vous n'avez pas de photo, un avatar coloré est généré automatiquement à partir de votre pseudo.</li>
                                </ul>
                            </div>

                            <!-- Confidentialité -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-user-secret text-green-600"></i> Confidentialité</p>
                                <p class="text-xs text-gray-600 mb-1">Contrôlez ce que les autres voient sur vos
                                    courses
                                    publiques :</p>
                                <ul class="text-xs text-gray-600 list-disc ml-4 space-y-0.5">
                                    <li>Afficher/Masquer votre pseudo</li>
                                    <li>Afficher/Masquer la ville de la course</li>
                                    <li>Afficher/Masquer le jour précis (ex: 12 mars)</li>
                                    <li>Afficher/Masquer le label "Favori"</li>
                                    <li>Masquer le compteur de "J'aime"</li>
                                </ul>
                            </div>

                            <!-- Interface -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-sliders-h text-green-600"></i> Préférences d'interface</p>
                                <p class="text-xs text-gray-600 mb-1">Simplifiez votre tableau de bord en affichant
                                    uniquement ce dont vous avez besoin :</p>
                                <ul class="text-xs text-gray-600 list-disc ml-4 space-y-0.5">
                                    <li>Afficher/Masquer le bouton "Importer mes données"</li>
                                    <li>Afficher/Masquer le bouton "Statistiques"</li>
                                </ul>
                            </div>

                            <!-- Actions -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-tools text-green-600"></i> Actions & Aide</p>
                                <ul class="text-xs text-gray-600 space-y-1">
                                    <li class="flex items-center gap-2"><i
                                            class="fas fa-graduation-cap text-blue-500"></i> <strong>Tutoriel
                                            :</strong>
                                        Relancez le guide interactif (depuis le tableau de bord uniquement).</li>
                                    <li class="flex items-center gap-2"><i class="fas fa-key text-red-500"></i>
                                        <strong>Sécurité :</strong> Réinitialisez votre mot de passe.
                                    </li>
                                    <li class="flex items-center gap-2"><i class="fas fa-user-times text-red-500"></i>
                                        <strong>Suppression du compte :</strong> Supprimez définitivement votre compte et vos données.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Export & Backup -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-download text-green-600"></i> Export, Sauvegarde & Import
                    </h4>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-green-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-file-export text-green-600"></i> Export & Backup
                            </h5>
                            <p class="text-sm text-gray-600">Sauvegardez toutes vos données (courses + wishlist)
                                :</p>
                            <ul class="text-xs text-gray-600 ml-4 mt-2 space-y-1">
                                <li>• Format JSON universel</li>
                                <li class="flex items-center gap-1">• Bouton <svg xmlns="http://www.w3.org/2000/svg"
                                        class="h-4 w-4 text-green-600 inline" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                            clip-rule="evenodd" />
                                    </svg> dans la barre de statut</li>
                            </ul>
                        </div>
                        <div class="bg-white border border-teal-100 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-teal-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-file-import text-teal-600"></i> Import Données
                            </h5>
                            <p class="text-sm text-gray-600">Restaurez vos données depuis un fichier JSON.</p>
                            <ul class="text-xs text-gray-600 ml-4 mt-2 space-y-1">
                                <li>• Importe courses et wishlist</li>
                                <li>• Courses publiques par défaut</li>
                                <li>• Caché par défaut (activer dans Compte)</li>
                            </ul>
                        </div>
                        <div class="bg-white border border-red-100 rounded-lg p-4 shadow-sm md:col-span-2">
                            <h5 class="font-bold text-red-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-file-pdf text-red-600"></i> Export PDF
                            </h5>
                            <p class="text-sm text-gray-600">Générez un rapport PDF esthétique de vos courses
                                pour
                                partager vos performances.</p>
                        </div>
                    </div>
                </section>

                <!-- Communauté -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-users text-green-600"></i> Communauté
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Partagez vos exploits avec la communauté :</p>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li class="flex items-start gap-2">
                                <i class="fas fa-globe text-green-600 mt-0.5"></i>
                                <span>Activez le partage public pour chaque course individuellement</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-eye text-blue-600 mt-0.5"></i>
                                <span>Consultez les courses des autres coureurs sur la page d'accueil</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-filter text-purple-600 mt-0.5"></i>
                                <span>Filtrez par statut (À venir / Passées) et nombre de résultats</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <!-- Astuces -->
                <section>
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-lightbulb text-green-600"></i> Astuces & Raccourcis
                    </h4>
                    <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                        <div class="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                            <div class="flex items-start gap-2">
                                <i class="fas fa-star text-yellow-500 mt-0.5"></i>
                                <span>Marquez vos courses favorites avec l'étoile</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <i class="fas fa-calendar-check text-green-600 mt-0.5"></i>
                                <span>Activez les rappels d'anniversaire de courses</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <i class="fas fa-camera text-blue-600 mt-0.5"></i>
                                <span>Ajoutez des photos pour immortaliser vos moments</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <i class="fas fa-graduation-cap text-green-600 mt-0.5"></i>
                                <span>Besoin d'aide ? Lancez le tuto guidé dans le menu Compte</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <i class="fas fa-magic text-blue-500 mt-0.5"></i>
                                <span>Pas de photo ? Laissez l'app chercher pour vous !</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <i class="fas fa-route text-purple-600 mt-0.5"></i>
                                <span>Importez vos traces GPX pour visualiser votre parcours</span>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

        </div>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('manualModal')) {
        const div = document.createElement('div');
        div.innerHTML = manualModalHTML;
        document.body.appendChild(div);
    }
});
