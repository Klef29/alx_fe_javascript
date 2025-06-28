let quotes = [];
let serverQuotes = [];

// Load local quotes from storage or set default
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
      { text: "Don't watch the clock; do what it does. Keep going.", category: "Motivation" },
      { text: "First, solve the problem. Then, write the code.", category: "Programming" }
    ];
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display one random quote
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const filtered = getFilteredQuotes();

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Create add-quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes";
  exportButton.onclick = exportToJson;

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  const categorySelect = document.createElement("select");
  categorySelect.id = "categoryFilter";
  categorySelect.addEventListener("change", filterQuotes);

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(exportButton);
  formContainer.appendChild(importInput);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(document.createTextNode("Filter by category:"));
  formContainer.appendChild(categorySelect);

  document.body.appendChild(formContainer);
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    displayRandomQuote();

    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Export to JSON file
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        displayRandomQuote();
        showNotification("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(file);
}

// Get all unique categories
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const selected = localStorage.getItem("selectedCategory") || "all";
  const categories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selected) option.selected = true;
    select.appendChild(option);
  });
}

// Get filtered quotes by category
function getFilteredQuotes() {
  const selected = document.getElementById("categoryFilter")?.value || "all";
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

// Filter quotes on selection
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  displayRandomQuote();
}

// Show notification bar
function showNotification(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.background = "#fffae6";
  div.style.border = "1px solid #ffc107";
  div.style.padding = "10px";
  div.style.margin = "10px 0";
  div.style.fontSize = "14px";
  div.style.color = "#333";
  document.body.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

// Simulate server update every 15s
function fetchFromServer() {
  setTimeout(() => {
    const serverNewQuote = {
      text: `Server Quote at ${new Date().toLocaleTimeString()}`,
      category: "Server"
    };
    serverQuotes.push(serverNewQuote);
    syncWithServer();
    showNotification("New quote from server added.");
    fetchFromServer();
  }, 15000);
}

// Merge server quotes into local quotes
function syncWithServer() {
  let added = 0;
  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(local => local.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
      added++;
    }
  });

  if (added > 0) {
    saveQuotes();
    populateCategories();
    displayRandomQuote();
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  displayRandomQuote();
  fetchFromServer();

  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
});
