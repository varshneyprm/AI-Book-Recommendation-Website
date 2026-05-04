/*
    Client-Side Telemetry Agent
    Purpose: Silently monitors user behavior on the frontend and transmits data packets to the backend to train the recommendation algorithms.
    Philosophy: Operates entirely in the background without generating intrusive loading spinners or interrupting the user's reading experience.
*/
document.addEventListener('DOMContentLoaded', () => {

    // Asynchronous network function responsible for transmitting the behavioral data silently
    const sendTelemetry = async (bookId, interactionType, rating = null) => {
        try {
            await fetch('/api/telemetry/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ bookId, interactionType, rating }) // Serializes the payload for the backend parser
            });
        } catch (error) {
            console.error('Telemetry stream interrupted.'); // Logs failures to the browser console but does not throw user-facing errors
        }
    };

    // Parses the browser's current URL string to dynamically identify which book the user is viewing
    const pathParts = window.location.pathname.split('/');
    let currentBookId = null;

    // Validates that the user is actually on a book detail page before attempting extraction
    if (pathParts.length >= 3 && pathParts[1] === 'book') {
        currentBookId = pathParts[2];
    }

    // Implements a timed logic gate to differentiate between meaningful reading and accidental clicks (bounce traffic)
    if (currentBookId) {
        setTimeout(() => {
            sendTelemetry(currentBookId, 'view'); // Transmits the 'view' event only if the user remains on the page for three seconds
        }, 3000);
    }

    // Binds event listeners to the primary interface controls
    const wishlistBtn = document.getElementById('btn-wishlist');
    const readingBtn = document.getElementById('btn-reading');

    if (wishlistBtn && currentBookId) {
        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Intercepts default form behaviors
            sendTelemetry(currentBookId, 'wishlist');

            // Instantly modifies the Button's DOM properties to provide positive psychological feedback to the user
            wishlistBtn.textContent = '✓ Added to Wishlist';
            wishlistBtn.classList.replace('text-indigo-600', 'text-green-600');
            wishlistBtn.classList.replace('border-indigo-100', 'border-green-600');
        });
    }

    if (readingBtn && currentBookId) {
        readingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendTelemetry(currentBookId, 'currently_reading');

            // Applies success state styling to confirm the interaction was registered
            readingBtn.textContent = '✓ Now Reading';
            readingBtn.classList.replace('bg-indigo-600', 'bg-green-600');
            readingBtn.classList.replace('hover:bg-indigo-700', 'hover:bg-green-700');
        });
    }
});