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
    const mobileAside = aside.querySelector('.lists-mobile')
    let content = document.querySelector('.main-list')

    if (mobileAside.matches('.hide')) {
        mobileAside.classList.toggle('hide')
    }
    else {
        setTimeout(() => mobileAside.classList.toggle('hide'), 300)
    }

    aside.classList.toggle('show-aside')
    burgerIcon.classList.toggle('hide')
    xMark.classList.toggle('hide')
    arrow.classList.toggle('hide')

    if (content.matches('.hide')) {
        content.classList.toggle('hide')
        contentHidden = true
    } else {
        setTimeout(() => content.classList.toggle('hide'), 300)
        contentHidden = false
    }
}

const addList = (e) => {
    const addField = e.target.closest('.add-list')
    const lists = document.querySelectorAll('.lists-list')
    const listName = addField.querySelector('input').value
    const errors = document.querySelectorAll('.lists-errors p')

    axios.post(`/add_list`, {
        list_name: listName
    }).then(r => {
        if (! r.data.error) {
            
            lists.forEach(l => {
                const new_list = document.createElement('li')
                new_list.innerHTML = `
            <a href="#"><input type="text" placeholder="${listName}" readonly></a>
            <span class="tools">
            <button class="tools-button edit-list-button">
            <i class="fa-solid fa-pen"></i>
            </button>
            <button class="tools-button delete-list-button">
            <i class="fa-solid fa-trash-can"></i>
            </button>
            </span>`
                l.prepend(new_list)
            })

            addField.querySelector('input').value = ''
            errors.forEach(e => e.textContent = '')

        } else {
            errors.forEach(e => e.textContent = r.data.error)
        }
    }).catch(error => errors.forEach(e => e.textContent = 'Ooops, something went wrong'))
}

const editList = (e) => {
    // idk why it dont works
    // const toEdit = e.target.closest('input')
    const toEdit = e.target.parentElement.parentElement.querySelector('input')
    toEdit.removeAttribute('readonly')
    toEdit.focus()
    toEdit.addEventListener('focusout', endListEditing)
}

const endListEditing = (inputElement) => {
    if (inputElement.value) {
        const oldName = inputElement.getAttribute('placeholder')
        const newName = inputElement.value
        const errors = document.querySelectorAll('.lists-errors p')
        axios.post('/edit_list', {
            old_name: oldName,
            new_name: newName
        }).then(r => {
            if (!r.data.error) {
                inputElement.setAttribute('placeholder', newName)
                // TU NIE DZIALA
                inputElement.setAttribute('readonly')
            } else {
                errors.forEach(e => e.textContent = r.data.error)
            }
        }).catch(error => errors.forEach(e => e.textContent = 'Ooops, something went wrong'))
    }
}

const main = () => {
    const menuIcons = document.querySelectorAll('.menu-icon')
    const asideIcons = document.querySelectorAll('.aside-icon')
    const addTaskButtons = document.querySelectorAll('.add-task-button')
    const editTaskButtons = document.querySelectorAll('.edit-task-button')
    const deleteTaskButtons = document.querySelectorAll('.delete-task-button')
    const addListButtons = document.querySelectorAll('.add-list-button')
    const editListButtons = document.querySelectorAll('.edit-list-button')
    const deleteListButtons = document.querySelectorAll('.delete-list-button')

    addListButtons.forEach(btn => btn.addEventListener('click', addList))
    editListButtons.forEach(btn => btn.addEventListener('click', editList))
    menuIcons.forEach(icon => {icon.addEventListener('click', toggleBurgerMenu)})
    asideIcons.forEach(icon => {icon.addEventListener('click', toggleListMenu)})
}

main()