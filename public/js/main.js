/*
    Client-Side Search Controller
    Purpose: Intercepts standard form submissions to execute asynchronous search queries against the local API, enabling fluid updates to the Document Object Model (DOM) without forcing a full page reload.
*/
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsGrid = document.getElementById('results-grid');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Halts the browser's default behavior of navigating away from the current page

            const query = searchInput.value.trim();
            if (!query) return; // Aborts execution to save server resources if the search bar is empty

            resultsGrid.innerHTML = ''; // Wipes the previous search results from the screen
            loadingSpinner.classList.remove('hidden'); // Triggers the visual indicator that network activity is occurring

            try {
                // Dispatches the query payload to the internal server endpoint
                const response = await fetch('/api/books/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                const result = await response.json(); // Parses the returning data packet
                loadingSpinner.classList.add('hidden'); // Retracts the visual loading indicator

                // Evaluates the logical success flag and verifies data exists before attempting to render
                if (result.success && result.data.length > 0) {
                    renderBookCards(result.data); // Passes the raw data array to the specialized rendering function
                } else {
                    // Injects an error state into the DOM if the query returns empty
                    resultsGrid.innerHTML = `
                        <div class="col-span-full bg-red-50 text-red-600 rounded-xl p-8 text-center border border-red-100">
                            <p class="font-bold text-lg">No matches found by the engine. Try a different query.</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Fetch API Error:', error);
                loadingSpinner.classList.add('hidden');
                // Injects a critical failure state if the network request fails entirely
                resultsGrid.innerHTML = `
                    <div class="col-span-full bg-red-50 text-red-600 rounded-xl p-8 text-center border border-red-100">
                        <p class="font-bold text-lg">System Error: Failed to connect to the recommendation pipeline.</p>
                    </div>
                `;
            }
        });
    }

    /*
        Dynamic Rendering Engine
        Purpose: Translates raw JSON objects into structured HTML components and inserts them into the interface efficiently.
    */
    function renderBookCards(books) {
        // Utilizes a DocumentFragment to compile all the new HTML in memory before writing it to the actual DOM, vastly improving rendering performance
        const fragment = document.createDocumentFragment();

        // Iterates over every book object returned by the server
        books.forEach(book => {
            const card = document.createElement('a');
            card.href = `/book/${book._id}`; // Dynamically maps the card link to the specific database ID
            card.className = 'group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full border border-gray-100';

            // Applies logical fallbacks in case the external API returned incomplete metadata
            const firstCategory = book.categories && book.categories.length > 0 ? book.categories[0] : 'General';
            const rating = book.averageRating ? ` ${book.averageRating}` : 'New';

            // Constructs the interior HTML structure using template literals
            card.innerHTML = `
                <div class="bg-gray-50 p-6 flex justify-center items-center h-72 border-b border-gray-50">
                    <img src="${book.thumbnail}" alt="Cover of ${book.title}" class="h-full object-cover rounded-lg shadow-lg group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-6 flex-grow flex flex-col">
                    <h3 class="font-black text-xl text-gray-900 mb-2 line-clamp-2 leading-tight">${book.title}</h3>
                    <p class="text-sm text-gray-500 font-semibold mb-4">${book.authors.join(', ')}</p>
                    <div class="mt-auto flex justify-between items-center">
                        <span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full truncate max-w-[60%]">
                            ${firstCategory}
                        </span>
                        <span class="text-sm text-yellow-600 font-black bg-yellow-50 px-3 py-1 rounded-full flex items-center">
                            ${rating}
                        </span>
                    </div>
                </div>
            `;
            fragment.appendChild(card); // Attaches the completed card to the memory fragment
        });

        resultsGrid.appendChild(fragment); // Executes a single, highly efficient write operation to the live DOM
    }
});