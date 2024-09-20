const API_URL = "http://localhost:5000/api/bookmarks";

function API_GetBookmarks() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            method: "GET",
            success: bookmarks => { resolve(bookmarks); },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}

function API_GetBookmark(bookmarkId) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + bookmarkId,
            method: "GET",
            success: bookmark => { resolve(bookmark); },
            error: () => { resolve(null); }
        });
    });
}

function API_SaveBookmark(bookmark, create) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + (create ? "" : "/" + bookmark.Id), // Assurez-vous que bookmark.Id est défini
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(bookmark),
            success: () => { resolve(true); },
            error: () => { resolve(false); }
        });
    });
}


function API_DeleteBookmark(id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + id,
            method: "DELETE",
            success: () => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}
