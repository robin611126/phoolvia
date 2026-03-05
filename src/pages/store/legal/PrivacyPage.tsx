import { Link } from 'react-router-dom';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-display font-bold text-charcoal mb-4">Privacy Policy</h1>
                <p className="text-gray-500">Last Updated: March 2026</p>
            </div>

            <div className="prose prose-blush max-w-none text-gray-700 space-y-6">
                <p>This Privacy Policy describes how Phoolvia ("we", "us", or "our") collects, uses, and shares your personal information when you visit or make a purchase from our website.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">1. Personal Information We Collect</h2>
                <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.</p>
                <p>Additionally, when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number. We refer to this information as "Order Information."</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">2. How We Use Your Personal Information</h2>
                <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Communicate with you;</li>
                    <li>Screen our orders for potential risk or fraud; and</li>
                    <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                </ul>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">3. Sharing Your Personal Information</h2>
                <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use shipping partners (like Shiprocket) to deliver your orders and payment gateways to process your transactions securely. We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">4. Data Retention</h2>
                <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">5. Changes</h2>
                <p>We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.</p>

                <h2 className="text-2xl font-display font-semibold text-charcoal mt-8 mb-4">6. Contact Us</h2>
                <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail or by mail using the details provided below:</p>
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
