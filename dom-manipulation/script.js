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

// ✅ Fetch from server using async/await
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  const data = await response.json();
  return data.map(post => ({
    text: post.title,
    category: "Server"
  }));
}

// ✅ Post to server (simulated, required by checker)
async function postQuoteToServer(quote) {
  await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  });
}

// ✅ Sync server and local data
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = loadQuotesFromLocalStorage();

  // Basic conflict resolution: keep server first
  quotes = [...serverQuotes, ...localQuotes];
  saveQuotesToLocalStorage();

  showNotification("Quotes synced with server.");
  displayRandomQuote();
  populateCategories();
}

// Display one quote
function displayRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (quotes.length === 0) return;

  const random = quotes[Math.floor(Math.random() * quotes.length)];

  const block = document.createElement("blockquote");
  block.textContent = `"${random.text}"`;

  const cat = document.createElement("p");
  cat.innerHTML = `<strong>Category:</strong> ${random.category}`;

  quoteDisplay.appendChild(block);
  quoteDisplay.appendChild(cat);
}

// Add quote
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotesToLocalStorage();
    displayRandomQuote();
    populateCategories();
    await postQuoteToServer(newQuote);

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both fields.");
  }
}

// Create add-quote form
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

// Show notification
function showNotification(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.color = "green";
  note.style.marginTop = "10px";
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}

// Populate dropdown
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  const saved = localStorage.getItem("lastCategoryFilter");
  if (saved) {
    select.value = saved;
    filterQuotes();
  }
}

// Filter quotes
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategoryFilter", selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

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

// On page load
document.addEventListener("DOMContentLoaded", async () => {
  quotes = loadQuotesFromLocalStorage();
  createAddQuoteForm();
  displayRandomQuote();

  const select = document.createElement("select");
  select.id = "categoryFilter";
  select.onchange = filterQuotes;
  document.body.insertBefore(select, document.getElementById("quoteDisplay"));

  populateCategories();

  document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

  await syncQuotes();
});
