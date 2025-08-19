function Hero() {
  return (
    <>
      <section
        id="home"
        className="relative h-[75vh] flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('hero.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-20">
          <div className="max-w-2xl text-left">
            <p className="text-sm md:text-base text-white mb-2">
              Discover an unparalleled journey filled with adventure
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-snug">
              Walikota Cup 2025
            </h1>

            <a
              href="#explore"
              className="mt-6 inline-block bg-[#ffd51e] text-black font-semibold px-6 py-3 rounded-md hover:bg-yellow-400 transition"
            >
              Explore →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
