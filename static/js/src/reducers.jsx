import { combineReducers } from 'redux'
import { SHOW_MODAL, HIDE_MODAL, CHANGE_SORT, REQUEST_FOLDER, RECEIVE_FOLDER, RECEIVE_FOLDER_TREE } from './actions'
import { OrderedSet } from 'immutable';
import { sortItems } from './helpers';
import _ from 'lodash';

function modal(state = {
    current: null,
    currentItem: undefined
}, action) {
    switch (action.type) {
        case SHOW_MODAL:
            return _.assign({}, state, {
                current: action.modal,
                currentItem: action.item
            })
        case HIDE_MODAL:
            return _.assign({}, state, {
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
    tree: [],
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
            return _.assign({}, state, {
                sortOn: action.sortOn,
                sortAscending: action.sortAscending,
                children: new OrderedSet(sortItems(state.children, action.sortOn, action.sortAscending))
            })
        case REQUEST_FOLDER:
            return _.assign({}, state, {
                isFetching: true
            })
        case RECEIVE_FOLDER:
            return _.assign({}, state, action.folder, {
                receivedAt: action.receivedAt,
                isFetching: false,
                children: new OrderedSet(sortItems(action.folder.children, state.sortOn, state.sortAscending)),
                offset: action.offset,
                limit: action.limit
            })
        case RECEIVE_FOLDER_TREE:
            return _.assign({}, state, {
                tree: action.tree
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