(() => {
  const component = document.querySelector("script[data-dc-script][data-dc-src]");
  if (!component) return;

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });

  const start = async () => {
    const response = await fetch(component.dataset.dcSrc);
    if (!response.ok) throw new Error("Unable to load the product experience");
    component.textContent = await response.text();

    if (window.location.hash.includes("figmacapture=")) {
      await loadScript("https://mcp.figma.com/mcp/html-to-design/capture.js");
    }
    await loadScript("./vendor/dc-runtime.js");
  };

  start().catch((error) => {
    document.documentElement.classList.remove("js-motion");
    document.documentElement.classList.remove("prototype-loading");
    console.error("[Dreame L50]", error);
  });
})();
