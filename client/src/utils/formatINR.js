/**
 * Format price in Indian Rupees (INR)
 * Uses the Indian numbering system (lakhs, crores)
 */
export const formatINR = (price, type = '') => {
    const suffix = type === 'rent' ? '/mo' : '';

    if (price >= 10000000) {
        // Crores
        const cr = price / 10000000;
        return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr${suffix}`;
    }
    if (price >= 100000) {
        // Lakhs
        const lakh = price / 100000;
        return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L${suffix}`;
    }
    if (price >= 1000) {
        // Thousands with Indian comma formatting
        return `₹${price.toLocaleString('en-IN')}${suffix}`;
    }
    return `₹${price}${suffix}`;
};
