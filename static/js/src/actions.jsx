import fetch from 'isomorphic-fetch'

export const CREATE_FOLDER = 'CREATE_FOLDER'
export const REQUEST_CREATE_FOLDER = 'REQUEST_CREATE_FOLDER'
export const REQUEST_EDIT_FOLDER = 'REQUEST_EDIT_FOLDER'

export const REQUEST_UPLOAD_FILE = 'UPLOAD_FILE'
export const REQUEST_EDIT_FILE = 'EDIT_FILE'

export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'

export const REQUEST_FOLDER = 'REQUEST_FOLDER'
export const RECEIVE_FOLDER = 'RECEIVE_FOLDER'

export const CHANGE_SORT = 'CHANGE_SORT'

export function uploadFiles(file, container) {
    return dispatch => {
        dispatch(requestUploadFile(file))

        let body = new FormData();
        body.append('tags', file.tags);
        body.append('access_id', file.accessId);
        body.append('write_access_id', file.writeAccessId);
        body.append('parent_guid', file.parentGuid);

        return fetch('/' + elgg.security.addToken('action/pleiofile/upload'), {
            credentials: 'same-origin',
            method: 'POST',
            body
        })
        .then(response => dispatch(fetchFolder(container.guid)))
    }
}

export function editFile(file, container) {
    return dispatch => {
        dispatch(requestEditFile(file))

        let body = new FormData();
        body.append('guid', file.guid);
        body.append('title', file.title);
        body.append('tags', file.tags);
        body.append('access_id', file.accessId);
        body.append('write_access_id', file.writeAccessId);
        body.append('parent_guid', file.parentGuid);

        return fetch('/' + elgg.security.addToken('action/pleiofile/edit_file'), {
            credentials: 'same-origin',
            method: 'POST',
            body
        })
        .then(response => dispatch(fetchFolder(container.guid)))
    }
}

export function editFolder(folder, container) {
    return dispatch => {
        dispatch(requestEditFolder(folder))

        let body = new FormData();
        body.append('guid', folder.guid);
        body.append('title', folder.title);
        body.append('access_id', folder.accessId);
        body.append('write_access_id', folder.writeAccessId);
        body.append('tags', folder.tags);
        body.append('parent_guid', folder.parentGuid);

        return fetch('/' + elgg.security.addToken('action/pleiofile/edit_folder'), {
            credentials: 'same-origin',
            method: 'POST',
            body
        })
        .then(response => dispatch(fetchFolder(container.guid)))
    }
}

export function createFolder(folder, container) {
    return dispatch => {
        dispatch(requestCreateFolder(folder))

        let body = new FormData();
        body.append('title', folder.title);
        body.append('access_id', folder.accessId);
        body.append('write_access_id', folder.writeAccessId);
        body.append('tags', folder.tags);
        body.append('parent_guid', folder.parentGuid);

        return fetch('/' + elgg.security.addToken('action/pleiofile/create_folder'), {
            credentials: 'same-origin',
            method: 'POST',
            body
        })
        .then(response => dispatch(fetchFolder(container.guid)))
    }
}

export function changeSort(sortOn, sortAscending) {
    return {
        type: CHANGE_SORT,
        sortOn,
        sortAscending
    }
}

function requestUploadFile(file) {
    return {
        type: REQUEST_UPLOAD_FILE,
        file
    }
}

function requestEditFile(file) {
    return {
        type: REQUEST_EDIT_FILE,
        file
    }
}

function requestCreateFolder(folder) {
    return {
        type: REQUEST_CREATE_FOLDER,
        folder
    }
}

function requestEditFolder(folder) {
    return {
        type: REQUEST_EDIT_FOLDER,
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