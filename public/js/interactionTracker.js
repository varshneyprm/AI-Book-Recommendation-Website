document.addEventListener('DOMContentLoaded', () => {

    // 1. Utility function to send telemetry silently
    const sendTelemetry = async (bookId, interactionType, rating = null) => {
        try {
            await fetch('/api/telemetry/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ bookId, interactionType, rating })
            });
            // No need to alert the user, this is background tracking
        } catch (error) {
            console.error('Telemetry stream interrupted.');
        }
    };

    // Extract Book ID from the current URL (assuming route is /book/:id)
    const pathParts = window.location.pathname.split('/');
    let currentBookId = null;

    if (pathParts.length >= 3 && pathParts[1] === 'book') {
        currentBookId = pathParts[2];
    }

    // 2. View Tracking: Only log a 'view' if they stay on the page for 3+ seconds 
    // (filters out bounce traffic from messing up AI weights)
    if (currentBookId) {
        setTimeout(() => {
            sendTelemetry(currentBookId, 'view');
        }, 3000);
    }

    // 3. Button Tracking: Listen for clicks on the action buttons
    const wishlistBtn = document.getElementById('btn-wishlist');
    const readingBtn = document.getElementById('btn-reading');

    if (wishlistBtn && currentBookId) {
        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendTelemetry(currentBookId, 'wishlist');

            // UI Feedback
            wishlistBtn.textContent = '✓ Added to Wishlist';
            wishlistBtn.classList.replace('text-indigo-600', 'text-green-600');
            wishlistBtn.classList.replace('border-indigo-100', 'border-green-600');
        });
    }

    if (readingBtn && currentBookId) {
        readingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendTelemetry(currentBookId, 'currently_reading');

            // UI Feedback
            readingBtn.textContent = '✓ Now Reading';
            readingBtn.classList.replace('bg-indigo-600', 'bg-green-600');
            readingBtn.classList.replace('hover:bg-indigo-700', 'hover:bg-green-700');
        });
    }
});