const displayFunFact = () => {
    const ffp = document.querySelector('.fun-fact')

    fetch('https://uselessfacts.jsph.pl/random.json?language=en').then(r => r.json()).then((r) => {
        ffp.textContent = r.text
    }).catch(() => {
        ffp.textContent = "oh you're really unlucky, even the fun fuct doesn't wan't to appear"
    })
}

document.addEventListener('DOMContentLoaded', displayFunFact)