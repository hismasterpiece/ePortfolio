const STORAGE_KEY = "eportfolio-items";

const defaultItems = [
  {
    title: "Example: Semester 1 Module Outline",
    url: "https://example.com/module-outline",
    categoryPath: "Year 1 / Semester 1",
  },
];

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [...defaultItems];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...defaultItems];
  } catch {
    return [...defaultItems];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function buildTree(items) {
  const root = {};

  for (const item of items) {
    const segments = item.categoryPath
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    let node = root;
    for (const segment of segments) {
      if (!node[segment]) {
        node[segment] = { __items: [] };
      }
      node = node[segment];
    }

    node.__items.push({ title: item.title, url: item.url });
  }

  return root;
}

function createNodeList(node) {
  const list = document.createElement("ul");

  for (const [category, value] of Object.entries(node)) {
    if (category === "__items") {
      continue;
    }

    const item = document.createElement("li");
    const label = document.createElement("span");
    label.className = "category-label";
    label.textContent = category;
    item.appendChild(label);

    if (Array.isArray(value.__items)) {
      for (const doc of value.__items) {
        const docRow = document.createElement("div");
        const link = document.createElement("a");
        link.className = "document-link";
        link.href = doc.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = doc.title;
        docRow.appendChild(link);
        item.appendChild(docRow);
      }
    }

    const childCategories = Object.keys(value).filter((key) => key !== "__items");
    if (childCategories.length > 0) {
      item.appendChild(createNodeList(value));
    }

    list.appendChild(item);
  }

  return list;
}

function render(items) {
  const container = document.getElementById("portfolio-tree");
  container.innerHTML = "";

  if (items.length === 0) {
    container.textContent = "No documents yet.";
    return;
  }

  const tree = buildTree(items);
  container.appendChild(createNodeList(tree));
}

const form = document.getElementById("document-form");
let items = loadItems();
render(items);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const categoryPath = String(formData.get("category") || "").trim();

  if (!title || !url || !categoryPath) {
    return;
  }

  items = [...items, { title, url, categoryPath }];
  saveItems(items);
  render(items);
  form.reset();
});
