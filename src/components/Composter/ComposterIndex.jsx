import React from 'react'

function ComposterIndex() {
  return (
    <div style={styles.container}>
      {/* Banner Section */}
      <div style={styles.banner}>
        <img
          src="https://example.com/veg-waste.jpg"
          alt="Vegetable Waste"
          style={styles.bannerImage}
        />
        <h2 style={styles.bannerText}>NoWaste: Bridging Waste from Markets to Farms</h2>
      </div>

      {/* Project Overview */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Project Overview</h3>
        <p style={styles.sectionText}>
          NoWaste is a platform that facilitates the collection of vegetable waste from markets and delivers them to pig farms and composters.
        </p>
      </section>

      {/* Challenges & Solutions */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Challenges & Solutions</h3>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Challenge: Inefficient Waste Collection</h4>
          <p style={styles.cardText}>
            Solution: An optimized system that allows farmers to locate and collect waste easily.
          </p>
        </div>
      </section>

      {/* Related Articles */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Related Articles</h3>
        <div style={styles.card}>
          <img
            src="https://example.com/pig-farm.jpg"
            alt="Recycle Waste"
            style={styles.cardImage}
          />
          <h4 style={styles.cardTitle}>Benefit from Vegetable Waste</h4>
        </div>
      </section>

      {/* About Section */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>About NoWaste</h3>
        <p style={styles.sectionText}>
          NoWaste is dedicated to reducing food waste by connecting markets with sustainable waste management solutions.
        </p>
      </section>
    </div>
  )
}

const styles = {
  container: {
    fontFamily: 'sans-serif',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  banner: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#4CAF50',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  bannerImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  bannerText: {
    color: 'white',
    marginTop: '15px',
    fontSize: '1.5rem',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  sectionText: {
    fontSize: '1rem',
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    marginTop: '10px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: '0.95rem',
    color: '#444',
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '10px',
  },
};

export default ComposterIndex
