const toggleBurgerMenu = () => {
    const BurgerIcon = document.querySelector('.bars-icon')
    const xMark = document.querySelector('.xmark-icon')
    const menu = document.querySelector('.menu')

    menu.classList.toggle('show')
    BurgerIcon.classList.toggle('hide')
    xMark.classList.toggle('hide')
}




const main = () => {
    const icons = document.querySelectorAll('menu-icon')

    icons.forEach(icon => icon.addEventListener('click', toggleBurgerMenu))
}