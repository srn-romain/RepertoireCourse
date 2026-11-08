/**
 * js/user-settings.js
 * Gère la modale de paramètres utilisateur (changement pseudo, reset mot de passe)
 * Doit être inclus après firebase-config.js et auth.js
 */

const userSettingsModalHTML = `
<div id="userSettingsModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-8 w-full max-w-lg m-4 rounded-2xl shadow-2xl relative transform scale-100 transition-transform duration-300 max-h-[90vh] overflow-y-auto">
        <button onclick="closeSettingsModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
        </button>

        <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-1">Paramètres du compte</h2>
            <p class="text-sm text-gray-500" id="settingsUserEmail"></p>
            
            <!-- Photo de profil -->
            <div class="mt-4 flex flex-col items-center">
                <div class="relative group">
                    <div id="profileImageContainer" class="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img id="settingsProfilePic" src="https://ui-avatars.com/api/?name=User&background=random" onclick="if(this.src && !this.src.includes('ui-avatars.com')) zoomImage(this.src)" class="w-full h-full object-cover cursor-zoom-in">
                        <div id="profilePicLoading" class="hidden absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white">
                            <i class="fas fa-spinner fa-spin text-2xl"></i>
                        </div>
                    </div>
                    <button id="btnEditProfilePic" class="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110">
                        <i class="fas fa-camera text-sm"></i>
                    </button>
                    <input type="file" id="inputProfilePic" class="hidden" accept="image/*">
                </div>
                <button id="btnDeleteProfilePic" class="hidden mt-2 text-xs text-red-500 hover:text-red-700 font-medium transition">
                    <i class="fas fa-trash-alt mr-1"></i> Supprimer la photo
                </button>
            </div>

            <!-- Notice pour les invités -->
            <div id="inviteNotice" class="hidden mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                <p class="text-sm text-blue-800">
                    <i class="fas fa-info-circle mr-2"></i>
                    En mode invité, les options de modification sont limitées. Seule la réinitialisation du mot de passe est disponible.
                </p>
            </div>
        </div>

        <div class="space-y-6">
            <!-- Changer le Pseudo -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Modifier le pseudo</label>
                <form id="updatePseudoForm" class="flex gap-2">
                    <input type="text" id="settingsNewPseudo" required 
                        class="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-800"
                        placeholder="Nouveau pseudo">
                    <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-md">
                        <i class="fas fa-save"></i>
                    </button>
                </form>
                <!-- Zone de message spécifique au pseudo -->
                <div id="pseudoMessageContainer" class="hidden mt-2 text-sm"></div>
            </div>

            <hr class="border-gray-100">

            <!-- Couleur de fond & Thème -->
            <div>
                <div class="flex items-center justify-between mb-1.5">
                    <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <i class="fas fa-palette text-green-600"></i>
                        <span>Couleur de fond</span>
                    </h3>
                    <span id="activeThemeBadge" class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-800 border border-green-200 transition-all">
                        Vert Émeraude
                    </span>
                </div>
                <p class="text-xs text-gray-500 mb-3">Sélectionnez une ambiance sobre pour adapter le fond, les boutons, les labels et les confettis.</p>
                
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <button type="button" onclick="window.selectUserTheme('green')" data-theme="green" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #16a34a;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Vert</span>
                            <span class="block text-[10px] text-gray-400 truncate">Émeraude</span>
                        </div>
                    </button>

                    <button type="button" onclick="window.selectUserTheme('blue')" data-theme="blue" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #2563eb;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Bleu</span>
                            <span class="block text-[10px] text-gray-400 truncate">Océan</span>
                        </div>
                    </button>

                    <button type="button" onclick="window.selectUserTheme('indigo')" data-theme="indigo" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #4f46e5;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Indigo</span>
                            <span class="block text-[10px] text-gray-400 truncate">Nuit</span>
                        </div>
                    </button>

                    <button type="button" onclick="window.selectUserTheme('teal')" data-theme="teal" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #0d9488;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Sarcelle</span>
                            <span class="block text-[10px] text-gray-400 truncate">Lagon</span>
                        </div>
                    </button>

                    <button type="button" onclick="window.selectUserTheme('amber')" data-theme="amber" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #d97706;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Ambre</span>
                            <span class="block text-[10px] text-gray-400 truncate">Chaud</span>
                        </div>
                    </button>

                    <button type="button" onclick="window.selectUserTheme('rose')" data-theme="rose" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #e11d48;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Rose</span>
                            <span class="block text-[10px] text-gray-400 truncate">Boisé</span>
                        </div>
                    </button>

                    <button type="button" onclick="window.selectUserTheme('purple')" data-theme="purple" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #9333ea;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Pourpre</span>
                            <span class="block text-[10px] text-gray-400 truncate">Royal</span>
                        </div>
                    </button>

                    <button type="button" onclick="window.selectUserTheme('slate')" data-theme="slate" class="theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group">
                        <span class="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center text-[10px] text-white" style="background-color: #475569;">
                            <i class="fas fa-check opacity-0 theme-check"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-xs font-semibold text-gray-800 truncate">Ardoise</span>
                            <span class="block text-[10px] text-gray-400 truncate">Zinc</span>
                        </div>
                    </button>
                </div>
            </div>

            <hr class="border-gray-100">

            <!-- Confidentialité et visibilité du carnet -->
            <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i class="fas fa-user-shield text-green-600"></i>
                    <span>Visibilité du carnet & Confidentialité</span>
                </h3>

                <div class="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    
                    <!-- Sélecteur de niveau de visibilité -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-gray-600">Niveau de visibilité :</span>
                            <span id="privacyLevelBadge" class="text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 transition-all bg-green-100 text-green-800 border border-green-200">
                                <i class="fas fa-file-lines text-green-600"></i> Fiche complète
                            </span>
                        </div>

                        <!-- 3 Boutons segmentés directs -->
                        <div class="grid grid-cols-3 gap-1 bg-gray-200/70 p-1 rounded-lg">
                            <button type="button" id="btnPrivacyLvl0" onclick="window.setPrivacyLevel(0)"
                                class="privacy-lvl-btn py-2 px-2 rounded-md text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-gray-600 hover:text-gray-900 cursor-pointer">
                                <i class="fas fa-lock text-sm text-red-500"></i>
                                <span>Privé</span>
                            </button>
                            <button type="button" id="btnPrivacyLvl1" onclick="window.setPrivacyLevel(1)"
                                class="privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-gray-600 hover:text-gray-900 cursor-pointer">
                                <i class="fas fa-eye text-sm text-blue-500"></i>
                                <span>Aperçu</span>
                            </button>
                            <button type="button" id="btnPrivacyLvl2" onclick="window.setPrivacyLevel(2)"
                                class="privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all bg-white text-green-800 shadow-sm border border-green-200 cursor-pointer">
                                <i class="fas fa-file-lines text-sm text-green-600"></i>
                                <span>Fiche</span>
                            </button>
                        </div>

                        <input type="hidden" id="privacyLevelInput" value="2">

                        <!-- Explication dynamique -->
                        <div id="privacyLevelDescription" class="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 mt-2.5 leading-relaxed flex items-start gap-2">
                            <div id="privacyLevelDescriptionText">
                                <strong>Fiche détaillée publique :</strong> Vos courses sont publiques et les visiteurs peuvent ouvrir la fiche complète.
                            </div>
                        </div>
                    </div>

                    <!-- Options Niveau 1 & 2 : Informations de base sur l'accueil -->
                    <div id="privacyBasicOptions" class="pt-3 border-t border-gray-200 space-y-3">
                        <p class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Masquage sur l'accueil :</p>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHidePseudo" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mon pseudo</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideCity" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer la ville de la course</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideFavorite" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer le statut "Favori"</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideLikeCount" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer le nombre de J'aime (pour les visiteurs)</span>
                        </label>
                    </div>

                    <!-- Options Niveau 2 : Masquage spécifique dans la fiche détaillée -->
                    <div id="privacyDetailOptions" class="pt-3 border-t border-gray-200 space-y-3">
                        <p class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Masquage dans la fiche détaillée :</p>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideNotes" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mes notes personnelles</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideRanking" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mes classements</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideStats" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer les stats calculées (allure, vitesse, D+/km)</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHidePhotos" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mes photos</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHidePrice" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer le prix d'inscription</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideBib" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer le numéro de dossard</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" id="prefHideCompanions" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                            <span class="ml-2 text-sm text-gray-700">Masquer mes accompagnants</span>
                        </label>

                        <!-- Libellé de recommandation si tout est masqué -->
                        <div id="privacyAllHiddenHint" class="hidden mt-2 p-3 bg-blue-50/90 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed flex items-start gap-2.5 transition-all shadow-xs">
                            <i class="fas fa-lightbulb text-amber-500 mt-0.5 text-sm shrink-0"></i>
                            <div class="space-y-1">
                                <p><strong>Conseil :</strong> Vous avez masqué la totalité des éléments de la fiche détaillée. Pour une consultation plus directe et épurée de vos courses, nous vous conseillons de basculer en mode <strong>« Aperçu simple »</strong>.</p>
                                <button type="button" onclick="window.setPrivacyLevel(1)" class="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer mt-1">
                                    <span>Basculer vers l'Aperçu simple</span>
                                    <i class="fas fa-arrow-right text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-gray-200 mt-2">
                        <p id="privacyAutoSaveStatus" class="text-xs text-green-600 font-medium flex items-center"><i class="fas fa-check-circle mr-1"></i>Modifications enregistrées automatiquement.</p>
                    </div>
                </div>
            </div>

            <hr class="border-gray-100">

            <!-- Préférences d'interface -->
            <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Préférences d'interface</h3>
                <div class="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefHideWishlistBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Masquer le bouton "Wishlist"</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefHideStatsBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Masquer le bouton "Statistiques"</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefHideBadgesBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Masquer le bouton "Badges"</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefHideFriendsBtn" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Masquer le bouton « Amis »</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="prefCompactDashboardStats" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm text-gray-700">Afficher les stat. du tableau de bord en compact</span>
                    </label>
                    <div class="pt-2 border-t border-gray-200 mt-2">
                        <p id="uiAutoSaveStatus" class="text-xs text-green-600 font-medium flex items-center"><i class="fas fa-check-circle mr-1"></i>Modifications enregistrées automatiquement.</p>
                    </div>
                </div>
                <div class="flex flex-col gap-1 mt-2">
                     <p class="text-xs text-gray-400 italic">Ces réglages contrôlent l'affichage du tableau de bord.</p>
                </div>
            </div>

            <hr class="border-gray-100">

            <!-- Gestion des données -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Gestion des données</label>
                <div class="grid grid-cols-2 gap-3">
                    <button id="btnSettingsExport" class="py-2.5 px-3 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow">
                        <i class="fas fa-download"></i>
                        Exporter
                    </button>
                    <button id="btnSettingsImport" class="py-2.5 px-3 border border-teal-200 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow">
                        <i class="fas fa-upload"></i>
                        Importer
                    </button>
                </div>
                <p class="text-xs text-gray-400 italic mt-2"> Exportez ou importez vos courses et wishlist au format JSON.</p>
            </div>

            <hr class="border-gray-100">

            <!-- Actions rapides -->
            <div id="userSettingsActions">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
                <div class="space-y-2">
                    <div class="relative group">
                        <button id="btnShowTutorial" class="w-full py-1.5 px-3 border border-green-200 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-50">
                            <i class="fas fa-graduation-cap"></i>
                            Voir le tutoriel
                        </button>
                        <div id="tutorialDisabledTooltip" class="hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                            Veuillez recharger la page pour lancer le tutoriel
                            <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </div>
                    <button id="btnSendPasswordReset" class="w-full py-1.5 px-3 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm">
                        <i class="fas fa-key"></i>
                        Réinitialiser le mot de passe
                    </button>
                </div>
            </div>
            
            <!-- Zone de message -->
            <div id="settingsMessageContainer" class="hidden p-3 rounded-lg text-sm text-center"></div>
            
            <div class="mt-6 border-t border-red-100 pt-4">
                <h3 class="text-sm font-semibold text-red-800 mb-2">Zone Danger</h3>
                <button id="btnInitDeleteAccount" class="w-full py-1.5 px-3 border border-red-300 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2 text-sm">
                    <i class="fas fa-trash-alt"></i>
                    Supprimer mon compte
                </button>
            </div>
        </div>
    </div>
</div>

<!-- WARNING MODAL -->
<div id="deleteAccountWarningModal" class="modal hidden fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-6 w-full max-w-md m-4 rounded-xl shadow-2xl border border-red-200">
        <div class="text-center mb-6">
             <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                <i class="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Attention !</h3>
            <p class="text-gray-600">Vous allez perdre toutes vos données enregistrées (compte et wishlist).</p>
        </div>
        <div class="flex gap-3 justify-center">
             <button onclick="closeModal('deleteAccountWarningModal')" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">Annuler</button>
             <button id="btnConfirmDeleteWarning" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-bold">Confirmer</button>
        </div>
    </div>
</div>

<!-- ULTIMATUM MODAL -->
<div id="deleteAccountUltimatumModal" class="modal hidden fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
    <div class="modal-content bg-white p-6 w-full max-w-lg m-4 rounded-xl shadow-2xl border-2 border-red-500 relative">
        <button onclick="closeModal('deleteAccountUltimatumModal')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
        </button>
        <div class="text-center mb-6">
             <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                <i class="fas fa-heart-broken text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-red-700 mb-4">Voulez-vous vraiment supprimer ?</h3>
            
            <p class="text-gray-700 mb-2 font-medium">Cette action est définitive et irréversible.</p>
            <p class="text-gray-500 mb-6 text-sm">Nous sommes tristes de vous voir partir...</p>

            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 mx-auto max-w-sm">
                <p class="text-blue-800 text-sm">
                    Avez-vous pensé à sauvegarder vos données ?<br>
                    Vous pouvez le faire via le bouton <i class="fas fa-download mx-1"></i> présent en haut à gauche de votre tableau de bord.
                </p>
            </div>
        </div>
        
        <!-- Zone de message d'erreur/succès pour suppression -->
        <div id="deleteAccountErrorContainer" class="hidden p-3 mb-4 rounded-lg text-sm text-center"></div>

        <div class="flex flex-col gap-3">
             <button id="btnFinalDeleteAccount" class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-bold shadow-lg hover:shadow-xl transform active:scale-95">
                OUI, Supprimer mon compte définitivement
             </button>
             <button onclick="closeModal('deleteAccountUltimatumModal')" class="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-semibold">
                Non, je reste !
             </button>
        </div>
    </div>
</div>
`;

window.settingsHasChanged = false;

document.addEventListener('DOMContentLoaded', () => {
    // Injecter la modale si elle n'existe pas
    if (!document.getElementById('userSettingsModal')) {
        const div = document.createElement('div');
        div.innerHTML = userSettingsModalHTML;
        document.body.appendChild(div);
    }

    // Empêcher la fermeture au clic extérieur pour la modale de paramètres
    const modal = document.getElementById('userSettingsModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            // Si on clique sur le backdrop (modal lui-même), ne rien faire
            if (e.target === modal) {
                e.stopPropagation();
                e.preventDefault();
                // Ne pas fermer la modale
                return false;
            }
        });

        // Empêcher la propagation des clics sur le contenu de la modale
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    // Attendre que l'auth soit prête avant d'initialiser les paramètres
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // Petit délai pour laisser le dashboard réparer le profil si nécessaire
            await new Promise(resolve => setTimeout(resolve, 500));
            initSettingsLogic();
        }
    });
});

// Fonction spécifique de fermeture pour gérer le reload et le flush des sauvegardes
window.closeSettingsModal = async function () {
    // Si des modifications étaient en attente dans le debounce, les persister immédiatement
    if (typeof window._flushPendingSettingsSave === 'function') {
        await window._flushPendingSettingsSave();
    }

    const modal = document.getElementById('userSettingsModal');
    if (modal) modal.classList.add('hidden');
    // Aussi fermer les sous-modales si ouvertes
    closeModal('deleteAccountWarningModal');
    closeModal('deleteAccountUltimatumModal');

    document.body.classList.remove('overflow-hidden'); // Unfreeze background

    if (window.settingsHasChanged) {
        window.settingsHasChanged = false;
        if (typeof loadPublicRaces === 'function') {
            loadPublicRaces();
        } else {
            window.location.reload();
        }
    }
};

window.addEventListener('beforeunload', () => {
    if (typeof window._flushPendingSettingsSave === 'function') {
        window._flushPendingSettingsSave();
    }
});

// Helper global closeModal (si modal-auth absent) - On le garde pour compatibilité générique
if (typeof window.closeModal === 'undefined') {
    window.closeModal = function (modalId) {
        if (modalId) {
            const el = document.getElementById(modalId);
            if (el) el.classList.add('hidden');
        } else {
            window.closeSettingsModal();
        }
    };
}

if (typeof window.openModal === 'undefined') {
    window.openModal = function (modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.remove('hidden');
    };
}

async function initSettingsLogic() {
    const pseudoForm = document.getElementById('updatePseudoForm');
    const resetBtn = document.getElementById('btnSendPasswordReset');
    const msgContainer = document.getElementById('settingsMessageContainer');

    // Contrôles Privacy & Niveau de visibilité
    const privacyLevelInput = document.getElementById('privacyLevelInput');
    const prefHidePseudo = document.getElementById('prefHidePseudo');
    const prefHideCity = document.getElementById('prefHideCity');
    const prefHideFavorite = document.getElementById('prefHideFavorite');
    const prefHideLikeCount = document.getElementById('prefHideLikeCount');
    const prefShowPseudoInLeaderboard = document.getElementById('prefShowPseudoInLeaderboard');

    // Nouveaux masquages spécifiques Fiche détaillée (Niveau 2)
    const prefHideNotes = document.getElementById('prefHideNotes');
    const prefHideRanking = document.getElementById('prefHideRanking');
    const prefHideStats = document.getElementById('prefHideStats');
    const prefHidePhotos = document.getElementById('prefHidePhotos');
    const prefHidePrice = document.getElementById('prefHidePrice');
    const prefHideBib = document.getElementById('prefHideBib');
    const prefHideCompanions = document.getElementById('prefHideCompanions');

    // Checkboxes UI preferences
    const prefHideStatsBtn = document.getElementById('prefHideStatsBtn');
    const prefHideBadgesBtn = document.getElementById('prefHideBadgesBtn');
    const prefHideWishlistBtn = document.getElementById('prefHideWishlistBtn');
    const prefHideFriendsBtn = document.getElementById('prefHideFriendsBtn');
    const prefCompactDashboardStats = document.getElementById('prefCompactDashboardStats');

    let currentSelectedPrivacyLevel = 2;

    // Gestion du sélecteur de couleur / thème
    function updateThemeSelectorUI(activeThemeKey) {
        const key = activeThemeKey || window.currentThemeColor || localStorage.getItem('userThemeColor') || 'green';
        const badge = document.getElementById('activeThemeBadge');
        const palettes = window.THEME_PALETTES || {};
        const palette = palettes[key] || palettes.green;

        if (badge && palette) {
            badge.textContent = palette.name;
        }

        const buttons = document.querySelectorAll('.theme-select-btn');
        buttons.forEach(btn => {
            const btnTheme = btn.getAttribute('data-theme');
            const check = btn.querySelector('.theme-check');
            if (btnTheme === key) {
                btn.className = "theme-select-btn p-2 rounded-lg border-2 border-green-600 ring-2 ring-green-500/20 bg-green-50/50 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group";
                if (check) check.classList.remove('opacity-0');
            } else {
                btn.className = "theme-select-btn p-2 rounded-lg border-2 border-transparent bg-white hover:border-gray-300 transition-all flex items-center gap-2 shadow-xs cursor-pointer text-left group";
                if (check) check.classList.add('opacity-0');
            }
        });
    }

    window.updateThemeSelectorUI = updateThemeSelectorUI;

    window.selectUserTheme = function (themeKey) {
        if (typeof window.applyThemeColor === 'function') {
            window.applyThemeColor(themeKey, true);
        }
        updateThemeSelectorUI(themeKey);
    };

    window.addEventListener('themeChanged', (e) => {
        if (e.detail && e.detail.themeKey) {
            updateThemeSelectorUI(e.detail.themeKey);
        }
    });

    // Mise à jour de l'affichage UI selon le niveau de confidentialité
    function updatePrivacyUI(level) {
        const lvl = parseInt(level) || 0;
        currentSelectedPrivacyLevel = lvl;

        const input = document.getElementById('privacyLevelInput');
        if (input) input.value = lvl;

        const badge = document.getElementById('privacyLevelBadge');
        const descText = document.getElementById('privacyLevelDescriptionText');
        const descBox = document.getElementById('privacyLevelDescription');
        const basicOpts = document.getElementById('privacyBasicOptions');
        const detailOpts = document.getElementById('privacyDetailOptions');

        // Boutons segmentés de niveau
        const btn0 = document.getElementById('btnPrivacyLvl0');
        const btn1 = document.getElementById('btnPrivacyLvl1');
        const btn2 = document.getElementById('btnPrivacyLvl2');

        const inactiveBase = "privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 cursor-pointer";
        const activeBase = "privacy-lvl-btn py-2 px-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all bg-white shadow-sm border cursor-pointer";

        if (btn0) btn0.className = lvl === 0 ? `${activeBase} text-red-700 border-red-200` : inactiveBase;
        if (btn1) btn1.className = lvl === 1 ? `${activeBase} text-blue-700 border-blue-200` : inactiveBase;
        if (btn2) btn2.className = lvl === 2 ? `${activeBase} text-green-800 border-green-200` : inactiveBase;

        if (lvl === 0) {
            if (badge) {
                badge.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200";
                badge.innerHTML = `<i class="fas fa-lock text-red-500"></i> 100% Privé`;
            }
            if (descBox) descBox.className = "text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-red-200 mt-2.5 leading-relaxed flex items-start gap-2";
            if (descText) {
                descText.innerHTML = `<strong>Totalement privé :</strong> Vos courses sont invisibles sur la page d'accueil communautaire. Vous seul pouvez les consulter dans votre carnet.`;
            }
            if (basicOpts) basicOpts.classList.add('hidden');
            if (detailOpts) detailOpts.classList.add('hidden');
        } else if (lvl === 1) {
            if (badge) {
                badge.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 bg-blue-100 text-blue-700 border border-blue-200";
                badge.innerHTML = `<i class="fas fa-eye text-blue-500"></i> Aperçu simple`;
            }
            if (descBox) descBox.className = "text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-blue-200 mt-2.5 leading-relaxed flex items-start gap-2";
            if (descText) {
                descText.innerHTML = `<strong>Aperçu public :</strong> Vos courses apparaissent sur l'accueil avec les données de base (date, distance, terrain). Les visiteurs n'ont pas accès à la fiche détaillée (au clic sur le nom, ils sont redirigés vers le site officiel s'il est renseigné).`;
            }
            if (basicOpts) basicOpts.classList.remove('hidden');
            if (detailOpts) detailOpts.classList.add('hidden');
        } else {
            if (badge) {
                badge.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 bg-green-100 text-green-800 border border-green-200";
                badge.innerHTML = `<i class="fas fa-file-lines text-green-600"></i> Fiche complète`;
            }
            if (descBox) descBox.className = "text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-green-200 mt-2.5 leading-relaxed flex items-start gap-2";
            if (descText) {
                descText.innerHTML = `<strong>Fiche détaillée publique :</strong> Vos courses sont publiques et les visiteurs peuvent ouvrir la fiche complète. Vous pouvez choisir ci-dessous les éléments à masquer.`;
            }
            if (basicOpts) basicOpts.classList.remove('hidden');
            if (detailOpts) detailOpts.classList.remove('hidden');
        }

        checkAllDetailsHiddenSuggestion();
    }

    function checkAllDetailsHiddenSuggestion() {
        const hintEl = document.getElementById('privacyAllHiddenHint');
        if (!hintEl) return;

        if (currentSelectedPrivacyLevel !== 2) {
            hintEl.classList.add('hidden');
            return;
        }

        const detailCheckboxes = [
            prefHideNotes, prefHideRanking, prefHideStats, prefHidePhotos, prefHidePrice, prefHideBib, prefHideCompanions
        ];

        const allChecked = detailCheckboxes.length > 0 && detailCheckboxes.every(cb => cb && cb.checked);
        if (allChecked) {
            hintEl.classList.remove('hidden');
        } else {
            hintEl.classList.add('hidden');
        }
    }

    window.setPrivacyLevel = function (lvl) {
        if (isInvite) return;
        updatePrivacyUI(lvl);
        savePrivacySettings();
    };

    // Vérifier si l'utilisateur est invité
    let isInvite = false;
    if (typeof window.isInviteUser === 'function') {
        isInvite = await window.isInviteUser();
    } else {
        // Fallback si isInvite.js n'est pas encore chargé
        console.warn('window.isInviteUser not available');
    }

    // Désactiver les contrôles pour les invités (sauf le bouton reset password)
    if (isInvite) {
        // Désactiver le formulaire pseudo
        const pseudoInput = document.getElementById('settingsNewPseudo');
        const pseudoSubmitBtn = pseudoForm?.querySelector('button[type="submit"]');
        if (pseudoInput) {
            pseudoInput.disabled = true;
            pseudoInput.classList.add('opacity-50', 'cursor-not-allowed');
        }
        if (pseudoSubmitBtn) {
            pseudoSubmitBtn.disabled = true;
            pseudoSubmitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Désactiver les boutons de niveau de confidentialité et toutes les checkboxes
        ['btnPrivacyLvl0', 'btnPrivacyLvl1', 'btnPrivacyLvl2'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        [
            prefHidePseudo, prefHideCity, prefHideFavorite, prefHideLikeCount, prefShowPseudoInLeaderboard,
            prefHideNotes, prefHideRanking, prefHideStats, prefHidePhotos, prefHidePrice, prefHideBib, prefHideCompanions
        ].forEach(cb => {
            if (cb) {
                cb.disabled = true;
                cb.classList.add('opacity-50', 'cursor-not-allowed');
                const label = cb.closest('label');
                if (label) label.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Désactiver toutes les checkboxes de préférences UI
        [prefHideStatsBtn, prefHideBadgesBtn, prefHideWishlistBtn].forEach(cb => {
            if (cb) {
                cb.disabled = true;
                cb.classList.add('opacity-50', 'cursor-not-allowed');
                const label = cb.closest('label');
                if (label) label.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Désactiver les boutons import/export pour les invités
        const btnSettingsImport = document.getElementById('btnSettingsImport');
        const btnSettingsExport = document.getElementById('btnSettingsExport');
        if (btnSettingsImport) {
            btnSettingsImport.disabled = true;
            btnSettingsImport.classList.add('opacity-50', 'cursor-not-allowed');
        }
        if (btnSettingsExport) {
            btnSettingsExport.disabled = true;
            btnSettingsExport.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Désactiver le bouton de suppression de compte
        const deleteAccountBtn = document.getElementById('btnInitDeleteAccount');
        if (deleteAccountBtn) {
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Désactiver la photo de profil pour les invités
        const btnEditProfilePic = document.getElementById('btnEditProfilePic');
        if (btnEditProfilePic) {
            btnEditProfilePic.disabled = true;
            btnEditProfilePic.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        }
    }

    // Gestion de la Photo de profil
    const btnEditProfilePic = document.getElementById('btnEditProfilePic');
    const inputProfilePic = document.getElementById('inputProfilePic');
    const btnDeleteProfilePic = document.getElementById('btnDeleteProfilePic');
    const profilePicImg = document.getElementById('settingsProfilePic');
    const profilePicLoading = document.getElementById('profilePicLoading');

    if (btnEditProfilePic && inputProfilePic && !isInvite) {
        btnEditProfilePic.addEventListener('click', () => inputProfilePic.click());

        inputProfilePic.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validation taille (Firestore limit is 1MB total per doc, so 600KB max for image in base64 is safer)
            if (file.size > 600 * 1024) {
                showMessage("L'image est trop volumineuse pour le stockage direct (max 600 Ko).", "error");
                return;
            }

            const user = firebase.auth().currentUser;
            if (!user) return;

            try {
                profilePicLoading.classList.remove('hidden');
                btnEditProfilePic.disabled = true;

                // Lecture du fichier en Base64
                const reader = new FileReader();
                const base64Promise = new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(file);
                const base64String = await base64Promise;

                // Mettre à jour Firestore
                await db.collection('users').doc(user.uid).update({
                    photoURL: base64String
                });

                // Mettre à jour l'UI
                profilePicImg.src = base64String;
                window.currentUserPhoto = base64String;
                localStorage.setItem('userCustomPhoto', base64String);
                if (btnDeleteProfilePic) btnDeleteProfilePic.classList.remove('hidden');
                settingsHasChanged = true;

                showMessage("Photo de profil mise à jour !", "success");
            } catch (error) {
                console.error("Erreur traitement photo:", error);
                showMessage("Erreur lors de l'enregistrement de la photo.", "error");
            } finally {
                profilePicLoading.classList.add('hidden');
                btnEditProfilePic.disabled = false;
            }
        });
    }

    if (btnDeleteProfilePic && !isInvite) {
        btnDeleteProfilePic.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user) return;

            if (!confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) {
                return;
            }

            try {
                profilePicLoading.classList.remove('hidden');

                // Mettre à jour Firestore
                await db.collection('users').doc(user.uid).update({
                    photoURL: firebase.firestore.FieldValue.delete()
                });

                // Mettre à jour l'UI
                const userDoc = await db.collection('users').doc(user.uid).get();
                const currentPseudo = userDoc.exists ? (userDoc.data().pseudo || "User") : "User";
                profilePicImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPseudo)}&background=random`;
                window.currentUserPhoto = null;
                localStorage.removeItem('userCustomPhoto');
                btnDeleteProfilePic.classList.add('hidden');
                settingsHasChanged = true;

                showMessage("Photo supprimée avec succès.", "success");
            } catch (error) {
                console.error("Erreur suppression photo:", error);
                showMessage("Erreur lors de la suppression.", "error");
            } finally {
                profilePicLoading.classList.add('hidden');
            }
        });
    }

    // Helper pour mettre à jour le statut visuel d'auto-save
    function updateAutoSaveStatus(type, status) {
        const el = document.getElementById(type === 'privacy' ? 'privacyAutoSaveStatus' : 'uiAutoSaveStatus');
        if (!el) return;
        if (status === 'saving') {
            el.className = "text-xs text-amber-600 font-medium flex items-center";
            el.innerHTML = `<i class="fas fa-arrows-rotate fa-spin mr-1 text-amber-500"></i>Enregistrement en cours...`;
        } else if (status === 'success') {
            el.className = "text-xs text-green-600 font-medium flex items-center";
            el.innerHTML = `<i class="fas fa-check-circle mr-1"></i>Modifications enregistrées automatiquement.`;
        } else if (status === 'error') {
            el.className = "text-xs text-red-500 font-medium flex items-center";
            el.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i>Erreur lors de l'enregistrement.`;
        }
    }

    let privacyDebounceTimer = null;
    let pendingPrivacyPayload = null;

    let uiDebounceTimer = null;
    let pendingUIPayload = null;

    // Fonction de flush immédiat des réglages en attente
    const flushPendingSettingsSave = async () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        if (privacyDebounceTimer) {
            clearTimeout(privacyDebounceTimer);
            privacyDebounceTimer = null;
        }
        if (uiDebounceTimer) {
            clearTimeout(uiDebounceTimer);
            uiDebounceTimer = null;
        }

        const promises = [];

        if (pendingPrivacyPayload) {
            const payload = pendingPrivacyPayload;
            pendingPrivacyPayload = null;
            promises.push(
                db.collection('users').doc(user.uid).set(payload, { merge: true })
                    .then(() => {
                        console.log("Préférences de confidentialité synchronisées dans Firestore :", payload);
                        window.settingsHasChanged = true;
                        updateAutoSaveStatus('privacy', 'success');
                    })
                    .catch(err => {
                        console.error("Erreur flush privacy :", err);
                        updateAutoSaveStatus('privacy', 'error');
                    })
            );
        }

        if (pendingUIPayload) {
            const payload = pendingUIPayload;
            pendingUIPayload = null;
            promises.push(
                db.collection('users').doc(user.uid).set(payload, { merge: true })
                    .then(() => {
                        console.log("Préférences UI synchronisées dans Firestore :", payload);
                        window.settingsHasChanged = true;
                        updateAutoSaveStatus('ui', 'success');
                    })
                    .catch(err => {
                        console.error("Erreur flush UI :", err);
                        updateAutoSaveStatus('ui', 'error');
                    })
            );
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }
    };

    window._flushPendingSettingsSave = flushPendingSettingsSave;

    // Sauvegarder les préférences avec debounce (800ms) pour éviter les requêtes Firestore excessives
    const savePrivacySettings = () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const currentLevel = currentSelectedPrivacyLevel;
        const isAccountPublic = currentLevel > 0;
        const isLeaderboardPseudoShown = (localStorage.getItem('prefShowPseudoInLeaderboard') !== 'false' && window.prefShowPseudoInLeaderboard !== false);

        const privacy = {
            level: currentLevel,
            isPublic: isAccountPublic,
            hidePseudo: prefHidePseudo ? prefHidePseudo.checked : false,
            hideCity: prefHideCity ? prefHideCity.checked : false,
            hideFavorite: prefHideFavorite ? prefHideFavorite.checked : false,
            hideLikeCount: prefHideLikeCount ? prefHideLikeCount.checked : false,
            showPseudoInLeaderboard: isLeaderboardPseudoShown,
            // Masquages fiche détaillée
            hideNotes: prefHideNotes ? prefHideNotes.checked : false,
            hideRanking: prefHideRanking ? prefHideRanking.checked : false,
            hideStats: prefHideStats ? prefHideStats.checked : false,
            hidePhotos: prefHidePhotos ? prefHidePhotos.checked : false,
            hidePrice: prefHidePrice ? prefHidePrice.checked : false,
            hideBib: prefHideBib ? prefHideBib.checked : false,
            hideCompanions: prefHideCompanions ? prefHideCompanions.checked : false,
            // Rétrocompatibilité
            showPseudo: prefHidePseudo ? !prefHidePseudo.checked : true,
            showCity: prefHideCity ? !prefHideCity.checked : true,
            showFavorite: prefHideFavorite ? !prefHideFavorite.checked : true
        };

        // Mise à jour immédiate de la mémoire et du cache pour une réactivité UI instantanée (0ms)
        localStorage.setItem('prefAccountPublicRaces', isAccountPublic ? 'true' : 'false');
        window.prefAccountPublicRaces = isAccountPublic;
        window.settingsHasChanged = true;
        checkAllDetailsHiddenSuggestion();

        // Indication visuelle de mise en attente / enregistrement
        updateAutoSaveStatus('privacy', 'saving');

        // Préparation du payload (suppression explicite de showDay en BDD s'il existait)
        pendingPrivacyPayload = {
            privacy,
            isPublic: isAccountPublic,
            'privacy.showDay': firebase.firestore.FieldValue.delete()
        };

        // Debounce de l'écriture Firestore (800ms sans nouvelle modification)
        if (privacyDebounceTimer) clearTimeout(privacyDebounceTimer);
        privacyDebounceTimer = setTimeout(async () => {
            if (pendingPrivacyPayload) {
                const payload = pendingPrivacyPayload;
                pendingPrivacyPayload = null;
                privacyDebounceTimer = null;
                try {
                    await db.collection('users').doc(user.uid).set(payload, { merge: true });
                    console.log("Préférences de confidentialité sauvegardées (debounced) :", payload);
                    updateAutoSaveStatus('privacy', 'success');
                } catch (e) {
                    console.error("Erreur save privacy :", e);
                    updateAutoSaveStatus('privacy', 'error');
                }
            }
        }, 800);
    };

    // Sauvegarder les préférences d'interface avec debounce (800ms)
    const saveUISettings = () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const uiPreferences = {
            hideStatsBtn: prefHideStatsBtn ? prefHideStatsBtn.checked : false,
            hideBadgesBtn: prefHideBadgesBtn ? prefHideBadgesBtn.checked : false,
            hideWishlistBtn: prefHideWishlistBtn ? prefHideWishlistBtn.checked : false,
            hideFriendsBtn: prefHideFriendsBtn ? prefHideFriendsBtn.checked : false,
            compactDashboardStats: prefCompactDashboardStats ? prefCompactDashboardStats.checked : false,
            // Rétrocompatibilité
            showStatsBtn: prefHideStatsBtn ? !prefHideStatsBtn.checked : true,
            showBadgesBtn: prefHideBadgesBtn ? !prefHideBadgesBtn.checked : true,
            showWishlistBtn: prefHideWishlistBtn ? !prefHideWishlistBtn.checked : true
        };

        window.settingsHasChanged = true;
        window.compactDashboardStats = uiPreferences.compactDashboardStats;
        window.dispatchEvent(new Event('compactDashboardStatsChanged'));
        const friendsButton = document.getElementById('friendsBtn');
        if (friendsButton) friendsButton.classList.toggle('hidden', uiPreferences.hideFriendsBtn || window.isFriendView === true);
        updateAutoSaveStatus('ui', 'saving');

        pendingUIPayload = { uiPreferences };

        if (uiDebounceTimer) clearTimeout(uiDebounceTimer);
        uiDebounceTimer = setTimeout(async () => {
            if (pendingUIPayload) {
                const payload = pendingUIPayload;
                pendingUIPayload = null;
                uiDebounceTimer = null;
                try {
                    await db.collection('users').doc(user.uid).set(payload, { merge: true });
                    console.log("Préférences UI sauvegardées (debounced) :", payload);
                    updateAutoSaveStatus('ui', 'success');
                } catch (e) {
                    console.error("Erreur save UI preferences :", e);
                    updateAutoSaveStatus('ui', 'error');
                }
            }
        }, 800);
    };

    // Ne pas attacher les listeners si l'utilisateur est invité
    if (!isInvite) {
        [
            prefHidePseudo, prefHideCity, prefHideFavorite, prefHideLikeCount,
            prefHideNotes, prefHideRanking, prefHideStats, prefHidePhotos, prefHidePrice, prefHideBib, prefHideCompanions
        ].forEach(cb => {
            if (cb) cb.addEventListener('change', savePrivacySettings);
        });

        [prefHideStatsBtn, prefHideBadgesBtn, prefHideWishlistBtn, prefHideFriendsBtn, prefCompactDashboardStats].forEach(cb => {
            if (cb) cb.addEventListener('change', saveUISettings);
        });

        // Bouton Importer dans les paramètres
        const btnSettingsImport = document.getElementById('btnSettingsImport');
        if (btnSettingsImport) {
            btnSettingsImport.addEventListener('click', () => {
                // Fermer la modale des paramètres
                const settingsModal = document.getElementById('userSettingsModal');
                if (settingsModal) settingsModal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
                // Ouvrir la modale d'import
                const importJsonModal = document.getElementById('importJsonModal');
                if (importJsonModal) {
                    importJsonModal.classList.remove('hidden');
                    const jsonFileInput = document.getElementById('jsonFileInput');
                    const importPreview = document.getElementById('importPreview');
                    const importMessage = document.getElementById('importMessage');
                    const confirmImportBtn = document.getElementById('confirmImportBtn');
                    if (jsonFileInput) jsonFileInput.value = '';
                    if (importPreview) importPreview.classList.add('hidden');
                    if (importMessage) importMessage.classList.add('hidden');
                    if (confirmImportBtn) confirmImportBtn.disabled = true;
                }
            });
        }

        // Bouton Exporter dans les paramètres
        const btnSettingsExport = document.getElementById('btnSettingsExport');
        if (btnSettingsExport) {
            btnSettingsExport.addEventListener('click', () => {
                // Fermer la modale des paramètres
                const settingsModal = document.getElementById('userSettingsModal');
                if (settingsModal) settingsModal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
                // Ouvrir la modale de backup/export
                const backupModal = document.getElementById('backupConfirmationModal');
                if (backupModal) backupModal.classList.remove('hidden');
            });
        }
    }

    // Gestion du bouton tutoriel
    const tutorialBtn = document.getElementById('btnShowTutorial');
    const tutorialTooltip = document.getElementById('tutorialDisabledTooltip');

    if (tutorialBtn) {
        // Vérifier si on est sur index.html
        const isOnIndexPage = window.location.pathname.includes('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/');

        if (isOnIndexPage) {
            tutorialBtn.disabled = true;
            if (tutorialTooltip) {
                tutorialTooltip.textContent = 'Le tutoriel est uniquement disponible depuis le tableau de bord des courses';
            }
        }

        tutorialBtn.addEventListener('click', function () {
            if (!this.disabled) {
                closeSettingsModal();
                setTimeout(() => {
                    if (typeof startTutorial === 'function') {
                        startTutorial();
                    }
                }, 300);
            }
        });

        // Afficher/masquer le tooltip au hover si désactivé
        tutorialBtn.addEventListener('mouseenter', function () {
            if (this.disabled && tutorialTooltip) {
                tutorialTooltip.classList.remove('hidden');
            }
        });

        tutorialBtn.addEventListener('mouseleave', function () {
            if (tutorialTooltip) {
                tutorialTooltip.classList.add('hidden');
            }
        });
    }

    // CHARGEMENT DES PRÉFÉRENCES ACTUELLES
    const loadCurrentSettings = async () => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();

                // Privacy level
                let privacyLevel = 2; // default full
                if (data.privacy && data.privacy.level !== undefined) {
                    privacyLevel = parseInt(data.privacy.level);
                } else if (data.privacy && data.privacy.isPublic !== undefined) {
                    privacyLevel = data.privacy.isPublic === true ? 2 : 0;
                } else if (data.isPublic !== undefined) {
                    privacyLevel = data.isPublic === true ? 2 : 0;
                }

                updatePrivacyUI(privacyLevel);

                const isAccountPublic = privacyLevel > 0;
                localStorage.setItem('prefAccountPublicRaces', isAccountPublic ? 'true' : 'false');
                window.prefAccountPublicRaces = isAccountPublic;

                if (data.privacy) {
                    if (prefHidePseudo) prefHidePseudo.checked = data.privacy.hidePseudo === true || data.privacy.showPseudo === false;
                    if (prefHideCity) prefHideCity.checked = data.privacy.hideCity === true || data.privacy.showCity === false;
                    if (prefHideFavorite) prefHideFavorite.checked = data.privacy.hideFavorite === true;
                    if (prefHideLikeCount) prefHideLikeCount.checked = data.privacy.hideLikeCount === true;
                    if (data.privacy.showPseudoInLeaderboard !== undefined) {
                        const isChecked = data.privacy.showPseudoInLeaderboard === true;
                        localStorage.setItem('prefShowPseudoInLeaderboard', isChecked ? 'true' : 'false');
                        window.prefShowPseudoInLeaderboard = isChecked;
                    }
                    // Masquages fiche détaillée
                    if (prefHideNotes) prefHideNotes.checked = data.privacy.hideNotes === true;
                    if (prefHideRanking) prefHideRanking.checked = data.privacy.hideRanking === true;
                    if (prefHideStats) prefHideStats.checked = data.privacy.hideStats === true;
                    if (prefHidePhotos) prefHidePhotos.checked = data.privacy.hidePhotos === true;
                    if (prefHidePrice) prefHidePrice.checked = data.privacy.hidePrice === true;
                    if (prefHideBib) prefHideBib.checked = data.privacy.hideBib === true;
                    if (prefHideCompanions) prefHideCompanions.checked = data.privacy.hideCompanions === true;
                } else {
                    // Par défaut, aucune case n'est cochée (rien n'est masqué)
                    if (prefHidePseudo) prefHidePseudo.checked = false;
                    if (prefHideCity) prefHideCity.checked = false;
                    if (prefHideFavorite) prefHideFavorite.checked = false;
                    if (prefHideLikeCount) prefHideLikeCount.checked = false;
                    if (prefHideNotes) prefHideNotes.checked = false;
                    if (prefHideRanking) prefHideRanking.checked = false;
                    if (prefHideStats) prefHideStats.checked = false;
                    if (prefHidePhotos) prefHidePhotos.checked = false;
                    if (prefHidePrice) prefHidePrice.checked = false;
                    if (prefHideBib) prefHideBib.checked = false;
                    if (prefHideCompanions) prefHideCompanions.checked = false;
                }

                // UI preferences (Default to false/unchecked, so nothing is hidden)
                if (data.uiPreferences) {
                    if (prefHideStatsBtn) prefHideStatsBtn.checked = data.uiPreferences.hideStatsBtn === true || data.uiPreferences.showStatsBtn === false;
                    if (prefHideBadgesBtn) prefHideBadgesBtn.checked = data.uiPreferences.hideBadgesBtn === true || data.uiPreferences.showBadgesBtn === false;
                    if (prefHideWishlistBtn) prefHideWishlistBtn.checked = data.uiPreferences.hideWishlistBtn === true || data.uiPreferences.showWishlistBtn === false;
                    if (prefHideFriendsBtn) prefHideFriendsBtn.checked = data.uiPreferences.hideFriendsBtn === true;
                    if (prefCompactDashboardStats) prefCompactDashboardStats.checked = data.uiPreferences.compactDashboardStats === true;
                } else {
                    // Defaults: none hidden
                    if (prefHideStatsBtn) prefHideStatsBtn.checked = false;
                    if (prefHideBadgesBtn) prefHideBadgesBtn.checked = false;
                    if (prefHideWishlistBtn) prefHideWishlistBtn.checked = false;
                    if (prefHideFriendsBtn) prefHideFriendsBtn.checked = false;
                    if (prefCompactDashboardStats) prefCompactDashboardStats.checked = false;
                }
                window.compactDashboardStats = data.uiPreferences?.compactDashboardStats === true;
                window.dispatchEvent(new Event('compactDashboardStatsChanged'));
                const friendsButton = document.getElementById('friendsBtn');
                if (friendsButton) friendsButton.classList.toggle('hidden', data.uiPreferences?.hideFriendsBtn === true || window.isFriendView === true);

                // Pseudo input
                const pseudoInput = document.getElementById('settingsNewPseudo');
                if (pseudoInput && data.pseudo) {
                    pseudoInput.value = data.pseudo;
                }

                // Theme color preference
                if (data.themeColor) {
                    if (typeof window.applyThemeColor === 'function') {
                        window.applyThemeColor(data.themeColor, false);
                    }
                    localStorage.setItem('userThemeColor', data.themeColor);
                }
                updateThemeSelectorUI(data.themeColor || localStorage.getItem('userThemeColor') || 'green');

                checkAllDetailsHiddenSuggestion();
            }
        } catch (e) {
            console.error("Erreur chargement settings", e);
        }
    };

    // Appeler le chargement
    loadCurrentSettings();

    // Fonction d'affichage de message
    function showMessage(msg, type = 'success', targetId = 'settingsMessageContainer') {
        const targetContainer = document.getElementById(targetId);
        if (!targetContainer) return;

        targetContainer.textContent = msg;
        targetContainer.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'text-green-600', 'text-red-600');

        if (targetId === 'pseudoMessageContainer') {
            // Style spécifique pour le message sous le pseudo (texte simple coloré)
            if (type === 'success') {
                targetContainer.classList.add('text-green-600');
            } else {
                targetContainer.classList.add('text-red-600');
            }
        } else {
            // Style boîte classique
            if (type === 'success') {
                targetContainer.classList.add('bg-green-100', 'text-green-800');
            } else {
                targetContainer.classList.add('bg-red-100', 'text-red-800');
            }
        }

        targetContainer.classList.remove('hidden');

        setTimeout(() => {
            targetContainer.classList.add('hidden');
        }, 5000);
    }

    // Gestion pseudo
    if (pseudoForm) {
        pseudoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPseudo = document.getElementById('settingsNewPseudo').value.trim();
            const user = firebase.auth().currentUser;

            if (!user) return;
            if (!newPseudo) return;

            const forbiddenPseudos = ['inconnu', 'unknown', 'anonyme', 'anonymous', 'deleted', 'supprimé', 'undefined', 'null', 'admin', 'invite', 'administrator', 'moderator'];
            if (forbiddenPseudos.includes(newPseudo.toLowerCase())) {
                showMessage("Ce pseudo n'est pas autorisé.", "error", "pseudoMessageContainer");
                return;
            }

            try {
                // Mise à jour Firestore
                await db.collection('users').doc(user.uid).update({
                    pseudo: newPseudo
                });

                window.currentUserPseudo = newPseudo;
                if (!window.isFriendView && !window.isInviteView) window.activeCarnetPseudo = newPseudo;
                localStorage.setItem('userPseudo', newPseudo);

                // Mettre également à jour le profil Firebase Auth pour synchroniser displayName
                if (user && typeof user.updateProfile === 'function') {
                    await user.updateProfile({ displayName: newPseudo }).catch(err => console.warn('updateProfile non supporté:', err));
                }

                // Marquer le changement pour recharger la page à la fermeture
                settingsHasChanged = true;

                // Désactiver le bouton tutoriel et afficher le tooltip
                const tutorialBtn = document.getElementById('btnShowTutorial');
                if (tutorialBtn) {
                    tutorialBtn.disabled = true;
                }

                // Feedback
                showMessage("Pseudo mis à jour avec succès !", "success", "pseudoMessageContainer");

                // Mettre à jour l'affichage dans la barre si possible sans rechargement
                // On peut re-déclencher une mise à jour UI si nécessaire, mais le plus simple est de recharger ou attendre la prochaine nav.
                // Pour l'UX, on peut essayer de mettre à jour le texte du bandeau directement.
                const authStatusText = document.getElementById('authStatusText');
                if (authStatusText && authStatusText.innerHTML.includes('Connecté en tant que')) {
                    // On fait un remplacement simple dans le DOM pour éviter de refetch tout de suite
                    // Mais idéalement on devrait relancer la logique d'auth.
                    // Reload simple pour être sûr ? Non c'est brutal.
                    // On laisse l'utilisateur voir le message.
                }

            } catch (error) {
                console.error("Erreur update pseudo:", error);
                showMessage("Erreur lors de la mise à jour.", "error", "pseudoMessageContainer");
            }
        });
    }

    // Gestion Reset Password
    let passwordResetConfirmPending = false;
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user || !user.email) return;

            // Si pas encore en attente de confirmation
            if (!passwordResetConfirmPending) {
                passwordResetConfirmPending = true;
                resetBtn.innerHTML = '<i class="fas fa-check"></i> Confirmer l\'envoi';
                resetBtn.classList.remove('border-red-200', 'bg-red-50', 'text-red-600', 'hover:bg-red-100');
                resetBtn.classList.add('border-orange-200', 'bg-orange-50', 'text-orange-600', 'hover:bg-orange-100');

                showMessage(`Cliquez à nouveau pour envoyer un email à ${user.email}`, 'warning');

                // Réinitialiser après 5 secondes si pas de confirmation
                setTimeout(() => {
                    if (passwordResetConfirmPending) {
                        passwordResetConfirmPending = false;
                        resetBtn.innerHTML = '<i class="fas fa-key"></i> Réinitialiser le mot de passe';
                        resetBtn.classList.remove('border-orange-200', 'bg-orange-50', 'text-orange-600', 'hover:bg-orange-100');
                        resetBtn.classList.add('border-red-200', 'bg-red-50', 'text-red-600', 'hover:bg-red-100');
                    }
                }, 5000);
                return;
            }

            // Confirmation validée, envoi de l'email
            passwordResetConfirmPending = false;
            resetBtn.innerHTML = '<i class="fas fa-key"></i> Réinitialiser le mot de passe';
            resetBtn.classList.remove('border-orange-200', 'bg-orange-50', 'text-orange-600', 'hover:bg-orange-100');
            resetBtn.classList.add('border-red-200', 'bg-red-50', 'text-red-600', 'hover:bg-red-100');

            try {
                await firebase.auth().sendPasswordResetEmail(user.email);
                showMessage(`Email envoyé à ${user.email} ! Vérifiez vos spams.`, 'success');
            } catch (error) {
                console.error("Erreur reset password:", error);
                showMessage("Erreur lors de l'envoi de l'email.", "error");
            }
        });
    }

    // GESTION SUPPRESSION COMPTE
    const btnInitDelete = document.getElementById('btnInitDeleteAccount');
    const btnConfirmWarning = document.getElementById('btnConfirmDeleteWarning');
    const btnUltimatumDownload = document.getElementById('btnUltimatumDownload');
    const btnFinalDelete = document.getElementById('btnFinalDeleteAccount');

    if (btnInitDelete) {
        btnInitDelete.addEventListener('click', () => {
            // Fermer settings ? Non, on empile ou on switch. 
            // On affiche le Warning par dessus ou on switch.
            // Affichons par dessus (z-index 60 géré dans HTML)
            window.openModal('deleteAccountWarningModal');
        });
    }

    if (btnConfirmWarning) {
        btnConfirmWarning.addEventListener('click', () => {
            window.closeModal('deleteAccountWarningModal');
            window.openModal('deleteAccountUltimatumModal');
        });
    }



    if (btnFinalDelete) {
        btnFinalDelete.addEventListener('click', async () => {
            const user = firebase.auth().currentUser;
            if (!user) return;

            // Désactiver bouton pour éviter double clic
            btnFinalDelete.disabled = true;
            btnFinalDelete.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Suppression en cours...`;

            // Vérification de sécurité (Session récente < 5 min)
            const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (now - lastSignInTime > fiveMinutes) {
                btnFinalDelete.disabled = false;
                btnFinalDelete.innerHTML = "OUI, Supprimer mon compte définitivement";

                const errContainer = document.getElementById('deleteAccountErrorContainer');
                if (errContainer) {
                    errContainer.textContent = "Par sécurité, cette action nécessite une connexion récente (moins de 5 min). Veuillez vous déconnecter et vous reconnecter avant de réessayer.";
                    errContainer.className = "p-3 mb-4 rounded-lg text-sm text-center bg-red-100 text-red-800";
                    errContainer.classList.remove('hidden');
                }
                return;
            }

            try {
                const uid = user.uid;

                // 1. Suppression des sous-collections (batch manuel si possible, ou simple tentative)
                // Note: Client SDK ne peut pas supprimer une collection entière facilement sans cloud function.
                // On va essayer de supprimer les documents visibles dans races et wishlist si les références globales existent.

                const deleteCollectionDocs = async (collectionRef) => {
                    if (!collectionRef) return;
                    try {
                        const snapshot = await collectionRef.get();
                        const batch = db.batch();
                        let count = 0;
                        snapshot.forEach(doc => {
                            batch.delete(doc.ref);
                            count++;
                        });
                        if (count > 0) await batch.commit();
                        console.log(`Supprimé ${count} docs de la collection.`);
                    } catch (e) {
                        console.warn("Erreur clean collection:", e);
                    }
                };

                // On suppose que window.racesCollection / wishlistCollection sont accessibles
                // Si on est dans dashboard.html avec les scripts chargés
                if (typeof racesCollection !== 'undefined') await deleteCollectionDocs(racesCollection);
                if (typeof wishlistCollection !== 'undefined') await deleteCollectionDocs(wishlistCollection);

                // 2. Supprimer la doc user
                await db.collection('users').doc(uid).delete();

                // 3. Supprimer le compte Auth
                await user.delete();

                // 4. Message et Redirection
                const errContainer = document.getElementById('deleteAccountErrorContainer');
                if (errContainer) {
                    errContainer.textContent = "Votre compte a été supprimé. Redirection...";
                    errContainer.className = "p-3 mb-4 rounded-lg text-sm text-center bg-green-100 text-green-800";
                    errContainer.classList.remove('hidden');
                }

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);

            } catch (error) {
                console.error("Erreur suppression compte:", error);
                btnFinalDelete.disabled = false;
                btnFinalDelete.innerText = "Réessayer la suppression";

                const errContainer = document.getElementById('deleteAccountErrorContainer');
                let msg = "Une erreur est survenue : " + error.message;

                if (error.code === 'auth/requires-recent-login') {
                    msg = "Par sécurité, cette opération nécessite une connexion récente. Veuillez vous déconnecter et vous reconnecter, puis réessayez.";
                }

                if (errContainer) {
                    errContainer.textContent = msg;
                    errContainer.className = "p-3 mb-4 rounded-lg text-sm text-center bg-red-100 text-red-800";
                    errContainer.classList.remove('hidden');
                }
            }
        });
    }
}

// Fonction globale pour ouvrir les paramètres
window.openUserSettings = async function () {
    if (window.isSelectionMode) return;
    const modal = document.getElementById('userSettingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Freeze background
    }

    const user = firebase.auth().currentUser;
    if (!user) return;

    const emailDisplay = document.getElementById('settingsUserEmail');
    const pseudoInput = document.getElementById('settingsNewPseudo');
    const inviteNotice = document.getElementById('inviteNotice');

    // Checkboxes inputs
    const prefHidePseudo = document.getElementById('prefHidePseudo');
    const prefHideCity = document.getElementById('prefHideCity');
    const prefHideFavorite = document.getElementById('prefHideFavorite');
    const prefHideLikeCount = document.getElementById('prefHideLikeCount');
    const prefShowPseudoInLeaderboard = document.getElementById('prefShowPseudoInLeaderboard');

    if (emailDisplay) emailDisplay.textContent = user.email;

    // Vérifier si l'utilisateur est invité et afficher le notice
    let isInvite = false;
    if (typeof window.isInviteUser === 'function') {
        isInvite = await window.isInviteUser();
    } else {
        // Fallback si isInvite.js n'est pas encore chargé
        console.warn('window.isInviteUser not available in openUserSettings, using sessionStorage fallback');
        isInvite = sessionStorage.getItem('authLevel') === 'invite';
    }
    if (inviteNotice) {
        if (isInvite) {
            inviteNotice.classList.remove('hidden');
        } else {
            inviteNotice.classList.add('hidden');
        }
    }

    // Pré-remplir le pseudo actuel
    if (pseudoInput && !pseudoInput.value) pseudoInput.value = "Chargement...";

    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (pseudoInput) pseudoInput.value = data.pseudo || "";

            // Photo de profil
            const profilePicImg = document.getElementById('settingsProfilePic');
            const btnDeleteProfilePic = document.getElementById('btnDeleteProfilePic');
            if (profilePicImg) {
                if (data.photoURL) {
                    profilePicImg.src = data.photoURL;
                    if (btnDeleteProfilePic && !isInvite) btnDeleteProfilePic.classList.remove('hidden');
                } else {
                    const nameForAvatar = data.pseudo || "User";
                    profilePicImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`;
                    if (btnDeleteProfilePic) btnDeleteProfilePic.classList.add('hidden');
                }
            }

            const p = data.privacy || {};
            if (prefHidePseudo) prefHidePseudo.checked = (p.hidePseudo === true) || (p.showPseudo === false);
            if (prefHideCity) prefHideCity.checked = (p.hideCity === true) || (p.showCity === false);
            if (prefHideFavorite) prefHideFavorite.checked = (p.hideFavorite === true);
            if (prefHideLikeCount) prefHideLikeCount.checked = (p.hideLikeCount === true);
            if (prefShowPseudoInLeaderboard) prefShowPseudoInLeaderboard.checked = (p.showPseudoInLeaderboard !== undefined) ? p.showPseudoInLeaderboard : true;

            // Masquages fiche détaillée
            const prefHideNotes = document.getElementById('prefHideNotes');
            const prefHideRanking = document.getElementById('prefHideRanking');
            const prefHideStats = document.getElementById('prefHideStats');
            const prefHidePhotos = document.getElementById('prefHidePhotos');
            const prefHidePrice = document.getElementById('prefHidePrice');
            const prefHideBib = document.getElementById('prefHideBib');
            const prefHideCompanions = document.getElementById('prefHideCompanions');

            if (prefHideNotes) prefHideNotes.checked = p.hideNotes === true;
            if (prefHideRanking) prefHideRanking.checked = p.hideRanking === true;
            if (prefHideStats) prefHideStats.checked = p.hideStats === true;
            if (prefHidePhotos) prefHidePhotos.checked = p.hidePhotos === true;
            if (prefHidePrice) prefHidePrice.checked = p.hidePrice === true;
            if (prefHideBib) prefHideBib.checked = p.hideBib === true;
            if (prefHideCompanions) prefHideCompanions.checked = p.hideCompanions === true;

            // Charger les préférences UI
            const ui = data.uiPreferences || {};
            const prefHideStatsBtn = document.getElementById('prefHideStatsBtn');
            const prefHideBadgesBtn = document.getElementById('prefHideBadgesBtn');
            const prefHideWishlistBtn = document.getElementById('prefHideWishlistBtn');
            const prefHideFriendsBtn = document.getElementById('prefHideFriendsBtn');
            const prefCompactDashboardStats = document.getElementById('prefCompactDashboardStats');

            if (prefHideStatsBtn) prefHideStatsBtn.checked = (ui.hideStatsBtn === true) || (ui.showStatsBtn === false);
            if (prefHideBadgesBtn) prefHideBadgesBtn.checked = (ui.hideBadgesBtn === true) || (ui.showBadgesBtn === false);
            if (prefHideWishlistBtn) prefHideWishlistBtn.checked = (ui.hideWishlistBtn === true) || (ui.showWishlistBtn === false);
            if (prefHideFriendsBtn) prefHideFriendsBtn.checked = ui.hideFriendsBtn === true;
            if (prefCompactDashboardStats) prefCompactDashboardStats.checked = ui.compactDashboardStats === true;
            window.compactDashboardStats = ui.compactDashboardStats === true;
            window.dispatchEvent(new Event('compactDashboardStatsChanged'));
            const friendsButton = document.getElementById('friendsBtn');
            if (friendsButton) friendsButton.classList.toggle('hidden', ui.hideFriendsBtn === true || window.isFriendView === true);
            // Theme color preference
            if (data && data.themeColor) {
                if (typeof window.applyThemeColor === 'function') {
                    window.applyThemeColor(data.themeColor, false);
                }
                localStorage.setItem('userThemeColor', data.themeColor);
            }
            if (typeof updateThemeSelectorUI === 'function') {
                updateThemeSelectorUI(data?.themeColor || localStorage.getItem('userThemeColor') || 'green');
            }

        } else {
            if (pseudoInput) pseudoInput.value = "";
            if (typeof updateThemeSelectorUI === 'function') {
                updateThemeSelectorUI(localStorage.getItem('userThemeColor') || 'green');
            }
        }
    } catch (e) {
        console.error(e);
        if (pseudoInput) pseudoInput.value = "";
        if (typeof updateThemeSelectorUI === 'function') {
            updateThemeSelectorUI(localStorage.getItem('userThemeColor') || 'green');
        }
    }

    // Injecter le formulaire d'avis si disponible
    if (!isInvite && typeof window.injectReviewForm === 'function') {
        setTimeout(() => window.injectReviewForm(), 100);
    }
};

window.openSettingsModal = window.openUserSettings;

// Ouvre les paramètres et surligne précisément la case du classement
window.openUserSettingsForLeaderboard = function () {
    if (window.isSelectionMode) return;
    const badgesModal = document.getElementById('badgesModal');
    if (badgesModal) badgesModal.classList.add('hidden');

    if (typeof window.openUserSettings === 'function') {
        window.openUserSettings();
    } else {
        const modal = document.getElementById('userSettingsModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }
    }

    const highlightTarget = () => {
        const cb = document.getElementById('prefShowPseudoInLeaderboard');
        if (cb) {
            const label = cb.closest('label');
            if (label) {
                label.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const highlightClasses = ['ring-2', 'ring-emerald-500', 'bg-emerald-100/80', 'p-1.5', '-m-1.5', 'rounded-lg', 'transition-all', 'duration-300'];
                label.classList.add(...highlightClasses);
                setTimeout(() => {
                    label.classList.remove(...highlightClasses);
                }, 3000);
            }
            cb.focus();
        }
    };

    setTimeout(highlightTarget, 100);
    setTimeout(highlightTarget, 350);
};
