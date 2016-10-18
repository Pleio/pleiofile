import fetch from 'isomorphic-fetch'

export const CREATE_FOLDER = 'CREATE_FOLDER'
export const REQUEST_CREATE_FOLDER = 'REQUEST_CREATE_FOLDER'
export const REQUEST_EDIT_FOLDER = 'REQUEST_EDIT_FOLDER'

export const REQUEST_UPLOAD_FILE = 'UPLOAD_FILE'
export const REQUEST_EDIT_FILE = 'EDIT_FILE'

export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'

export const SHOW_ERROR = 'SHOW_ERROR'

export const REQUEST_FOLDER = 'REQUEST_FOLDER'
export const RECEIVE_FOLDER = 'RECEIVE_FOLDER'

export const REQUEST_FOLDER_TREE = 'REQUEST_FOLDER_TREE'
export const RECEIVE_FOLDER_TREE = 'RECEIVE_FOLDER_TREE'

export const CHANGE_SORT = 'CHANGE_SORT'

export function fetchFolder(guid, limit = 100, offset = 0) {
    return dispatch => {
        dispatch(requestFolder())

        return fetch('/pleiofile/browse?containerGuid=' + guid + '&limit=' + limit + '&offset=' + offset, {
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(json => dispatch(receiveFolder(json, limit, offset)))
        .catch(function(error) {
            dispatch(showError(404))
        })
    }
}

function requestFolder() {
    return {
        type: REQUEST_FOLDER
    }
}

function receiveFolder(folder, limit, offset) {
    return {
        type: RECEIVE_FOLDER,
        folder,
        limit: limit,
        offset: offset,
        receivedAt: Date.now()
    }
}

function showError(code) {
    return {
        type: SHOW_ERROR,
        code
    }
}

export function fetchFolderTree(guid) {
    return dispatch => {
        dispatch(requestFolderTree())

        return fetch('/pleiofile/folder_tree?containerGuid=' + guid, {
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(json => dispatch(receiveFolderTree(json)))
    }
}

function requestFolderTree() {
    return {
        type: REQUEST_FOLDER_TREE
    }
}

function receiveFolderTree(tree) {
    return {
        type: RECEIVE_FOLDER_TREE,
        tree
    }
}

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

function requestUploadFile(file) {
    return {
        type: REQUEST_UPLOAD_FILE,
        file
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

        if (file.file) {
            body.append('file', file.file);
        }

        return fetch('/' + elgg.security.addToken('action/pleiofile/edit_file'), {
            credentials: 'same-origin',
            method: 'POST',
            body
        })
        .then(response => dispatch(fetchFolder(container.guid)))
    }
}

function requestEditFile(file) {
    return {
        type: REQUEST_EDIT_FILE,
        file
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
        body.append('update_children', folder.updateChildren);

        return fetch('/' + elgg.security.addToken('action/pleiofile/edit_folder'), {
            credentials: 'same-origin',
            method: 'POST',
            body
        })
        .then(response => {
            dispatch(fetchFolder(container.guid))

            if (_appData['containerGuid']) {
                dispatch(fetchFolderTree(_appData['containerGuid']))
            }
        })
    }
}

function requestEditFolder(folder) {
    return {
        type: REQUEST_EDIT_FOLDER,
        folder
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
        .then(response => {
            dispatch(fetchFolder(container.guid))

            if (_appData['containerGuid']) {
                dispatch(fetchFolderTree(_appData['containerGuid']))
            }
        })
    }
}

function requestCreateFolder(folder) {
    return {
        type: REQUEST_CREATE_FOLDER,
        folder
    }
}

export function changeSort(sortOn, sortAscending) {
    return {
        type: CHANGE_SORT,
        sortOn,
        sortAscending
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