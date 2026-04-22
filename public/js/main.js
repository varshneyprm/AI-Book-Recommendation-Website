document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsGrid = document.getElementById('results-grid');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;

            resultsGrid.innerHTML = '';
            loadingSpinner.classList.remove('hidden');

            try {
                const response = await fetch('/api/books/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                const result = await response.json();
                loadingSpinner.classList.add('hidden');

                if (result.success && result.data.length > 0) {
                    renderBookCards(result.data);
                } else {
                    resultsGrid.innerHTML = `
                        <div class="col-span-full bg-red-50 text-red-600 rounded-xl p-8 text-center border border-red-100">
                            <p class="font-bold text-lg">No matches found by the engine. Try a different query.</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Fetch API Error:', error);
                loadingSpinner.classList.add('hidden');
                resultsGrid.innerHTML = `
                    <div class="col-span-full bg-red-50 text-red-600 rounded-xl p-8 text-center border border-red-100">
                        <p class="font-bold text-lg">System Error: Failed to connect to the recommendation pipeline.</p>
                    </div>
                `;
            }
        });
    }

    function renderBookCards(books) {
        const fragment = document.createDocumentFragment();

        books.forEach(book => {
            const card = document.createElement('a');
            card.href = `/book/${book._id}`;
            card.className = 'group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full border border-gray-100';

            const firstCategory = book.categories && book.categories.length > 0 ? book.categories[0] : 'General';
            const rating = book.averageRating ? `⭐ ${book.averageRating}` : 'New';

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
            fragment.appendChild(card);
        });

        resultsGrid.appendChild(fragment);
    }
});