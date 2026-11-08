(function () {
  const KEY = "tribunal-du-chaos-atelier-v1";
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function load() {
    try {
      const saved = localStorage.getItem(KEY);
      if (!saved) return clone(window.TDC_DATA);
      const parsed = JSON.parse(saved);
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.cases) || !parsed.settings) throw new Error("Structure de projet invalide.");
      return parsed;
    } catch (error) {
      console.error("Impossible de charger le projet local.", error);
      window.TDC_STORAGE_LOAD_ERROR = error;
      return clone(window.TDC_DATA);
    }
  }
  function save(project) {
    try {
      localStorage.setItem(KEY, JSON.stringify(project));
      return true;
    } catch (error) {
      console.error("La sauvegarde locale a échoué.", error);
      throw new Error("La sauvegarde a échoué. L’espace de stockage est peut-être plein : exportez votre projet puis réduisez les images.");
    }
  }
  window.TDC_STORAGE = { load, save, clone };
})();
