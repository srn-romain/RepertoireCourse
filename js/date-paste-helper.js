/**
 * Helper de collage intelligent de date pour RépertoireCourse
 * Permet de coller une date directement (Ctrl+V ou Clic droit -> Coller)
 * dans les champs date des formulaires sans bouton ni label intrusif.
 */
(function(window) {
    'use strict';

    const FRENCH_MONTHS = {
        'janvier': 1, 'janv': 1, 'jan': 1,
        'février': 2, 'fevrier': 2, 'févr': 2, 'fevr': 2, 'fév': 2, 'fev': 2,
        'mars': 3, 'mar': 3,
        'avril': 4, 'avr': 4,
        'mai': 5,
        'juin': 6,
        'juillet': 7, 'juil': 7,
        'août': 8, 'aout': 8, 'aoû': 8,
        'septembre': 9, 'sept': 9, 'sep': 9,
        'octobre': 10, 'oct': 10,
        'novembre': 11, 'nov': 11,
        'décembre': 12, 'decembre': 12, 'déc': 12, 'dec': 12
    };

    const ENGLISH_MONTHS = {
        'january': 1, 'jan': 1,
        'february': 2, 'feb': 2,
        'march': 3, 'mar': 3,
        'april': 4, 'apr': 4,
        'may': 5,
        'june': 6, 'jun': 6,
        'july': 7, 'jul': 7,
        'august': 8, 'aug': 8,
        'september': 9, 'sept': 9, 'sep': 9,
        'october': 10, 'oct': 10,
        'november': 11, 'nov': 11,
        'december': 12, 'dec': 12
    };

    function isValidDateParts(year, month, day) {
        if (year < 1900 || year > 2100) return false;
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        const d = new Date(year, month - 1, day);
        return d.getFullYear() === year && (d.getMonth() + 1) === month && d.getDate() === day;
    }

    function formatIsoDate(year, month, day) {
        const y = String(year);
        const m = String(month).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function parseFlexibleDate(rawText) {
        if (!rawText || typeof rawText !== 'string') return null;
        let str = rawText.trim();
        if (!str) return null;

        // Extraction de l'heure si présente : ex "09:30", "9h30", "14h00", "09:30:00"
        let extractedTime = null;
        const timeMatch = str.match(/(?:(?:à|at|vers)\s*)?([01]?\d|2[0-3])(?::|h)([0-5]\d)(?::([0-5]\d))?/i);
        if (timeMatch) {
            const hh = timeMatch[1].padStart(2, '0');
            const mm = timeMatch[2].padStart(2, '0');
            extractedTime = `${hh}:${mm}`;
        }

        // Nettoyage de préfixes courants : "le", "du", "au", "date:", "date :"
        let cleaned = str.replace(/^(?:date\s*:\s*|le\s+|du\s+|au\s+)/i, '');

        // 1. Format ISO ou Année en premier : YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
        const isoMatch = cleaned.match(/\b(19\d{2}|20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
        if (isoMatch) {
            const y = parseInt(isoMatch[1], 10);
            const m = parseInt(isoMatch[2], 10);
            const d = parseInt(isoMatch[3], 10);
            if (isValidDateParts(y, m, d)) {
                return { date: formatIsoDate(y, m, d), time: extractedTime };
            }
        }

        // 2. Format Européen standard : DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, DD/MM/YY
        const dmyMatch = cleaned.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2}|19\d{2}|\d{2})\b/);
        if (dmyMatch) {
            const d = parseInt(dmyMatch[1], 10);
            const m = parseInt(dmyMatch[2], 10);
            let y = parseInt(dmyMatch[3], 10);
            if (y < 100) {
                y = y < 70 ? 2000 + y : 1900 + y;
            }
            if (isValidDateParts(y, m, d)) {
                return { date: formatIsoDate(y, m, d), time: extractedTime };
            }
        }

        // 3. Format textuel français : "18 mai 2025", "1er mai 2025", "18-mai-2025", "18 mai", "15 oct. 2025"
        const frenchTextMatch = cleaned.match(/\b(0?[1-9]|[12]\d|3[01]|1er)\s*[- ]\s*([a-zA-ZÀ-ÿ.]+)(?:\s*[- ]\s*(20\d{2}|19\d{2}|\d{2}))?\b/i);
        if (frenchTextMatch) {
            const dayRaw = frenchTextMatch[1].toLowerCase().replace('er', '');
            const d = parseInt(dayRaw, 10);
            const mKey = frenchTextMatch[2].toLowerCase().replace('.', '');
            const m = FRENCH_MONTHS[mKey] || ENGLISH_MONTHS[mKey];
            if (m) {
                let y = frenchTextMatch[3] ? parseInt(frenchTextMatch[3], 10) : new Date().getFullYear();
                if (y < 100) {
                    y = y < 70 ? 2000 + y : 1900 + y;
                }
                if (isValidDateParts(y, m, d)) {
                    return { date: formatIsoDate(y, m, d), time: extractedTime };
                }
            }
        }

        // 4. Format textuel anglais : "October 12, 2025", "Oct 12 2025"
        const engTextMatch = cleaned.match(/\b([a-zA-Z]+)\s+(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?,?\s+(20\d{2}|19\d{2}|\d{2})\b/i);
        if (engTextMatch) {
            const mKey = engTextMatch[1].toLowerCase().replace('.', '');
            const m = ENGLISH_MONTHS[mKey] || FRENCH_MONTHS[mKey];
            const d = parseInt(engTextMatch[2], 10);
            let y = parseInt(engTextMatch[3], 10);
            if (y < 100) y = y < 70 ? 2000 + y : 1900 + y;
            if (m && isValidDateParts(y, m, d)) {
                return { date: formatIsoDate(y, m, d), time: extractedTime };
            }
        }

        // 5. Fallback Date.parse standard
        const parsedTs = Date.parse(cleaned);
        if (!isNaN(parsedTs)) {
            const dt = new Date(parsedTs);
            const y = dt.getFullYear();
            const m = dt.getMonth() + 1;
            const d = dt.getDate();
            if (isValidDateParts(y, m, d)) {
                return { date: formatIsoDate(y, m, d), time: extractedTime };
            }
        }

        return null;
    }

    function applyDateToInput(rawText, dateInput, hourInput) {
        if (!dateInput) return false;
        const result = parseFlexibleDate(rawText);

        if (result && result.date) {
            dateInput.value = result.date;
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));

            if (result.time && hourInput && !hourInput.value) {
                hourInput.value = result.time;
                hourInput.dispatchEvent(new Event('input', { bubbles: true }));
                hourInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Retour visuel discret sur le champ
            dateInput.classList.remove('border-red-500');
            dateInput.classList.add('ring-2', 'ring-emerald-500');
            setTimeout(() => {
                dateInput.classList.remove('ring-2', 'ring-emerald-500');
            }, 600);

            return true;
        }
        return false;
    }

    function bindDateInput(dateInput, hourInput) {
        if (!dateInput || dateInput._hasDatePasteListener) return;
        dateInput._hasDatePasteListener = true;

        // 1. Événement 'paste' (Ctrl+V ou Clic droit -> Coller)
        dateInput.addEventListener('paste', (e) => {
            const pastedText = (e.clipboardData || window.clipboardData)?.getData('text');
            if (pastedText) {
                const applied = applyDateToInput(pastedText, dateInput, hourInput);
                if (applied) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });

        // 2. Événement 'keydown' (Ctrl+V / Cmd+V) si le navigateur intercepte 'paste'
        dateInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                setTimeout(async () => {
                    if (navigator.clipboard && navigator.clipboard.readText) {
                        try {
                            const clipText = await navigator.clipboard.readText();
                            if (clipText) {
                                applyDateToInput(clipText, dateInput, hourInput);
                            }
                        } catch (_) {}
                    }
                }, 20);
            }
        });
    }

    function initAll() {
        const raceDate = document.getElementById('raceDate');
        const raceHour = document.getElementById('raceHour');
        if (raceDate) {
            bindDateInput(raceDate, raceHour);
        }

        const wishlistDate = document.getElementById('newWishlistItemDate');
        if (wishlistDate) {
            bindDateInput(wishlistDate, null);
        }

        // Délégation globale sur tout input[type="date"]
        document.querySelectorAll('input[type="date"]').forEach(inp => {
            if (inp !== raceDate && inp !== wishlistDate) {
                bindDateInput(inp, null);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    window.DatePasteHelper = {
        parseFlexibleDate,
        applyDateToInput,
        bindDateInput
    };

})(window);
