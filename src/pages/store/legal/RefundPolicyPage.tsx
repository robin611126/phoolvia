import { Link } from 'react-router-dom';

export default function RefundPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-display font-bold text-charcoal mb-4">Refund & Cancellation Policy</h1>
                <p className="text-gray-500">Last Updated: March 2026</p>
            </div>

            <div className="prose prose-blush max-w-none text-gray-700 space-y-6">
                <p>At Phoolvia, we take immense pride in the craftsmanship of our handmade crochet products. Because each item is meticulously handcrafted specifically for you upon order, we have a strict policy regarding returns and refunds.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">1. No Refunds Policy</h2>
                <p><strong>We do not offer refunds or standard returns for change of mind.</strong> As our products are custom-made through intensive hand labor, all sales are considered final once the crafting process has begun.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">2. Replacements for Damaged Items</h2>
                <p>We deeply care about your experience and the safe arrival of your order. <strong>We strictly offer replacements only if the product received is damaged or defective upon arrival.</strong></p>

                <p>To be eligible for a replacement:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>You must contact us within <strong>48 hours</strong> of receiving your order.</li>
                    <li>You must provide an **unboxing video** as proof of damage. The video must show the sealed package being opened for the first time, clearly revealing the damage or defect.</li>
                    <li>The product must be unused and in the same condition that you received it.</li>
                </ul>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">3. Requesting a Replacement</h2>
                <p>To request a replacement for a damaged item, please email us at <strong>phoolviaa@gmail.com</strong> or WhatsApp us at <strong>+91 9065046908</strong> with:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Your Full Name</li>
                    <li>Order Number</li>
                    <li>The unboxing video clearly showing the defect/damage</li>
                </ol>
                <p>Once we receive and review your email and video, we will notify you of the approval or rejection of your replacement. If approved, we will begin crafting your replacement item immediately and ship it to you at no additional shipping cost.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">4. Cancellations</h2>
                <p>Cancellations are only accepted within <strong>12 hours</strong> of placing the order, provided the crafting of your handmade item has not yet begun. Once the crafting process has started, the order cannot be cancelled. To request a cancellation, contact us immediately at the details below.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">5. Contact Info</h2>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Business Name:</strong> Phoolvia</li>
                    <li><strong>Email:</strong> phoolviaa@gmail.com</li>
                    <li><strong>Phone:</strong> +91 9065046908</li>
                    <li><strong>Address:</strong> Amlabad Colliery, Bokaro, Jharkhand - 828303, India</li>
                </ul>
            </div>

            <div className="mt-12 text-center">
                <Link to="/" className="text-blush-600 hover:text-blush-700 font-medium">← Back to Home</Link>
            </div>
        </div>
    );
}
