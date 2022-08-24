const displayError = (message) => {
    const popup = document.querySelector('.error-popup')
    popup.querySelector('p').textContent = message
    popup.classList.add('show-popup')
}

const hideError = () => {
    const popup = document.querySelector('.error-popup')
    popup.classList.remove('show-popup')
}

const displayHowTo = () => {
    const popup = document.querySelector('.how-to-popup')
    popup.classList.add('show-popup')
}

const hideHowTo = () => {
    const popup = document.querySelector('.how-to-popup')
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
    const data = {list_name: listName}
    fetch(`/lists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(r => r.json()).then(r => {
        if (! r.error) {
            
            lists.forEach(l => {
                const new_list = document.createElement('li')
                new_list.innerHTML = `
            <a href="#"><input type="text" placeholder="${listName}" data-oldname="${listName}" readonly></a>
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
            
            hideError()
            
        } else {
            displayError(r.error)
        }
        addField.querySelector('input').value = ''
    }).catch(() => displayError(`Ooops, something went wrong`))
}

const addTask = () => {
    const addFieldInput = document.querySelector('.add-task input')
    const newTaskName = addFieldInput.value
    const listName = document.querySelector('.active input').getAttribute('placeholder')
    const data = {
        task_name: newTaskName,
        list_name: listName
    }

    fetch(`/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(r => r.json()).then(r => {
        if (!r.error) {
            displayList()
        }
        else {
            displayError(r.error)
        }
        addFieldInput.value = ''
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
    toEdit.removeAttribute('placeholder')
    toEdit.dataset.oldname = oldName
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
        const oldName = toEdit.dataset.oldname
        const newName = inputElement.value
        const inputs = document.querySelectorAll(`[data-oldname="${oldName}"]`)
        const data = {
            old_name: oldName,
            new_name: newName
        }
        fetch('/lists', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(r => r.json()).then(r => {
            if (!r.error) {
                inputs.forEach(input => {
                    input.setAttribute('placeholder', newName)
                    input.dataset.oldname = newName
                })
                hideError()
                if (inputElement.parentElement.parentElement.matches('.active')) {
                    displayList()
                }
            } else {
                inputElement.setAttribute('placeholder', oldName)
                displayError(r.error)
            }
            inputElement.value = ''
        }).catch(() => {
            displayError('Ooops, something went wrong')
            inputElement.setAttribute('placeholder', oldName)
            inputElement.value = ''
        })
        inputElement.setAttribute('readonly', '')
        inputElement.removeEventListener('focusout', activateFocusout)
        inputElement.removeEventListener('keydown', activateKeydown)
    }

    toEdit.addEventListener('focusout', activateFocusout)
    toEdit.addEventListener('keydown', activateKeydown)
}

const editTask = (e) => {
    const toEdit = e.target.parentElement.parentElement.querySelector('input')
    const endEditingButton = e.target.parentElement.querySelector('.task-end-editing-button')
    const doneButton = e.target.parentElement.querySelector('.task-done-button')
    const oldName = toEdit.getAttribute('placeholder')
    toEdit.removeAttribute('readonly')
    toEdit.removeAttribute('placeholder')
    toEdit.value = oldName
    toEdit.focus()
    doneButton.classList.add('hide')
    endEditingButton.classList.remove('hide')
    
    const activateKeydown = (e) => {
        if (e.key == 'Enter') {
            toEdit.blur()
        }
    }

    const activateFocusout = (e) => {
        endTaskEditing(toEdit)
    }
    
    const endTaskEditing = (inputElement) => {
        const newName = inputElement.value
        const activeList = document.querySelector('.active input').getAttribute('placeholder')
        const data = {
            mark_as_done: false,
            mark_as_undone: false,
            old_name: oldName,
            new_name: newName,
            active_list: activeList
        }
        fetch(`/tasks`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(r => r.json()).then(r => {
                if (!r.error) {
                inputElement.setAttribute('placeholder', newName)
                hideError()
            } else {
                displayError(r.error)
                inputElement.setAttribute('placeholder', oldName)
            }
            inputElement.value = ''
            inputElement.setAttribute('readonly', '')
        }).catch(() => {
            displayError('Ooops, something went wrong')
            inputElement.setAttribute('placeholder', oldName)
            inputElement.value = ''
        })
        toEdit.removeEventListener('focusout', activateFocusout)
        toEdit.removeEventListener('keydown', activateKeydown)
        doneButton.classList.remove('hide')
        endEditingButton.classList.add('hide')
    }
    toEdit.addEventListener('focusout', activateFocusout)
    toEdit.addEventListener('keydown', activateKeydown)
}

const deleteList = (e) => {
    const toDeleteName = e.target.parentElement.parentElement.querySelector('input').getAttribute('placeholder')
    let toDelete = document.querySelectorAll(`[placeholder="${toDeleteName}"]`)
    const data = {list_name: toDeleteName}
    fetch('/lists', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(r => r.json()).then((r) => {
        console.log(r);
        if (!r.error) {
            toDelete.forEach(el => el.parentElement.parentElement.remove())
            hideError()
        } else {
            displayError(r.error)
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

const deleteTask = (e) => {
    const toDelete = e.target.parentElement.parentElement
    const taskName = toDelete.querySelector('input').getAttribute('placeholder')
    const activeList = document.querySelector('.active input').getAttribute('placeholder')
    const data = {
        active_list: activeList,
        task_name: taskName
    }
    fetch(`/tasks`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(() => {
        toDelete.remove()
        hideError()
    }).catch(() => {
        displayError('Ooops, something went wrong')})
}

const markTaskAsDone = (e) => {
    const doneInput = e.target.parentElement.parentElement.querySelector('input')
    const taskName = doneInput.getAttribute('placeholder')
    const activeList = document.querySelector('.active input').getAttribute('placeholder')
    const data = {
        mark_as_done: true,
        task_name: taskName,
        active_list: activeList
    }
    fetch(`/tasks`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(() => {
        doneInput.classList.add('done')
        e.target.classList.add('hide')
        e.target.nextElementSibling.classList.add('hide')
        e.target.previousElementSibling.classList.remove('hide')
        hideError()
    }).catch(() => {
        displayError('Ooops, something went wrong')
    })
}

const markTaskAsUndone = (e) => {
    const doneInput = e.target.parentElement.parentElement.querySelector('input')
    const taskDoneButton = e.target.parentElement.querySelector('.task-done-button')
    const taskEditButton = e.target.parentElement.querySelector('.task-edit-button')
    const taskName = doneInput.getAttribute('placeholder')
    const activeList = document.querySelector('.active input').getAttribute('placeholder')
    const data = {
        mark_as_done: false,
        mark_as_undone: true,
        task_name: taskName,
        active_list: activeList
    }
    fetch(`/tasks`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(() => {
        doneInput.classList.remove('done')
        e.target.classList.add('hide')
        taskDoneButton.classList.remove('hide')
        taskEditButton.classList.remove('hide')
        hideError()
    }).catch(() => {
        displayError('Ooops, something went wrong')
    })
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
    if (e.target.closest('div').matches('.lists-mobile')) {
        toggleListMenu()
    }
}

const displayList = () => {
    const listNameHeading = document.querySelector('h2')
    const listsList = document.querySelectorAll('.lists-list')
    const listName = listsList[0].querySelector('.active input').dataset.oldname
    const tasksList = document.querySelector('.tasks-list')
    let lastTask = tasksList.lastElementChild
    while(!lastTask.matches('.add-task')) {
        lastTask.remove()
        lastTask = tasksList.lastElementChild
    }
    
    listNameHeading.textContent = listName
    const data = {list_name: listName}
    fetch('/display-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(r => r.json()).then(r => {
        for (let task of r.tasks) {
            const newLi = document.createElement('li')
            newLi.classList.add('task')
            newLi.innerHTML = `
            <input type="text" placeholder="${task[0]}" readonly ${task[1] ? 'class="done"' : ''}>
            <span class="tools">
                <button class="tools-button task-end-editing-button hide">
                <i class="fa-solid fa-check"></i>
                </button>
                <button class="tools-button task-undone-button ${task[1] ? '' : 'hide'}">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
                <button class="tools-button task-done-button ${task[1] ? 'hide' : ''}">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="tools-button task-edit-button ${task[1] ? 'hide' : ''}">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="tools-button task-delete-button">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </span>`
        
        tasksList.append(newLi)
        }
    }).catch(() => {
        displayError(`Could not load your list :c`)
    })
}

const main = () => {
    const menuIcons = document.querySelectorAll('.menu-icon')
    const asideIcons = document.querySelectorAll('.aside-icon')
    const addTaskButton = document.querySelector('.add-task-button')
    const howToLinks = document.querySelectorAll('.how-to-link')
    const addTaskInput = document.querySelector('.add-task input')
    const addListButtons = document.querySelectorAll('.add-list-button')
    const addListInputs = document.querySelectorAll('.add-list input')
    const editListButtons = document.querySelectorAll('.edit-list-button')
    const deleteListButtons = document.querySelectorAll('.delete-list-button')
    const listLinks = document.querySelectorAll('.lists-list a')

    const errorPopupButton = document.querySelector('.error-popup .popup-button')
    const howToPopupButton = document.querySelector('.how-to-popup .popup-button')
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
    errorPopupButton.addEventListener('click', hideError)
    howToPopupButton.addEventListener('click', hideHowTo)
    listLinks.forEach(link => link.addEventListener('click', setActiveList))
    howToLinks.forEach(link => {
        link.addEventListener('click', () => {
            displayHowTo()
            if (link.parentElement.matches('li')) {
                toggleBurgerMenu()
            }
        })
    })

    // event listners to dynamically added elements
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.task-edit-button')) {
            editTask(e)
        } else if (e.target.matches('.task-done-button')) {
            markTaskAsDone(e)
        } else if (e.target.matches('.task-delete-button')) {
            deleteTask(e)
        } else if (e.target.matches('.task-undone-button')) {
            markTaskAsUndone(e)
        }
    })
}

document.addEventListener('DOMContentLoaded', main)
