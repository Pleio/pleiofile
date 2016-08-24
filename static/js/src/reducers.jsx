import { combineReducers } from 'redux'
import { SHOW_MODAL, HIDE_MODAL, CHANGE_SORT, REQUEST_FOLDER, RECEIVE_FOLDER } from './actions'
import { OrderedSet } from 'immutable';
import { sortItems } from './helpers';

function modal(state = {
    current: null,
    currentItem: undefined
}, action) {
    switch (action.type) {
        case SHOW_MODAL:
            return Object.assign({}, state, {
                current: action.modal,
                currentItem: action.item
            })
        case HIDE_MODAL:
            return Object.assign({}, state, {
                current: null,
                currentItem: undefined
            })
        default:
            return state
    }
}

function folder(state = {
    isFetching: false,
    title: "",
    breadcrumb: [],
    children: new OrderedSet,
    sortOn: "title",
    sortAscending: true,
    offset: 0,
    limit: 100,
    accessId: 0,
    writeAccessId: 0
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
                children: new OrderedSet(sortItems(action.folder.children, state.sortOn, state.sortAscending)),
                offset: action.offset,
                limit: action.limit
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