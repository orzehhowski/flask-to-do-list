const displayFunFact = () => {
    const ffp = document.querySelector('.fun-fact')

    axios.get('https://uselessfacts.jsph.pl/random.json?language=en').then((r) => {
        ffp.textContent = r.data.text
    }).catch(() => {
        ffp.textContent = "oh you're really unlucky, even the fun fuct doesn't wan't to appear"
    })
}

document.addEventListener('DOMContentLoaded', displayFunFact)