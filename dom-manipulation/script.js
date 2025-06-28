// Global quote array
let quotes = [];

// Load from localStorage
function loadQuotesFromLocalStorage() {
  const stored = localStorage.getItem("quotes");
  return stored ? JSON.parse(stored) : [];
}

// Save to localStorage
function saveQuotesToLocalStorage() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Fetch quotes from mock server (JSONPlaceholder)
function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
    .then(response => response.json())
    .then(data => {
      // Convert mock data to quote format
      return data.map(post => ({
        text: post.title,
        category: "Server"
      }));
    });
}

// ✅ Sync quotes (server overwrites local)
function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
    const localQuotes = loadQuotesFromLocalStorage();

    // Simple overwrite: server takes priority
    quotes = [...serverQuotes, ...localQuotes];
    saveQuotesToLocalStorage();

    // Optional: notify user
    const notification = document.createElement("div");
    notification.textContent = "Quotes synced with server.";
    notification.style.color = "green";
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);

    displayRandomQuote();
    populateCategories();
  });
}

// Display random quote
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteText = document.createElement("blockquote");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCat = document.createElement("p");
  quoteCat.innerHTML = `<strong>Category:</strong> ${quote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCat);
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotesToLocalStorage();
    displayRandomQuote();
    populateCategories();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both fields.");
  }
}

// Create the form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);

  document.body.appendChild(formContainer);
}

// Populate category filter
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Load last filter
  const saved = localStorage.getItem("lastCategoryFilter");
  if (saved) {
    select.value = saved;
    filterQuotes();
  }
}

// Filter quotes by category
function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategoryFilter", filter);

  const filtered = filter === "all"
    ? quotes
    : quotes.filter(q => q.category === filter);

  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";

  filtered.forEach(quote => {
    const block = document.createElement("blockquote");
    block.textContent = `"${quote.text}"`;

    const cat = document.createElement("p");
    cat.innerHTML = `<strong>Category:</strong> ${quote.category}`;

    display.appendChild(block);
    display.appendChild(cat);
  });
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  quotes = loadQuotesFromLocalStorage();
  displayRandomQuote();
  createAddQuoteForm();
  populateCategories();

  // Show quote on click
  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

  // Optional filter UI
  const select = document.createElement("select");
  select.id = "categoryFilter";
  select.onchange = filterQuotes;
  document.body.insertBefore(select, document.getElementById("quoteDisplay"));

  // Trigger sync
  syncQuotes();
});
