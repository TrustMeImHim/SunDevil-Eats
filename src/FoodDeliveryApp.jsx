import React, { useMemo, useState } from 'react';
import { ShoppingCart, Clock, MapPin, MessageSquare, Sparkles } from 'lucide-react';

const FoodDeliveryApp = () => {
    const [cart, setCart] = useState([]);
    const [view, setView] = useState('menu'); // 'menu' | 'cart' | 'recipe'
    const [selectedSection, setSelectedSection] = useState('Pre-Made Meals');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [servings, setServings] = useState(2);
    const [address, setAddress] = useState('');
    const [orderInstructions, setOrderInstructions] = useState('');
    const [itemNotes, setItemNotes] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    // ----------- Sections -----------
    const sections = [
        { name: 'Pre-Made Meals', icon: '🍱' },
        { name: 'Groceries', icon: '🛒' },
        { name: 'Outside Food', icon: '🍕' },
    ];

    // ----------- Recipes (used for Meal Prep + Macros in Cart) -----------
    const recipes = {
        'Chicken Alfredo': {
            baseServings: 2,
            macrosPerServing: { cal: 700, protein: 38, carbs: 60, fat: 28 },
            ingredients: [
                { name: 'Chicken Breast', qty: '450 g' },
                { name: 'Fettuccine Pasta', qty: '180 g' },
                { name: 'Alfredo Sauce', qty: '1 cup' },
                { name: 'Parmesan', qty: '30 g' },
                { name: 'Garlic', qty: '2 cloves' },
                { name: 'Olive Oil / Butter', qty: '1 tbsp' },
            ],
            steps: [
                'Boil pasta until al dente.',
                'Sear chicken 4–6 min per side; slice.',
                'Warm Alfredo sauce and toss with pasta.',
                'Top with chicken and Parmesan.',
            ],
        },
        'Burrito Bowl': {
            baseServings: 2,
            macrosPerServing: { cal: 650, protein: 35, carbs: 75, fat: 18 },
            ingredients: [
                { name: 'Rice', qty: '1 cup (dry)' },
                { name: 'Black Beans', qty: '1 can (15 oz)' },
                { name: 'Grilled Chicken', qty: '300 g' },
                { name: 'Salsa', qty: '1/2 cup' },
                { name: 'Shredded Cheese', qty: '1/2 cup' },
                { name: 'Lettuce', qty: '2 cups' },
            ],
            steps: [
                'Cook rice and warm beans.',
                'Layer rice, beans, chicken, lettuce.',
                'Top with salsa and cheese.',
            ],
        },
        'Healthier Cookies': {
            baseServings: 8,
            macrosPerServing: { cal: 150, protein: 3, carbs: 24, fat: 5 },
            ingredients: [
                { name: 'Oats', qty: '1 cup' },
                { name: 'Banana', qty: '2 medium' },
                { name: 'Honey', qty: '2 tbsp' },
                { name: 'Dark Chocolate Chips', qty: '1/4 cup' },
                { name: 'Cinnamon', qty: '1/2 tsp' },
            ],
            steps: [
                'Preheat oven to 350°F.',
                'Mash bananas and mix all ingredients.',
                'Bake 12 minutes and cool 5 minutes.',
            ],
        },
        'Chicken Caesar Salad': {
            baseServings: 2,
            macrosPerServing: { cal: 480, protein: 34, carbs: 18, fat: 28 },
            ingredients: [
                { name: 'Romaine Lettuce', qty: '3 cups' },
                { name: 'Grilled Chicken', qty: '300 g' },
                { name: 'Croutons', qty: '1 cup' },
                { name: 'Parmesan', qty: '1/4 cup' },
                { name: 'Caesar Dressing', qty: '1/3 cup' },
            ],
            steps: [
                'Chop lettuce and toss with dressing.',
                'Add chicken, croutons, and Parmesan.',
            ],
        },
    };

    // ----------- Menu -----------
    const menuData = {
        'Pre-Made Meals': [
            { id: 1, name: 'Chicken Alfredo', price: 9.99, cal: 700, time: '12-16', image: '🍝', category: 'Dinner', hasRecipe: true },
            { id: 2, name: 'Grilled Chicken Bowl', price: 8.49, cal: 520, time: '12-15', image: '🍗', category: 'High Protein' },
            { id: 5, name: 'Burrito Bowl', price: 8.99, cal: 610, time: '12-15', image: '🌯', category: 'Mexican', hasRecipe: true },
            { id: 7, name: 'Chicken Caesar Salad', price: 8.29, cal: 460, time: '8-10', image: '🥗', category: 'Salads', hasRecipe: true },
            { id: 8, name: 'Mac & Cheese', price: 6.49, cal: 640, time: '8-10', image: '🧈', category: 'Comfort' },
            { id: 9, name: 'Healthier Cookies', price: 4.99, cal: 150, time: '15-18', image: '🍪', category: 'Dessert', hasRecipe: true },
        ],
        'Groceries': [
            { id: 101, name: 'Bananas (6 ct)', price: 1.99, image: '🍌', category: 'Produce' },
            { id: 102, name: 'Strawberries (1 lb)', price: 3.99, image: '🍓', category: 'Produce' },
            { id: 103, name: 'Whole Wheat Bread', price: 2.49, image: '🍞', category: 'Bakery' },
            { id: 104, name: 'Milk (1/2 gal)', price: 2.99, image: '🥛', category: 'Dairy' },
            { id: 105, name: 'Eggs (12 ct)', price: 3.49, image: '🥚', category: 'Dairy' },
        ],
        'Outside Food': [
            { id: 201, name: 'Panda Express Plate', price: 11.49, time: '18-28', image: '🥡', restaurant: 'Panda Express' },
            { id: 202, name: 'Chick-fil-A Sandwich Meal', price: 10.49, time: '12-20', image: '🍔', restaurant: 'Chick-fil-A' },
            { id: 203, name: 'Double-Double Combo', price: 9.99, time: '10-18', image: '🍔', restaurant: 'In-N-Out' },
            { id: 204, name: '10pc Classic Wings + Fries', price: 14.49, time: '18-25', image: '🍗', restaurant: 'Wingstop' },
        ],
    };

    // ----------- Helpers: Images (no downloads needed) -----------
    // Uses Unsplash Source. In prod, check license/attribution needs; avoid hotlinking brand logos.
    const imageFor = (name) =>
        `https://source.unsplash.com/600x400/?${encodeURIComponent(name + ', food')}`;

    // ----------- Cart + Checkout -----------
    const addToCart = (item) => {
        const exists = cart.find((c) => c.id === item.id);
        if (exists) setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
        else setCart([...cart, { ...item, qty: 1 }]);
    };

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    const handleCheckout = () => {
        if (!address.trim()) return alert('Enter a delivery address first!');
        alert(
            `Order placed!\nDelivering to: ${address}\nTotal: $${total.toFixed(
                2
            )}\nEstimated delivery: 25-35 mins`
        );
        setCart([]);
        setView('menu');
    };

    // ----------- Recipe Logic -----------
    const currentRecipe = selectedRecipe ? recipes[selectedRecipe] : null;
    const scaleQty = (qty, factor) => {
        const m = String(qty).match(/([0-9]*\.?[0-9]+)/);
        if (!m) return `${qty} × ${factor}`;
        const scaled = parseFloat(m[1]) * factor;
        return String(qty).replace(m[1], (Math.round(scaled * 100) / 100).toString());
    };

    const scaledIngredients = useMemo(() => {
        if (!currentRecipe) return [];
        const factor = servings / currentRecipe.baseServings;
        return currentRecipe.ingredients.map((i) => ({
            ...i,
            qty: scaleQty(i.qty, factor),
        }));
    }, [currentRecipe, servings]);

    // ----------- Estimated Macros in Cart (from meals only) -----------
    // We count macros from items that match a recipe by name OR have ids like 'premade-<Recipe Name>'
    const cartMacros = useMemo(() => {
        const totals = { cal: 0, protein: 0, carbs: 0, fat: 0 };
        for (const item of cart) {
            // try by name
            let recipeName = null;
            if (recipes[item.name]) recipeName = item.name;
            // try premade id format
            if (!recipeName && typeof item.id === 'string' && item.id.startsWith('premade-')) {
                const n = item.id.replace(/^premade-/, '');
                if (recipes[n]) recipeName = n;
            }
            if (!recipeName) continue;

            const m = recipes[recipeName].macrosPerServing;
            // assume 1 serving per pre-made item ordered
            totals.cal += m.cal * item.qty;
            totals.protein += m.protein * item.qty;
            totals.carbs += m.carbs * item.qty;
            totals.fat += m.fat * item.qty;
        }
        // round nicely
        for (const k of Object.keys(totals)) totals[k] = Math.round(totals[k]);
        return totals;
    }, [cart]);

    // ----------- UI -----------
    const currentItems = menuData[selectedSection] || [];

    return (
        <div className="app-bg">
            <div className="container">
                {/* Header */}
                <div className="card header">
                    <div>
                        <h1 className="title">🔱 SunDevil Eats</h1>
                        <p className="subtitle">Everything You Need, Delivered</p>
                    </div>
                    <button
                        className="btn btn-maroon"
                        onClick={() => setView(view === 'cart' ? 'menu' : 'cart')}
                    >
                        <ShoppingCart size={18} /> Cart ({cart.length})
                    </button>
                </div>

                {/* Menu */}
                {view === 'menu' && (
                    <>
                        <div className="tabs">
                            {sections.map((s) => (
                                <button
                                    key={s.name}
                                    className={`tab ${selectedSection === s.name ? 'active' : ''}`}
                                    onClick={() => setSelectedSection(s.name)}
                                >
                                    {s.icon} {s.name}
                                </button>
                            ))}
                        </div>

                        <div className="grid">
                            {currentItems.map((item) => (
                                <div key={item.id} className="card product">
                                    <div className="product-hero">
                                        <img
                                            src={imageFor(item.name)}
                                            alt={item.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                            style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }}
                                        />
                                        <div className="emoji" aria-hidden>
                                            {item.image}
                                        </div>
                                    </div>
                                    <h3>{item.name}</h3>
                                    <p className="muted">{item.category || item.restaurant || ''}</p>
                                    <div className="product-meta">
                                        <span className="price">${item.price.toFixed(2)}</span>
                                        <div className="meta-right">
                                            {item.time && (
                                                <span className="meta">
                          <Clock size={14} /> {item.time} min
                        </span>
                                            )}
                                            {item.cal && <span className="meta">🔥 {item.cal} cal</span>}
                                        </div>
                                    </div>

                                    <div className="product-actions">
                                        <button className="btn btn-grad" onClick={() => addToCart(item)}>
                                            + Add to Cart
                                        </button>
                                        {item.hasRecipe && (
                                            <button
                                                className="btn btn-lite"
                                                onClick={() => {
                                                    setSelectedRecipe(item.name);
                                                    setServings(recipes[item.name].baseServings);
                                                    setView('recipe');
                                                }}
                                            >
                                                🧑‍🍳 View Recipe
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Recipe */}
                {view === 'recipe' && currentRecipe && (
                    <div className="card recipe">
                        <div className="product-hero">
                            <img
                                src={imageFor(selectedRecipe)}
                                alt={selectedRecipe}
                                loading="lazy"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }}
                            />
                            <div className="emoji" aria-hidden>
                                🍽️
                            </div>
                        </div>

                        <h2>{selectedRecipe}</h2>
                        <div className="macros">
                            <p>
                                <strong>Per Serving:</strong> {currentRecipe.macrosPerServing.cal} cal •{' '}
                                {currentRecipe.macrosPerServing.protein}g P •{' '}
                                {currentRecipe.macrosPerServing.carbs}g C • {currentRecipe.macrosPerServing.fat}g F
                            </p>
                            <label className="servings">
                                Servings:{' '}
                                <input
                                    type="number"
                                    min="1"
                                    value={servings}
                                    onChange={(e) => setServings(Number(e.target.value))}
                                />
                            </label>
                        </div>

                        <h3>Ingredients</h3>
                        <ul>
                            {scaledIngredients.map((i, idx) => (
                                <li key={idx}>
                                    {i.qty} {i.name}
                                </li>
                            ))}
                        </ul>

                        <h3>Steps</h3>
                        <ol>
                            {currentRecipe.steps.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ol>

                        <div className="recipe-actions">
                            <button
                                className="btn btn-grad"
                                onClick={() => alert('🛒 Ingredients added to cart!')}
                            >
                                Add Ingredients to Cart
                            </button>
                            <button
                                className="btn btn-maroon"
                                onClick={() => {
                                    addToCart({
                                        id: `premade-${selectedRecipe}`,
                                        name: selectedRecipe,
                                        price: 9.99,
                                        image: '🍽️',
                                        qty: 1,
                                    });
                                    alert('✅ Pre-made meal added to cart!');
                                }}
                            >
                                Order Pre-Made Instead
                            </button>
                            <button className="btn btn-lite" onClick={() => setView('menu')}>
                                ← Back
                            </button>
                        </div>
                    </div>
                )}

                {/* Cart */}
                {view === 'cart' && (
                    <div className="card">
                        <h2>🛒 Your Cart</h2>
                        {cart.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            <>
                                <ul>
                                    {cart.map((i, idx) => (
                                        <li key={idx}>
                                            {i.image} {i.name} — ${i.price.toFixed(2)} × {i.qty}
                                        </li>
                                    ))}
                                </ul>

                                {/* Estimated macros from meals */}
                                {(cartMacros.cal + cartMacros.protein + cartMacros.carbs + cartMacros.fat > 0) && (
                                    <div
                                        style={{
                                            marginTop: 12,
                                            padding: '10px 12px',
                                            border: '1px solid #eaeaea',
                                            borderRadius: 12,
                                            background: '#fffdf6',
                                        }}
                                    >
                                        <strong>Estimated Macros (meals in cart):</strong>
                                        <div style={{ marginTop: 6 }}>
                                            {cartMacros.cal} cal • {cartMacros.protein}g P • {cartMacros.carbs}g C •{' '}
                                            {cartMacros.fat}g F
                                        </div>
                                        <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
                                            Groceries are not counted in macros.
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div style={{ marginTop: 16 }}>
                            <p>
                                <strong>Total:</strong> ${total.toFixed(2)}
                            </p>
                        </div>

                        <div className="promo card-lite" style={{ marginTop: 12 }}>
                            <label className="promo-label">
                                <Sparkles size={16} /> Promo Code
                            </label>
                            <div className="promo-row">
                                <input
                                    className="input"
                                    placeholder="ASU10, FIRST20, FORKS"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <button
                                    className="btn btn-yellow"
                                    onClick={() => {
                                        const code = promoCode.trim().toUpperCase();
                                        if (code === 'ASU10') {
                                            setDiscount(0.1);
                                            alert('🎉 10% student discount applied!');
                                        } else if (code === 'FIRST20') {
                                            setDiscount(0.2);
                                            alert('🎉 20% first order discount applied!');
                                        } else if (code === 'FORKS') {
                                            alert('✅ Free utensils added to your order!');
                                        } else {
                                            setDiscount(0);
                                            alert('❌ Invalid promo code');
                                        }
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div className="address card-lite" style={{ marginTop: 12 }}>
                            <label className="label">
                                <MapPin size={16} /> Delivery Address
                            </label>
                            <input
                                className="input"
                                placeholder="Enter your dorm or ASU address..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            <label className="label">
                                <MessageSquare size={16} /> Delivery Instructions (Optional)
                            </label>
                            <textarea
                                className="input textarea"
                                rows={3}
                                placeholder="e.g., Leave at door, call when here, gate code..."
                                value={orderInstructions}
                                onChange={(e) => setOrderInstructions(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-grad big" onClick={handleCheckout} style={{ marginTop: 12 }}>
                            Place Order
                        </button>
                        <button className="btn btn-lite" onClick={() => setView('menu')} style={{ marginTop: 8 }}>
                            ← Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodDeliveryApp;
