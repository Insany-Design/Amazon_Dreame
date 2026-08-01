(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("figma") === "1") document.documentElement.classList.add("figma-export");
  document.documentElement.classList.add("js-motion");
})();
