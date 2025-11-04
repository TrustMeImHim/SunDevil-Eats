import React, {createContext, useContext, useEffect, useMemo, useReducer} from "react";

const CartCtx = createContext(null);

function reducer(state, action) {
    switch (action.type) {
        case "ADD": {
            const { id, name, price = 0, image } = action.item;
            const prev = state.items[id];
            const qty = (prev?.qty ?? 0) + (action.item.qty ?? 1);
            return { ...state, items: { ...state.items, [id]: { id, name, price, image, qty } } };
        }
        case "INC": {
            const it = state.items[action.id]; if (!it) return state;
            return { ...state, items: { ...state.items, [action.id]: { ...it, qty: it.qty + 1 } } };
        }
        case "DEC": {
            const it = state.items[action.id]; if (!it) return state;
            const q = it.qty - 1; const items = { ...state.items };
            if (q <= 0) delete items[action.id]; else items[action.id] = { ...it, qty: q };
            return { ...state, items };
        }
        case "REMOVE": {
            const items = { ...state.items }; delete items[action.id]; return { ...state, items };
        }
        case "CLEAR": return { items: {} };
        case "HYDRATE": return action.state ?? { items: {} };
        default: return state;
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, { items: {} });

    useEffect(() => {
        try {
            const raw = localStorage.getItem("sundevil_cart_v1");
            if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
        } catch {}
    }, []);

    useEffect(() => {
        try { localStorage.setItem("sundevil_cart_v1", JSON.stringify(state)); } catch {}
    }, [state]);

    const totalCount = useMemo(
        () => Object.values(state.items).reduce((n, it) => n + it.qty, 0),
        [state.items]
    );
    const subtotal = useMemo(
        () => Object.values(state.items).reduce((s, it) => s + (it.price || 0) * it.qty, 0),
        [state.items]
    );

    const value = useMemo(() => ({
        items: state.items,
        totalCount,
        subtotal,
        add: (item) => dispatch({ type: "ADD", item }),
        inc: (id) => dispatch({ type: "INC", id }),
        dec: (id) => dispatch({ type: "DEC", id }),
        remove: (id) => dispatch({ type: "REMOVE", id }),
        clear: () => dispatch({ type: "CLEAR" }),
    }), [state, totalCount, subtotal]);

    return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
    const ctx = useContext(CartCtx);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}
