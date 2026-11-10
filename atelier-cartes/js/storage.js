(function () {
	const KEY = "tribunal-du-chaos-atelier-v2";
	const IMAGES_KEY = "tribunal-du-chaos-images-v2";
	function clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
	function examples() {
		const { version, settings, cases } = window.TDC_DATA;
		return clone({ version, settings, cases, uploads: [] });
	}
	// Copie locale des images importées : sert d'aperçu tant que le fichier n'est pas dans uploads/illustrations.
	function loadImages() {
		try {
			return JSON.parse(localStorage.getItem(IMAGES_KEY)) || {};
		} catch (error) {
			return {};
		}
	}
	function saveImages(images) {
		try {
			localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
			return true;
		} catch (error) {
			return false;
		}
	}
	function load(validate) {
		try {
			const saved = localStorage.getItem(KEY);
			if (!saved) return examples();
			const parsed = JSON.parse(saved);
			validate(parsed);
			return parsed;
		} catch (error) {
			console.error("Impossible de charger le projet local.", error);
			window.TDC_STORAGE_LOAD_ERROR = error;
			return examples();
		}
	}
	function save(project, replaceUnreadable = false) {
		if (window.TDC_STORAGE_LOAD_ERROR && !replaceUnreadable)
			throw new Error(
				"Le projet local illisible ou incompatible est protégé : importez un projet compatible ou réinitialisez le grimoire pour le remplacer."
			);
		try {
			localStorage.setItem(KEY, JSON.stringify(project));
			if (replaceUnreadable) delete window.TDC_STORAGE_LOAD_ERROR;
			return true;
		} catch (error) {
			console.error("La sauvegarde locale a échoué.", error);
			throw new Error(
				"La sauvegarde a échoué. L’espace de stockage est peut-être plein : exportez votre projet puis réduisez les images."
			);
		}
	}
	window.TDC_STORAGE = { load, save, clone, loadImages, saveImages, KEY };
})();
