import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = ({ 
  currentCarouselIndex, 
  setCurrentCarouselIndex, 
  setCurrentPage 
}) => {
  const carouselSlides = [
    {
      title: "LEVEL UP YOUR STYLE",
      subtitle: "Discover our exclusive collection of gaming and tech-inspired apparel",
      buttonText: "SHOP NOW",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "NEW ARRIVALS",
      subtitle: "Fresh designs for the modern tech enthusiast",
      buttonText: "EXPLORE",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "GAMING COLLECTION",
      subtitle: "Express your passion for gaming with our unique designs",
      buttonText: "DISCOVER",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentCarouselIndex ? 'active' : ''}`}
            style={{ background: slide.gradient }}
          >
            <div className="hero-content">
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <button 
                className="hero-btn"
                onClick={() => setCurrentPage('products')}
              >
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="carousel-indicators">
        {carouselSlides.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentCarouselIndex ? 'active' : ''}`}
            onClick={() => setCurrentCarouselIndex(index)}
          />
        ))}
      </div>
      
      <button 
        className="carousel-arrow prev"
        onClick={() => setCurrentCarouselIndex((prev) => 
          prev === 0 ? carouselSlides.length - 1 : prev - 1
        )}
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        className="carousel-arrow next"
        onClick={() => setCurrentCarouselIndex((prev) => 
          (prev + 1) % carouselSlides.length
        )}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default HeroCarousel;