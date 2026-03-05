import { Link } from 'react-router-dom';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-display font-bold text-charcoal mb-4">Terms & Conditions</h1>
                <p className="text-gray-500">Last Updated: March 2026</p>
            </div>

            <div className="prose prose-blush max-w-none text-gray-700 space-y-6">
                <p>Welcome to Phoolvia. By accessing our website and placing an order, you agree to be bound by these Terms and Conditions.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">1. General Overview</h2>
                <p>This website is operated by Phoolvia. Throughout the site, the terms "we", "us" and "our" refer to Phoolvia. We offer this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">2. Products and Services</h2>
                <p>As our products are handmade, there may be slight variations in color, size, and design from the product images shown on the website. These variations are a testament to the handmade nature of our products and are not considered defects.</p>
                <p>We reserve the right to modify or discontinue any product or service without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">3. Pricing and Payments</h2>
                <p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated. We reserve the right to change prices at any time without prior notice. Payment must be made in full at the time of ordering for prepaid orders. For Cash on Delivery (COD), payment must be made to the delivery executive upon receipt of the order.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">4. Accuracy of Information</h2>
                <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">5. Governing Law</h2>
                <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India, with jurisdiction in Bokaro, Jharkhand.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">6. Contact Information</h2>
                <p>Questions about the Terms of Service should be sent to us at:</p>
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
