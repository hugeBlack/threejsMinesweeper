let canUserClick = false
const basePath = "/minesweeperDemo/"
const setCanUserClick = (b) => {
    canUserClick = b
}

const getCanUserClick = () => {
    return canUserClick
}

export {
    setCanUserClick,
    getCanUserClick,
    basePath
}