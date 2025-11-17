import React from 'react';

// Komponen Ikon Media Sosial (menggunakan Lucide Icons untuk kesederhanaan)
const SocialIcon = ({ href, iconName }) => {
    const IconComponent = () => {
        const defaultClass = "w-6 h-6 transition-transform duration-300 transform group-hover:scale-110";
        switch (iconName) {
            case 'instagram':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultClass}>
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                );
            case 'facebook':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultClass}>
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                );
            case 'twitter':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultClass}>
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.1 1 11.1 2 5c2.4 1.4 5 2 7 2C7.3 4.3 8 2 8 2"></path>
                    </svg>
                );
            case 'youtube':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultClass}>
                        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2h15a2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10l-.49 1.13a2 2 0 0 1-1.92 1.44H4.9a2 2 0 0 1-1.92-1.44L2.5 17z"></path>
                        <path d="m10 15 5-3-5-3v6z"></path>
                    </svg>
                );
            default:
                return null;
        }
    };

    // Menggunakan warna putih untuk border/hover
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group p-2 rounded-full border-2 border-transparent text-white hover:border-white hover:bg-white hover:text-[#1E293B] transition-all duration-300"
            aria-label={`Kunjungi ${iconName} PELTI Denpasar`}
        >
            <IconComponent />
        </a>
    );
};

// Komponen Informasi & Kebijakan
const PolicySection = () => {
    // Data dummy untuk Kebijakan dan Informasi
    const policyLinks = [
        { title: "Kebijakan Privasi", href: "#privacy" },
        { title: "Syarat Penggunaan", href: "#terms" },
        { title: "FAQ", href: "#faq" },
        { title: "Peta Situs", href: "#sitemap" },
    ];

    return (
        <div className="space-y-3">
            <ul className="space-y-3">
                {policyLinks.map((link, index) => (
                    <li key={index}>
                        <a 
                            href={link.href} 
                            className="text-gray-100 hover:text-white transition duration-200 text-base"
                        >
                            {link.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const Footer = () => {
    // Data Navigasi
    const navLinks = [
        { title: "Beranda", href: "#home" },
        { title: "Tentang Kami", href: "#about" },
        { title: "Program & Kegiatan", href: "#program" },
        { title: "Atlet Unggulan", href: "#athletes" },
        { title: "Berita & Event", href: "#news" },
        { title: "Hubungi Kami", href: "#contact" },
    ];

    // Data Kontak
    const contactData = [
        { icon: "map-pin", value: "Jl. Hayam Wuruk No. 123, Denpasar, Bali" },
        { icon: "phone", value: "+62 812-3456-7890" },
        { icon: "mail", value: "peltidenpasar.official@mail.com" },
    ];

    // Komponen Tautan Detail Kontak
    const ContactItem = ({ iconName, value }) => {
        const IconComponent = () => {
            // Ikon tetap menggunakan warna putih
            const defaultClass = "w-4 h-4 mr-3 flex-shrink-0 text-white"; 
            switch (iconName) {
                case 'map-pin':
                    return (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultClass}>
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    );
                case 'phone':
                    return (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultClass}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.72-6.72 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72 17 17 0 0 0 .93 4.41 2 2 0 0 1-.72 2.15l-.26.26c-.86.86-1.14 2.1-.21 3.14a15 15 0 0 0 6.54 6.54c1.04.93 2.28.65 3.14-.21l.26-.26a2 2 0 0 1 2.15-.72A17 17 0 0 0 20.28 20a2 2 0 0 1 1.72 2.18z"></path>
                        </svg>
                    );
                case 'mail':
                    return (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={defaultClass}>
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                    );
                default:
                    return null;
            }
        };
        return (
            <div className="flex items-start text-gray-100 hover:text-white transition duration-200">
                <IconComponent />
                <span className="text-sm">{value}</span>
            </div>
        );
    }

    return (
        <footer className="bg-secondary text-white pt-16">
            <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-gray-100 pb-12">
                    
                    {/* KOLOM 1: Logo & Deskripsi */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <img 
                            src="/logo.png" // Menggunakan nama logo yang lebih spesifik
                            alt="Logo Persatuan Tenis Seluruh Indonesia PELTI" 
                            className="w-12 md:w-14 h-auto" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/000000/ffffff?text=PELTI" }} 
                          />
                            <h4 className="text-2xl font-bold text-white tracking-wider">PELTI Denpasar</h4>
                        </div>
                        <p className="text-sm text-gray-100 mt-4 max-w-xs">
                            Persatuan Lawn Tenis Indonesia Kota Denpasar. Membina atlet unggul dan memajukan olahraga tenis di Bali.
                        </p>
                        
                        {/* Media Sosial */}
                        <div className="flex space-x-3 mt-6">
                            <SocialIcon href="https://www.instagram.com" iconName="instagram" />
                            <SocialIcon href="https://www.facebook.com" iconName="facebook" />
                            <SocialIcon href="https://www.youtube.com" iconName="youtube" />
                            
                        </div>
                    </div>

                    {/* KOLOM 2: Navigasi Cepat */}
                    <div>
                        {/* Judul diubah menjadi putih */}
                        <h5 className="text-xl font-semibold text-white mb-6 pb-2">
                            Navigasi Cepat
                        </h5>
                        <ul className="space-y-3">
                            {navLinks.map((link, index) => (
                                <li key={index}>
                                    <a 
                                        href={link.href} 
                                        className="text-gray-100 hover:text-white transition duration-200 text-base"
                                    >
                                        {link.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* KOLOM 3: Informasi & Kebijakan - BARU */}
                    <div>
                        {/* Judul diubah menjadi putih */}
                        <h5 className="text-xl font-semibold text-white mb-6 pb-2">
                            Informasi & Kebijakan
                        </h5>
                        <PolicySection />
                    </div>
                    
                    {/* KOLOM 4: Hubungi Kami */}
                    <div>
                        {/* Judul diubah menjadi putih */}
                        <h5 className="text-xl font-semibold text-white mb-6 pb-2">
                            Sekretariat
                        </h5>
                        <div className="space-y-4">
                            {contactData.map((item, index) => (
                                <ContactItem key={index} iconName={item.icon} value={item.value} />
                            ))}
                        </div>
                       
                    </div>

                </div>

                {/* Bagian Copyright */}
                <div className="text-center py-6 mt-0">
                    <p className="text-sm text-gray-100">
                        &copy; {new Date().getFullYear()} PELTI Kota Denpasar. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;