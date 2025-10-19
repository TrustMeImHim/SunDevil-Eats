import React, { useState } from 'react';
import { ShoppingCart, Clock, MapPin, MessageSquare, Sparkles } from 'lucide-react';

const FoodDeliveryApp = () => {
    const [cart, setCart] = useState([]);
    const [view, setView] = useState('menu');
    const [selectedSection, setSelectedSection] = useState('Pre-Made Meals');
    const [address, setAddress] = useState('');
    const [orderInstructions, setOrderInstructions] = useState('');
    const [itemNotes, setItemNotes] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const sections = [
        { name: 'Pre-Made Meals', icon: '🍱' },
        { name: 'Groceries',      icon: '🛒' },
        { name: 'Outside Food',   icon: '🍕' },
    ];

    const menuData = {
        'Pre-Made Meals': [
            { id: 1,  name: 'Chicken Alfredo',             price: 9.99, cal: 700, time: '12-16', image: '🍝', category: 'Dinner' },
            { id: 2,  name: 'Grilled Chicken Bowl',        price: 8.49, cal: 520, time: '12-15', image: '🍗', category: 'High Protein' },
            { id: 3,  name: 'Turkey Sandwich',             price: 7.49, cal: 430, time: '8-10',  image: '🥪', category: 'Lunch' },
            { id: 4,  name: 'Veggie Stir-Fry',             price: 7.99, cal: 420, time: '10-12', image: '🥦', category: 'Vegetarian' },
            { id: 5,  name: 'Burrito Bowl',                price: 8.99, cal: 610, time: '12-15', image: '🌯', category: 'Mexican' },
            { id: 6,  name: 'Tomato Soup & Grilled Cheese',price: 6.99, cal: 500, time: '8-10',  image: '🧀', category: 'Comfort' },
            { id: 7,  name: 'Chicken Caesar Salad',        price: 8.29, cal: 460, time: '8-10',  image: '🥗', category: 'Salads' },
            { id: 8,  name: 'Mac & Cheese',                price: 6.49, cal: 640, time: '8-10',  image: '🧈', category: 'Comfort' },
            { id: 9,  name: 'Breakfast Burrito',           price: 7.49, cal: 530, time: '10-12', image: '🥚', category: 'Breakfast' },
            { id: 10, name: 'BBQ Chicken Sandwich',        price: 8.79, cal: 570, time: '10-15', image: '🍖', category: 'Lunch' },
        ],

        'Groceries': [
            { id: 101, name: 'Bananas (6 ct)',             price: 1.99, image: '🍌', category: 'Produce' },
            { id: 102, name: 'Strawberries (1 lb)',        price: 3.99, image: '🍓', category: 'Produce' },
            { id: 103, name: 'Whole Wheat Bread',          price: 2.49, image: '🍞', category: 'Bakery' },
            { id: 104, name: 'Milk (1/2 gal)',             price: 2.99, image: '🥛', category: 'Dairy' },
            { id: 105, name: 'Eggs (12 ct)',               price: 3.49, image: '🥚', category: 'Dairy' },
            { id: 106, name: 'Cheddar Cheese (8 oz)',      price: 2.99, image: '🧀', category: 'Dairy' },
            { id: 107, name: 'Pasta (1 lb)',               price: 1.79, image: '🍝', category: 'Pantry' },
            { id: 108, name: 'Granola Bars (6 ct)',        price: 3.49, image: '🍫', category: 'Snacks' },
            { id: 109, name: 'Cereal (12 oz)',             price: 4.29, image: '🥣', category: 'Breakfast' },
            { id: 110, name: 'Ramen Pack (6 ct)',          price: 2.99, image: '🍜', category: 'Pantry' },
            { id: 111, name: 'Frozen Pizza',               price: 5.99, image: '🍕', category: 'Frozen' },
            { id: 112, name: 'Chicken Nuggets (1 lb)',     price: 6.49, image: '🍗', category: 'Frozen' },
        ],

        'Outside Food': [
            { id: 201, name: 'Panda Express Plate',        price: 11.49, time: '18-28', image: '🥡', restaurant: 'Panda Express' },
            { id: 202, name: 'Chick-fil-A Sandwich Meal',  price: 10.49, time: '12-20', image: '🍔', restaurant: 'Chick-fil-A' },
            { id: 203, name: 'Double-Double Combo',        price: 9.99,  time: '10-18', image: '🍔', restaurant: 'In-N-Out Burger' },
            { id: 204, name: "Barro's Large Pepperoni",    price: 16.99, time: '20-30', image: '🍕', restaurant: "Barro's Pizza" },
            { id: 205, name: '10pc Classic Wings + Fries', price: 14.49, time: '18-25', image: '🍗', restaurant: 'Wingstop' },
            { id: 206, name: 'Panda Bowl (1 Entrée)',      price: 9.29,  time: '15-20', image: '🥢', restaurant: 'Panda Express' },
            { id: 207, name: 'Chick-fil-A Nuggets (8 ct)', price: 9.79,  time: '12-18', image: '🐔', restaurant: 'Chick-fil-A' },
            { id: 208, name: 'In-N-Out Fries & Shake',     price: 6.99,  time: '8-12',  image: '🥤', restaurant: 'In-N-Out Burger' },
        ],
    };

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
        else setCart([...cart, {...item, qty: 1}]);
    };

    const removeFromCart = (id) => {
        const existing = cart.find(c => c.id === id);
        if (!existing) return;
        if (existing.qty > 1) setCart(cart.map(c => c.id === id ? {...c, qty: c.qty - 1} : c));
        else {
            setCart(cart.filter(c => c.id !== id));
            const next = {...itemNotes}; delete next[id]; setItemNotes(next);
        }
    };

    const updateItemNote = (id, note) => setItemNotes({...itemNotes, [id]: note});

    const applyPromo = () => {
        const code = promoCode.trim().toUpperCase();
        if (code === 'ASU10') { setDiscount(0.10); alert('🎉 10% student discount applied!'); }
        else if (code === 'FIRST20') { setDiscount(0.20); alert('🎉 20% first order discount applied!'); }
        else if (code === 'FORKS') { alert('✅ Free utensils added to your order!'); }
        else { setDiscount(0); alert('❌ Invalid promo code'); }
    };

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);

    const handleCheckout = () => {
        if (!address.trim()) return;
        let msg = `Order placed! 🎉\n\nDelivering to: ${address}\nTotal: $${total.toFixed(2)}`;
        if (orderInstructions) msg += `\n\nDelivery Instructions: ${orderInstructions}`;
        const withNotes = cart.filter(i => itemNotes[i.id]);
        if (withNotes.length) {
            msg += `\n\nSpecial Requests:`;
            withNotes.forEach(i => { msg += `\n- ${i.name}: ${itemNotes[i.id]}`; });
        }
        msg += `\n\nEstimated delivery: 25-35 mins`;
        alert(msg);

        setCart([]); setView('menu'); setAddress(''); setOrderInstructions('');
        setItemNotes({}); setPromoCode(''); setDiscount(0);
    };

    const currentItems = menuData[selectedSection] || [];

    return (
        <div className="app-bg">
            <div className="container">
                {/* Header */}
                <div className="card header">
                    <div className="header-left">
                        <h1 className="title">🔱 SunDevil Eats</h1>
                        <p className="subtitle">Everything You Need, Delivered</p>
                    </div>
                    <button className="btn btn-maroon cart-btn" onClick={() => setView(view === 'cart' ? 'menu' : 'cart')}>
                        <ShoppingCart size={18} />
                        <span>Cart</span>
                        {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </button>
                </div>

                {view === 'menu' ? (
                    <>
                        {/* Address */}
                        <div className="card">
                            <h2 className="section-title">📍 Delivery Address</h2>
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter your dorm or ASU address..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="tabs">
                            {sections.map(s => (
                                <button
                                    key={s.name}
                                    onClick={() => setSelectedSection(s.name)}
                                    className={`tab ${selectedSection === s.name ? 'tab-active' : ''}`}
                                >
                                    <span className="emoji">{s.icon}</span>{s.name}
                                </button>
                            ))}
                        </div>

                        {/* Grid of items */}
                        <div className="grid">
                            {currentItems.map(item => (
                                <article key={item.id} className="card product">
                                    <div className="product-hero">
                                        <span className="hero-emoji" aria-hidden>{item.image}</span>
                                    </div>
                                    <div className="product-body">
                                        <div className="product-header">
                                            <div className="product-titles">
                                                <h3 className="product-name">{item.name}</h3>
                                                <p className="product-sub">{item.category || item.restaurant || ''}</p>
                                            </div>
                                            <span className="product-price">${item.price}</span>
                                        </div>

                                        <div className="product-meta">
                                            {item.time && (
                                                <span className="meta">
                          <Clock size={14} /> {item.time} min
                        </span>
                                            )}
                                            {item.cal && (
                                                <span className="meta">🔥 {item.cal} cal</span>
                                            )}
                                        </div>

                                        <button className="btn btn-grad" onClick={() => addToCart(item)}>+ Add to Cart</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="card">
                        <h2 className="cart-title">🛒 Your Cart</h2>

                        {cart.length === 0 ? (
                            <div className="empty">
                                <p>Your cart is empty</p>
                                <button className="btn btn-grad" onClick={() => setView('menu')}>Browse Menu</button>
                            </div>
                        ) : (
                            <>
                                <div className="cart-list">
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-row">
                                            <div className="cart-main">
                                                <span className="cart-emoji">{item.image}</span>
                                                <div>
                                                    <div className="cart-name">{item.name}</div>
                                                    <div className="cart-each">${item.price} each</div>
                                                </div>
                                            </div>

                                            <div className="cart-actions">
                                                <div className="qty">
                                                    <button onClick={() => removeFromCart(item.id)} className="qty-btn">−</button>
                                                    <span className="qty-num">{item.qty}</span>
                                                    <button onClick={() => addToCart(item)} className="qty-btn">+</button>
                                                </div>
                                                <div className="cart-row-total">${(item.price * item.qty).toFixed(2)}</div>
                                            </div>

                                            <div className="note">
                                                <label className="note-label">
                                                    <MessageSquare size={14} /> Special instructions
                                                </label>
                                                <input
                                                    className="input"
                                                    type="text"
                                                    placeholder="e.g., No onions, extra sauce..."
                                                    value={itemNotes[item.id] || ''}
                                                    onChange={(e) => updateItemNote(item.id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="promo card-lite">
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
                                        <button className="btn btn-yellow" onClick={applyPromo}>Apply</button>
                                    </div>
                                </div>

                                <div className="totals card-lite">
                                    <div className="totals-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                    {discount > 0 && (
                                        <div className="totals-row green">
                                            <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                                            <span>- ${discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="totals-row"><span>Delivery Fee</span><span className="green">FREE</span></div>
                                    <div className="totals-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
                                </div>

                                <div className="address card-lite">
                                    <label className="label"><MapPin size={16} /> Delivery Address</label>
                                    <input
                                        className="input"
                                        placeholder="Enter your dorm or ASU address..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                    <label className="label"><MessageSquare size={16} /> Delivery Instructions (Optional)</label>
                                    <textarea
                                        className="input textarea"
                                        rows={3}
                                        placeholder="e.g., Leave at door, call when here, gate code..."
                                        value={orderInstructions}
                                        onChange={(e) => setOrderInstructions(e.target.value)}
                                    />
                                </div>

                                <button className="btn btn-grad big" disabled={!address.trim()} onClick={handleCheckout}>
                                    Place Order — ${total.toFixed(2)}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodDeliveryApp;
