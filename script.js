/* =====================================================
   VAULT
   FANDOM INFINITE CANVAS
===================================================== */

/* =====================================================
   ELEMENTS
===================================================== */

const homeScreen = document.getElementById("homeScreen");

const vaultScreen = document.getElementById("vaultScreen");

const fandomTrack = document.getElementById("fandomTrack");

const vaultName = document.getElementById("vaultName");

const canvasHint = document.getElementById("canvasHint");

const canvasViewport = document.getElementById("canvasViewport");

const infiniteCanvas = document.getElementById("infiniteCanvas");

const uploadButton = document.getElementById("uploadButton");

const textButton = document.getElementById("textButton");

const editButton = document.getElementById("editButton");

const viewButton = document.getElementById("viewButton");

const editPanel = document.getElementById("editPanel");

const editText = document.getElementById("editText");

const deleteElement = document.getElementById("deleteElement");

const pinElement = document.getElementById("pinElement");

const backHome = document.getElementById("backHome");

const zoomIn = document.getElementById("zoomIn");

const zoomOut = document.getElementById("zoomOut");

const zoomValue = document.getElementById("zoomValue");

const centerCanvas = document.getElementById("centerCanvas");

/* =====================================================
   FRONT PAGE — ADD FANDOM ELEMENTS
===================================================== */

const addFandomButton = document.getElementById("addFandomTop");

const editWorldsButton = document.getElementById("editWorldsButton");

const fandomModal = document.getElementById("fandomModal");

const closeFandomModal = document.getElementById("closeFandomModal");

const cancelFandom = document.getElementById("cancelFandom");

const fandomNameInput = document.getElementById("fandomNameInput");

const fandomImageInput = document.getElementById("fandomImageInput");

const fandomImagePreview = document.getElementById("fandomImagePreview");

const fandomImageError = document.getElementById("fandomImageError");

const createFandom = document.getElementById("createFandom");

/* =====================================================
   MANAGE WORLDS
===================================================== */

const manageWorldsModal = document.getElementById("manageWorldsModal");

const closeManageWorlds = document.getElementById("closeManageWorlds");

const manageWorldsList = document.getElementById("manageWorldsList");

/* =====================================================
   VAULT — ADD IMAGE MODAL ELEMENTS
===================================================== */

const imageModal = document.getElementById("imageModal");

const imageURLInput = document.getElementById("imageURLInput");

const imagePreview = document.getElementById("imagePreview");

const imageError = document.getElementById("imageError");

const addImageConfirm = document.getElementById("addImageConfirm");

const cancelImage = document.getElementById("cancelImage");

const closeImageModal = document.getElementById("closeImageModal");

/* =====================================================
   STATE
===================================================== */

let currentFandom = null;

let selectedElement = null;

let editMode = true;

let zoom = 1;

let panX = 0;
let panY = 0;

let draggingItem = false;

let dragOffsetX = 0;
let dragOffsetY = 0;

let panningCanvas = false;

let panStartX = 0;
let panStartY = 0;

let startPanX = 0;
let startPanY = 0;

/* =====================================================
   STORAGE
===================================================== */

const STORAGE_KEY = "vault.fandom.spaces";

const FANDOMS_KEY = "vault.fandom.list";

function getVaults() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveVaults(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* =====================================================
   FANDOM STORAGE
===================================================== */

function getFandoms() {
  return JSON.parse(localStorage.getItem(FANDOMS_KEY) || "[]");
}

function saveFandoms(fandoms) {
  localStorage.setItem(FANDOMS_KEY, JSON.stringify(fandoms));
}

/* =====================================================
   CREATE UNIQUE FANDOM ID
===================================================== */

function createFandomId(name) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "fandom-" + crypto.randomUUID();
}

/* =====================================================
   OPEN FANDOM
===================================================== */

function attachFandomCard(card) {
  card.addEventListener("click", () => {
    currentFandom = card.dataset.fandom;

    vaultName.textContent = card.dataset.name;

    openVault();
  });
}

/* =====================================================
   ATTACH EXISTING FANDOM CARDS
===================================================== */

document.querySelectorAll(".fandom-card").forEach((card) => {
  attachFandomCard(card);
});

/* =====================================================
   OPEN VAULT
===================================================== */

function openVault() {
  homeScreen.classList.remove("active");

  vaultScreen.classList.add("active");

  canvasHint.textContent = vaultName.textContent;

  resetCanvas();

  loadVault();
}

/* =====================================================
   BACK HOME
===================================================== */

backHome.addEventListener("click", () => {
  saveCurrentVault();

  vaultScreen.classList.remove("active");

  homeScreen.classList.add("active");
});

/* =====================================================
   RESET CANVAS
===================================================== */

function resetCanvas() {
  zoom = 1;

  panX = 0;

  panY = 0;

  updateCanvasTransform();
}

/* =====================================================
   CANVAS TRANSFORM
===================================================== */

function updateCanvasTransform() {
  infiniteCanvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;

  zoomValue.textContent = Math.round(zoom * 100) + "%";
}

/* =====================================================
   CENTER CANVAS
===================================================== */

function centerCanvasOnTitle() {
  if (!canvasHint) return;

  const viewportRect = canvasViewport.getBoundingClientRect();
  const titleRect = canvasHint.getBoundingClientRect();

  // Current visual center of the title
  const titleCenterX = titleRect.left + titleRect.width / 2;
  const titleCenterY = titleRect.top + titleRect.height / 2;

  // Center of the visible canvas
  const viewportCenterX = viewportRect.left + viewportRect.width / 2;

  const viewportCenterY = viewportRect.top + viewportRect.height / 2;

  // Move canvas by the difference
  panX += viewportCenterX - titleCenterX;
  panY += viewportCenterY - titleCenterY;

  updateCanvasTransform();
}

if (centerCanvas) {
  centerCanvas.addEventListener("click", centerCanvasOnTitle);
}

/* =====================================================
   ZOOM
===================================================== */

zoomIn.addEventListener("click", () => {
  zoom = Math.min(2.5, zoom + 0.1);

  updateCanvasTransform();
});

zoomOut.addEventListener("click", () => {
  zoom = Math.max(0.1, zoom - 0.1);

  updateCanvasTransform();
});

/* =====================================================
   LOAD VAULT
===================================================== */

function loadVault() {
  infiniteCanvas.querySelectorAll(".canvas-item").forEach((el) => el.remove());

  const vaults = getVaults();

  const items = vaults[currentFandom] || [];

  items.forEach((item) => {
    createCanvasItem(item, false);
  });
}

/* =====================================================
   SAVE VAULT
===================================================== */

function saveCurrentVault() {
  if (!currentFandom) return;

  const items = [];

  infiniteCanvas.querySelectorAll(".canvas-item").forEach((el) => {
    const item = {
      id: el.dataset.id,

      type: el.dataset.type,

      left: parseFloat(el.style.left),

      top: parseFloat(el.style.top),

      width: el.dataset.width || null,

      text:
        el.dataset.type === "text"
          ? el.querySelector(".text-content").textContent
          : null,

      src: el.dataset.type === "image" ? el.querySelector("img").src : null,
    };

    items.push(item);
  });

  const vaults = getVaults();

  vaults[currentFandom] = items;

  saveVaults(vaults);
}

/* =====================================================
   CREATE CANVAS ITEM
===================================================== */

function createCanvasItem(data, save = true) {
  const element = document.createElement("div");

  element.className = "canvas-item";

  element.dataset.id = data.id || crypto.randomUUID();

  element.dataset.type = data.type;

  element.style.left = `${data.left || 2500}px`;

  element.style.top = `${data.top || 2500}px`;

  /* ===================================================
     IMAGE
  =================================================== */

  if (data.type === "image") {
    const img = document.createElement("img");

    img.src = data.src;

    if (data.width) {
      img.style.width = `${data.width}px`;

      element.dataset.width = data.width;
    }

    element.appendChild(img);
  }

  /* ===================================================
     TEXT
  =================================================== */

  if (data.type === "text") {
    const text = document.createElement("div");

    text.className = "text-item";

    text.contentEditable = false;

    text.innerHTML = `<span class="text-content">${
      data.text || "Your thought..."
    }</span>`;

    element.appendChild(text);
  }

  infiniteCanvas.appendChild(element);

  /* ===================================================
     SELECT
  =================================================== */

  element.addEventListener("click", (e) => {
    if (!editMode) return;

    e.stopPropagation();

    selectElement(element);
  });

  /* ===================================================
     DRAG
  =================================================== */

  element.addEventListener("pointerdown", startItemDrag);

  if (save) {
    saveCurrentVault();
  }

  return element;
}

/* =====================================================
   SELECT ELEMENT
===================================================== */

function selectElement(element) {
  if (selectedElement) {
    selectedElement.classList.remove("selected");
  }

  selectedElement = element;

  selectedElement.classList.add("selected");

  editPanel.classList.remove("hidden");
}

/* =====================================================
   CANVAS CLICK
===================================================== */

infiniteCanvas.addEventListener("click", () => {
  if (selectedElement) {
    selectedElement.classList.remove("selected");

    selectedElement = null;

    editPanel.classList.add("hidden");
  }
});

/* =====================================================
   DRAG ITEMS
===================================================== */

function startItemDrag(e) {
  if (!editMode) return;

  e.stopPropagation();

  const element = e.currentTarget;

  selectElement(element);

  draggingItem = true;

  const rect = infiniteCanvas.getBoundingClientRect();

  const mouseX = (e.clientX - rect.left) / zoom;

  const mouseY = (e.clientY - rect.top) / zoom;

  dragOffsetX = mouseX - parseFloat(element.style.left);

  dragOffsetY = mouseY - parseFloat(element.style.top);

  element.setPointerCapture(e.pointerId);

  element.addEventListener("pointermove", dragItem);

  element.addEventListener("pointerup", stopItemDrag, { once: true });
}

function dragItem(e) {
  if (!draggingItem) return;

  const element = e.currentTarget;

  const rect = infiniteCanvas.getBoundingClientRect();

  const mouseX = (e.clientX - rect.left) / zoom;

  const mouseY = (e.clientY - rect.top) / zoom;

  element.style.left = `${mouseX - dragOffsetX}px`;

  element.style.top = `${mouseY - dragOffsetY}px`;
}

function stopItemDrag(e) {
  draggingItem = false;

  const element = e.currentTarget;

  element.removeEventListener("pointermove", dragItem);

  saveCurrentVault();
}

/* =====================================================
   ADD TEXT
===================================================== */

textButton.addEventListener("click", () => {
  if (!editMode) return;

  const data = {
    id: crypto.randomUUID(),

    type: "text",

    left: 2500 - panX / zoom,

    top: 2500 - panY / zoom,

    text: "Write something...",
  };

  const item = createCanvasItem(data);

  selectElement(item);

  setTimeout(() => {
    editSelectedText();
  }, 50);
});

/* =====================================================
   EDIT TEXT
===================================================== */

editText.addEventListener("click", () => {
  editSelectedText();
});

function editSelectedText() {
  if (!selectedElement) return;

  if (selectedElement.dataset.type !== "text") {
    return;
  }

  const textElement = selectedElement.querySelector(".text-content");

  const newText = prompt("Edit your text:", textElement.textContent);

  if (newText === null) return;

  textElement.textContent = newText;

  saveCurrentVault();
}

/* =====================================================
   DELETE
===================================================== */

deleteElement.addEventListener("click", () => {
  if (!selectedElement) return;

  selectedElement.remove();

  selectedElement = null;

  editPanel.classList.add("hidden");

  saveCurrentVault();
});

/* =====================================================
   PIN
===================================================== */

pinElement.addEventListener("click", () => {
  if (!selectedElement) return;

  selectedElement.classList.toggle("pinned");

  saveCurrentVault();
});

/* =====================================================
   ADD IMAGE MODAL
===================================================== */

/* OPEN */

uploadButton.addEventListener("click", () => {
  if (!editMode) return;

  imageModal.classList.remove("hidden");

  imageURLInput.value = "";

  imageError.textContent = "";

  addImageConfirm.disabled = true;

  imagePreview.innerHTML = `
      <div class="preview-placeholder">

        <i
          data-lucide="image"
          size="25"
        ></i>

        <p>
          Image preview
        </p>

      </div>
    `;

  refreshLucide();

  setTimeout(() => {
    imageURLInput.focus();
  }, 100);
});

/* CLOSE */

function closeImageModalWindow() {
  imageModal.classList.add("hidden");

  imageURLInput.value = "";

  imageError.textContent = "";

  addImageConfirm.disabled = true;
}

closeImageModal.addEventListener("click", closeImageModalWindow);

cancelImage.addEventListener("click", closeImageModalWindow);

/* PREVIEW */

imageURLInput.addEventListener("input", () => {
  const url = imageURLInput.value.trim();

  imageError.textContent = "";

  addImageConfirm.disabled = true;

  if (!url) {
    imagePreview.innerHTML = `
        <div class="preview-placeholder">

          <i
            data-lucide="image"
            size="25"
          ></i>

          <p>
            Image preview
          </p>

        </div>
      `;

    refreshLucide();

    return;
  }

  try {
    new URL(url);
  } catch {
    imageError.textContent = "Please enter a valid URL.";

    return;
  }

  imagePreview.innerHTML = `
      <div class="preview-placeholder">

        <p>
          Loading preview...
        </p>

      </div>
    `;

  const testImage = new Image();

  testImage.onload = () => {
    imagePreview.innerHTML = "";

    const preview = document.createElement("img");

    preview.src = url;

    imagePreview.appendChild(preview);

    addImageConfirm.disabled = false;
  };

  testImage.onerror = () => {
    imagePreview.innerHTML = `
          <div class="preview-placeholder">

            <i
              data-lucide="image-off"
              size="25"
            ></i>

            <p>
              Couldn't load this image
            </p>

          </div>
        `;

    imageError.textContent = "Use a direct image URL.";

    addImageConfirm.disabled = true;

    refreshLucide();
  };

  testImage.src = url;
});

/* ADD TO CANVAS */

addImageConfirm.addEventListener("click", () => {
  const imageURL = imageURLInput.value.trim();

  if (!imageURL) return;

  const data = {
    id: crypto.randomUUID(),

    type: "image",

    left: 2500 - panX / zoom,

    top: 2500 - panY / zoom,

    src: imageURL,
  };

  const item = createCanvasItem(data);

  selectElement(item);

  closeImageModalWindow();
});

/* =====================================================
   EDIT MODE
===================================================== */

editButton.addEventListener("click", () => {
  editMode = true;

  vaultScreen.classList.remove("view-mode");

  setToolbarActive(editButton);
});

/* =====================================================
   VIEW / EDIT TOGGLE
===================================================== */

viewButton.addEventListener("click", () => {
  if (editMode) {
    // Switch to VIEW mode
    editMode = false;

    vaultScreen.classList.add("view-mode");

    if (selectedElement) {
      selectedElement.classList.remove("selected");
    }

    selectedElement = null;

    editPanel.classList.add("hidden");

    setToolbarActive(viewButton);
  } else {
    // Switch back to EDIT mode
    editMode = true;

    vaultScreen.classList.remove("view-mode");

    setToolbarActive(editButton);
  }
});

/* =====================================================
   TOOLBAR ACTIVE STATE
===================================================== */

function setToolbarActive(button) {
  document.querySelectorAll(".tool-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  button.classList.add("active");
}

/* =====================================================
   CANVAS PANNING
===================================================== */

canvasViewport.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".canvas-item")) {
    return;
  }

  panningCanvas = true;

  canvasViewport.classList.add("grabbing");

  panStartX = e.clientX;

  panStartY = e.clientY;

  startPanX = panX;

  startPanY = panY;
});

canvasViewport.addEventListener("pointermove", (e) => {
  if (!panningCanvas) return;

  panX = startPanX + (e.clientX - panStartX);

  panY = startPanY + (e.clientY - panStartY);

  updateCanvasTransform();
});

canvasViewport.addEventListener("pointerup", () => {
  panningCanvas = false;

  canvasViewport.classList.remove("grabbing");
});

canvasViewport.addEventListener("pointercancel", () => {
  panningCanvas = false;

  canvasViewport.classList.remove("grabbing");
});

/* =====================================================
   MOUSE WHEEL ZOOM
===================================================== */

canvasViewport.addEventListener(
  "wheel",
  (e) => {
    if (!e.ctrlKey) return;

    e.preventDefault();

    if (e.deltaY < 0) {
      zoom = Math.min(2.5, zoom + 0.05);
    } else {
      zoom = Math.max(0.5, zoom - 0.05);
    }

    updateCanvasTransform();
  },
  {
    passive: false,
  },
);

/* =====================================================
   HOME CAROUSEL
===================================================== */

const scrollLeft = document.getElementById("scrollLeft");

const scrollRight = document.getElementById("scrollRight");

if (scrollLeft) {
  scrollLeft.addEventListener("click", () => {
    fandomTrack.scrollBy({
      left: -350,

      behavior: "smooth",
    });
  });
}

if (scrollRight) {
  scrollRight.addEventListener("click", () => {
    fandomTrack.scrollBy({
      left: 350,

      behavior: "smooth",
    });
  });
}

/* =====================================================
   FRONT PAGE — ADD FANDOM MODAL
===================================================== */

/* =====================================================
   MANAGE WORLDS
===================================================== */

function openManageWorldsModal() {
  if (!manageWorldsModal) return;

  renderManageWorlds();

  manageWorldsModal.classList.remove("hidden");
}

function renderManageWorlds() {
  if (!manageWorldsList) return;

  const fandoms = getFandoms();

  manageWorldsList.innerHTML = "";

  fandoms.forEach((fandom, index) => {
    const item = document.createElement("div");
    item.draggable = true;

    item.className = "manage-world-item";

    item.dataset.id = fandom.id;

    item.innerHTML = `
      <div class="manage-world-arrows">
  <button
    class="manage-world-up"
    data-id="${escapeHTMLAttribute(fandom.id)}"
    aria-label="Move ${escapeHTMLAttribute(fandom.name)} up"
  >
    <i data-lucide="chevron-up" size="16"></i>
  </button>

  <button
    class="manage-world-down"
    data-id="${escapeHTMLAttribute(fandom.id)}"
    aria-label="Move ${escapeHTMLAttribute(fandom.name)} down"
  >
    <i data-lucide="chevron-down" size="16"></i>
  </button>
</div>

      <div class="manage-world-preview">
        <img
          src="${escapeHTMLAttribute(fandom.image)}"
          alt="${escapeHTMLAttribute(fandom.name)}"
        />
      </div>

      <div class="manage-world-info">
        <span class="manage-world-name">
          ${escapeHTML(fandom.name)}
        </span>
      </div>

      <button
        class="manage-world-edit"
        data-id="${escapeHTMLAttribute(fandom.id)}"
        aria-label="Edit ${escapeHTMLAttribute(fandom.name)}"
      >
        <i data-lucide="pencil" size="16"></i>
      </button>

      <button
        class="manage-world-delete"
        data-id="${escapeHTMLAttribute(fandom.id)}"
        aria-label="Delete ${escapeHTMLAttribute(fandom.name)}"
      >
        <i data-lucide="trash-2" size="16"></i>
      </button>
    `;

    manageWorldsList.appendChild(item);
  });

  refreshLucide();
}

function editWorld(worldId) {
  const fandoms = getFandoms();

  const fandom = fandoms.find((item) => item.id === worldId);

  if (!fandom) return;

  const newName = prompt("World name:", fandom.name);

  if (newName === null) return;

  const name = newName.trim();

  if (!name) return;

  fandom.name = name;

  saveFandoms(fandoms);

  refreshFandomCards();

  renderManageWorlds();
}

manageWorldsList.addEventListener("click", (e) => {
  // EDIT
  const editButton = e.target.closest(".manage-world-edit");

  if (editButton) {
    const worldId = editButton.dataset.id;
    editWorld(worldId);
    return;
  }

  // DELETE
  const deleteButton = e.target.closest(".manage-world-delete");

  if (deleteButton) {
    const worldId = deleteButton.dataset.id;
    deleteWorld(worldId);
    return;
  }
});

/* =====================================================
   REORDER WORLDS
===================================================== */

function moveWorld(worldId, direction) {
  const fandoms = getFandoms();

  const index = fandoms.findIndex((fandom) => fandom.id === worldId);

  if (index === -1) return;

  const newIndex = direction === "up" ? index - 1 : index + 1;

  // Already at the top/bottom
  if (newIndex < 0 || newIndex >= fandoms.length) {
    return;
  }

  // Swap
  [fandoms[index], fandoms[newIndex]] = [fandoms[newIndex], fandoms[index]];

  saveFandoms(fandoms);

  // Refresh both places
  renderManageWorlds();
  refreshFandomCards();
}

manageWorldsList.addEventListener("click", (e) => {
  const upButton = e.target.closest(".manage-world-up");

  if (upButton) {
    moveWorld(upButton.dataset.id, "up");
    return;
  }

  const downButton = e.target.closest(".manage-world-down");

  if (downButton) {
    moveWorld(downButton.dataset.id, "down");
    return;
  }
});

function deleteWorld(worldId) {
  const fandoms = getFandoms();

  const fandom = fandoms.find((item) => item.id === worldId);

  if (!fandom) return;

  const confirmed = confirm(
    `Delete "${fandom.name}"?\n\nThis will also remove everything inside this world.`,
  );

  if (!confirmed) return;

  const updatedFandoms = fandoms.filter((item) => item.id !== worldId);

  saveFandoms(updatedFandoms);

  /* Remove the world itself */
  const card = fandomTrack.querySelector(
    `[data-fandom="${CSS.escape(worldId)}"]`,
  );

  if (card) {
    card.remove();
  }

  /* Remove its vault contents */
  const vaults = getVaults();

  delete vaults[worldId];

  saveVaults(vaults);

  /* Refresh popup */
  renderManageWorlds();
}

if (editWorldsButton) {
  editWorldsButton.addEventListener("click", openManageWorldsModal);
}

function closeManageWorldsModal() {
  if (!manageWorldsModal) return;

  manageWorldsModal.classList.add("hidden");
}

if (closeManageWorlds) {
  closeManageWorlds.addEventListener("click", closeManageWorldsModal);
}

function closeManageWorldsModal() {
  if (!manageWorldsModal) return;

  manageWorldsModal.classList.add("hidden");
}

if (closeManageWorlds) {
  closeManageWorlds.addEventListener("click", closeManageWorldsModal);
}

/* =====================================================
   OPEN MODAL
===================================================== */

function openFandomModal() {
  fandomModal.classList.remove("hidden");

  fandomNameInput.value = "";

  fandomImageInput.value = "";

  fandomImageError.textContent = "";

  createFandom.disabled = true;

  fandomImagePreview.innerHTML = `
    <div class="preview-placeholder">

      <i
        data-lucide="image"
        size="25"
      ></i>

      <p>
        Image preview
      </p>

    </div>
  `;

  refreshLucide();

  setTimeout(() => {
    fandomNameInput.focus();
  }, 100);
}

const addFandomCard = document.getElementById("addFandomCard");

if (addFandomButton) {
  addFandomButton.addEventListener("click", openFandomModal);
}

if (addFandomCard) {
  addFandomCard.addEventListener("click", openFandomModal);
}

/* =====================================================
   CLOSE MODAL
===================================================== */

function closeFandomModalWindow() {
  fandomModal.classList.add("hidden");

  fandomNameInput.value = "";

  fandomImageInput.value = "";

  fandomImageError.textContent = "";

  createFandom.disabled = true;
}

if (closeFandomModal) {
  closeFandomModal.addEventListener("click", closeFandomModalWindow);
}

if (cancelFandom) {
  cancelFandom.addEventListener("click", closeFandomModalWindow);
}

/* =====================================================
   ESCAPE TO CLOSE MODALS
===================================================== */

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  if (fandomModal && !fandomModal.classList.contains("hidden")) {
    closeFandomModalWindow();
    return;
  }

  if (imageModal && !imageModal.classList.contains("hidden")) {
    closeImageModalWindow();
    return;
  }

  if (manageWorldsModal && !manageWorldsModal.classList.contains("hidden")) {
    closeManageWorldsModal();
    return;
  }
});
/* =====================================================
   FANDOM IMAGE PREVIEW
===================================================== */

fandomImageInput.addEventListener("input", () => {
  const url = fandomImageInput.value.trim();

  fandomImageError.textContent = "";

  createFandom.disabled = true;

  if (!url) {
    fandomImagePreview.innerHTML = `
        <div class="preview-placeholder">

          <i
            data-lucide="image"
            size="25"
          ></i>

          <p>
            Image preview
          </p>

        </div>
      `;

    refreshLucide();

    return;
  }

  try {
    new URL(url);
  } catch {
    fandomImageError.textContent = "Please enter a valid image URL.";

    return;
  }

  fandomImagePreview.innerHTML = `
      <div class="preview-placeholder">

        <p>
          Loading preview...
        </p>

      </div>
    `;

  const testImage = new Image();

  testImage.onload = () => {
    fandomImagePreview.innerHTML = "";

    const preview = document.createElement("img");

    preview.src = url;

    preview.alt = "Fandom cover preview";

    fandomImagePreview.appendChild(preview);

    validateFandomForm();
  };

  testImage.onerror = () => {
    fandomImagePreview.innerHTML = `
          <div class="preview-placeholder">

            <i
              data-lucide="image-off"
              size="25"
            ></i>

            <p>
              Couldn't load this image
            </p>

          </div>
        `;

    fandomImageError.textContent = "Use a direct image URL.";

    createFandom.disabled = true;

    refreshLucide();
  };

  testImage.src = url;
});

/* =====================================================
   VALIDATE NAME
===================================================== */

fandomNameInput.addEventListener("input", validateFandomForm);

function validateFandomForm() {
  const name = fandomNameInput.value.trim();

  const imageURL = fandomImageInput.value.trim();

  if (name && imageURL && fandomImagePreview.querySelector("img")) {
    createFandom.disabled = false;
  } else {
    createFandom.disabled = true;
  }
}

/* =====================================================
   CREATE FANDOM
===================================================== */

createFandom.addEventListener("click", () => {
  const name = fandomNameInput.value.trim();

  const imageURL = fandomImageInput.value.trim();

  if (!name || !imageURL) {
    return;
  }

  const fandomId = createFandomId(name);

  const existingFandoms = getFandoms();

  /*
      Prevent duplicate IDs
    */

  let finalId = fandomId;

  if (existingFandoms.some((fandom) => fandom.id === finalId)) {
    finalId = `${fandomId}-${Date.now()}`;
  }

  const fandom = {
    id: finalId,

    name: name,

    image: imageURL,
  };

  /*
      Save fandom
    */

  existingFandoms.push(fandom);

  saveFandoms(existingFandoms);

  /*
      Create visual card
    */

  const card = document.createElement("article");

  card.className = "fandom-card";

  card.dataset.fandom = fandom.id;

  card.dataset.name = fandom.name;

  card.dataset.image = fandom.image;

  card.innerHTML = `

      <div class="fandom-circle">

        <img
          src="${escapeHTMLAttribute(fandom.image)}"
          alt="${escapeHTMLAttribute(fandom.name)}"
        />

        <div class="image-placeholder">

          <i
            data-lucide="sparkles"
            size="28"
          ></i>

        </div>

      </div>

      <h3>
        ${escapeHTML(fandom.name)}
      </h3>

    `;

  /*
      Add to carousel
    */

  fandomTrack.insertBefore(card, addFandomCard);

  /*
      Make card clickable
    */

  attachFandomCard(card);

  /*
      Refresh Lucide icons
    */

  refreshLucide();

  /*
      Close modal
    */

  closeFandomModalWindow();

  /*
      Scroll new fandom into view
    */

  setTimeout(() => {
    card.scrollIntoView({
      behavior: "smooth",

      block: "nearest",

      inline: "center",
    });
  }, 100);
});

/* =====================================================
   LOAD SAVED FANDOMS
===================================================== */

function loadSavedFandoms() {
  const savedFandoms = getFandoms();

  savedFandoms.forEach((fandom) => {
    /*
        Avoid duplicating
        cards already present
        in HTML.
      */

    const existing = fandomTrack.querySelector(
      `[data-fandom="${CSS.escape(fandom.id)}"]`,
    );

    if (existing) return;

    createSavedFandomCard(fandom);
  });

  refreshLucide();
}

/* =====================================================
   CREATE SAVED FANDOM CARD
===================================================== */

function createSavedFandomCard(fandom) {
  const card = document.createElement("article");

  card.className = "fandom-card";

  card.dataset.fandom = fandom.id;

  card.dataset.name = fandom.name;

  card.dataset.image = fandom.image;

  card.innerHTML = `

    <div class="fandom-circle">

      <img
        src="${escapeHTMLAttribute(fandom.image)}"
        alt="${escapeHTMLAttribute(fandom.name)}"
      />

      <div class="image-placeholder">

        <i
          data-lucide="sparkles"
          size="28"
        ></i>

      </div>

    </div>

    <h3>
      ${escapeHTML(fandom.name)}
    </h3>

  `;

  fandomTrack.insertBefore(card, addFandomCard);

  attachFandomCard(card);
}

/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHTMLAttribute(value) {
  return escapeHTML(value);
}

/* =====================================================
   LUCIDE REFRESH
===================================================== */

function refreshLucide() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

/* =====================================================
   INITIALIZE SAVED FANDOMS
===================================================== */

loadSavedFandoms();

/* =====================================================
   INITIAL LUCIDE
===================================================== */

refreshLucide();

/* =====================================================
   SAVE BEFORE LEAVING
===================================================== */

window.addEventListener("beforeunload", () => {
  saveCurrentVault();
});
