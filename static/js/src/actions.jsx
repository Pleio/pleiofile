import fetch from 'isomorphic-fetch'

export const CREATE_FOLDER = 'CREATE_FOLDER'
export const REQUEST_CREATE_FOLDER = 'REQUEST_CREATE_FOLDER'

export const EDIT_FOLDER = 'EDIT_FOLDER'

export const EDIT_FILE = 'EDIT_FILE'
export const UPLOAD_FILE = 'UPLOAD_FILE'

export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'

export const REQUEST_FOLDER = 'REQUEST_FOLDER'
export const RECEIVE_FOLDER = 'RECEIVE_FOLDER'

export const CHANGE_SORT = 'CHANGE_SORT'

export function editFile() {
    return {
        type: EDIT_FILE
    }
}

export function editFolder() {
    return {
        type: EDIT_FOLDER
    }
}

export function createFolder(folder, container) {
    return dispatch => {
        dispatch(requestCreateFolder(folder))

        let body = new FormData();
        body.append('title', folder.title);
        body.append('access_id', folder.accessId);
        body.append('tags', folder.tags);
        body.append('parent_guid', folder.parentGuid);

        return fetch('/' + elgg.security.addToken('action/pleiofile/create_folder'), {
            credentials: 'same-origin',
            method: 'POST',
            body
        })
        .then(response => dispatch(fetchFolder(folder.parentGuid)))
    }
}

export function changeSort(sortOn, sortAscending) {
    return {
        type: CHANGE_SORT,
        sortOn,
        sortAscending
    }
}

function requestCreateFolder(folder) {
    return {
        type: REQUEST_CREATE_FOLDER,
        folder
    }
}

export function showModal(modal, item) {
    return {
        type: SHOW_MODAL,
        modal,
        item
    }
}

export function hideModal(modal, item) {
    return {
        type: HIDE_MODAL,
        modal,
        item
    }
}

function requestFolder() {
    return {
        type: REQUEST_FOLDER
    }
}

function receiveFolder(folder) {
    return {
        type: RECEIVE_FOLDER,
        folder,
        receivedAt: Date.now()
    }
}

export function fetchFolder(guid) {
    return dispatch => {
        dispatch(requestFolder())

        return fetch('/pleiofile/browse?containerGuid=' + guid , {
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(json => dispatch(receiveFolder(json)))
    }
}