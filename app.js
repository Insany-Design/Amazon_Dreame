(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("figma") === "1") document.documentElement.classList.add("figma-export");
  document.documentElement.classList.add("js-motion");

  const component = document.querySelector("script[data-dc-script][data-dc-src]");
  if (!component) {
    document.documentElement.classList.remove("js-motion");
    return;
  }

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
    await loadScript("./dc-runtime.js");
  };

  start().catch((error) => {
    document.documentElement.classList.remove("js-motion");
    console.error("[Dreame L50]", error);
  });
})();
