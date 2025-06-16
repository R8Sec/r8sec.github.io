function toggleMenu() {
    const nav = document.querySelector('.top-nav');
    const navLinks = document.querySelector('.nav-links');

    // Toggle the 'expanded' class on both nav and nav-links
    nav.classList.toggle('expanded');
    navLinks.classList.toggle('expanded');
}
