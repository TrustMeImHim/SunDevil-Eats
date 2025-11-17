import React, { useMemo, useState } from 'react';
import { ShoppingCart, MapPin, Clock, Truck, Flame } from 'lucide-react';

/** ================================================================
 * SunDevil Eats — Meal Prep Builder (Chef’s Choice simplified + More Custom)
 * - Campus picker (Tempe = Delivery + Pickup; others = Pickup)
 * - Chef’s Choice: 3-step quick selector with live preview
 * - Custom: expanded proteins/carbs/veggies/sauces/extras
 * - Portion sizes, spice levels, bundle deals, cart + checkout
 * - Uses your existing CSS classes (no Tailwind required)
 * ================================================================ */

const CAMPUSES = [
    { id: 'Tempe', label: 'Tempe (Pickup + Delivery)', delivery: true },
    { id: 'West', label: 'West (Pickup Only)', delivery: false },
    { id: 'Polytechnic', label: 'Polytechnic (Pickup Only)', delivery: false },
    { id: 'Downtown', label: 'Downtown (Pickup Only)', delivery: false },
];

// Pricing
const BASE_PRICE = 13.50;             // Chef’s Choice / Standard
const CUSTOM_UPCHARGE = 1.5;         // Custom build
const STEAK_UPCHARGE = 2.0;          // Steak premium
const SEAFOOD_UPCHARGE = 2.0;        // Salmon/Shrimp premium
const LARGE_UPCHARGE = 2.5;          // Portion Large premium
const DELIVERY_FEE = 2.99;           // Delivery fee (Tempe only)
const BUNDLE_DISCOUNTS = { 3: 1.5, 5: 4.0, 7: 6.5, 10: 10.0 }; // $ off

// Options — expanded
const PROTEINS = [
    { id: 'chicken', label: 'Chicken' },
    { id: 'turkey', label: 'Turkey' },
    { id: 'beef', label: 'Lean Beef' },
    { id: 'steak', label: 'Steak (+$2)' },
    { id: 'salmon', label: 'Salmon (+$2)' },
    { id: 'shrimp', label: 'Shrimp (+$2)' },
    { id: 'tilapia', label: 'Tilapia' },
    { id: 'tofu', label: 'Tofu' },
    { id: 'tempeh', label: 'Tempeh' },
    { id: 'seitan', label: 'Seitan' },
    { id: 'eggs', label: 'Egg Whites' },
    { id: 'vegpatty', label: 'Veggie Patty' },
    { id: 'falafel', label: 'Baked Falafel' },
];
const PREMIUM_PROTEINS = new Set(['steak', 'salmon', 'shrimp']);

const CARBS = [
    { id: 'brownrice', label: 'Brown Rice' },
    { id: 'whiterice', label: 'White Rice' },
    { id: 'quinoa', label: 'Quinoa' },
    { id: 'wildrice', label: 'Wild Rice' },
    { id: 'couscous', label: 'Couscous' },
    { id: 'wwpasta', label: 'Whole-wheat Pasta' },
    { id: 'potatoes', label: 'Roasted Potatoes' },
    { id: 'sweetpotato', label: 'Sweet Potato' },
    { id: 'caulirice', label: 'Cauliflower Rice (low-carb)' },
    { id: 'farro', label: 'Farro' },
    { id: 'tortilla', label: 'Brown Rice Tortilla' },
];

const VEGGIES = [
    { id: 'broccoli', label: 'Broccoli' },
    { id: 'asparagus', label: 'Asparagus' },
    { id: 'greenbeans', label: 'Green Beans' },
    { id: 'zucchini', label: 'Zucchini' },
    { id: 'peppers', label: 'Peppers & Onions' },
    { id: 'mix', label: 'Mixed Veg' },
    { id: 'brussels', label: 'Brussels Sprouts' },
    { id: 'carrots', label: 'Carrots' },
    { id: 'spinach', label: 'Garlic Spinach' },
    { id: 'cabbage', label: 'Shredded Cabbage' },
    { id: 'kale', label: 'Sautéed Kale' },
];

const SAUCES = [
    { id: 'none', label: 'No Sauce' },
    { id: 'teriyaki', label: 'Teriyaki' },
    { id: 'chipotle', label: 'Chipotle Lime' },
    { id: 'alfredo', label: 'Light Alfredo' },
    { id: 'bbq', label: 'BBQ' },
    { id: 'garlicparm', label: 'Garlic Parmesan' },
    { id: 'buffalo', label: 'Buffalo' },
    { id: 'pesto', label: 'Basil Pesto' },
    { id: 'salsa', label: 'Salsa Verde' },
    { id: 'tikka', label: 'Light Tikka' },
    { id: 'tzatziki', label: 'Tzatziki' },
];

const EXTRAS = [
    { id: 'extraprotein', label: 'Extra Protein', price: 2.5 },
    { id: 'doubleveg', label: 'Double Veg', price: 1.0 },
    { id: 'avocado', label: 'Avocado', price: 1.5 },
    { id: 'cheese', label: 'Shredded Cheese', price: 0.75 },
    { id: 'egg', label: 'Fried Egg', price: 1.0 },
    { id: 'picodegallo', label: 'Pico de Gallo', price: 0.5 },
    { id: 'corn', label: 'Roasted Corn', price: 0.5 },
    { id: 'beans', label: 'Black Beans', price: 0.6 },
    { id: 'hummus', label: 'Hummus', price: 1.0 },
];

// Diet presets to prefill custom
const PRESETS = [
    { id: 'highprotein', label: 'High-Protein', config: { protein: 'chicken', carb: 'quinoa',    veg: 'broccoli', sauce: 'garlicparm' } },
    { id: 'keto',        label: 'Keto',         config: { protein: 'beef',    carb: 'caulirice', veg: 'spinach',  sauce: 'pesto' } },
    { id: 'vegan',       label: 'Vegan',        config: { protein: 'tofu',    carb: 'brownrice', veg: 'peppers',  sauce: 'teriyaki' } },
];

/** ---------- Chef's Choice helper ---------- */
const CHEF_GOALS = [
    { id: 'balanced', label: 'Balanced' },
    { id: 'muscle',   label: 'Muscle Gain' },
    { id: 'lowcarb',  label: 'Lower Carb' },
    { id: 'veggie',   label: 'Vegetarian' },
];

const CHEF_CUISINES = [
    { id: 'american', label: 'American' },
    { id: 'mex',      label: 'Mexican' },
    { id: 'asian',    label: 'Asian' },
    { id: 'med',      label: 'Mediterranean' },
];

const CHEF_DISLIKES = [
    { id: 'broccoli',  label: 'No Broccoli' },
    { id: 'asparagus', label: 'No Asparagus' },
    { id: 'peppers',   label: 'No Peppers' },
    { id: 'onions',    label: 'No Onions' },
    { id: 'dairy',     label: 'No Dairy Sauces' },
    { id: 'spicy',     label: 'No Spicy' },
];

/** Given simple Chef choices, return a recommended combo */
function chefRecommend(goal, cuisine, dislikes) {
    const avoid = new Set(dislikes || []);
    const safeVeg = (pref) => {
        const order = [pref, 'spinach', 'greenbeans', 'carrots', 'zucchini', 'mix', 'kale'];
        return order.find(v => !avoid.has(v)) || 'mix';
    };
    const sauceIf = (id, alt) =>
        (avoid.has('dairy') && (id === 'alfredo' || id === 'garlicparm' || id === 'tzatziki')) ? alt : id;

    if (goal === 'muscle') {
        if (cuisine === 'american') return { protein:'chicken', carb:'whiterice', veg: safeVeg('broccoli'), sauce: sauceIf('bbq','pesto') };
        if (cuisine === 'mex')      return { protein:'beef',    carb:'whiterice', veg: safeVeg('peppers'),  sauce: sauceIf('chipotle','salsa') };
        if (cuisine === 'asian')    return { protein:'chicken', carb:'whiterice', veg: safeVeg('broccoli'), sauce: sauceIf('teriyaki','pesto') };
        return                         { protein:'chicken', carb:'quinoa',    veg: safeVeg('spinach'),  sauce: sauceIf('tzatziki','pesto') };
    }
    if (goal === 'lowcarb') {
        if (cuisine === 'american') return { protein:'beef',    carb:'caulirice', veg: safeVeg('greenbeans'), sauce:'garlicparm' };
        if (cuisine === 'mex')      return { protein:'chicken', carb:'caulirice', veg: safeVeg('peppers'),    sauce:'salsa' };
        if (cuisine === 'asian')    return { protein:'shrimp',  carb:'caulirice', veg: safeVeg('broccoli'),   sauce:'teriyaki' };
        return                         { protein:'salmon',  carb:'caulirice', veg: safeVeg('spinach'),    sauce:'pesto' };
    }
    if (goal === 'veggie') {
        if (cuisine === 'american') return { protein:'tofu',    carb:'quinoa',    veg: safeVeg('broccoli'), sauce:'garlicparm' };
        if (cuisine === 'mex')      return { protein:'tempeh',  carb:'brownrice', veg: safeVeg('peppers'),  sauce:'salsa' };
        if (cuisine === 'asian')    return { protein:'tofu',    carb:'whiterice', veg: safeVeg('broccoli'), sauce:'teriyaki' };
        return                         { protein:'falafel', carb:'couscous',  veg: safeVeg('spinach'),  sauce:'tzatziki' };
    }
    // balanced
    if (cuisine === 'american')   return { protein:'chicken', carb:'potatoes',   veg: safeVeg('greenbeans'), sauce:'garlicparm' };
    if (cuisine === 'mex')        return { protein:'chicken', carb:'brownrice',  veg: safeVeg('peppers'),     sauce:'chipotle' };
    if (cuisine === 'asian')      return { protein:'shrimp',  carb:'whiterice',  veg: safeVeg('broccoli'),    sauce:'teriyaki' };
    return                           { protein:'chicken', carb:'farro',      veg: safeVeg('spinach'),     sauce:'pesto' };
}

export default function FoodDeliveryApp() {
    // Views
    const [view, setView] = useState('home'); // 'home' | 'build' | 'cart'
    const [campus, setCampus] = useState(null);

    // Fulfillment
    const [fulfillment, setFulfillment] = useState('pickup'); // 'pickup' | 'delivery'
    const [pickupTime, setPickupTime] = useState('Today 5:00–5:30 PM');
    const [address, setAddress] = useState('');

    // Cart (bags)
    const [bags, setBags] = useState([]); // {id,preset,protein,carb,veg,sauce,portion,spice,extras[],price}

    // Builder — mode tabs
    const [mode, setMode] = useState('chef'); // 'chef' | 'custom'

    // Chef’s Choice simple selectors
    const [chefGoal, setChefGoal] = useState('balanced');
    const [chefCuisine, setChefCuisine] = useState('american');
    const [chefDislikes, setChefDislikes] = useState({}); // id -> bool
    const chefSuggestion = useMemo(() => {
        const dislikesArr = Object.keys(chefDislikes).filter(k => chefDislikes[k]);
        return chefRecommend(chefGoal, chefCuisine, dislikesArr);
    }, [chefGoal, chefCuisine, chefDislikes]);

    // Custom selectors
    const [protein, setProtein] = useState('chicken');
    const [carb, setCarb] = useState('brownrice');
    const [veg, setVeg] = useState('broccoli');
    const [sauce, setSauce] = useState('none');
    const [portion, setPortion] = useState('standard'); // 'standard' | 'large'
    const [spice, setSpice] = useState(0); // 0..3
    const [extras, setExtras] = useState({}); // map id->boolean

    const canDeliver = campus && CAMPUSES.find(c => c.id === campus)?.delivery;

    // Price calc for current bag
    const currentBagPrice = useMemo(() => {
        let p = BASE_PRICE;
        if (mode === 'custom') p += CUSTOM_UPCHARGE;
        if (mode === 'custom' && PREMIUM_PROTEINS.has(protein)) {
            p += protein === 'steak' ? STEAK_UPCHARGE : SEAFOOD_UPCHARGE;
        }
        if (portion === 'large') p += LARGE_UPCHARGE;
        for (const x of EXTRAS) if (extras[x.id]) p += x.price;
        return p;
    }, [mode, protein, portion, extras]);

    const addBag = (bag) =>
        setBags(prev => [...prev, { ...bag, id: `bag-${prev.length + 1}` }]);

    const removeBag = (id) => setBags(prev => prev.filter(b => b.id !== id));

    const toggleExtra = (id) => setExtras(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleChefDislike = (id) => setChefDislikes(prev => ({ ...prev, [id]: !prev[id] }));

    const clearBuilder = () => {
        setMode('chef');
        setProtein('chicken');
        setCarb('brownrice');
        setVeg('broccoli');
        setSauce('none');
        setPortion('standard');
        setSpice(0);
        setExtras({});
        setChefGoal('balanced');
        setChefCuisine('american');
        setChefDislikes({});
    };

    const applyPreset = (config) => {
        setMode('custom');
        setProtein(config.protein);
        setCarb(config.carb);
        setVeg(config.veg);
        setSauce(config.sauce);
    };

    const handleAddCurrentBag = () => {
        if (mode === 'chef') {
            const { protein: p, carb: c, veg: v, sauce: s } = chefSuggestion;
            addBag({
                preset: 'chef',
                protein: p, carb: c, veg: v, sauce: s,
                portion: 'standard',
                spice: 0,
                extras: [],
                price: BASE_PRICE,
            });
        } else {
            const chosenExtras = EXTRAS.filter(x => extras[x.id]).map(x => x.id);
            addBag({
                preset: 'custom',
                protein, carb, veg, sauce, portion, spice,
                extras: chosenExtras,
                price: currentBagPrice,
            });
        }
    };

    // Bundles (stackable)
    const addBundle = (count) => {
        const items = Array.from({ length: count }).map(() => ({
            preset: 'chef',
            ...chefRecommend(chefGoal, chefCuisine, Object.keys(chefDislikes).filter(k => chefDislikes[k])),
            portion: 'standard',
            spice: 0,
            extras: [],
            price: BASE_PRICE,
        }));
        setBags(prev => {
            const start = prev.length;
            const withIds = items.map((b, i) => ({ ...b, id: `bag-${start + i + 1}` }));
            return [...prev, ...withIds];
        });
    };

    // Totals
    const subtotal = useMemo(() => bags.reduce((s, b) => s + b.price, 0), [bags]);

    const bundleDiscount = useMemo(() => {
        let n = bags.length;
        if (n === 0) return 0;
        const order = [10, 7, 5, 3];
        let discount = 0;
        for (const size of order) {
            if (!BUNDLE_DISCOUNTS[size]) continue;
            if (n >= size) {
                const k = Math.floor(n / size);
                discount += k * BUNDLE_DISCOUNTS[size];
                n %= size;
            }
        }
        return discount;
    }, [bags.length]);

    const deliveryFee = useMemo(() => {
        return (fulfillment === 'delivery' && canDeliver) ? DELIVERY_FEE : 0;
    }, [fulfillment, canDeliver]);

    const total = Math.max(0, subtotal - bundleDiscount + deliveryFee);

    // Utils
    const labelFor = (list, id) => list.find(x => x.id === id)?.label || id;
    const describeSpice = (n) => ['None', 'Mild', 'Medium', 'Hot'][n] || 'None';
    const listExtras = (ids) => ids.map(id => EXTRAS.find(x => x.id === id)?.label || id).join(', ') || '—';

    // Place order
    const placeOrder = () => {
        if (!campus) return alert('Pick a campus first!');
        if (bags.length === 0) return alert('Add at least one meal bag.');
        if (fulfillment === 'delivery') {
            if (!canDeliver) return alert('Delivery is Tempe-only.');
            if (!address.trim()) return alert('Enter a delivery address.');
        }

        const lines = bags.map((b, i) => {
            return (
                'Bag #' + (i + 1) + ': ' +
                labelFor(PROTEINS, b.protein) + ' + ' +
                labelFor(CARBS, b.carb) + ' + ' +
                labelFor(VEGGIES, b.veg) + ' (' + labelFor(SAUCES, b.sauce) + '), ' +
                b.portion + ' • Spice: ' + describeSpice(b.spice) +
                ' • Extras: ' + listExtras(b.extras) +
                ' — $' + b.price.toFixed(2)
            );
        }).join('\n');

        const method = fulfillment === 'pickup'
            ? ('Pickup at ' + campus + ' — ' + pickupTime)
            : ('Delivery (Tempe) — ' + address);

        const summaryLines = [
            'Subtotal: $' + subtotal.toFixed(2),
            'Bundle Discount: -$' + bundleDiscount.toFixed(2)
        ];
        if (deliveryFee > 0) {
            summaryLines.push('Delivery Fee: $' + deliveryFee.toFixed(2));
        }
        summaryLines.push('Total: $' + total.toFixed(2));

        alert(
            'Order placed! 🎉\n\n' +
            'Campus: ' + campus + '\n' +
            'Method: ' + method + '\n\n' +
            'Items:\n' + lines + '\n\n' +
            summaryLines.join('\n')
        );

        setBags([]);
        clearBuilder();
        setView('home');
    };

    /** ================== Views ================== */

    const Home = () => (
        <div className="card">
            <h1 className="title">🔱 SunDevil Eats — Meal Prep</h1>
            <p className="subtitle">Healthy, bagged meals for students — grab & go from your campus store.</p>

            {/* Campus */}
            <div className="card-lite" style={{ marginTop: 10 }}>
                <label className="label"><MapPin size={16} /> Choose Campus</label>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {CAMPUSES.map(c => (
                        <button
                            key={c.id}
                            className={`btn ${campus === c.id ? 'btn-maroon' : 'btn-lite'}`}
                            onClick={() => { setCampus(c.id); setFulfillment('pickup'); }}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
                {campus && (
                    <p className="muted" style={{ marginTop: 6 }}>
                        {canDeliver ? 'Delivery available at Tempe or choose pickup.' : 'Pickup only at this campus.'}
                    </p>
                )}
            </div>

            {/* Fulfillment */}
            {campus && (
                <div className="card-lite" style={{ marginTop: 10 }}>
                    <label className="label"><Truck size={16} /> Fulfillment</label>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                        <button className={`btn ${fulfillment === 'pickup' ? 'btn-maroon' : 'btn-lite'}`} onClick={() => setFulfillment('pickup')}>Pickup</button>
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
                        <div style={{ marginTop: 8 }}>
                            <label className="label"><Clock size={16} /> Pickup Time</label>
                            <select className="input" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}>
                                <option>Today 4:00–4:30 PM</option>
                                <option>Today 5:00–5:30 PM</option>
                                <option>Today 6:00–6:30 PM</option>
                                <option>Tomorrow 12:00–12:30 PM</option>
                            </select>
                        </div>
                    ) : (
                        <div style={{ marginTop: 8 }}>
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
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-grad" onClick={() => setView('build')} disabled={!campus}>Build Meal Bags</button>
                <button className="btn btn-lite" onClick={() => setView('cart')}><ShoppingCart size={16}/> Cart ({bags.length})</button>
            </div>
        </div>
    );

    const Builder = () => (
        <div className="card">
            <h2 className="section-title">🧑‍🍳 Build Your Bag</h2>
            <p className="muted">Pick Chef’s Choice for a quick, balanced combo or Custom to pick every item. (Steak/seafood +$2, Large +$2.50)</p>

            {/* Mode */}
            <div className="card-lite" style={{ marginTop: 8 }}>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                    <button className={`btn ${mode === 'chef' ? 'btn-maroon' : 'btn-lite'}`} onClick={() => setMode('chef')}>
                        Chef’s Choice — ${BASE_PRICE.toFixed(2)}
                    </button>
                    <button className={`btn ${mode === 'custom' ? 'btn-maroon' : 'btn-lite'}`} onClick={() => setMode('custom')}>
                        Custom (+${CUSTOM_UPCHARGE.toFixed(2)})
                    </button>
                </div>
            </div>

            {/* ---------- Chef's Choice Simple Flow ---------- */}
            {mode === 'chef' && (
                <div className="card-lite" style={{ marginTop: 12 }}>
                    {/* Step 1: Goal */}
                    <label className="label">1) What’s your goal?</label>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                        {CHEF_GOALS.map(g => (
                            <button
                                key={g.id}
                                className={`btn ${chefGoal === g.id ? 'btn-maroon' : 'btn-lite'}`}
                                onClick={() => setChefGoal(g.id)}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>

                    {/* Step 2: Cuisine */}
                    <label className="label" style={{ marginTop: 10 }}>2) Pick a vibe</label>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                        {CHEF_CUISINES.map(c => (
                            <button
                                key={c.id}
                                className={`btn ${chefCuisine === c.id ? 'btn-maroon' : 'btn-lite'}`}
                                onClick={() => setChefCuisine(c.id)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    {/* Step 3: Dislikes */}
                    <label className="label" style={{ marginTop: 10 }}>3) Anything to avoid?</label>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                        {CHEF_DISLIKES.map(d => (
                            <label key={d.id} className="checkbox-row" style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <input
                                    type="checkbox"
                                    checked={!!chefDislikes[d.id]}
                                    onChange={() => toggleChefDislike(d.id)}
                                />
                                <span>{d.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Live preview */}
                    <div className="card-lite" style={{ marginTop: 12 }}>
                        <strong>Preview:</strong>{' '}
                        {`${labelFor(PROTEINS, chefSuggestion.protein)} + ${labelFor(CARBS, chefSuggestion.carb)} + ${labelFor(VEGGIES, chefSuggestion.veg)} (${labelFor(SAUCES, chefSuggestion.sauce)})`}
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Price: ${BASE_PRICE.toFixed(2)}</span>
                            <button className="btn btn-grad" onClick={handleAddCurrentBag}>+ Add Bag</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Custom Builder ---------- */}
            {mode === 'custom' && (
                <>
                    <div className="card-lite" style={{ marginTop: 12 }}>
                        <label className="label">Quick presets (prefill custom)</label>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                            {PRESETS.map(p => (
                                <button key={p.id} className="btn btn-lite" onClick={() => applyPreset(p.config)}>{p.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
                        <div>
                            <label className="label">Protein</label>
                            <select className="input" value={protein} onChange={(e) => setProtein(e.target.value)}>
                                {PROTEINS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Carb</label>
                            <select className="input" value={carb} onChange={(e) => setCarb(e.target.value)}>
                                {CARBS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Veggie</label>
                            <select className="input" value={veg} onChange={(e) => setVeg(e.target.value)}>
                                {VEGGIES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Sauce</label>
                            <select className="input" value={sauce} onChange={(e) => setSauce(e.target.value)}>
                                {SAUCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Portion + Spice */}
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
                        <div>
                            <label className="label">Portion Size</label>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                <button className={`btn ${portion === 'standard' ? 'btn-maroon' : 'btn-lite'}`} onClick={() => setPortion('standard')}>
                                    Standard
                                </button>
                                <button className={`btn ${portion === 'large' ? 'btn-maroon' : 'btn-lite'}`} onClick={() => setPortion('large')}>
                                    Large (+${LARGE_UPCHARGE.toFixed(2)})
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="label">Spice Level</label>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {[0,1,2,3].map(n => (
                                    <button
                                        key={n}
                                        className={`btn ${spice === n ? 'btn-maroon' : 'btn-lite'}`}
                                        onClick={() => setSpice(n)}
                                        title={['None', 'Mild', 'Medium', 'Hot'][n]}
                                    >
                                        <Flame size={14} /> {['0','1','2','3'][n]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="card-lite" style={{ marginTop: 12 }}>
                        <label className="label">Extras</label>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            {EXTRAS.map(x => (
                                <label key={x.id} className="checkbox-row" style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <input type="checkbox" checked={!!extras[x.id]} onChange={() => toggleExtra(x.id)} />
                                    <span>{x.label}</span>
                                    <span className="muted">+${x.price.toFixed(2)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price + Add */}
                    <div className="card-lite" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <strong>Price:</strong>{' '}
                            {mode === 'chef' ? `$${BASE_PRICE.toFixed(2)}` : `$${currentBagPrice.toFixed(2)}`}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-grad" onClick={handleAddCurrentBag}>+ Add Bag</button>
                            <button className="btn btn-lite" onClick={clearBuilder}>Reset</button>
                        </div>
                    </div>
                </>
            )}

            {/* Quick bundles */}
            <div className="card-lite" style={{ marginTop: 12 }}>
                <label className="label">Quick Add Bundles (Chef’s Choice)</label>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    {[3,5,7,10].map(n => (
                        <button key={n} className="btn btn-lite" onClick={() => addBundle(n)}>
                            {n}-Pack — save ${BUNDLE_DISCOUNTS[n].toFixed(2)}
                        </button>
                    ))}
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
                    {`${labelFor(PROTEINS, b.protein)} + ${labelFor(CARBS, b.carb)} + ${labelFor(VEGGIES, b.veg)} (${labelFor(SAUCES, b.sauce)}), ${b.portion} • Spice: ${describeSpice(b.spice)} • Extras: ${listExtras(b.extras)}`}
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
                {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Delivery Fee</span>
                        <strong>${deliveryFee.toFixed(2)}</strong>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', marginTop: 6, paddingTop: 6 }}>
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                </div>
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-lite" onClick={() => setView('home')}>← Back</button>
                <button className="btn btn-grad" onClick={() => setView('cart')}>Review & Checkout</button>
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
                    <strong>{fulfillment === 'pickup' ? `Pickup — ${pickupTime}` : 'Delivery (Tempe only)'}</strong>
                </div>
            </div>

            {fulfillment === 'delivery' && canDeliver && (
                <div className="card-lite" style={{ marginTop: 8 }}>
                    <label className="label"><MapPin size={16} /> Delivery Address (Tempe)</label>
                    <input className="input" placeholder="e.g., 123 E Lemon St, Tempe, AZ" value={address} onChange={(e) => setAddress(e.target.value)} />
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
                      {`${labelFor(PROTEINS, b.protein)} + ${labelFor(CARBS, b.carb)} + ${labelFor(VEGGIES, b.veg)} (${labelFor(SAUCES, b.sauce)}), ${b.portion} • Spice: ${describeSpice(b.spice)} • Extras: ${listExtras(b.extras)}`}
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
                {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Delivery Fee</span>
                        <strong>${deliveryFee.toFixed(2)}</strong>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', marginTop: 6, paddingTop: 6 }}>
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-lite" onClick={() => setView('build')}>← Back</button>
                <button className="btn btn-grad" onClick={placeOrder} disabled={bags.length === 0}>Place Order</button>
            </div>
        </div>
    );

    // Render
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

                <footer style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#aaa', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                    Photos courtesy of <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: '#8c1d40', textDecoration: 'none' }}>Unsplash</a>
                </footer>
            </div>
        </div>
    );
}
