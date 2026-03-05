import { Link } from 'react-router-dom';

export default function ShippingPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-display font-bold text-charcoal mb-4">Shipping Policy</h1>
                <p className="text-gray-500">Last Updated: March 2026</p>
            </div>

            <div className="prose prose-blush max-w-none text-gray-700 space-y-6">
                <p>At Phoolvia, every product is carefully handmade to order with love and premium materials. Because of the bespoke nature of our products, our shipping timeline reflects the time needed to handcraft your special items.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">1. Processing Time</h2>
                <p>All our products are 100% handmade to order. Standard processing and crafting time is <strong>5 to 7 business days</strong> before your order is dispatched. During peak holiday seasons or sales events, processing times may be slightly longer.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">2. Shipping Timelines & Rates</h2>
                <p>Once your order is handcrafted and dispatched, standard delivery times within India apply:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Metro Cities:</strong> 3-5 business days after dispatch</li>
                    <li><strong>Rest of India:</strong> 5-7 business days after dispatch</li>
                </ul>
                <p>Shipping charges (if applicable) are calculated and displayed at checkout. We currently only ship within India.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">3. Order Tracking</h2>
                <p>Once your order has been shipped, you will receive a tracking link via email/SMS. You can use this link to track the status of your delivery in real-time through our delivery partners.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">4. Address Accuracy</h2>
                <p>Please ensure that you provide a complete and accurate shipping address during checkout, including the correct PIN code and phone number. We are not responsible for delays or non-delivery caused by incorrect or incomplete addresses provided by the customer.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">5. Contact Info</h2>
                <p>If you have any questions about your shipment, please reach out to us:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Email:</strong> phoolviaa@gmail.com</li>
                    <li><strong>Phone:</strong> +91 9065046908</li>
                </ul>
            </div>

            <div className="mt-12 text-center">
                <Link to="/" className="text-blush-600 hover:text-blush-700 font-medium">← Back to Home</Link>
            </div>
        </div>
    );
}
