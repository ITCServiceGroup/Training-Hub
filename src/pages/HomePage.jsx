import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // Inline styles to ensure proper rendering
  const homePageStyles = {
    padding: '2rem 0'
  };
  
  const heroStyles = {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '3rem 1rem',
    backgroundColor: '#f0fdfa',
    borderRadius: '0.5rem'
  };
  
  const heroTitleStyles = {
    fontSize: '2.5rem',
    color: '#0f766e',
    marginBottom: '1rem'
  };
  
  const heroDescStyles = {
    fontSize: '1.25rem',
    color: '#334155',
    marginBottom: '2rem'
  };
  
  const heroActionsStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  };
  
  const primaryBtnStyles = {
    backgroundColor: '#0f766e',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.25rem',
    textDecoration: 'none',
    fontWeight: 'bold'
  };
  
  const secondaryBtnStyles = {
    backgroundColor: '#7e22ce',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.25rem',
    textDecoration: 'none',
    fontWeight: 'bold'
  };
  
  const sectionStyles = {
    marginBottom: '3rem'
  };
  
  const sectionTitleStyles = {
    fontSize: '1.75rem',
    color: '#0f766e',
    marginBottom: '1.5rem'
  };
  
  const featureGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  };
  
  const featureCardStyles = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.25rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const featureTitleStyles = {
    fontSize: '1.25rem',
    color: '#0f766e',
    marginBottom: '0.75rem'
  };
  
  const linkStyles = {
    color: '#0f766e',
    textDecoration: 'none',
    fontWeight: '500'
  };
  
  const listStyles = {
    paddingLeft: '1.5rem',
    lineHeight: '1.8'
  };

  return (
    <div style={homePageStyles}>
      <section style={heroStyles}>
        <h1 style={heroTitleStyles}>Welcome to Training Hub</h1>
        <p style={heroDescStyles}>Your comprehensive platform for training materials and assessments</p>
        <div style={heroActionsStyles}>
          <Link to="/study" style={primaryBtnStyles}>Study Guides</Link>
          <Link to="/quiz" style={secondaryBtnStyles}>Take a Quiz</Link>
        </div>
      </section>

      <section style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Features</h2>
        <div style={featureGridStyles}>
          <div style={featureCardStyles}>
            <h3 style={featureTitleStyles}>Study Guides</h3>
            <p>Access comprehensive study materials to enhance your knowledge and skills.</p>
          </div>
          <div style={featureCardStyles}>
            <h3 style={featureTitleStyles}>Interactive Quizzes</h3>
            <p>Test your understanding with our interactive quizzes and receive immediate feedback.</p>
          </div>
          <div style={featureCardStyles}>
            <h3 style={featureTitleStyles}>Progress Tracking</h3>
            <p>Monitor your learning progress and identify areas for improvement.</p>
          </div>
          <div style={featureCardStyles}>
            <h3 style={featureTitleStyles}>Certification</h3>
            <p>Achieve certification upon successful completion of assessment requirements.</p>
          </div>
        </div>
      </section>

      <section style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Getting Started</h2>
        <ol style={listStyles}>
          <li>Browse available <Link to="/study" style={linkStyles}>study guides</Link> by category</li>
          <li>Review the material thoroughly</li>
          <li>Test your knowledge with <Link to="/quiz" style={linkStyles}>practice quizzes</Link></li>
          <li>Complete official assessments when ready</li>
        </ol>
      </section>
    </div>
  );
};

export default HomePage;
