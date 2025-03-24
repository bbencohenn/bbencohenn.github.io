const menuBtn = document.getElementById('menu-btn');
const nav = document.getElementById('nav');
let isOpen = false;

menuBtn.addEventListener('click', () => {
  isOpen = !isOpen;
  menuBtn.classList.toggle('open');
  nav.classList.toggle('open');

  if (isOpen) {
    gsap.from(".nav ul li", {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });
  }
});
