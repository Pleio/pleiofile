import { combineReducers } from 'redux'
import { CHANGE_SORT, SHOW_MODAL, HIDE_MODAL, FOLDER_CREATE, FOLDER_EDIT, FILE_EDIT, REQUEST_FOLDER, RECEIVE_FOLDER } from './actions'
import { OrderedSet } from 'immutable';
import { sortItems } from './helpers';

function modal(state = {
    current: null
}, action) {
    switch (action.type) {
        case SHOW_MODAL:
            return Object.assign({}, state, {
                current: action.modal,
            })
        case HIDE_MODAL:
            return Object.assign({}, state, {
                current: null
            })
        default:
            return state
    }
}

function folder(state = {
    isFetching: false,
    title: "",
    children: new OrderedSet,
    sortOn: "title",
    sortAscending: true
}, action) {
    switch (action.type) {
        case CHANGE_SORT:
            return Object.assign({}, state, {
                sortOn: action.sortOn,
                sortAscending: action.sortAscending,
                children: new OrderedSet(sortItems(state.children, action.sortOn, action.sortAscending))
            })
        case REQUEST_FOLDER:
            return Object.assign({}, state, {
                isFetching: true
            })
        case RECEIVE_FOLDER:
            return Object.assign({}, state, action.folder, {
                receivedAt: action.receivedAt,
                isFetching: false,
                children: new OrderedSet(sortItems(action.folder.children, state.sortOn, state.sortAscending))
            })
        default:
            return state
    }
}



const rootReducer = combineReducers({
    modal,
    folder
})

export default rootReducer;