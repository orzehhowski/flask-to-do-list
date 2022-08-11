const toggleBurgerMenu = () => {
    const burgerIcon = document.querySelector('.bars-icon')
    const xMark = document.querySelector('.xmark-icon-menu')
    const menu = document.querySelector('.menu')
    const arrow = document.querySelector('.right-arrow-icon')

    menu.classList.toggle('show-menu')
    burgerIcon.classList.toggle('hide')
    xMark.classList.toggle('hide')
    arrow.classList.toggle('hide')
}

const toggleListMenu = () => {
    const burgerIcon = document.querySelector('.bars-icon')
    const xMark = document.querySelector('.xmark-icon-lists')
    const aside = document.querySelector('.aside')
    const arrow = document.querySelector('.right-arrow-icon')

    aside.classList.toggle('show-aside')
    burgerIcon.classList.toggle('hide')
    xMark.classList.toggle('hide')
    arrow.classList.toggle('hide')
}




const main = () => {
    const menuIcons = document.querySelectorAll('.menu-icon')
    const asideIcons = document.querySelectorAll('.aside-icon')

    menuIcons.forEach(icon => {icon.addEventListener('click', toggleBurgerMenu)})
    asideIcons.forEach(icon => {icon.addEventListener('click', toggleListMenu)})
}

main()