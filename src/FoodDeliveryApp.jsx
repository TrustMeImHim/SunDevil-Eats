import React, { useMemo, useState } from 'react';
import { ShoppingCart, MapPin, Clock, Truck } from 'lucide-react';

/**
 * SunDevil Eats — Meal Prep Builder (Pickup-first + Tempe delivery)
 * - Campus selection gate
 * - Build “bags” (pre-made meals) with Chef's Choice or Custom selections
 * - Quick 3-pack / 5-pack bundles
 * - Pickup time; Delivery only if campus === "Tempe"
 * - Cart groups items by Bag # and totals with discounts & upcharges
 *
 * Styling: uses your existing .app-bg, .container, .card, .btn, .btn-maroon, .btn-grad, .input, .label, .grid, etc.
 * If something looks off, tweak App.css (no Tailwind needed).
 */

const CAMPUSES = [
    { id: 'Tempe', label: 'Tempe (Pickup + Delivery)', delivery: true },
    { id: 'West', label: 'West (Pickup Only)', delivery: false },
    { id: 'Polytechnic', label: 'Polytechnic (Pickup Only)', delivery: false },
    { id: 'Downtown', label: 'Downtown (Pickup Only)', delivery: false },
];

// Builder options
const BASE_PRICE = 8.99;           // Chef’s Choice
const CUSTOM_UPCHARGE = 1.5;       // Custom build
const STEAK_UPCHARGE = 2.0;        // Additional if steak selected
const BUNDLE_DISCOUNTS = { 3: 1.5, 5: 4.0 }; // dollars off total for quick bundles

const PROTEINS = [
    { id: 'chicken', label: 'Chicken' },
    { id: 'beef', label: 'Lean Beef' },
    { id: 'steak', label: 'Steak (+$2)' },
    { id: 'tofu', label: 'Tofu' },
];

const CARBS = [
    { id: 'rice', label: 'Brown Rice' },
    { id: 'quinoa', label: 'Quinoa' },
    { id: 'pasta', label: 'Whole-wheat Pasta' },
];

const VEGGIES = [
    { id: 'broccoli', label: 'Broccoli' },
    { id: 'asparagus', label: 'Asparagus' },
    { id: 'mix', label: 'Mixed Veg' },
];

const SAUCES = [
    { id: 'none', label: 'No sauce' },
    { id: 'teriyaki', label: 'Teriyaki' },
    { id: 'chipotle', label: 'Chipotle Lime' },
    { id: 'alfredo', label: 'Light Alfredo' },
];

export default function FoodDeliveryApp() {
    // global UI
    const [view, setView] = useState('home'); // 'home' | 'build' | 'cart'
    const [campus, setCampus] = useState(null);

    // order mode
    const [fulfillment, setFulfillment] = useState('pickup'); // 'pickup' | 'delivery' (delivery only at Tempe)
    const [pickupTime, setPickupTime] = useState('Today 5:00–5:30 PM');
    const [address, setAddress] = useState('');

    // cart of “bags”
    const [bags, setBags] = useState([]); // each bag = {id, preset:'chef'|'custom', protein, carb, veg, sauce, price}

    // builder state (one bag editor)
    const [preset, setPreset] = useState('chef'); // 'chef' | 'custom'
    const [protein, setProtein] = useState('chicken');
    const [carb, setCarb] = useState('rice');
    const [veg, setVeg] = useState('broccoli');
    const [sauce, setSauce] = useState('none');

    // compute bag price
    const currentBagPrice = useMemo(() => {
        let p = BASE_PRICE;
        if (preset === 'custom') p += CUSTOM_UPCHARGE;
        if (preset === 'custom' && protein === 'steak') p += STEAK_UPCHARGE;
        return p;
    }, [preset, protein]);

    const addBag = (bag) => {
        setBags((prev) => [...prev, { ...bag, id: `bag-${prev.length + 1}` }]);
    };

    const handleAddCurrentBag = () => {
        if (preset === 'chef') {
            // Chef’s choice = defaults, no custom upcharge, no steak upcharge
            addBag({
                preset: 'chef',
                protein: 'chef-choice',
                carb: 'chef-choice',
                veg: 'chef-choice',
                sauce: 'chef-choice',
                price: BASE_PRICE,
            });
        } else {
            addBag({
                preset: 'custom',
                protein,
                carb,
                veg,
                sauce,
                price: currentBagPrice,
            });
        }
    };

    const removeBag = (id) => setBags((prev) => prev.filter((b) => b.id !== id));

    const clearBuilder = () => {
        setPreset('chef');
        setProtein('chicken');
        setCarb('rice');
        setVeg('broccoli');
        setSauce('none');
    };

    // Quick bundles
    const addBundle = (count) => {
        const items = Array.from({ length: count }).map(() => ({
            preset: 'chef',
            protein: 'chef-choice',
            carb: 'chef-choice',
            veg: 'chef-choice',
            sauce: 'chef-choice',
            price: BASE_PRICE,
        }));
        setBags((prev) => {
            const start = prev.length;
            const withIds = items.map((b, i) => ({ ...b, id: `bag-${start + i + 1}` }));
            return [...prev, ...withIds];
        });
    };

    // Totals
    const subtotal = useMemo(() => bags.reduce((s, b) => s + b.price, 0), [bags]);

    const bundleDiscount = useMemo(() => {
        // apply the biggest matching discount (3-pack or 5-pack) per threshold
        let discount = 0;
        const n = bags.length;
        // allow stacking: e.g., 5-pack discount applies once for each multiple of 5; leftover 3-pack discount applies for remainder
        if (n >= 5) {
            const fives = Math.floor(n / 5);
            discount += fives * BUNDLE_DISCOUNTS[5];
            const rem = n % 5;
            if (rem >= 3) discount += BUNDLE_DISCOUNTS[3];
        } else if (n >= 3) {
            const threes = Math.floor(n / 3);
            discount += threes * BUNDLE_DISCOUNTS[3];
        }
        return discount;
    }, [bags.length]);

    const total = Math.max(0, subtotal - bundleDiscount);

    const canDeliver = campus && CAMPUSES.find((c) => c.id === campus)?.delivery;

    const placeOrder = () => {
        if (!campus) return alert('Pick a campus first!');
        if (bags.length === 0) return alert('Add at least one meal bag.');

        if (fulfillment === 'delivery') {
            if (!canDeliver) return alert('Delivery is Tempe-campus only.');
            if (!address.trim()) return alert('Enter a delivery address.');
        }

        const lines = bags
            .map((b, idx) => {
                if (b.preset === 'chef') return `Bag #${idx + 1}: Chef's Choice ($${b.price.toFixed(2)})`;
                return `Bag #${idx + 1}: ${labelFor(PROTEINS, b.protein)} + ${labelFor(CARBS, b.carb)} + ${labelFor(VEGGIES, b.veg)} (${labelFor(SAUCES, b.sauce)}) — $${b.price.toFixed(2)}`;
            })
            .join('\n');

        const method =
            fulfillment === 'pickup'
                ? `Pickup at ${campus} — ${pickupTime}`
                : `Delivery (Tempe) — ${address}`;

        alert(
            `Order placed! 🎉\n\nCampus: ${campus}\nMethod: ${method}\n\nItems:\n${lines}\n\nSubtotal: $${subtotal.toFixed(
                2
            )}\nBundle Discount: -$${bundleDiscount.toFixed(2)}\nTotal: $${total.toFixed(2)}`
        );

        // reset
        setBags([]);
        clearBuilder();
        setView('home');
    };

    // Utils
    function labelFor(list, id) {
        return list.find((x) => x.id === id)?.label || id;
    }

    // UI SECTIONS -------------------------------------------------------------

    const Home = () => (
        <div className="card">
            <h1 className="title">🔱 SunDevil Eats — Meal Prep</h1>
            <p className="subtitle">Healthy, bagged meals for students | grab & go from your campus store.</p>

            {/* Campus Picker */}
            <div className="card-lite" style={{ marginTop: 12 }}>
                <label className="label"><MapPin size={16} /> Choose Campus</label>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {CAMPUSES.map((c) => (
                        <button
                            key={c.id}
                            className={`btn ${campus === c.id ? 'btn-maroon' : 'btn-lite'}`}
                            onClick={() => {
                                setCampus(c.id);
                                setFulfillment('pickup');
                            }}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
                {campus && (
                    <p className="muted" style={{ marginTop: 8 }}>
                        {canDeliver ? 'Delivery available at Tempe or choose pickup.' : 'Pickup only at this campus.'}
                    </p>
                )}
            </div>

            {/* Fulfillment */}
            {campus && (
                <div className="card-lite" style={{ marginTop: 12 }}>
                    <label className="label"><Truck size={16} /> Fulfillment</label>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                        <button
                            className={`btn ${fulfillment === 'pickup' ? 'btn-maroon' : 'btn-lite'}`}
                            onClick={() => setFulfillment('pickup')}
                        >
                            Pickup
                        </button>
                        <button
                            className={`btn ${fulfillment === 'delivery' ? 'btn-maroon' : 'btn-lite'}`}
                            onClick={() => setFulfillment('delivery')}
                            disabled={!canDeliver}
                            title={!canDeliver ? 'Delivery is Tempe-only' : 'Delivery (Tempe)'}
                        >
                            Delivery {canDeliver ? '' : '(Tempe only)'}
                        </button>
                    </div>

                    {fulfillment === 'pickup' ? (
                        <div style={{ marginTop: 10 }}>
                            <label className="label"><Clock size={16} /> Pickup Time</label>
                            <select className="input" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}>
                                <option>Today 4:00–4:30 PM</option>
                                <option>Today 5:00–5:30 PM</option>
                                <option>Today 6:00–6:30 PM</option>
                                <option>Tomorrow 12:00–12:30 PM</option>
                            </select>
                        </div>
                    ) : (
                        <div style={{ marginTop: 10 }}>
                            <label className="label"><MapPin size={16} /> Delivery Address (Tempe)</label>
                            <input
                                className="input"
                                placeholder="e.g., Tooker House, 500 E University Dr"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-grad" onClick={() => setView('build')} disabled={!campus}>
                    Build Meal Bags
                </button>
                <button className="btn btn-lite" onClick={() => setView('cart')}>
                    View Cart ({bags.length})
                </button>
            </div>
        </div>
    );

    const Builder = () => (
        <div className="card">
            <h2 className="section-title">🧑‍🍳 Build Your Bag</h2>
            <p className="muted">Chef’s Choice is fastest & cheapest. Custom lets you swap components (steak +$2).</p>

            {/* Preset toggle */}
            <div className="card-lite" style={{ marginTop: 8 }}>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                    <button className={`btn ${preset === 'chef' ? 'btn-maroon' : 'btn-lite'}`} onClick={() => setPreset('chef')}>
                        Chef’s Choice — ${BASE_PRICE.toFixed(2)}
                    </button>
                    <button className={`btn ${preset === 'custom' ? 'btn-maroon' : 'btn-lite'}`} onClick={() => setPreset('custom')}>
                        Custom (+${CUSTOM_UPCHARGE.toFixed(2)})
                    </button>
                </div>
            </div>

            {/* Custom controls */}
            {preset === 'custom' && (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
                    <div>
                        <label className="label">Protein</label>
                        <select className="input" value={protein} onChange={(e) => setProtein(e.target.value)}>
                            {PROTEINS.map((p) => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Carb</label>
                        <select className="input" value={carb} onChange={(e) => setCarb(e.target.value)}>
                            {CARBS.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Veggie</label>
                        <select className="input" value={veg} onChange={(e) => setVeg(e.target.value)}>
                            {VEGGIES.map((v) => (
                                <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Sauce</label>
                        <select className="input" value={sauce} onChange={(e) => setSauce(e.target.value)}>
                            {SAUCES.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Price + Add */}
            <div className="card-lite" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <strong>Price:</strong>{' '}
                    {preset === 'chef' ? `$${BASE_PRICE.toFixed(2)}` : `$${currentBagPrice.toFixed(2)}`}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-grad" onClick={() => { handleAddCurrentBag(); }}>
                        + Add Bag
                    </button>
                    <button className="btn btn-lite" onClick={clearBuilder}>Reset</button>
                </div>
            </div>

            {/* Quick bundles */}
            <div className="card-lite" style={{ marginTop: 8 }}>
                <label className="label">Quick Add Bundles (Chef’s Choice)</label>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <button className="btn btn-lite" onClick={() => addBundle(3)}>
                        3-Pack — save ${BUNDLE_DISCOUNTS[3].toFixed(2)}
                    </button>
                    <button className="btn btn-lite" onClick={() => addBundle(5)}>
                        5-Pack — save ${BUNDLE_DISCOUNTS[5].toFixed(2)}
                    </button>
                </div>
            </div>

            {/* Cart preview */}
            <div className="card-lite" style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3>Your Bags</h3>
                    <button className="btn btn-maroon" onClick={() => setView('cart')}>
                        <ShoppingCart size={16} /> Cart ({bags.length})
                    </button>
                </div>

                {bags.length === 0 ? (
                    <p className="muted">No bags yet. Add one above or use a quick bundle.</p>
                ) : (
                    <ul style={{ marginTop: 8 }}>
                        {bags.map((b, i) => (
                            <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                <span>
                  <strong>Bag #{i + 1}:</strong>{' '}
                    {b.preset === 'chef'
                        ? "Chef's Choice"
                        : `${labelFor(PROTEINS, b.protein)} + ${labelFor(CARBS, b.carb)} + ${labelFor(VEGGIES, b.veg)} (${labelFor(SAUCES, b.sauce)})`}
                </span>
                                <span>
                  ${b.price.toFixed(2)}{' '}
                                    <button className="btn btn-lite" onClick={() => removeBag(b.id)} style={{ marginLeft: 8 }}>Remove</button>
                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Subtotals */}
            <div className="card-lite" style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1a7f37' }}>
                    <span>Bundle Discount</span>
                    <strong>- ${bundleDiscount.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', marginTop: 6, paddingTop: 6 }}>
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-lite" onClick={() => setView('home')}>← Back</button>
                <button className="btn btn-grad" onClick={() => setView('cart')}>
                    Review & Checkout
                </button>
            </div>
        </div>
    );

    const Cart = () => (
        <div className="card">
            <h2>🛒 Checkout</h2>

            <div className="card-lite" style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Campus</span>
                    <strong>{campus || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span>Method</span>
                    <strong>
                        {fulfillment === 'pickup'
                            ? `Pickup — ${pickupTime}`
                            : 'Delivery (Tempe only)'}
                    </strong>
                </div>
            </div>

            {fulfillment === 'delivery' && canDeliver && (
                <div className="card-lite" style={{ marginTop: 8 }}>
                    <label className="label"><MapPin size={16} /> Delivery Address (Tempe)</label>
                    <input
                        className="input"
                        placeholder="e.g., 123 E Lemon St, Tempe, AZ"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
            )}

            <div className="card-lite" style={{ marginTop: 8 }}>
                <h3>Bags</h3>
                {bags.length === 0 ? (
                    <p className="muted">No items. Go back and add bags.</p>
                ) : (
                    <ul style={{ marginTop: 6 }}>
                        {bags.map((b, i) => (
                            <li key={b.id} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>Bag #{i + 1}:</strong>{' '}
                      {b.preset === 'chef'
                          ? "Chef's Choice"
                          : `${labelFor(PROTEINS, b.protein)} + ${labelFor(CARBS, b.carb)} + ${labelFor(VEGGIES, b.veg)} (${labelFor(SAUCES, b.sauce)})`}
                  </span>
                                    <strong>${b.price.toFixed(2)}</strong>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="card-lite" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1a7f37' }}>
                    <span>Bundle Discount</span>
                    <strong>- ${bundleDiscount.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', marginTop: 6, paddingTop: 6 }}>
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-lite" onClick={() => setView('build')}>← Back</button>
                <button className="btn btn-grad" onClick={placeOrder} disabled={bags.length === 0}>
                    Place Order
                </button>
            </div>
        </div>
    );

    // RENDER
    return (
        <div className="app-bg">
            <div className="container">
                <div className="card header" style={{ marginBottom: 12 }}>
                    <div>
                        <h1 className="title">🔱 SunDevil Eats</h1>
                        <p className="subtitle">Campus Meal Prep — bagged, ready to grab.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-lite" onClick={() => setView('home')}>Campus</button>
                        <button className="btn btn-maroon" onClick={() => setView('cart')}>
                            <ShoppingCart size={16} /> Cart ({bags.length})
                        </button>
                    </div>
                </div>

                {view === 'home' && <Home />}
                {view === 'build' && <Builder />}
                {view === 'cart' && <Cart />}

                {/* Footer credit for images if you add any later */}
                <footer style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#aaa', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                    Photos courtesy of <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: '#8c1d40', textDecoration: 'none' }}>Unsplash</a>
                </footer>
            </div>
        </div>
    );
}
