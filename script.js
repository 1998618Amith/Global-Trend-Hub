// Global Variables
let currentCategory = 'all';

// Pagination Variables (පේළි 4 x අයිටම් 4 = එක පිටුවකට 16ක්)
let currentPage = 1;
const itemsPerPage = 16; 

// Modal Gallery Variables
let currentImageList = [];
let currentImageIndex = 0;

// ==========================================
// 1. Thumbnails ක්ලික් කළ විට ප්‍රධාන පින්තූරය මාරු කිරීම
// ==========================================
function changeImage(imageSrc, mainImgId, thumbnailElement) {
    const mainImg = document.getElementById(mainImgId);
    if (mainImg) {
        mainImg.src = imageSrc;
    }
    
    // ක්ලික් කළ Thumbnail එක අයිති Row එක සොයාගෙන Active Class එක මාරු කිරීම
    const parentRow = thumbnailElement ? thumbnailElement.parentElement : null;
    if (parentRow) {
        const thumbnails = parentRow.querySelectorAll('.thumb');
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        thumbnailElement.classList.add('active');
    }
}

// ==========================================
// 2. View Details (See more / Show less) Toggle කිරීම
// ==========================================
function toggleDetails(detailsId, buttonElement) {
    const detailsBox = document.getElementById(detailsId);
    if (!detailsBox) return;

    const parentCard = detailsBox.closest('.product-card');
    const btn = buttonElement || (parentCard ? parentCard.querySelector('.details-btn') : null);

    const isHidden = window.getComputedStyle(detailsBox).display === "none";
    
    detailsBox.style.display = isHidden ? "block" : "none";

    if (parentCard) {
        parentCard.style.zIndex = isHidden ? "20" : "1";
    }

    if (btn) {
        btn.textContent = isHidden ? "Show less" : "See more";
    }
}

// ==========================================
// 3. Category Filter කිරීම
// ==========================================
function filterCategory(category, evt) {
    currentCategory = category;

    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }

    currentPage = 1; // Filter කළ විට 1 වන පිටුවට යෑම
    renderPagination();
    scrollToTop();
}

// ==========================================
// 4. Pagination & Products Display Logic (හැමවෙලාවෙම Bottom Numbers)
// ==========================================
function renderPagination() {
    const cards = Array.from(document.querySelectorAll('.product-card'));
    const searchInput = document.getElementById('searchinput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Category සහ Search එකට ගැලපෙන Products තේරීම
    const filteredCards = cards.filter(card => {
        const cardCategory = card.getAttribute('data-category');
        const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.product-short-desc')?.textContent.toLowerCase() || '';

        const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
        const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    // සියලුම Products Hide කිරීම
    cards.forEach(card => {
        card.style.display = 'none';
        card.classList.add('hide');
    });

    // Current Page එකට අදාළ Products 16 පමණක් Display කිරීම
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const cardsToDisplay = filteredCards.slice(startIndex, endIndex);

    cardsToDisplay.forEach(card => {
        card.style.display = 'flex'; // හෝ 'block' (ඔබගේ CSS Layout එක අනුව)
        card.classList.remove('hide');
    });

    // Total Pages ගණන සෙවීම
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / itemsPerPage));
    const paginationContainer = document.getElementById('pagination');

    if (paginationContainer) {
        paginationContainer.innerHTML = '';

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.classList.add('page-btn');
        prevBtn.innerText = '❮ Prev';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderPagination();
                scrollToTop();
            }
        };
        paginationContainer.appendChild(prevBtn);

        // Page Numbers (1, 2, 3...)
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-btn');
            if (i === currentPage) pageBtn.classList.add('active');
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentPage = i;
                renderPagination();
                scrollToTop();
            };
            paginationContainer.appendChild(pageBtn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('page-btn');
        nextBtn.innerText = 'Next ❯';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPagination();
                scrollToTop();
            }
        };
        paginationContainer.appendChild(nextBtn);

        // ============================================================
        // ** වෙනස් කළ ස්ථානය **: 
        // Pagination Container එක Products-Content එකට පහළින්ම re-append කිරීම.
        // මෙය මගින් Page Numbers සෑම විටම පහළින්ම පවතිනු ඇත.
        // ============================================================
        const productsContent = document.querySelector('.products-content');
        if (productsContent) {
            productsContent.appendChild(paginationContainer);
        }
    }
}

function scrollToTop() {
    const productsContent = document.querySelector('.products-content');
    if (productsContent) {
        productsContent.scrollTop = 0;
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================
// 5. Image Zoom Modal Popup, Arrows & Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // මුලින්ම Load වන විට Pagination පෙන්වීම
    renderPagination();

    // Real-time Search Listener
    const searchInput = document.getElementById('searchinput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderPagination();
        });
    }

    // Modal Popup Listener
    const mainImages = document.querySelectorAll('.product-image-box img');
    const modal = document.getElementById('imageModal');

    mainImages.forEach(img => {
        img.addEventListener('click', function() {
            const imagesAttr = this.getAttribute('data-images');
            if (imagesAttr) {
                currentImageList = imagesAttr.split(',').map(url => url.trim());
            } else {
                currentImageList = [this.src];
            }
            
            const clickedSrc = this.getAttribute('src');
            currentImageIndex = currentImageList.indexOf(clickedSrc);
            if (currentImageIndex === -1) currentImageIndex = 0;

            updateModalContent();

            if (modal) {
                modal.style.display = "block";
            }
        });
    });

    // Keyboard Arrow Keys මඟින් Image මාරු කිරීම
    document.addEventListener('keydown', (e) => {
        if (modal && modal.style.display === "block") {
            if (e.key === "ArrowLeft") changeSlide(-1);
            if (e.key === "ArrowRight") changeSlide(1);
            if (e.key === "Escape") closeModal();
        }
    });
});

// Modal එක ඇතුළේ Image එක සහ Thumbnails Update කරන Function එක
function updateModalContent() {
    const modalImg = document.getElementById('imgModalSrc');
    const modalThumbContainer = document.getElementById('modalThumbnailsRow');

    if (modalImg && currentImageList.length > 0) {
        modalImg.src = currentImageList[currentImageIndex];
    }

    if (modalThumbContainer) {
        modalThumbContainer.innerHTML = '';

        currentImageList.forEach((imgUrl, idx) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.classList.add('modal-thumb');

            if (idx === currentImageIndex) {
                thumb.classList.add('active');
            }

            thumb.addEventListener('click', function() {
                currentImageIndex = idx;
                updateModalContent();
            });

            modalThumbContainer.appendChild(thumb);
        });
    }
}

// ඊතල (Next/Prev) ක්ලික් කළ විට
function changeSlide(direction) {
    if (!currentImageList || currentImageList.length === 0) return;

    currentImageIndex += direction;

    if (currentImageIndex >= currentImageList.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = currentImageList.length - 1;
    }

    updateModalContent();
}

// Modal එක Close කිරීම
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = "none";
    }
}
// Image Change Function
function changeImage(src, mainImgId, element) {
    const mainImg = document.getElementById(mainImgId);
    if (mainImg) {
        mainImg.src = src;
    }
    
    // Active class highlight for thumbnails
    const parentRow = element.parentElement;
    const thumbs = parentRow.getElementsByClassName('thumb');
    for (let thumb of thumbs) {
        thumb.classList.remove('active');
    }
    element.classList.add('active');
}

// Open Modal Zoom on Clicking Main Product Image
document.addEventListener('DOMContentLoaded', () => {
    const mainImages = document.querySelectorAll('.product-image-box img');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imgModalSrc');

    mainImages.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src;
        });
    });
});

// Close Modal Function
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = "none";
    }
}

// Close Modal when clicking outside the image
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Outside Click කළ විට Modal වැසීම
window.addEventListener('click', (event) => {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
});