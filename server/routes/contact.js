const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// @route   POST /api/contact
router.post('/', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // In production, save to DB or send email. For demo, just log and confirm.
        console.log('Contact form submission:', req.body);

        res.json({ message: 'Thank you for your message! We will get back to you soon.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
