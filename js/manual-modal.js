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
                            <strong class="text-green-800">Carnet de Courses</strong> centralise vos courses, vos
                            statistiques et leur partage. Consultez les sections ci-dessous selon vos besoins.
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
                            <p class="text-sm text-gray-600 mb-2">Créez un compte avec votre e-mail et un mot de passe :</p>
                            <ul class="text-sm text-gray-600 space-y-1 ml-4">
                                <li>✓ Sauvegarde cloud sécurisée</li>
                                <li>✓ Synchronisation multi-appareils</li>
                                <li>✓ Données privées par défaut</li>
                                <li>✓ Export et sauvegarde</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Amis -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-user-group text-green-600"></i> Amis
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-700 mb-3">Dans <strong>Amis</strong>, recherchez un pseudo et envoyez une demande pour suivre son carnet.</p>
                        <ul class="text-sm text-gray-600 space-y-1.5 ml-4">
                            <li>• Le coureur choisit les accès accordés : carnet, wishlist, statistiques, badges et détails des courses.</li>
                            <li>• Dans <strong>Notifications</strong>, acceptez ou refusez les demandes et gérez vos abonnés.</li>
                            <li>• Après acceptation et autorisation d’accès au carnet, cliquez sur <strong>Voir le carnet</strong> dans vos abonnements.</li>
                            <li>• Désabonnez-vous ou révoquez l’accès d’un abonné à tout moment.</li>
                        </ul>
                    </div>
                </section>

                <!-- Interface principale -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-desktop text-green-600"></i> Interface Principale
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm">
                        <img src="img/app_generale.png" alt="Interface générale" class="w-full h-auto">
                        <div class="p-4 bg-gray-50 space-y-2">
                            <p class="text-sm text-gray-600"><strong>Vue d'ensemble :</strong> statistiques, graphiques et liste de vos courses.</p>
                            <p class="text-xs text-green-800 bg-green-50 p-2.5 rounded-lg border border-green-200">
                                <i class="fas fa-calculator text-green-600 mr-1.5"></i>
                                <strong>Détail des calculs :</strong> cliquez sur le nombre de courses, les kilomètres, le D+ ou le chrono pour voir le détail par course, y compris vos parts de relais et de triathlon.
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
                            <p class="text-sm text-gray-600 mb-2">Cliquez sur <span
                                    class="px-2 py-1 bg-green-600 text-white text-xs rounded-full">+ Nouvelle
                                    Course</span> en haut du tableau de bord.</p>
                            <div class="bg-gray-50 rounded p-3 mt-2">
                                <p class="text-xs font-semibold text-gray-700 mb-2">Informations disponibles :</p>
                                <div class="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>• Nom de la course <span class="text-red-500">*</span></div>
                                    <div>• Date <span class="text-red-500">*</span></div>
                                    <div>• Distance (km)</div>
                                    <div>• Numéro de dossard</div>
                                    <div>• Dénivelé D+ et D- (m)</div>
                                    <div>• Temps de course</div>
                                    <div>• Classements général, par genre et par catégorie FFA</div>
                                    <div>• Points de passage (km ou étape de triathlon, classement et temps)</div>
                                    <div>• Lieu / Ville</div>
                                    <div>• Photo (JPG, PNG)</div>
                                    <div>• Image automatique (Web/Nom)</div>
                                    <div>• Fichier GPX</div>
                                    <div>• Notes personnelles avec éditeur</div>
                                    <div>• Achat photo (prix inclus dans les dépenses)</div>
                                    <div>• Statut favori</div>
                                    <div>• Partage public</div>
                                    <div>• Accompagnants avec type coureur ou spectateur</div>
                                    <div>• Lien site de la course</div>
                                    <div>• Lien résultats en ligne</div>
                                    <div>• Lien Google Drive en ligne</div>
                                </div>
                                <p class="text-xs text-gray-600 mt-3">
                                    <strong>Classements :</strong> saisissez votre position et le nombre de participants (général, genre, catégorie). Pour la catégorie, sélectionnez votre catégorie d’âge FFA.
                                </p>
                                <p class="text-xs text-gray-600 mt-3">Pour ajouter le temps et le classement d’un accompagnant coureur, cliquez sur « + ». Précisez s’il a couru la même course ; sinon, indiquez distance et dénivelé. Son palmarès figure dans le détail de la course.</p>
                            </div>
                        </div>

                        <!-- Modifier/Supprimer -->
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                                <h5 class="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    <i class="fas fa-edit text-blue-600"></i> Modifier
                                </h5>
                                <p class="text-sm text-gray-600">Cliquez sur <i class="fas fa-pencil-alt text-blue-600"></i> sur une carte pour modifier la course.</p>
                            </div>
                            <div class="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
                                <h5 class="font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <i class="fas fa-trash text-red-600"></i> Supprimer
                                </h5>
                                <p class="text-sm text-gray-600">Cliquez sur <i class="fas fa-trash text-red-600"></i>, puis confirmez la suppression définitive.</p>
                            </div>
                        </div>

                        <!-- Prédiction IA sur les courses à venir -->
                        <div class="bg-purple-50/80 border border-purple-200 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                <i class="fas fa-robot text-purple-600"></i> Prédiction IA personnalisée (Courses à venir)
                            </h5>
                            <p class="text-sm text-gray-700 mb-2 leading-relaxed">Pour une course <strong>à venir</strong>, la fiche détaillée peut estimer votre performance :</p>
                            <ul class="text-xs text-gray-600 space-y-1.5 ml-4">
                                <li>• <strong>Terrain :</strong> projection adaptée à la route, au trail (D+) et au relais.</li>
                                <li>• <strong>Calcul :</strong> formule de Peter Riegel et vos performances d’effort passées.</li>
                                <li>• <strong>Activation :</strong> nécessite au moins <strong>5 courses complètes</strong> avec distance et chrono ; sinon, le statut habituel reste affiché.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Sélection Multiple et Actions en masse -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-emerald-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-tasks text-emerald-600"></i> Sélection Multiple & Actions en masse
                    </h4>
                    <div class="bg-white border border-emerald-100 rounded-lg p-5 shadow-sm space-y-4">
                        <p class="text-sm text-gray-700 leading-relaxed">Sélectionnez plusieurs courses pour leur appliquer une action groupée.</p>

                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                                <h5 class="font-bold text-emerald-800 text-sm mb-1.5 flex items-center gap-2">
                                    <i class="fas fa-hand-pointer text-emerald-600"></i> Activation & Sélection
                                </h5>
                                <ul class="text-xs text-gray-600 space-y-1.5">
                                    <li>• <strong>Activer :</strong> clic ou appui long (~500 ms) sur une carte, ou bouton « Sélectionner » dans la barre de filtres.</li>
                                    <li>• <strong>Quitter :</strong> recliquez sur le bouton ou désélectionnez la dernière course (« Tout désélec. »).</li>
                                </ul>
                            </div>

                            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                                <h5 class="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                                    <i class="fas fa-tools text-slate-600"></i> Actions en masse disponibles
                                </h5>
                                <ul class="text-xs text-gray-600 space-y-1.5">
                                    <li>• <strong>Exporter :</strong> téléchargez un seul fichier JSON des courses sélectionnées.</li>
                                    <li>• <strong>Note commune :</strong> ajoutez une note à la fin de chaque note existante (avec retour à la ligne).</li>
                                    <li>• <strong>Favoris :</strong> ajoutez ou retirez le statut favori en lot.</li>
                                    <li>• <strong>Supprimer :</strong> confirmation en deux étapes.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Configuration des Cartes -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-cog text-green-600"></i> Configuration des Cartes
                    </h4>
                    <div class="space-y-4">
                        <!-- Boutons d'actions rapides -->
                        <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-green-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-hand-pointer text-green-600"></i> Boutons d'actions rapides
                            </h5>
                            <p class="text-sm text-gray-600 mb-3">Personnalisez les raccourcis en bas à gauche des cartes :</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-arrows-alt text-green-600 mt-0.5"></i>
                                    <span><strong>Réorganiser :</strong> glisser-déposer sur ordinateur, clics sur mobile.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-layer-group text-green-600 mt-0.5"></i>
                                    <span><strong>Choix :</strong> Modifier, Supprimer, Favori, PDF, Site, GPX, Drive, Résultats ou Export JSON d’une course. Par défaut : <strong>Modifier, Supprimer et PDF</strong> ; jusqu’à 3 boutons par carte.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-eye text-green-600 mt-0.5"></i>
                                    <span><strong>Aperçu :</strong> visualisez le résultat sur une carte d’exemple.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-image text-green-600 mt-0.5"></i>
                                    <span><strong>Image :</strong> choisissez la photo ou le tracé GPX ; si l’image manque, l’autre s’affiche.</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Tags des cartes -->
                        <div class="bg-white border border-purple-100 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-purple-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-tags text-purple-600"></i> Tags affichés sur les cartes
                            </h5>
                            <p class="text-xs text-gray-500 mb-2">Tags disponibles :</p>
                            <div class="flex flex-wrap gap-1.5 mb-3">
                                <span class="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-ruler-horizontal text-green-500"></i> Distance</span>
                                <span class="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-mountain text-orange-500"></i> Dénivelé</span>
                                <span class="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-map-marker-alt text-teal-500"></i> Lieu</span>
                                <span class="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-road text-indigo-500"></i> Terrain</span>
                                <span class="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-clock text-cyan-500"></i> Temps</span>
                                <span class="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-tachometer-alt text-violet-500"></i> Allure</span>
                                <span class="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-euro-sign text-red-500"></i> Prix</span>
                                <span class="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-camera text-rose-500"></i> Prix photos</span>
                                <span class="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-medal text-yellow-500"></i> Classement général</span>
                                <span class="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-layer-group text-amber-500"></i> Classement catégorie</span>
                                <span class="inline-flex items-center gap-1 bg-pink-50 border border-pink-200 text-pink-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-venus-mars text-pink-500"></i> Classement par genre</span>
                                <span class="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-percent text-violet-500"></i> Pourcentage au général</span>
                            </div>
                            <p class="text-[11px] text-gray-500 italic">Activez en un clic les tags souhaités dans <strong>Configurer la carte → Tags affichés</strong> pour toutes les cartes.</p>
                        </div>
                    </div>
                    <p class="text-[11px] text-blue-600 italic mt-3 flex items-center gap-2">
                        <i class="fas fa-lightbulb text-yellow-500"></i>
                        <span>Ouvrez <strong><i class="fas fa-cog mr-1"></i> Configurer la carte</strong> en haut du tableau de bord.</span>
                    </p>
                </section>

                <!-- Google Drive -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fab fa-google-drive text-green-600"></i> Dossier Google Drive
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Associez un dossier Drive pour retrouver les documents de la course (photos, certificats, factures).</p>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li class="flex items-start gap-2">
                                <i class="fas fa-link text-green-600 mt-0.5"></i>
                                <span><strong>Associer :</strong> saisissez l’ID du dossier dans « ID Dossier Google Drive » à l’ajout ou à la modification.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-folder-open text-green-600 mt-0.5"></i>
                                <span><strong>Ouvrir :</strong> le bouton <span class="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs leading-none"><i class="fab fa-google-drive mr-1"></i>Dossier Drive</span> de la fiche détail lance l’explorateur intégré.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-th-large text-green-600 mt-0.5"></i>
                                <span><strong>Affichage :</strong> alternez entre les vues « Miniature » (par défaut) et « Liste ».</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <!-- Liens & Boutons d'accès rapide -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-link text-green-600"></i> Liens & Boutons d'accès rapide
                    </h4>
                    <div class="bg-white border border-orange-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">La fiche détail affiche les boutons correspondant aux informations renseignées :</p>
                        <ul class="space-y-3 text-sm text-gray-600">
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-blue-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-external-link-alt mr-1.5"></i>Site</span>
                                <span><strong class="text-gray-800">Voir le site</strong> — site officiel.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-orange-500 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-trophy mr-1.5"></i>Résultats</span>
                                <span><strong class="text-gray-800">Voir les résultats</strong> — classement en ligne.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-green-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-route mr-1.5"></i>GPX</span>
                                <span><strong class="text-gray-800">Voir le GPX</strong> — visualisation du tracé si disponible.</span>
                            </li>
                             <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-semibold shrink-0"><i class="fab fa-google-drive mr-1.5"></i>Drive</span>
                                <span><strong class="text-gray-800">Dossier Drive</strong> — explorateur de fichiers intégré.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-red-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-file-pdf mr-1.5"></i>PDF</span>
                                <span><strong class="text-gray-800">Export PDF</strong> — rapport de course avec nom de fichier horodaté et unique.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-pink-100 border border-pink-200 text-pink-800 rounded text-xs font-semibold shrink-0"><i class="fas fa-file-export mr-1.5"></i>Export</span>
                                <span><strong class="text-gray-800">Exporter la course</strong> — téléchargez sa sauvegarde JSON.</span>
                            </li>
                        </ul>
                        <p class="text-xs text-gray-400 italic mt-3">Ces boutons apparaissent dans la modale de détail.</p>
                    </div>
                </section>

                <!-- Nouveautés de la fiche détail -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-chart-line text-green-600"></i> Fiche détail d’une course
                    </h4>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>• Comparez vos performances avec les éditions précédentes.</li>
                        <li>• Consultez votre position en pourcentage du classement (ex. : Top 11.0%).</li>
                        <li>• Consultez vos points de passage et dépliez la comparaison au classement final : places gagnées en vert, perdues en rouge.</li>
                    </ul>
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
                            <p class="text-sm text-gray-600 mb-2">Pour un triathlon, renseignez :</p>
                            <ul class="text-xs text-gray-600 ml-4 space-y-1">
                                <li>• <strong>Natation :</strong> Distance (m) et Temps</li>
                                <li>• <strong>Vélo :</strong> Distance (km), D+ (m), D- (m) et Temps</li>
                                <li>• <strong>Course à pied :</strong> Distance (km), D+ (m), D- (m) et Temps</li>
                                <li class="text-xs text-blue-400 italic">Les totaux D+ et D- sont calculés à partir du vélo et de la course à pied.</li>
                            </ul>
                        </div>

                        <hr class="border-blue-100">

                        <!-- Relais -->
                        <div>
                            <h5 class="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-users"></i> Courses en Relais
                            </h5>
                            <p class="text-sm text-gray-600 mb-2">Dans le tableau de relais :</p>
                            <ul class="text-xs text-gray-600 ml-4 space-y-1">
                                <li>• <strong>Saisie :</strong> pour chaque segment, indiquez le coureur (nom personnalisé ou « Personne »), la distance, les D+ / D- et le temps.</li>
                                <li>• <strong>« Personne » :</strong> le segment s’affiche « - » et ses kilomètres, dénivelés et temps ne sont attribués à personne.</li>
                                <li>• <strong>Totaux :</strong> distances et dénivelés se recalculent en temps réel.</li>
                                <li>• <strong>Commentaires :</strong> ajoutez une remarque par segment ; le PDF l’affiche dans un bloc dédié, centré et aligné.</li>
                                <li>• <strong>PDF relais :</strong> exportez uniquement le tableau. Le nom du fichier est unique à la seconde ; le dernier coéquipier est centré si l’équipe est impaire.</li>
                                <li>• <strong>Horaires :</strong> avec l’heure de départ et un temps valide pour chaque segment, cliquez sur une ligne pour voir ses heures de départ et d’arrivée, de façon centrée et sans défilement horizontal.</li>
                                <li>• <strong>Dénivelés :</strong> D+ et D- tiennent sur une ligne (ex. « ↑500m ↓200m » ; si D- est nul, seul D+ apparaît). Le PDF utilise les signes + / -.</li>
                                <li>• <strong>Relais effectués :</strong> le numéro des segments de chaque coéquipier accompagne son total (ex. « 2 relais effectués (1, 3) »).</li>
                                <li>• <strong>Votre pseudo :</strong> remplace automatiquement « Moi » sur vos relais (ou ceux du propriétaire du carnet).</li>
                                <li>• <strong>Triathlon en relais :</strong> choisissez « En équipe (Relais) », puis votre discipline (nage, vélo ou course à pied) ; seule votre partie est enregistrée.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Statistiques -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-chart-line text-green-600"></i> Statistiques & Analyses
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm space-y-4">
                        <img src="img/stat.png" alt="Statistiques" class="w-full h-auto">
                        <div class="p-4 bg-gray-50">
                            <p class="text-sm text-gray-600 mb-3"><strong>Graphiques interactifs :</strong> suivez votre progression avec :</p>
                            <div class="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>📊 Distance par mois/année</div>
                                <div>⛰️ Dénivelé D+ cumulé</div>
                                <div>📉 Dénivelé D- cumulé</div>
                                <div>📈 Évolution du nombre de courses</div>
                                <div>🏃 Vitesse moyenne par période</div>
                                <div>🏆 Records D+ et D- par course</div>
                                <div>📈 Courbe d'évolution des performances (vitesse, allure, effort ajusté au D+)</div>
                            </div>
                        </div>

                        <!-- Allures moyennes, RP & Indice de fatigue -->
                        <div class="p-4 bg-emerald-50/70 border-t border-emerald-200">
                            <h5 class="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-2">
                                <i class="fas fa-tachometer-alt text-emerald-600"></i> Allures de référence, RP & Indice de fatigue
                            </h5>
                            <p class="text-xs text-gray-700 mb-3 leading-relaxed">La modale de statistiques fournit ces repères à partir de vos courses :</p>
                            <div class="grid md:grid-cols-3 gap-3 text-xs text-gray-700">
                                <div class="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                                    <p class="font-bold text-emerald-800 mb-1">⏱️ Allures moyennes</p>
                                    <p class="text-gray-600">Temps et allures estimés sur <strong>1 km</strong>, <strong>10 km</strong> et <strong>semi-marathon</strong>, ajustés au dénivelé.</p>
                                </div>
                                <div class="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                                    <p class="font-bold text-emerald-800 mb-1">🥇 Records Personnels (RP)</p>
                                    <p class="text-gray-600">Votre meilleur chrono historique pour chaque distance de référence.</p>
                                </div>
                                <div class="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                                    <p class="font-bold text-emerald-800 mb-1">❤️ Indice de fatigue</p>
                                    <p class="text-gray-600">Calculé avec la formule de Peter Riegel. Cliquez sur le badge pour l’explication interactive.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Courbe d'évolution des performances & Allure d'effort -->
                        <div class="p-4 bg-blue-50/70 border-t border-blue-200">
                            <h5 class="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                                <i class="fas fa-chart-line text-blue-600"></i> Courbe d'évolution des performances & Allure d'effort
                            </h5>
                            <p class="text-xs text-gray-700 mb-2 leading-relaxed">Suivez l’évolution de vos performances avec quatre métriques :</p>
                            <ul class="text-xs text-gray-600 space-y-1.5 ml-4">
                                <li>• Vitesse (km/h), vitesse d’effort avec D+ (Effort-km/h), allure (min/km) et allure d’effort ajustée (min/km).</li>
                                <li>• Les repères « Meilleure » et « Moins bonne » reposent sur l’effort réel : kilomètre-effort (distance + D+/100), formule de Riegel et terrain. Le dénivelé d’un trail est ainsi pris en compte.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Badges, Missions & Gamification -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-trophy text-yellow-500"></i> Gamification, Missions & Records
                    </h4>
                    <div class="bg-white border border-yellow-200 rounded-lg p-5 shadow-sm space-y-4">
                        <p class="text-sm text-gray-700 leading-relaxed">Gagnez des XP, débloquez des records et comparez-vous à la communauté.</p>

                        <div class="grid md:grid-cols-3 gap-3">
                            <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
                                <h5 class="font-bold text-amber-900 text-sm mb-1.5 flex items-center gap-2">
                                    <i class="fas fa-gamepad text-amber-600"></i> 120 Missions & 10 Niveaux
                                </h5>
                                <ul class="text-xs text-gray-600 space-y-1">
                                    <li>• <strong>10 niveaux :</strong> de Tong à Crampons d’Or.</li>
                                    <li>• <strong>12 missions par niveau :</strong> 10 000 XP au total.</li>
                                    <li>• <strong>Défis :</strong> distance, régularité, dénivelé, GPX, photos, météo et complétude des fiches.</li>
                                </ul>
                            </div>

                            <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
                                <h5 class="font-bold text-blue-900 text-sm mb-1.5 flex items-center gap-2">
                                    <i class="fas fa-medal text-blue-600"></i> Cocardes Records
                                </h5>
                                <ul class="text-xs text-gray-600 space-y-1">
                                    <li>• <strong>3 records :</strong> allure (RP), D+ maximal et plus longue distance.</li>
                                    <li>• <strong>Section repliable :</strong> ouvrez-la ou repliez-la en un clic.</li>
                                </ul>
                            </div>

                            <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
                                <h5 class="font-bold text-emerald-900 text-sm mb-1.5 flex items-center gap-2">
                                    <i class="fas fa-users text-emerald-600"></i> Classement Live
                                </h5>
                                <ul class="text-xs text-gray-600 space-y-1">
                                    <li>• <strong>Top 5 en direct :</strong> classé selon les XP enregistrés.</li>
                                    <li>• <strong>Votre rang :</strong> position exacte mise à jour en temps réel.</li>
                                    <li>• <strong>Confidentialité :</strong> masquez ou affichez votre pseudo en un clic.</li>
                                </ul>
                            </div>
                        </div>

                        <p class="text-[11px] text-emerald-700 italic flex items-center gap-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                            <i class="fas fa-shield-alt text-emerald-600"></i>
                            <span>Les jauges d’XP, badges et statistiques incluent toutes vos courses, même si le tableau de bord est filtré.</span>
                        </p>
                    </div>
                </section>

                <!-- Recherche avancée -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-search text-green-600"></i> Recherche Avancée
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Combinez plusieurs critères pour filtrer vos courses :</p>
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
                        <p class="text-[11px] text-blue-600 italic mt-3 flex items-center gap-2">
                            <i class="fas fa-lightbulb text-yellow-500"></i>
                             <span><strong>Recherche :</strong> la barre principale cherche dans tous les champs (lieu, notes, dossard, accompagnants, etc.), pas seulement dans les noms.</span>
                        </p>
                    </div>
                </section>

                <!-- Wishlist -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-heart text-green-600"></i> Wishlist & Courses Futures
                    </h4>
                    <div class="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Planifiez vos courses à venir dans la wishlist :</p>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Date et site :</strong> renseignez la date prévue et l’URL officielle.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Tri :</strong> triez par date ou nom, par discipline (Route, Trail, Triathlon, Relai), en consultation ou édition. Recliquez pour inverser l’ordre.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Accès au site :</strong> cliquez sur le nom de la course.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Date d’ajout :</strong> survolez la course ou faites un appui long sur mobile pour voir la date exacte.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Ajout au carnet :</strong> le nom, la catégorie, la date et le lien sont repris automatiquement dans le formulaire.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Copier :</strong> copiez un nom près du titre de sa catégorie, ou toute la wishlist organisée par type via le bouton en bas de la modale.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Disciplines :</strong> en édition, filtrez via des onglets colorés et comptés (Route, Trail, Triathlon, Relai). Chaque course est une carte repliable aux couleurs de sa discipline.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Favoris :</strong> une étoile (★) distingue les favoris dans la liste de sélection.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                <span><strong>Depuis les courses publiques :</strong> « + Wishlist » importe le nom, la discipline, la date et le site dans votre wishlist.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <!-- Interactions -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-heart text-green-600"></i> Interactions Sociales
                    </h4>
                    <div class="bg-white border border-red-100 rounded-lg p-4 shadow-sm space-y-4">
                        <div>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                    <span><strong>Aimer :</strong> cliquez sur le cœur <i class="fas fa-heart text-red-500"></i> pour saluer une performance.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                    <span><strong>Voir les « J’aime » :</strong> cliquez sur le compteur pour voir qui a aimé la course.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
                                    <span><strong>Confidentialité :</strong> masquez le nombre de « J’aime » de vos courses dans les paramètres.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-globe text-green-600 mt-0.5"></i>
                                    <span><strong>Partage public :</strong> rendez chaque course visible par la communauté individuellement.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-eye text-blue-600 mt-0.5"></i>
                                    <span><strong>Découvrir :</strong> consultez les performances des autres coureurs sur la page d’accueil.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-layer-group text-green-600 mt-0.5"></i>
                                    <span><strong>Courses identiques :</strong> les courses de plusieurs membres sur la même épreuve sont regroupées en pile. Parcourez-les avec ‹ › ou la molette.</span>
                                </li>
                            </ul>
                        </div>

                        <hr class="border-red-50">

                        <!-- Compteur kilométrique collectif & Contribution -->
                        <div>
                            <h5 class="font-bold text-green-900 mb-2 flex items-center gap-2">
                                <i class="fas fa-globe-europe text-green-600"></i> Compteur Kilométrique Collectif
                            </h5>
                            <ul class="text-xs text-gray-600 ml-4 space-y-1.5">
                                <li>• <strong>Cumul global :</strong> total des kilomètres de la communauté, affiché sur la page d’accueil.</li>
                                <li>• <strong>Votre contribution :</strong> connecté, consultez votre part du total et vos kilomètres cumulés.</li>
                                <li>• <strong>Chargement :</strong> cache local pour un affichage instantané sans chargement supplémentaire.</li>
                            </ul>
                        </div>

                        <hr class="border-red-50">

                        <!-- Nouveau : Avis -->
                        <div>
                            <h5 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-star text-yellow-400"></i> Avis Communautaires
                            </h5>
                            <ul class="text-xs text-gray-600 ml-4 space-y-1.5">
                                <li>• <strong>Déposer :</strong> dans <i class="fas fa-cog"></i> <strong>Paramètres</strong>, donnez 1 à 5 étoiles et rédigez un message.</li>
                                <li>• <strong>Affichage :</strong> votre avis et votre photo de profil apparaissent dans le carrousel d’accueil.</li>
                                <li>• <strong>Gérer :</strong> modifiez, mettez en brouillon ou supprimez votre avis depuis les paramètres.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Paramètres -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-cog text-green-600"></i> Paramètres du Compte
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Ouvrez les paramètres avec <i class="fas fa-cog text-gray-600"></i> dans le bandeau de connexion, ou « Compte » sur mobile.</p>

                        <div class="space-y-3">
                            <!-- Profil -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-user-edit text-green-600"></i> Profil & Photo</p>
                                <ul class="text-[10px] text-gray-500 list-disc ml-4 space-y-1">
                                    <li><strong>Pseudo :</strong> modifiez votre nom public.</li>
                                    <li><strong>Photo de profil :</strong> importez une image (600 Ko max), stockée de façon sécurisée et affichée sur vos courses publiques.</li>
                                    <li><strong>Avatar :</strong> un avatar coloré basé sur votre pseudo est créé si vous n’ajoutez pas de photo.</li>
                                </ul>
                            </div>

                            <!-- Couleur de fond & Thème -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-palette text-green-600"></i> Couleur de fond & Thème</p>
                                <ul class="text-[10px] text-gray-500 list-disc ml-4 space-y-1">
                                    <li><strong>8 thèmes :</strong> Vert Émeraude (défaut), Bleu Océan, Indigo Nuit, Sarcelle Lagon, Ambre Chaud, Rose Boisé, Pourpre Royal et Ardoise Zinc.</li>
                                    <li><strong>Application immédiate :</strong> fond, boutons, bordures, badges et confettis adoptent la couleur choisie.</li>
                                    <li><strong>Synchronisation :</strong> thème sauvegardé automatiquement sur votre profil et repris sur vos appareils.</li>
                                </ul>
                            </div>

                            <!-- Confidentialité -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-user-secret text-green-600"></i> Confidentialité</p>
                                <p class="text-xs text-gray-600 mb-1">Choisissez les informations masquées sur vos courses publiques :</p>
                                <ul class="text-xs text-gray-600 list-disc ml-4 space-y-0.5">
                                    <li>Pseudo</li>
                                    <li>Ville de la course</li>
                                    <li>Statut favori</li>
                                    <li>Nombre de « J’aime »</li>
                                </ul>
                            </div>

                            <!-- Interface -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-sliders-h text-green-600"></i> Préférences d'interface</p>
                                <p class="text-xs text-gray-600 mb-1">Masquez les boutons inutilisés :</p>
                                <ul class="text-xs text-gray-600 list-disc ml-4 space-y-0.5">
                                    <li>Masquer le bouton "Wishlist"</li>
                                    <li>Masquer le bouton "Statistiques"</li>
                                    <li>Masquer le bouton "Badges"</li>
                                </ul>
                                <p class="text-[10px] text-gray-400 italic mt-1">Rien n’est masqué par défaut.</p>
                            </div>

                            <!-- Gestion des données -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-database text-green-600"></i> Gestion des données</p>
                                <p class="text-xs text-gray-600 mb-1">Importez ou exportez vos courses et votre wishlist :</p>
                                <ul class="text-xs text-gray-600 list-disc ml-4 space-y-0.5">
                                    <li><strong>Importer :</strong> restaurez une sauvegarde JSON.</li>
                                    <li><strong>Exporter :</strong> téléchargez une copie complète de vos courses et de votre wishlist.</li>
                                </ul>
                            </div>

                            <!-- Actions -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-tools text-green-600"></i> Actions & Aide</p>
                                <ul class="text-xs text-gray-600 space-y-1">
                                    <li class="flex items-center gap-2"><i class="fas fa-graduation-cap text-blue-500"></i> <strong>Tutoriel :</strong> relancez-le depuis le tableau de bord.</li>
                                    <li class="flex items-center gap-2"><i class="fas fa-key text-red-500"></i> <strong>Sécurité :</strong> réinitialisez votre mot de passe.</li>
                                    <li class="flex items-center gap-2"><i class="fas fa-user-times text-red-500"></i> <strong>Suppression du compte :</strong> effacez définitivement votre compte et vos données.</li>
                                </ul>
                            </div>
                        </div>
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
                                <span>Retrouvez vos exploits passés avec les rappels d'anniversaire</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <i class="fas fa-search text-blue-600 mt-0.5"></i>
                                <span>Retrouvez une course grâce à une donnée qui la concerne</span>
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
