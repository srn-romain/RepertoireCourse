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
                                    <div>• Classements (Général et Genre/Catégorie)</div>
                                    <div>• Lieu / Ville</div>
                                    <div>• Photo (JPG, PNG)</div>
                                    <div>• Image automatique (Web/Nom)</div>
                                    <div>• Fichier GPX</div>
                                    <div>• Notes personnelles avec éditeur</div>
                                    <div>• Statut favori</div>
                                    <div>• Partage public</div>
                                    <div>• Accompagnants</div>
                                    <div>• Lien site de la course</div>
                                    <div>• Lien résultats en ligne</div>
                                    <div>• Lien Google Drive en ligne</div>
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
                </section>

                <!-- Sélection Multiple et Actions en masse -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-emerald-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-tasks text-emerald-600"></i> Sélection Multiple & Actions en masse
                    </h4>
                    <div class="bg-white border border-emerald-100 rounded-lg p-5 shadow-sm space-y-4">
                        <p class="text-sm text-gray-700 leading-relaxed">
                            Vous pouvez sélectionner plusieurs courses simultanément sur le tableau de bord pour effectuer des actions groupées rapidement et en toute sécurité.
                        </p>

                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
                                <h5 class="font-bold text-emerald-800 text-sm mb-1.5 flex items-center gap-2">
                                    <i class="fas fa-hand-pointer text-emerald-600"></i> Activation & Sélection
                                </h5>
                                <ul class="text-xs text-gray-600 space-y-1.5">
                                    <li>• <strong>Clic prolongé :</strong> Maintenez le clic ou le doigt pendant ~500ms sur une carte pour la sélectionner et basculer en mode sélection.</li>
                                    <li>• <strong>Bouton "Sélectionner" :</strong> Cliquez sur le bouton d'outils dans la barre de filtres pour activer ou désactiver manuellement le mode.</li>
                                    <li>• <strong>Désélection automatique :</strong> Si vous décochez la dernière course sélectionnée (ou via "Tout désélec."), le mode se ferme automatiquement.</li>
                                </ul>
                            </div>

                            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                                <h5 class="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                                    <i class="fas fa-tools text-slate-600"></i> Actions en masse disponibles
                                </h5>
                                <ul class="text-xs text-gray-600 space-y-1.5">
                                    <li>• <strong>Exporter :</strong> Téléchargez un fichier JSON unique contenant les courses sélectionnées.</li>
                                    <li>• <strong>Note commune :</strong> Ajoutez une note concaténée à la fin des notes existantes de chaque course sélectionnée (avec un retour à la ligne automatique).</li>
                                    <li>• <strong>Favoris :</strong> Marquez ou démarquez en lot les courses sélectionnées comme favorites.</li>
                                    <li>• <strong>Suppression sécurisée :</strong> Supprimez les courses sélectionnées grâce à une modale de confirmation en 2 étapes.</li>
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
                            <p class="text-sm text-gray-600 mb-3">Personnalisez les raccourcis affichés en bas à gauche de chaque carte de course :</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-arrows-alt text-green-600 mt-0.5"></i>
                                    <span><strong>Interface intuitive :</strong> Utilisez le glisser-déposer (sur ordinateur) ou de simples clics (sur mobile) pour réorganiser vos boutons.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-layer-group text-green-600 mt-0.5"></i>
                                    <span><strong>Choix des boutons :</strong> Choisissez parmi Modifier, Supprimer, PDF, Site web, GPX, Drive, Résultats ou Export (téléchargement JSON d'une course individuelle). Par défaut, les boutons activés sont <strong>Modifier, Supprimer et PDF</strong>. Vous pouvez afficher jusqu'à 3 boutons par carte.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-eye text-green-600 mt-0.5"></i>
                                    <span><strong>Aperçu en temps réel :</strong> Visualisez immédiatement le résultat sur une carte d'exemple.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-image text-green-600 mt-0.5"></i>
                                    <span><strong>Image par défaut :</strong> Choisissez d'afficher la photo de la course ou le tracé GPX. Un repli intelligent s'applique si l'image choisie est absente.</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Tags des cartes -->
                        <div class="bg-white border border-purple-100 rounded-lg p-4 shadow-sm">
                            <h5 class="font-bold text-purple-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-tags text-purple-600"></i> Tags affichés sur les cartes
                            </h5>
                            <p class="text-xs text-gray-500 mb-2">Badges affichables sur chaque carte :</p>
                            <div class="flex flex-wrap gap-1.5 mb-3">
                                <span class="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-ruler-horizontal text-green-500"></i> Distance</span>
                                <span class="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-mountain text-orange-500"></i> Dénivelé</span>
                                <span class="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-map-marker-alt text-teal-500"></i> Lieu</span>
                                <span class="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-road text-indigo-500"></i> Terrain</span>
                                <span class="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-clock text-cyan-500"></i> Temps</span>
                                <span class="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-tachometer-alt text-violet-500"></i> Allure</span>
                                <span class="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-euro-sign text-red-500"></i> Prix</span>
                                <span class="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] font-medium px-1.5 py-0.5 rounded"><i class="fas fa-trophy text-yellow-500"></i> Classement</span>
                            </div>
                            <p class="text-[11px] text-gray-500 italic">Cochez ou décochez chaque tag dans la section <strong>Tags affichés</strong> du panneau de configuration pour personnaliser l'affichage de toutes vos cartes en un clic.</p>
                        </div>
                    </div>
                    <p class="text-[11px] text-blue-600 italic mt-3 flex items-center gap-2">
                        <i class="fas fa-lightbulb text-yellow-500"></i>
                        <span>Cliquez sur le bouton <strong><i class="fas fa-cog mr-1"></i> Configurer la carte</strong> en haut du tableau de bord pour accéder à toutes ces options.</span>
                    </p>
                </section>

                <!-- Google Drive -->
                <section class="mb-8">
                    <h4 class="text-xl font-bold text-green-700 mb-3 flex items-center gap-2">
                        <i class="fab fa-google-drive text-green-600"></i> Dossier Google Drive
                    </h4>
                    <div class="bg-white border border-green-100 rounded-lg p-4 shadow-sm">
                        <p class="text-sm text-gray-600 mb-3">Associez un dossier Google Drive à votre course pour centraliser vos documents (photos, certificats, factures) :</p>
                        <ul class="space-y-2 text-sm text-gray-600">
                            <li class="flex items-start gap-2">
                                <i class="fas fa-link text-green-600 mt-0.5"></i>
                                <span><strong>Configuration :</strong> Renseignez l'ID du dossier Drive dans le champ "ID Dossier Google Drive" lors de l'ajout ou la modification.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-folder-open text-green-600 mt-0.5"></i>
                                <span><strong>Explorateur intégré :</strong> Un bouton <span class="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs leading-none"><i class="fab fa-google-drive mr-1"></i>Dossier Drive</span> apparaît sur la fiche détail. Il ouvre un explorateur intégré pour naviguer dans vos fichiers.</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <i class="fas fa-th-large text-green-600 mt-0.5"></i>
                                <span><strong>Vues :</strong> Basculez entre la vue "Miniature" (par défaut) et la vue "Liste" via le bouton dédié dans l'explorateur.</span>
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
                        <p class="text-sm text-gray-600 mb-3">Dans la fiche détail d'une course, plusieurs boutons peuvent apparaître si les informations sont renseignées :</p>
                        <ul class="space-y-3 text-sm text-gray-600">
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-blue-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-external-link-alt mr-1.5"></i>Site</span>
                                <span><strong class="text-gray-800">Voir le site</strong> — lien officiel de l'événement.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-orange-500 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-trophy mr-1.5"></i>Résultats</span>
                                <span><strong class="text-gray-800">Voir les résultats</strong> — accès direct au classement en ligne.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-green-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-route mr-1.5"></i>GPX</span>
                                <span><strong class="text-gray-800">Voir le GPX</strong> — visualisation du tracé si disponible.</span>
                            </li>
                             <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-semibold shrink-0"><i class="fab fa-google-drive mr-1.5"></i>Drive</span>
                                <span><strong class="text-gray-800">Dossier Drive</strong> — accès à l'explorateur de fichiers intégré.</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-red-600 text-white rounded text-xs font-semibold shrink-0"><i class="fas fa-file-pdf mr-1.5"></i>PDF</span>
                                <span><strong class="text-gray-800">Export PDF</strong> — générez un rapport esthétique de vos performances (avec nom de fichier unique et horodaté).</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="inline-flex items-center justify-center w-24 py-1 bg-pink-100 border border-pink-200 text-pink-800 rounded text-xs font-semibold shrink-0"><i class="fas fa-file-export mr-1.5"></i>Export</span>
                                <span><strong class="text-gray-800">Exporter la course</strong> — téléchargez la sauvegarde JSON de cette course spécifique.</span>
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
                                    ajouter chaque segment avec son <strong>coureur</strong> (nom personnalisé ou option <strong>"Personne"</strong> pour ne pas comptabiliser les stats), sa <strong>distance</strong>, son <strong>D+</strong>, son <strong>D-</strong> et son <strong>temps</strong>.</li>
                                <li>• <strong>Attribution "Personne" :</strong> Permet de ne lier un relais à aucun participant. Ce relais s'affiche sous la mention <code>"-"</code> et ses données (km, dénivelé, temps) ne sont imputées à personne.</li>
                                <li>• <strong>Calculs Automatiques :</strong> Les totaux de distance et de dénivelé sont recalculés en temps réel selon les segments saisis.</li>
                                <li>• <strong>Commentaires de relais :</strong> Saisissez des remarques/commentaires pour chaque segment du relais. Dans les PDF, ils s'affichent sous forme de blocs dédiés, centrés et bien alignés.</li>
                                <li>• <strong>Export PDF ciblé & unique :</strong> Téléchargez uniquement le tableau détaillé de vos relais grâce à un bouton d'export dédié. Le PDF généré possède un nom de fichier unique à la seconde près et centre le dernier coéquipier si le nombre de participants est impair.</li>
                                <li>• <strong>Horaires ergonomiques :</strong> Si l'heure de départ de la course est renseignée et que tous les segments ont un temps valide, cliquez sur n'importe quelle ligne de segment pour déplier les horaires associés (Départ / Arrivée) de façon centrée sans défilement horizontal.</li>
                                <li>• <strong>Dénivelé unifié & compact :</strong> Les dénivelés D+ et D- sont combinés sur une seule ligne (ex: '↑500m ↓200m' ou seulement '↑500m' si D- est nul) pour éviter les retours à la ligne disgracieux. Les PDF utilisent le format simplifié '+' / '-'.</li>
                                <li>• <strong>Détail des relais effectués :</strong> Le numéro des relais courus par chaque coéquipier est affiché à côté de son total de relais, par exemple : <code>2 relais effectués (1, 3)</code>.</li>
                                <li>• <strong>Pseudo connecté :</strong> Vos propres relais affichent automatiquement votre pseudo dynamique d'utilisateur (ou du propriétaire du carnet) au lieu de la mention standard « Moi ».</li>
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
                                <div>📈 Courbe d'évolution vitesse & allure</div>
                                <div>🤖 Prédiction IA de vos prochaines performances</div>
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
                        <p class="text-xs text-gray-500 italic">Note : Cliquez sur la modale 'Badge' pour voir votre 
                        collection.</p>
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
                        <p class="text-[11px] text-blue-600 italic mt-3 flex items-center gap-2">
                            <i class="fas fa-lightbulb text-yellow-500"></i>
                            <span><strong>Recherche Intelligente :</strong> La barre de recherche principale ne se
                             limite pas aux noms. Elle scanne instantanément toutes les données de vos courses
                              (lieux, notes, accompagnants, etc.) pour vous offrir un résultat immédiat.</span>
                        </p>
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
                    <div class="bg-white border border-red-100 rounded-lg p-4 shadow-sm space-y-4">
                        <div>
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
                                            J'aime</strong> sur VOS courses dans les paramètres de compte.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-globe text-green-600 mt-0.5"></i>
                                    <span><strong>Partage public :</strong> Activez le partage pour chaque course individuellement pour qu'elle soit visible par la communauté.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-eye text-blue-600 mt-0.5"></i>
                                    <span><strong>Découvrir :</strong> Consultez les performances des autres coureurs sur la page d'accueil de l'application.</span>
                                </li>
                            </ul>
                        </div>

                        <hr class="border-red-50">

                        <!-- Nouveau : Avis -->
                        <div>
                            <h5 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <i class="fas fa-star text-yellow-400"></i> Avis Communautaires
                            </h5>
                            <p class="text-sm text-gray-600 mb-2">Partagez votre expérience sur l'application :</p>
                            <ul class="text-xs text-gray-600 ml-4 space-y-1.5">
                                <li>• <strong>Comment faire :</strong> Allez dans vos <i class="fas fa-cog"></i> <strong>Paramètres</strong> pour laisser une note (1 à 5 étoiles) et un message.</li>
                                <li>• <strong>Visibilité :</strong> Votre avis s'affiche dans le carrousel sur la page d'accueil avec votre photo de profil.</li>
                                <li>• <strong>Gestion :</strong> Vous pouvez modifier, mettre en brouillon ou supprimer votre avis à tout moment depuis vos paramètres.</li>
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
                                    <li>Afficher/Masquer le bouton "Wishlist"</li>
                                    <li>Afficher/Masquer le bouton "Statistiques"</li>
                                    <li>Afficher/Masquer le bouton "Badges"</li>
                                </ul>
                                <p class="text-[10px] text-gray-400 italic mt-1">Par défaut, tous les boutons sont activés.</p>
                            </div>

                            <!-- Gestion des données -->
                            <div class="bg-gray-50 p-3 rounded border border-gray-100">
                                <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2"><i
                                        class="fas fa-database text-green-600"></i> Gestion des données</p>
                                <p class="text-xs text-gray-600 mb-1">Importez ou exportez vos courses et votre wishlist directement depuis vos paramètres :</p>
                                <ul class="text-xs text-gray-600 list-disc ml-4 space-y-0.5">
                                    <li><strong>Importer :</strong> Restaurez vos données depuis un fichier JSON de sauvegarde.</li>
                                    <li><strong>Exporter :</strong> Téléchargez une copie complète de vos données (courses + wishlist).</li>
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
