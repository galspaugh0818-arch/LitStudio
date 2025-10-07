// Smooth scroll when clicking "Explore" button
document.getElementById('explore-btn').addEventListener('click', () => {
  const gallery = document.querySelector('.gallery');
  gallery.scrollIntoView({ behavior: 'smooth' });
});

// Optional: random background color flash effect for fun
setInterval(() => {
  const colors = ['#0f0c29', '#302b63', '#24243e'];
  document.body.style.background = `linear-gradient(135deg, ${colors[Math.floor(Math.random()*colors.length)]}, #302b63, #24243e)`;
}, 15000);
