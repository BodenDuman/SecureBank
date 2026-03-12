import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BankRequest, RequestStatus, PRIORITY_WEIGHT } from '@/types/alerts';
import { mockBankRequests } from '@/data/mockAlerts';

// ──────────────────────────────────────────────
// LocalStorage helpers
// ──────────────────────────────────────────────

const STORAGE_KEY = 'securebank_requests';
/** Bump this version any time the data schema changes (e.g. new fields added) */
const STORAGE_VERSION = 2;
const STORAGE_VERSION_KEY = 'securebank_version';

function loadFromStorage(): BankRequest[] {
    try {
        const storedVersion = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0', 10);
        if (storedVersion < STORAGE_VERSION) {
            // Schema changed — wipe old cache and re-seed from mock data
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
            return [];
        }
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return parsed.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
        }));
    } catch {
        return [];
    }
}

function saveToStorage(requests: BankRequest[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
    } catch {
        // Storage full or unavailable
    }
}

// ──────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────

type Action =
    | { type: 'ADD_REQUEST'; payload: BankRequest }
    | { type: 'DELETE_REQUEST'; payload: string }
    | { type: 'UPDATE_STATUS'; payload: { id: string; status: RequestStatus } }
    | { type: 'TOGGLE_ACTION'; payload: { requestId: string; actionId: string } }
    | { type: 'SET_SELECTED'; payload: string };

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────

interface RequestState {
    requests: BankRequest[];
    selectedId: string;
}

function getInitialState(): RequestState {
    const stored = loadFromStorage();
    // If localStorage is empty (first load or schema migration), seed with mock data
    const seed = stored.length > 0 ? stored : mockBankRequests;
    const sorted = [...seed].sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
    return {
        requests: sorted,
        selectedId: sorted[0]?.id || '',
    };
}

// ──────────────────────────────────────────────
// Reducer
// ──────────────────────────────────────────────

function requestReducer(state: RequestState, action: Action): RequestState {
    switch (action.type) {
        case 'ADD_REQUEST': {
            const newRequests = [action.payload, ...state.requests];
            newRequests.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
            return { ...state, requests: newRequests, selectedId: action.payload.id };
        }

        case 'DELETE_REQUEST': {
            const remaining = state.requests.filter(r => r.id !== action.payload);
            let newSelectedId = state.selectedId;
            // If the deleted request was selected, select the next available one
            if (state.selectedId === action.payload) {
                const deletedIndex = state.requests.findIndex(r => r.id === action.payload);
                if (remaining.length > 0) {
                    // Try to select the next item, or the previous one
                    const nextIndex = Math.min(deletedIndex, remaining.length - 1);
                    newSelectedId = remaining[nextIndex].id;
                } else {
                    newSelectedId = '';
                }
            }
            return { ...state, requests: remaining, selectedId: newSelectedId };
        }

        case 'UPDATE_STATUS':
            return {
                ...state,
                requests: state.requests.map(r =>
                    r.id === action.payload.id ? { ...r, status: action.payload.status } : r
                ),
            };

        case 'TOGGLE_ACTION':
            return {
                ...state,
                requests: state.requests.map(r =>
                    r.id === action.payload.requestId
                        ? {
                            ...r,
                            aiResponse: {
                                ...r.aiResponse,
                                suggestedActions: r.aiResponse.suggestedActions.map(a =>
                                    a.id === action.payload.actionId ? { ...a, checked: !a.checked } : a
                                ),
                            },
                        }
                        : r
                ),
            };

        case 'SET_SELECTED':
            return { ...state, selectedId: action.payload };

        default:
            return state;
    }
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

interface RequestContextValue {
    state: RequestState;
    addRequest: (request: BankRequest) => void;
    deleteRequest: (id: string) => void;
    updateStatus: (id: string, status: RequestStatus) => void;
    toggleAction: (requestId: string, actionId: string) => void;
    setSelected: (id: string) => void;
    getSortedRequests: () => BankRequest[];
}

const RequestContext = createContext<RequestContextValue | undefined>(undefined);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function RequestStoreProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(requestReducer, undefined, getInitialState);

    // Persist to localStorage on every state change
    useEffect(() => {
        saveToStorage(state.requests);
    }, [state.requests]);

    const addRequest = (request: BankRequest) => {
        dispatch({ type: 'ADD_REQUEST', payload: request });
    };

    const deleteRequest = (id: string) => {
        dispatch({ type: 'DELETE_REQUEST', payload: id });
    };

    const updateStatus = (id: string, status: RequestStatus) => {
        dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
    };

    const toggleAction = (requestId: string, actionId: string) => {
        dispatch({ type: 'TOGGLE_ACTION', payload: { requestId, actionId } });
    };

    const setSelected = (id: string) => {
        dispatch({ type: 'SET_SELECTED', payload: id });
    };

    const getSortedRequests = () => {
        return [...state.requests].sort(
            (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
        );
    };

    return (
        <RequestContext.Provider value={{ state, addRequest, deleteRequest, updateStatus, toggleAction, setSelected, getSortedRequests }}>
            {children}
        </RequestContext.Provider>
    );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useRequestStore() {
    const context = useContext(RequestContext);
    if (!context) {
        throw new Error('useRequestStore must be used within a RequestStoreProvider');
    }
    return context;
}
