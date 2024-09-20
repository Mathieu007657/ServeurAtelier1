let selectedCategory = "";
let isEditing = false; // Flag to determine if we are editing

// Render bookmarks in the main list
function renderBookmarks() {
    API_GetBookmarks().then(bookmarks => {
        let filteredBookmarks = selectedCategory ? bookmarks.filter(b => b.Category === selectedCategory) : bookmarks;
        let content = $('#content');
        content.empty();
        filteredBookmarks.forEach(bookmark => {
            let faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.Url).hostname}`;
            let bookmarkHtml = `
                <div class="bookmark-card bg-light p-2 mb-3 d-flex justify-content-between align-items-center bookmark-item">
                    <a href="${bookmark.Url}" target="_blank" class="text-decoration-none text-dark d-flex align-items-center">
                        <img src="${faviconUrl}" alt="Favicon" class="favicon me-2" onerror="this.onerror=null;this.src='bookmark-logo.svg';">
                        <div class="bookmark-info">
                            <h5 class="bookmark-title">${bookmark.Title}</h5>
                            <p class="bookmark-category">${bookmark.Category}</p>
                        </div>
                    </a>
                    <div class="bookmark-actions d-none">
                        <i class="editCmd fa fa-pencil me-2" title="Modifier ${bookmark.Title}" editBookmarkId="${bookmark.Id}"></i>
                        <i class="deleteCmd fa fa-trash" title="Effacer ${bookmark.Title}" deleteBookmarkId="${bookmark.Id}"></i>
                    </div>
                </div>`;
            content.append(bookmarkHtml);
        });

        // Show edit and delete icons on hover
        $('.bookmark-item').hover(
            function () { $(this).find('.bookmark-actions').removeClass('d-none'); },
            function () { $(this).find('.bookmark-actions').addClass('d-none'); }
        );

        // Attach edit and delete actions
        $(".editCmd").on("click", function () {
            let bookmarkId = $(this).attr("editBookmarkId");
            startEditing(bookmarkId);
        });
        $(".deleteCmd").on("click", function () {
            let bookmarkId = $(this).attr("deleteBookmarkId");
            renderDeleteBookmarkForm(bookmarkId);
        });
    });
}

// Render the 'About' section
function renderAbout() {
    $('#content').html(`
        <div class="about-section">
            <h2>À propos de l’application</h2>
            <p>Petite application de gestion de signets à titre de démonstration d'interface utilisateur monopage réactive.</p>
            <p>Auteur: Nicolas Chourot</p>
            <p>Collège Lionel-Groulx, automne 2024</p>
        </div>
    `);
}

// Update the dropdown menu for categories
function updateDropDownMenu(categories) {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="allCatCmd">
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
        </div>
    `));
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append($(`
            <div class="dropdown-item menuItemLayout category" id="category-${category}">
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
            </div>
        `));
    });
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    DDMenu.append($(` 
        <div class="dropdown-item menuItemLayout" id="aboutCmd">
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
        </div>
    `));

    // Event listeners for category filtering and 'About' section
    $('#aboutCmd').on("click", function () { renderAbout(); });
    $('#allCatCmd').on("click", function () { selectedCategory = ""; renderBookmarks(); });
    $('.category').on("click", function () {
        selectedCategory = $(this).text().trim();
        renderBookmarks();
    });
}

// Set the editing mode (toggle between viewing and editing)
function setEditMode(editing) {
    isEditing = editing;
    if (isEditing) {
        $('#abort').removeClass('d-none'); // Show the 'x' icon
        $('#createBookmark').addClass('d-none'); // Hide the 'plus' icon
    } else {
        $('#abort').addClass('d-none'); // Hide the 'x' icon
        $('#createBookmark').removeClass('d-none'); // Show the 'plus' icon
    }
}

// Function to start editing a bookmark
function startEditing(bookmarkId = null) {
    setEditMode(true);
    if (bookmarkId) {
        renderEditBookmarkForm(bookmarkId);
    } else {
        renderCreateBookmarkForm();
    }
}

// Function to stop editing
function stopEditing() {
    setEditMode(false);
    renderBookmarks();
}

// Render the form for creating a new bookmark
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}

// Render the form for editing an existing bookmark
function renderEditBookmarkForm(bookmarkId) {
    API_GetBookmark(bookmarkId).then(bookmark => {
        if (bookmark) {
            renderBookmarkForm(bookmark);
        } else {
            renderError("Erreur: signet introuvable!");
        }
    });
}

function renderBookmarkForm(bookmark = null) {
    let createMode = !bookmark;
    bookmark = bookmark || { Id: 0, Title: "", Url: "", Category: "" };
    let faviconUrl = bookmark.Url ? `https://www.google.com/s2/favicons?domain=${new URL(bookmark.Url).hostname}` : 'bookmark-logo.svg';

    let formHtml = `
        <form id="bookmarkForm" class="bookmark-form">
            <input type="hidden" name="Id" value="${bookmark.Id}">
            <div class="text-center mb-3">
                <img id="faviconPreview" src="${faviconUrl}" alt="Favicon" class="favicon-large" onerror="this.onerror=null;this.src='bookmark-logo.svg';">
            </div>
            <label>Titre</label>
            <input type="text" id="Title" name="Title" class="form-control" value="${bookmark.Title}" required>
            <label>URL</label>
            <input type="url" id="Url" name="Url" class="form-control" value="${bookmark.Url}" required>
            <label>Catégorie</label>
            <input type="text" id="Category" name="Category" class="form-control" value="${bookmark.Category}" required>
            <div class="form-actions mt-3">
                <button type="submit" class="btn btn-primary">${createMode ? "Créer" : "Enregistrer"}</button>
                <button type="button" id="cancel" class="btn btn-secondary">Annuler</button>
            </div>
        </form>
    `;

    $('#content').html(formHtml);

    // Update the favicon preview when URL input changes
    $('#Url').on('input', function () {
        let url = $(this).val();
        if (url) {
            try {
                let newFaviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;
                $('#faviconPreview').attr('src', newFaviconUrl).on('error', function() {
                    // If the favicon fails to load, revert to default
                    $('#faviconPreview').attr('src', 'bookmark-logo.svg');
                });
            } catch (error) {
                // If the URL is invalid, revert to default icon
                $('#faviconPreview').attr('src', 'bookmark-logo.svg');
            }
        } else {
            // Revert to the default icon if the URL field is empty
            $('#faviconPreview').attr('src', 'bookmark-logo.svg');
        }
    });

    // Handle form submission
    $('#bookmarkForm').on("submit", function (e) {
        e.preventDefault();
        let bookmarkData = {
            Id: parseInt($('#Id').val()), // Assure-toi que l'ID est un nombre
            Title: $('#Title').val(),
            Url: $('#Url').val(),
            Category: $('#Category').val()
        };

        // Appelle la fonction API_SaveBookmark avec createMode si l'ID est 0 (nouveau bookmark)
        API_SaveBookmark(bookmarkData, bookmarkData.Id === 0).then(() => stopEditing());
    });

    // Handle cancel button
    $('#cancel').on("click", stopEditing);
}


// Render the delete confirmation form
function renderDeleteBookmarkForm(bookmarkId) {
    API_GetBookmark(bookmarkId).then(bookmark => {
        if (bookmark) {
            let deleteHtml = `
                <div class="delete-confirmation">
                    <h5>Confirmer la suppression du signet suivant:</h5>
                    <div class="bookmark-card">
                        <img src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.Url).hostname}" class="favicon me-2" onerror="this.onerror=null;this.src='bookmark-logo.svg';">
                        <div>
                            <h5>${bookmark.Title}</h5>
                            <p>${bookmark.Category}</p>
                        </div>
                    </div>
                    <button class="btn btn-danger" id="confirmDelete">Supprimer</button>
                    <button class="btn btn-secondary" id="cancelDelete">Annuler</button>
                </div>
            `;
            $('#content').html(deleteHtml);

            // Handle delete confirmation
            $('#confirmDelete').on("click", function () {
                API_DeleteBookmark(bookmarkId).then(() => stopEditing());
            });

            // Handle cancel button
            $('#cancelDelete').on("click", stopEditing);
        } else {
            renderError("Erreur: signet introuvable!");
        }
    });
}

// Render an error message
function renderError(message) {
    $('#content').html(`<div class="error">${message}</div>`);
}

// Start by rendering bookmarks
renderBookmarks();

// Event listener for the create bookmark button
$('#createBookmark').on("click", function () {
    startEditing();
});

// Event listener for the abort (cancel) button
$('#abort').on("click", stopEditing);
