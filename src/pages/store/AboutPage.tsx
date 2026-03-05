import { Heart, Shield, Leaf, Sparkles } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="animate-fade-in">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blush-100 via-blush-50 to-ivory px-4 py-12 text-center">
                <span className="inline-block px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-semibold text-blush-500 tracking-widest mb-3">OUR STORY</span>
                <h1 className="font-display text-3xl font-bold text-charcoal mb-3">Flowers That<br />Never Fade</h1>
                <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">Each creation is lovingly crocheted by hand, bringing everlasting beauty to your special moments.</p>
            </section>

            {/* Story */}
            <section className="px-4 py-8">
                <h2 className="font-display text-xl font-semibold text-charcoal mb-3">Handmade With Love</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    PHOOLVIAA was born from a simple passion — creating beautiful, lasting gifts that bring joy. Every flower, every teddy, every piece is carefully crafted with premium yarn and boundless love.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                    We believe in the beauty of handmade artistry. Each creation takes hours of dedicated craft, resulting in a unique piece that carries the warmth of human touch — something no machine can replicate.
                </p>
            </section>

            {/* Photos Grid */}
            <section className="px-4 pb-8">
                <div className="grid grid-cols-2 gap-3">
                    {[['🌸', 'Crochet Flowers'], ['🧸', 'Stuffed Teddies'], ['💐', 'Gift Hampers'], ['🧶', 'Premium Yarn']].map(([emoji, label]) => (
                        <div key={label} className="aspect-square bg-blush-50 rounded-2xl flex flex-col items-center justify-center">
                            <span className="text-5xl mb-2">{emoji}</span>
                            <span className="text-xs font-medium text-gray-600">{label as string}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="px-4 pb-8 space-y-4">
                {[
                    { icon: Heart, title: 'Handcrafted with Care', desc: 'Every product is made by skilled artisans who pour their heart into each creation.' },
                    { icon: Sparkles, title: 'Premium Quality Yarn', desc: 'We use only the finest quality yarn to ensure durability and a luxurious feel.' },
                    { icon: Shield, title: 'Quality Guaranteed', desc: 'Each item undergoes careful quality checks before reaching your hands.' },
                    { icon: Leaf, title: 'Sustainable Craft', desc: 'Our handmade process minimizes waste and supports sustainable practices.' },
                ].map(f => (
                    <div key={f.title} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-blush-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <f.icon size={22} className="text-blush-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm">{f.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Quote */}
            <section className="mx-4 mb-8 bg-gradient-to-r from-blush-100 to-amber-50 rounded-2xl p-6 text-center">
                <p className="font-display text-lg italic text-charcoal mb-3">
                    "Every stitch tells a story, every flower holds a smile."
                </p>
                <p className="text-sm text-blush-500 font-medium">— The PHOOLVIAA Team</p>
            </section>
        </div>
    );
}
