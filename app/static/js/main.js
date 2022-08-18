const displayError = (message) => {
    const popup = document.querySelector('.error-popup')
    popup.querySelector('p').textContent = message
    popup.classList.add('show-popup')
}

const hideError = () => {
    const popup = document.querySelector('.error-popup')
    popup.classList.remove('show-popup')
}

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
    } else {
        setTimeout(() => content.classList.toggle('hide'), 300)
    }
}

const addList = (e) => {
    const addField = e.target.closest('.add-list')
    const lists = document.querySelectorAll('.lists-list')
    const listName = addField.querySelector('input').value

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
                new_list.querySelector('.edit-list-button').addEventListener('click', editList)
                new_list.querySelector('.delete-list-button').addEventListener('click', deleteList)
                new_list.querySelector('a').addEventListener('click', setActiveList)
                l.prepend(new_list)
            })
            
            addField.querySelector('input').value = ''
            hideError()

        } else {
            displayError(r.data.error)
        }
    }).catch(() => displayError('Ooops, something went wrong'))
}

const addTask = () => {
    const addFieldInput = document.querySelector('.add-task input')
    const newTaskName = addFieldInput.value
    const listName = document.querySelector('.active input').getAttribute('placeholder')

    axios.post('/add_task', {
        task_name: newTaskName,
        list_name: listName
    }).then(r => {
        if (!r.data.error) {
            addFieldInput.value = ''
            displayList()
        }
        else {
            displayError(r.data.error)
        }
    }).catch(() => {
        displayError('Ooops, something went wrong')
    })
}

const editList = (e) => {
    // idk why it dont works
    // const toEdit = e.target.closest('input')
    const toEdit = e.target.parentElement.parentElement.querySelector('input')
    const oldName = toEdit.getAttribute('placeholder')
    toEdit.removeAttribute('readonly')
    toEdit.value = oldName
    toEdit.focus()

    const activateKeydown = (e) => {
        if (e.key == 'Enter') {
            // UNFOCUS ELEMENT - this will activate focusout EL
            toEdit.blur()
        }
    }

    const activateFocusout = (e) => {
        endListEditing(toEdit)
    }   

    const endListEditing = (inputElement) => {
        const oldName = inputElement.getAttribute('placeholder')
        const newName = inputElement.value
        const inputs = document.querySelectorAll(`[placeholder="${oldName}"]`)
        axios.post('/edit_list', {
            old_name: oldName,
            new_name: newName
        }).then(r => {
            if (!r.data.error) {
                inputs.forEach(input => input.setAttribute('placeholder', newName))
                inputElement.value = ''
                hideError()
                if (inputElement.parentElement.parentElement.matches('.active')) {
                    displayList()
                }
            } else {
                inputElement.setAttribute('placeholder', oldName)
                inputElement.value = ''
                displayError(r.data.error)
            }
            inputElement.setAttribute('readonly', '')
        }).catch(() => {
            displayError('Ooops, something went wrong')
            inputElement.setAttribute('placeholder', oldName)
            inputElement.value = ''
        })
        inputElement.removeEventListener('focusout', activateFocusout)
        inputElement.removeEventListener('keydown', activateKeydown)
    }

    toEdit.addEventListener('focusout', activateFocusout)
    toEdit.addEventListener('keydown', activateKeydown)
}

const deleteList = (e) => {
    const toDeleteName = e.target.parentElement.parentElement.querySelector('input').getAttribute('placeholder')
    let toDelete = document.querySelectorAll(`[placeholder="${toDeleteName}"]`)
    axios.post('/delete_list', {
        list_name: toDeleteName
    }).then((r) => {
        if (!r.data.error) {
            toDelete.forEach(el => el.parentElement.parentElement.remove())
            hideError()
        } else {
            displayError(r.data.error)
        }
        if (toDelete[0].parentElement.parentElement.matches('.active')) {
            const listsList = document.querySelectorAll('.lists-list')
            listsList.forEach(l => {
                l.firstElementChild.classList.add('active')
            })
            displayList()
        }
    }).catch(() => {
        displayError('Ooops, something went wrong')})
}

const setActiveList = (e) => {
    const oldActive = document.getElementsByClassName('active')
    for (let el of oldActive) {
        el.classList.remove('active')
    }
    let activeListName
    if (e.target.matches('input')) {
        activeListName = e.target.getAttribute('placeholder')
    } else {
        activeListName = e.target.getElementsByTagName('input')[0].getAttribute('placeholder')
    }
    const newActive = document.querySelectorAll(`[placeholder="${activeListName}"]`)
    newActive.forEach(input => {input.parentElement.parentElement.classList.add('active')})

    displayList()
}

const displayList = () => {
    const listNameHeading = document.querySelector('h2')
    const listsList = document.querySelectorAll('.lists-list')
    const listName = listsList[0].querySelector('.active input').getAttribute('placeholder')
    const tasksList = document.querySelector('.tasks-list')
    let lastTask = tasksList.lastElementChild
    while(!lastTask.matches('.add-task')) {
        lastTask.remove()
        lastTask = tasksList.lastElementChild
    }

    listNameHeading.textContent = listName
    axios.post('/tasks', {
        list_name: listName
    }).then(r => {
        for (let task of r.data.tasks) {
            const newLi = document.createElement('li')
            newLi.classList.add('task')
            newLi.innerHTML = `
            <input type="text" placeholder="${task}"  readonly>
            <span class="tools">
                <button class="tools-button task-done-button">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="tools-button task-edit-button">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="tools-button task-delete-button">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </span>`
        
        tasksList.append(newLi)
        }
    }).catch(() => {
        displayError('Could not load your list :c')
    })
}


const main = () => {
    const menuIcons = document.querySelectorAll('.menu-icon')
    const asideIcons = document.querySelectorAll('.aside-icon')
    const addTaskButton = document.querySelector('.add-task-button')
    const addTaskInput = document.querySelector('.add-task input')
    const editTaskButtons = document.querySelectorAll('.edit-task-button')
    const deleteTaskButtons = document.querySelectorAll('.delete-task-button')
    const addListButtons = document.querySelectorAll('.add-list-button')
    const addListInputs = document.querySelectorAll('.add-list input')
    const editListButtons = document.querySelectorAll('.edit-list-button')
    const deleteListButtons = document.querySelectorAll('.delete-list-button')
    const listLinks = document.querySelectorAll('.lists-list a')

    const popupButton = document.querySelector('.popup-button')
    const listsList = document.querySelectorAll('.lists-list')

    listsList.forEach(l => {
        l.firstElementChild.classList.add('active')
    })
    displayList()

    addListButtons.forEach(btn => btn.addEventListener('click', addList))
    addListInputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key == 'Enter') {
                addList(e)
            }
        })
    })
    addTaskButton.addEventListener('click', addTask)
    addTaskInput.addEventListener('keydown', e => {
        if (e.key == 'Enter') {
            addTask()
        }
    })
    editListButtons.forEach(btn => btn.addEventListener('click', editList))
    deleteListButtons.forEach(btn => btn.addEventListener('click', deleteList))
    menuIcons.forEach(icon => {icon.addEventListener('click', toggleBurgerMenu)})
    asideIcons.forEach(icon => {icon.addEventListener('click', toggleListMenu)})
    popupButton.addEventListener('click', hideError)
    listLinks.forEach(link => link.addEventListener('click', setActiveList))
}

document.addEventListener('DOMContentLoaded', main)
