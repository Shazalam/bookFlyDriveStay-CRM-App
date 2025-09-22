import React, { useState, useEffect } from 'react';

interface GiftCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (cardData: {
        amount: string;
        giftCode: string;
        expirationDate: string;
        fullName: string;
    }) => void;
    initialCustomerName?: string; // Add this prop
}

const GiftCardModal: React.FC<GiftCardModalProps> = ({ isOpen, onClose, onGenerate,
    initialCustomerName = 'JOHN DOE' // Default value
}) => {
    const [amount, setAmount] = useState('');
    const [giftCode, setGiftCode] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [error, setError] = useState('');

    // Generate initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            generateUniqueCode();
            setExpirationDate(calculateExpirationDate());
            setAmount('');
            setError('');
        }
    }, [isOpen]);

    const generateUniqueCode = () => {
        const parts = [];
        for (let i = 0; i < 4; i++) {
            parts.push(Math.floor(1000 + Math.random() * 9000));
        }
        const newCode = parts.join(' ');
        setGiftCode(newCode);
        return newCode;
    };

    const calculateExpirationDate = () => {
        const now = new Date();
        const expiration = new Date(now.setMonth(now.getMonth() + 24));
        return `${String(expiration.getMonth() + 1).padStart(2, '0')}/${String(expiration.getFullYear()).slice(2)}`;
    };

    const handleGenerateNewCode = () => {
        generateUniqueCode();
    };

    const handleGenerateCard = () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        if (!initialCustomerName.trim()) {
            setError('Please enter a customer name');
            return;
        }

        onGenerate({
            amount: parseFloat(amount).toFixed(2),
            giftCode,
            expirationDate,
            fullName: initialCustomerName.toUpperCase()
        });

        onClose();
    };

    const handleAmountChange = (value: string) => {
        setAmount(value);
        if (error) setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-indigo-900/20 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl transform transition-all duration-300 scale-100">
                {/* Floating Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20 transform scale-105" />

                {/* Main Modal Card */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header Gradient */}
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">Create Gift Card</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                            >
                                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input Section */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        value={initialCustomerName}
                                        placeholder="Enter customer name"
                                        className="w-full text-lg font-medium px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                                        Gift Card Amount ($)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-lg">$</span>
                                        </div>
                                        <input
                                            value={amount}
                                            onChange={(e) => handleAmountChange(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 text-lg font-medium px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                            step="0.01"
                                        />
                                    </div>
                                    {error && (
                                        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">{error}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Details */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Card Details</h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block">Card Number</label>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-lg font-bold text-blue-800">{giftCode}</span>
                                                <button
                                                    onClick={handleGenerateNewCode}
                                                    className="bg-white hover:bg-gray-50 border border-blue-300 text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    New Code
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600 block">Expiration Date</label>
                                            <div className="text-lg font-semibold text-gray-800">{expirationDate}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleGenerateCard}
                                        disabled={!amount || parseFloat(amount) <= 0}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Generate Gift Card
                                    </button>
                                </div>
                            </div>

                            {/* Card Preview */}
                            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6 rounded-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                                {/* Card Chip */}
                                <div className="absolute top-6 right-6 w-10 h-7 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-md flex items-center justify-center">
                                    <div className="w-7 h-5 bg-gradient-to-r from-yellow-300 to-yellow-200 rounded-sm"></div>
                                </div>

                                {/* Card Brand */}
                                <div className="absolute top-6 left-6 text-xl font-bold text-white/80">TRAVEL PREMIUM</div>

                                {/* Card Number */}
                                <div className="text-xl font-mono tracking-widest mb-6 mt-8 text-center">
                                    {giftCode || '•••• •••• •••• ••••'}
                                </div>

                                {/* Card Details */}
                                <div className="flex justify-between items-end mt-auto">
                                    <div>
                                        <div className="text-xs text-white/70 mb-1">CARDHOLDER NAME</div>
                                        <div className="text-md font-semibold">{initialCustomerName}</div>
                                    </div>
                                    <div className="text- mb-6">
                                        <div className="text-xs text-white/70 mb-1">EXPIRES</div>
                                        <div className="text-md font-semibold">{expirationDate}</div>
                                    </div>
                                </div>

                                {/* Amount Display */}
                                <div className="absolute bottom-4 right-6 text-xl font-bold text-yellow-300">
                                    ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
                                <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/5 rounded-full"></div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>💳 CARD TERMS:</strong> Valid for 24 months from issue date. Redeemable for flights, car rentals, and cruise bookings.
                                Non-refundable.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftCardModal;