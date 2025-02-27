let lastScrollTop = 0;  // variable to store the last scroll position
const navBar = document.querySelector('.top-nav');  // reference to the navbar

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
        // Scrolling down
        navBar.style.top = '-80px';  // adjust this value to match the height of your navbar
    } else {
        // Scrolling up
        navBar.style.top = '0';
    }
    lastScrollTop = scrollTop;  // update the last scroll position to the current position
})
