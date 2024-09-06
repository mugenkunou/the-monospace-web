function gridCellDimensions() {
  const element = document.createElement("div");
  element.style.position = "fixed";
  element.style.height = "var(--line-height)";
  element.style.width = "1ch";
  document.body.appendChild(element);
  const rect = element.getBoundingClientRect();
  document.body.removeChild(element);
  return { width: rect.width, height: rect.height };
}

// Add padding to each media to maintain grid.
function adjustMediaPadding() {
  const cell = gridCellDimensions();

  function setHeightFromRatio(media, ratio) {
    const rect = media.getBoundingClientRect();
    const realHeight = rect.width / ratio;
    const diff = cell.height - (realHeight % cell.height);
    media.style.setProperty("padding-bottom", `${diff}px`);
  }

  function setFallbackHeight(media) {
    const rect = media.getBoundingClientRect();
    const height = Math.round(rect.width / 2 / cell.height) * cell.height;
    media.style.setProperty("height", `${height}px`);
  }

  function onMediaLoaded(media) {
    var width, height;
    switch (media.tagName) {
      case "IMG":
        width = media.naturalWidth;
        height = media.naturalHeight;
        break;
      case "VIDEO":
        width = media.videoWidth;
        height = media.videoHeight;
        break;
    }
    if (width > 0 && height > 0) {
      setHeightFromRatio(media, width / height);
    } else {
      setFallbackHeight(media);
    }
  }

  const medias = document.querySelectorAll("img");
  for (media of medias) {
    if (media.complete) {
      onMediaLoaded(media);
    } else {
      media.addEventListener("load", () => onMediaLoaded(media));
      media.addEventListener("error", function () {
        setFallbackHeight(media);
      });
    }
  }
}

adjustMediaPadding();
window.addEventListener("load", adjustMediaPadding);
window.addEventListener("resize", adjustMediaPadding);

function checkOffsets() {
  const ignoredTagNames = new Set([
    "THEAD",
    "TBODY",
    "TFOOT",
    "TR",
    "TD",
    "TH",
  ]);
  const cell = gridCellDimensions();
  const elements = document.querySelectorAll(
    "body"
  );
  for (const element of elements) {
    if (ignoredTagNames.has(element.tagName)) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      continue;
    }
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;
    const offset = top % (cell.height / 2);
    if (offset > 0) {
      element.classList.add("off-grid");
      console.error(
        "Incorrect vertical offset for",
        element,
        "with remainder",
        top % cell.height,
        "when expecting divisible by",
        cell.height / 2
      );
    } else {
      element.classList.remove("off-grid");
    }
  }
}

// generate anchor links for headers
document.addEventListener("DOMContentLoaded", function () {
  const headers = document.querySelectorAll("h2, h3, h4, h5, h6");
  headers.forEach(function (header) {
    const anchor = document.createElement("a");
    anchor.href = "#" + header.id;
    anchor.className = "header-link";
    anchor.textContent = " 🔗";
    header.appendChild(anchor);
  });
});

// copy to clipboard, anchor links
document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("a.header-link");
  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const href = link.getAttribute("href");
      const fullUrl = window.location.origin + window.location.pathname + href;
      navigator.clipboard
        .writeText(fullUrl)
        .then(() => {
          window.location.href = href;
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    });
  });
});
