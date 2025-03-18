import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">TestiVid</div>
        <nav className="landing-nav">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link to="/signin" className="nav-link">Sign In</Link>
          <Link to="/signup" className="nav-button">Get Started</Link>
        </nav>
      </header>
      
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Collect powerful video testimonials from your customers</h1>
            <p className="hero-subtitle">
              TestiVid makes it easy to request, collect, and showcase authentic video testimonials that convert visitors into customers.
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button primary">Start Free Trial</Link>
              <a href="#demo" className="cta-button secondary">Watch Demo</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="video-testimonial-preview">
              <div className="video-placeholder">
                <div className="play-icon">▶</div>
              </div>
              <div className="testimonial-caption">
                <p>"TestiVid helped us increase conversion rates by 37% with authentic customer stories."</p>
                <div className="testimonial-author">Sarah J. - Marketing Director</div>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="social-proof">
          <p>Trusted by innovative companies</p>
          <div className="company-logos">
            <div className="company-logo">Company 1</div>
            <div className="company-logo">Company 2</div>
            <div className="company-logo">Company 3</div>
            <div className="company-logo">Company 4</div>
            <div className="company-logo">Company 5</div>
          </div>
        </section> */}
        
        <section id="features" className="features-section">
          <h2>Why choose TestiVid?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3>Easy Collection</h3>
              <p>Send branded video request links that make it simple for customers to record their testimonials directly in the browser — no downloads required.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Automatic Editing</h3>
              <p>Our AI-powered editor adds your branding, captions, and background music automatically to create polished testimonials.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Performance Analytics</h3>
              <p>Track which testimonials drive the most engagement and conversions with built-in analytics.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Multi-platform Sharing</h3>
              <p>Easily share testimonials across your website, social media, and marketing campaigns with a single click.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Customers can record high-quality testimonials from any device, including smartphones and tablets.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Management</h3>
              <p>Organize, edit, and manage all your testimonial content in one secure dashboard.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works">
          <h2>How TestiVid Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Request</h3>
              <p>Set up personalized testimonial requests with custom questions and branding.</p>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Send to Customers</h3>
              <p>Share your request link via email or message to your satisfied customers.</p>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Collect Videos</h3>
              <p>Customers record testimonials directly in their browser - no account needed.</p>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Edit & Share</h3>
              <p>Automatically enhance videos and share them across your marketing channels.</p>
            </div>
          </div>
        </section>

        <section id="demo" className="demo-section">
          <div className="demo-content">
            <h2>See TestiVid in Action</h2>
            <p>Watch how easy it is to collect and manage powerful video testimonials</p>
            <div className="demo-video">
              <div className="video-placeholder large">
                <div className="play-icon">▶</div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing-section">
          <h2>Simple, Transparent Pricing</h2>
          <p className="pricing-subtitle">Choose the plan that works for your business</p>
          
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Starter</h3>
                <div className="price">$49<span>/month</span></div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>Up to 10 testimonial requests/month</li>
                  <li>Basic video editing</li>
                  <li>Email support</li>
                  <li>Video hosting included</li>
                  <li>Simple embed options</li>
                </ul>
              </div>
              <Link to="/signup" className="pricing-cta">Start Free Trial</Link>
            </div>
            
            <div className="pricing-card featured">
              <div className="most-popular">Most Popular</div>
              <div className="pricing-card-header">
                <h3>Professional</h3>
                <div className="price">$99<span>/month</span></div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>Up to 30 testimonial requests/month</li>
                  <li>Advanced AI video editing</li>
                  <li>Priority support</li>
                  <li>Custom branding</li>
                  <li>Analytics dashboard</li>
                  <li>Multiple team members</li>
                </ul>
              </div>
              <Link to="/signup" className="pricing-cta">Start Free Trial</Link>
            </div>
            
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Enterprise</h3>
                <div className="price">Custom</div>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>Unlimited testimonial requests</li>
                  <li>Premium editing features</li>
                  <li>Dedicated account manager</li>
                  <li>API access</li>
                  <li>Advanced analytics & reporting</li>
                  <li>SSO & enterprise security</li>
                </ul>
              </div>
              <Link to="/signup" className="pricing-cta">Contact Sales</Link>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to collect powerful testimonials?</h2>
          <p>Join thousands of companies using TestiVid to convert prospects with authentic customer stories.</p>
          <Link to="/signup" className="cta-button primary large">Start Your Free Trial</Link>
          <p className="no-cc">No credit card required</p>
        </section>
      </main>
      
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">TestiVid</div>
            <p>The easiest way to collect, manage, and share video testimonials from your customers.</p>
          </div>
          
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#customers">Customers</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#support">Support</a></li>
              <li><a href="#documentation">Documentation</a></li>
              <li><a href="#tutorials">Tutorials</a></li>
              <li><a href="#guides">Guides</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TestiVid. All rights reserved.</p>
          <div className="footer-links">
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;